import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { Collection, Loan } from '../types';
import { Colors } from '../theme/colors';
import { CheckCircle2, QrCode } from 'lucide-react-native';

interface ThermalReceiptPreviewProps {
  collection: Collection;
  loan?: Loan;
}

export const ThermalReceiptPreview: React.FC<ThermalReceiptPreviewProps> = ({
  collection,
  loan,
}) => {
  const paidWeeks = loan
    ? Math.min(
        loan.durationUnits,
        Math.round((loan.totalPaidAmount + collection.amount) / (loan.installmentAmount || 1))
      )
    : collection.weeksCleared || 1;

  const remainingBal = loan
    ? Math.max(0, loan.outstandingBalance - collection.amount)
    : collection.balanceAfterPayment;

  return (
    <View style={styles.paper}>
      {/* Top Header */}
      <View style={styles.centerAlign}>
        <Text style={styles.receiptBrand}>FINTRACK FINANCE</Text>
        <Text style={styles.receiptSub}>Microfinance & Lending Solutions</Text>
        <Text style={styles.receiptPhone}>Support: 1800-425-9988</Text>
      </View>

      <View style={styles.dashedLine} />

      {/* Official Badge */}
      <View style={styles.statusBadge}>
        <CheckCircle2 size={14} color="#059669" />
        <Text style={styles.statusText}>COLLECTION RECEIPT (PAID)</Text>
      </View>

      <View style={styles.dashedLine} />

      {/* Key Fields */}
      <View style={styles.row}>
        <Text style={styles.label}>Receipt No:</Text>
        <Text style={styles.valueBold}>{collection.receiptNumber}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Date & Time:</Text>
        <Text style={styles.value}>
          {collection.collectionDate} {collection.time}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Agent / Officer:</Text>
        <Text style={styles.value}>
          {collection.agentName} ({collection.agentId})
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Route / Beat:</Text>
        <Text style={styles.value}>{collection.routeName}</Text>
      </View>

      <View style={styles.dashedLine} />

      <View style={styles.row}>
        <Text style={styles.label}>Customer:</Text>
        <Text style={styles.valueBold}>{collection.customerName}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Customer Code:</Text>
        <Text style={styles.value}>{collection.customerCode}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Loan Account:</Text>
        <Text style={styles.value}>{collection.loanNumber}</Text>
      </View>

      <View style={styles.dashedLine} />

      {/* Paid Amount Callout */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>AMOUNT COLLECTED</Text>
        <Text style={styles.amountValue}>₹{collection.amount.toLocaleString('en-IN')}.00</Text>
        <Text style={styles.modeText}>Mode: {collection.paymentMethod}</Text>
      </View>

      {collection.weeksCleared && collection.weeksCleared > 1 && (
        <View style={styles.advancePill}>
          <Text style={styles.advancePillText}>
            ★ {collection.weeksCleared} WEEKS ADVANCE EMI CLEARED
          </Text>
        </View>
      )}

      {loan && (
        <View style={styles.row}>
          <Text style={styles.label}>Tenure Cleared:</Text>
          <Text style={styles.valueBold}>
            {paidWeeks} of {loan.durationUnits} Weeks
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Remaining Balance:</Text>
        <Text style={styles.valueBold}>₹{remainingBal.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.dashedLine} />

      <View style={styles.centerAlign}>
        <Text style={styles.footerNote}>Thank you for your timely repayment!</Text>
        <Text style={styles.footerSub}>This is a system generated thermal voucher.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerAlign: {
    alignItems: 'center',
    marginVertical: 4,
  },
  receiptBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  receiptSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  receiptPhone: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    color: '#475569',
  },
  value: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
  },
  valueBold: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  amountContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },
  advancePill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 6,
  },
  advancePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  footerNote: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
});
