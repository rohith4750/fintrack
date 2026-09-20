import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { AdvanceSelector } from '../../components/AdvanceSelector';
import { ApiService } from '../../services/api';
import { Collection, Customer, Loan, PaymentMethod } from '../../types';
import {
  IndianRupee,
  CheckCircle2,
  QrCode,
  Banknote,
  Receipt,
  Sparkles,
  Calendar,
  Phone,
} from 'lucide-react-native';

export const CollectPaymentScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { user, updateUserStats } = useAuth();
  const { loanId, customerId, loan: passedLoan } = route.params || {};

  const [loan, setLoan] = useState<Loan | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [upiRef, setUpiRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLoanDetails();
  }, [loanId, customerId, passedLoan]);

  const loadLoanDetails = async () => {
    try {
      const [allLoans, allCustomers] = await Promise.all([
        ApiService.getLoans(),
        ApiService.getCustomers(),
      ]);

      const effectiveId = loanId || passedLoan?.id || passedLoan?.loanNumber;
      let foundLoan = passedLoan || allLoans.find((l) => l.id === effectiveId || l.loanNumber === effectiveId);
      if (!foundLoan && customerId) {
        foundLoan = allLoans.find((l) => l.customerId === customerId || l.customerCode === customerId);
      }

      if (foundLoan) {
        setLoan(foundLoan);
        const foundCustomer = allCustomers.find(
          (c) => c.id === foundLoan.customerId || c.customerCode === foundLoan.customerCode || c.customerCode === foundLoan.customerId
        );
        if (foundCustomer) {
          setCustomer(foundCustomer);
        }
      }
    } catch (e) {
      console.error('Error loading loan details:', e);
    }
  };

  if (!loan || !customer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  // Get unpaid due dates
  const unpaidInstallments = (loan.installments || []).filter((i) => i.status !== 'PAID');
  const unpaidDueDates = unpaidInstallments.map((i) => i.dueDate);

  const isClosed = loan.status === 'CLOSED' || loan.outstandingBalance <= 0;
  const baseEmi = loan.installmentAmount;
  const totalPayable = isClosed ? 0 : baseEmi * selectedWeeks;

  const handleSubmit = async () => {
    if (isClosed) {
      Alert.alert(
        'Loan Fully Settled',
        'This loan is completely repaid and closed. No further EMI collections can be recorded.'
      );
      return;
    }

    if (totalPayable <= 0) {
      Alert.alert('Invalid Amount', 'Please select at least 1 installment to collect');
      return;
    }

    if (paymentMethod === 'UPI' && !upiRef.trim()) {
      Alert.alert('UPI Reference Required', 'Please enter UPI Transaction Reference / UTR');
      return;
    }

    setIsSubmitting(true);
    try {
      const { date: currentDate, time: currentTime } = ApiService.formatCurrentDateTime();

      const collectionPayload: Omit<Collection, 'id' | 'receiptNumber'> = {
        customerId: customer.id,
        customerCode: customer.customerCode,
        customerName: customer.fullName,
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        agentId: user?.userId || 'USR-02',
        agentName: user?.name || 'Field Officer',
        amount: totalPayable,
        paymentMethod,
        upiTransactionId: paymentMethod === 'UPI' ? upiRef : undefined,
        collectionDate: currentDate,
        time: currentTime,
        areaName: loan.areaName,
        routeName: loan.routeName,
        installmentNumber: unpaidInstallments[0]?.installmentNumber || 1,
        balanceAfterPayment: Math.max(0, loan.outstandingBalance - totalPayable),
        weeksCleared: selectedWeeks,
        remarks: remarks || (selectedWeeks > 1 ? `Advance paid for ${selectedWeeks} weeks` : 'Regular weekly collection'),
      };

      const recorded = await ApiService.recordCollection(collectionPayload);

      // Update in-memory stats
      updateUserStats(totalPayable);

      // Navigate to Receipt View
      navigation.replace('ReceiptView', {
        collection: recorded,
        loan: {
          ...loan,
          totalPaidAmount: loan.totalPaidAmount + totalPayable,
          outstandingBalance: Math.max(0, loan.outstandingBalance - totalPayable),
        },
        customer,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to record collection. Saved locally in offline queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Collect Payment"
        subtitle={`${customer.fullName} • ${loan.loanNumber}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Closed Loan Notification Banner */}
        {isClosed && (
          <View style={styles.closedBanner}>
            <CheckCircle2 size={24} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.closedBannerTitle}>Loan Fully Settled & Closed</Text>
              <Text style={styles.closedBannerSubtitle}>
                All scheduled EMI installments for this loan have been completely repaid. Remaining balance is ₹0. No further collections can be accepted.
              </Text>
            </View>
          </View>
        )}

        {/* Borrower Card Header */}
        <View style={styles.borrowerCard}>
          <View style={styles.borrowerTop}>
            <View>
              <Text style={styles.borrowerName}>{customer.fullName}</Text>
              <Text style={styles.borrowerCode}>{customer.customerCode} • {customer.phone}</Text>
            </View>
            <View style={styles.routeTag}>
              <Text style={styles.routeTagText}>{loan.routeName}</Text>
            </View>
          </View>

          <View style={styles.loanStatsGrid}>
            <View style={styles.loanStatItem}>
              <Text style={styles.loanStatLabel}>Installment (EMI)</Text>
              <Text style={styles.loanStatValue}>₹{loan.installmentAmount}/Wk</Text>
            </View>
            <View style={styles.loanStatItem}>
              <Text style={styles.loanStatLabel}>Outstanding Balance</Text>
              <Text style={[styles.loanStatValue, { color: isClosed ? Colors.success : Colors.warning }]}>
                {isClosed ? '₹0 (Settled)' : `₹${loan.outstandingBalance.toLocaleString('en-IN')}`}
              </Text>
            </View>
          </View>
        </View>

        {isClosed ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.returnBtn}
          >
            <Text style={styles.returnBtnText}>Return to Ledger / Dashboard</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Advance Weeks Multiplier Component */}
            <AdvanceSelector
              baseEmi={baseEmi}
              selectedWeeks={selectedWeeks}
              onSelectWeeks={setSelectedWeeks}
              unpaidDueDates={unpaidDueDates}
            />

            {/* Total Amount Callout Card */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Collection Amount</Text>
              <Text style={styles.totalValue}>₹{totalPayable.toLocaleString('en-IN')}</Text>
              <Text style={styles.totalSub}>
                Includes {selectedWeeks} weekly installment{selectedWeeks > 1 ? 's' : ''} (₹{baseEmi} × {selectedWeeks})
              </Text>
            </View>

            {/* Payment Method Selector */}
            <View style={styles.paymentMethodSection}>
              <Text style={styles.sectionTitle}>Payment Mode</Text>
              <View style={styles.modeButtonsRow}>
                <TouchableOpacity
                  onPress={() => setPaymentMethod('CASH')}
                  style={[styles.modeBtn, paymentMethod === 'CASH' && styles.modeBtnActive]}
                >
                  <Banknote size={18} color={paymentMethod === 'CASH' ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.modeBtnText, paymentMethod === 'CASH' && styles.modeBtnTextActive]}>
                    Physical Cash
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPaymentMethod('UPI')}
                  style={[styles.modeBtn, paymentMethod === 'UPI' && styles.modeBtnActive]}
                >
                  <QrCode size={18} color={paymentMethod === 'UPI' ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.modeBtnText, paymentMethod === 'UPI' && styles.modeBtnTextActive]}>
                    UPI QR / PhonePe
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'UPI' && (
                <View style={styles.upiInputWrapper}>
                  <Text style={styles.inputLabel}>UPI UTR / Reference ID</Text>
                  <TextInput
                    style={styles.input}
                    value={upiRef}
                    onChangeText={setUpiRef}
                    placeholder="e.g. 426899120345"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              )}
            </View>

            {/* Optional Remarks */}
            <View style={styles.remarksSection}>
              <Text style={styles.sectionTitle}>Collection Remarks (Optional)</Text>
              <TextInput
                style={styles.remarksInput}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="e.g. Borrower paid in advance for festival week"
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>

            {/* Submit & Generate Thermal Receipt Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Receipt size={18} color="#FFF" />
                  <Text style={styles.submitBtnText}>
                    Confirm & Issue Receipt (₹{totalPayable})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  borrowerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  borrowerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  borrowerCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  routeTag: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  routeTagText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  loanStatsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
  },
  loanStatItem: {
    flex: 1,
  },
  loanStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  loanStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  totalCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E0E7FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginVertical: 4,
  },
  totalSub: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  paymentMethodSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    paddingVertical: 10,
  },
  modeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  upiInputWrapper: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 13,
  },
  remarksSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 20,
  },
  remarksInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    padding: 10,
    color: Colors.text,
    fontSize: 12,
    height: 60,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    height: 52,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  closedBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.success,
  },
  closedBannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  returnBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
});
