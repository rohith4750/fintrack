import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { CashDenomination } from '../types';

interface DenominationTableProps {
  denominations: CashDenomination;
  onChange: (key: keyof CashDenomination, count: number) => void;
  expectedAmount: number;
}

export const DenominationTable: React.FC<DenominationTableProps> = ({
  denominations,
  onChange,
  expectedAmount,
}) => {
  const notesConfig: Array<{ key: keyof CashDenomination; multiplier: number; label: string }> = [
    { key: 'notes2000', multiplier: 2000, label: '₹2,000' },
    { key: 'notes500', multiplier: 500, label: '₹500' },
    { key: 'notes200', multiplier: 200, label: '₹200' },
    { key: 'notes100', multiplier: 100, label: '₹100' },
    { key: 'notes50', multiplier: 50, label: '₹50' },
    { key: 'notes20', multiplier: 20, label: '₹20' },
    { key: 'notes10', multiplier: 10, label: '₹10' },
    { key: 'coins', multiplier: 1, label: 'Coins' },
  ];

  const totalCalculated = notesConfig.reduce(
    (sum, item) => sum + (denominations[item.key] || 0) * item.multiplier,
    0
  );

  const diff = totalCalculated - expectedAmount;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Physical Cash Denomination Count</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Currency</Text>
        <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>Count (Pieces)</Text>
        <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Total (INR)</Text>
      </View>

      {notesConfig.map((item) => {
        const count = denominations[item.key] || 0;
        const lineTotal = count * item.multiplier;

        return (
          <View key={item.key} style={styles.row}>
            <Text style={styles.currLabel}>{item.label}</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={count === 0 ? '' : count.toString()}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                onChangeText={(text: string) => {
                  const val = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                  onChange(item.key, val);
                }}
              />
            </View>

            <Text style={styles.lineTotalText}>
              ₹{lineTotal.toLocaleString('en-IN')}
            </Text>
          </View>
        );
      })}

      {/* Summary Box */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Cash Counted:</Text>
          <Text style={styles.summaryValue}>₹{totalCalculated.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Expected Cash Collections:</Text>
          <Text style={styles.summaryValue}>₹{expectedAmount.toLocaleString('en-IN')}</Text>
        </View>

        <View style={[styles.diffBox, diff === 0 ? styles.diffMatch : styles.diffMismatch]}>
          <Text style={styles.diffText}>
            {diff === 0
              ? '✓ Perfect Match (Zero Discrepancy)'
              : diff > 0
              ? `+ Excess Cash: ₹${diff.toLocaleString('en-IN')}`
              : `- Shortage: ₹${Math.abs(diff).toLocaleString('en-IN')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    marginBottom: 6,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  currLabel: {
    flex: 1.5,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  inputWrapper: {
    flex: 1.5,
    alignItems: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 6,
    color: Colors.text,
    width: 70,
    height: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    padding: 0,
  },
  lineTotalText: {
    flex: 2,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  summaryContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  diffBox: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  diffMatch: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  diffMismatch: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  diffText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
});
