import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Calendar, Sparkles } from 'lucide-react-native';

interface AdvanceSelectorProps {
  baseEmi: number;
  selectedWeeks: number;
  onSelectWeeks: (weeks: number) => void;
  unpaidDueDates: string[];
}

export const AdvanceSelector: React.FC<AdvanceSelectorProps> = ({
  baseEmi,
  selectedWeeks,
  onSelectWeeks,
  unpaidDueDates,
}) => {
  const options = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Sparkles size={14} color={Colors.warning} />
          <Text style={styles.headerTitle}>Select Installments / Advance Weeks</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {selectedWeeks > 1 ? `${selectedWeeks} Weeks Advance` : 'Current Week Only'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        {options.map((w) => {
          const isSelected = selectedWeeks === w;
          const totalAmount = baseEmi * w;
          return (
            <TouchableOpacity
              key={w}
              onPress={() => onSelectWeeks(w)}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
            >
              <Text style={[styles.weekLabel, isSelected && styles.weekLabelActive]}>
                {w} {w === 1 ? 'Wk' : 'Wks'}
              </Text>
              <Text style={[styles.amountLabel, isSelected && styles.amountLabelActive]}>
                ₹{totalAmount}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Due Dates Being Cleared Preview */}
      <View style={styles.datePreviewBox}>
        <View style={styles.datePreviewHeader}>
          <Calendar size={12} color={Colors.textMuted} />
          <Text style={styles.datePreviewTitle}>Clearing Due Dates in Advance:</Text>
        </View>
        <View style={styles.datesWrap}>
          {unpaidDueDates.slice(0, selectedWeeks).map((date, idx) => (
            <View key={idx} style={styles.dateChip}>
              <Text style={styles.dateChipText}>
                Wk {idx + 1}: {date} {idx > 0 ? '★ ADV' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  optionBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: Colors.primary,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  weekLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  amountLabelActive: {
    color: '#FFF',
  },
  datePreviewBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 8,
  },
  datePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  datePreviewTitle: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  datesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dateChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dateChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
  },
});
