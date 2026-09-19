import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { Customer, Route, LoanType } from '../../types';
import { Plus, Check, Calendar, IndianRupee, Sparkles } from 'lucide-react-native';

export const AdminDisburseLoanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedCustomerCode, setSelectedCustomerCode] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('WEEKLY');
  const [principalAmount, setPrincipalAmount] = useState('50000');
  const [interestRate, setInterestRate] = useState('14');
  const [durationUnits, setDurationUnits] = useState('60'); // 60 weeks
  const [processingFee, setProcessingFee] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [custList, routeList] = await Promise.all([
        ApiService.getCustomers(),
        ApiService.getRoutes(),
      ]);
      setCustomers(custList);
      setRoutes(routeList);
      if (custList.length > 0) {
        setSelectedCustomerCode(custList[0].customerCode);
      }
    } catch (e) {
      console.error('Failed to load customers for loan disbursal:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const principal = Number(principalAmount) || 0;
  const rate = Number(interestRate) || 0;
  const units = Number(durationUnits) || 1;
  const fee = Number(processingFee) || 0;

  const totalInterest = Math.round((principal * rate) / 100);
  const totalRepayable = principal + totalInterest;
  const installmentEmi = Math.round(totalRepayable / units);

  const handleDisburse = async () => {
    if (principal <= 0 || units <= 0) {
      Alert.alert('Validation Error', 'Please enter valid loan amount and duration units.');
      return;
    }

    const customer = customers.find((c) => c.customerCode === selectedCustomerCode) || customers[0];
    if (!customer) {
      Alert.alert('No Customer Selected', 'Please select or add a customer first.');
      return;
    }

    const routeObj = routes.find((r) => r.id === customer.routeId || r.routeId === customer.routeId) || routes[0] || {
      id: 'RT-01',
      routeId: 'RT-01',
      name: 'Main Road Beat',
      assignedAgentId: 'USR-02',
      assignedAgentName: 'Suresh Varma',
    };

    setIsSubmitting(true);
    try {
      const loanPayload = {
        customerId: customer.id || customer.customerCode,
        customerCode: customer.customerCode,
        customerName: customer.fullName,
        phone: customer.phone,
        principalAmount: principal,
        interestRatePercentage: rate,
        totalInterestAmount: totalInterest,
        processingFee: fee,
        totalRepayableAmount: totalRepayable,
        installmentAmount: installmentEmi,
        durationUnits: units,
        loanType,
        areaId: customer.areaId || 'AREA-01',
        areaName: customer.areaName || 'Rajahmundry Urban',
        routeId: routeObj.id || routeObj.routeId || 'RT-01',
        routeName: routeObj.name || 'Main Road Beat',
        agentId: routeObj.assignedAgentId || 'USR-02',
        agentName: routeObj.assignedAgentName || 'Suresh Varma',
        disbursementDate: new Date().toISOString().split('T')[0],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      await ApiService.disburseLoan(loanPayload);

      Alert.alert(
        'Loan Disbursed Successfully',
        `New loan disbursed for ${customer.fullName} with EMI of ₹${installmentEmi}/${loanType === 'WEEKLY' ? 'Wk' : 'Mo'}. Saved to database.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to disburse loan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.textMuted }}>Loading Borrower Ledger...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Disburse New Loan"
        subtitle="Loan Creation & EMI Calculator"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Customer Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Borrower / Customer</Text>
          {customers.length === 0 ? (
            <Text style={{ color: Colors.textMuted, fontSize: 13, paddingVertical: 8 }}>
              No borrowers found in database. Please create a customer first.
            </Text>
          ) : (
            <View style={styles.customerChipsRow}>
              {customers.map((c) => {
                const isSelected = selectedCustomerCode === c.customerCode;
                return (
                  <TouchableOpacity
                    key={c.id || c.customerCode}
                    onPress={() => setSelectedCustomerCode(c.customerCode)}
                    style={[styles.customerChip, isSelected && styles.customerChipActive]}
                  >
                    <Text style={[styles.customerChipText, isSelected && styles.customerChipTextActive]}>
                      {c.fullName} ({c.customerCode})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Loan Type Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loan Scheme Frequency</Text>
          <View style={styles.typeRow}>
            {(['WEEKLY', 'MONTHLY', 'DAILY'] as LoanType[]).map((type) => {
              const isSelected = loanType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setLoanType(type);
                    if (type === 'WEEKLY') setDurationUnits('60');
                    if (type === 'MONTHLY') setDurationUnits('12');
                    if (type === 'DAILY') setDurationUnits('100');
                  }}
                  style={[styles.typeBtn, isSelected && styles.typeBtnActive]}
                >
                  <Text style={[styles.typeBtnText, isSelected && styles.typeBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Loan Numbers Inputs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Loan Financial Parameters</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Principal Loan Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={principalAmount}
              onChangeText={setPrincipalAmount}
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.inputLabel}>Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="numeric"
                placeholder="14"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.inputLabel}>Duration ({loanType === 'WEEKLY' ? 'Weeks' : 'Months'})</Text>
              <TextInput
                style={styles.input}
                value={durationUnits}
                onChangeText={setDurationUnits}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Documentation & Processing Fee (₹)</Text>
            <TextInput
              style={styles.input}
              value={processingFee}
              onChangeText={setProcessingFee}
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Live EMI Calculation Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Sparkles size={16} color={Colors.warning} />
            <Text style={styles.summaryTitle}>Automated Repayment Summary</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <Text style={styles.sumLabel}>INSTALLMENT EMI</Text>
              <Text style={styles.sumEmi}>₹{installmentEmi.toLocaleString('en-IN')}</Text>
              <Text style={styles.sumSub}>per {loanType.toLowerCase().slice(0, -2)}</Text>
            </View>

            <View style={styles.summaryCol}>
              <Text style={styles.sumLabel}>TOTAL REPAYABLE</Text>
              <Text style={styles.sumVal}>₹{totalRepayable.toLocaleString('en-IN')}</Text>
              <Text style={styles.sumSub}>₹{totalInterest} Interest Profit</Text>
            </View>
          </View>
        </View>

        {/* Submit Disbursement Button */}
        <TouchableOpacity
          onPress={handleDisburse}
          disabled={isSubmitting}
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Plus size={18} color="#FFF" />
              <Text style={styles.submitBtnText}>
                Disburse Loan (₹{principal.toLocaleString('en-IN')})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  customerChipsRow: {
    gap: 8,
  },
  customerChip: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    padding: 10,
  },
  customerChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  customerChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  customerChipTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E0E7FF',
    textTransform: 'uppercase',
  },
  summaryGrid: {
    flexDirection: 'row',
  },
  summaryCol: {
    flex: 1,
  },
  sumLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C7D2FE',
    letterSpacing: 0.5,
  },
  sumEmi: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 2,
  },
  sumVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  sumSub: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
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
});
