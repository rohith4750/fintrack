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
import { useAuth } from '../../context/AuthContext';
import { Customer, Route, LoanType } from '../../types';
import { Plus, Check, Calendar, IndianRupee, Sparkles } from 'lucide-react-native';

export const AdminDisburseLoanScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { user } = useAuth();
  const preselectedCustomerCode = route?.params?.customerCode || '';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerCode, setSelectedCustomerCode] = useState(preselectedCustomerCode);
  const [selectedAgentId, setSelectedAgentId] = useState(user?.role === 'AGENT' ? (user.userId || user.id) : 'USR-02');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('WEEKLY');
  const [principalAmount, setPrincipalAmount] = useState('50000');
  const [interestRate, setInterestRate] = useState('14');
  const [durationUnits, setDurationUnits] = useState('60'); // 60 weeks
  const [processingFee, setProcessingFee] = useState('1000');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [custList, routeList, agentList] = await Promise.all([
        ApiService.getCustomers(),
        ApiService.getRoutes(),
        ApiService.getAgents(),
      ]);
      setCustomers(custList);
      setRoutes(routeList);
      setAgents(agentList);
      if (custList.length > 0) {
        const targetCust = (preselectedCustomerCode && custList.find((c) => c.customerCode === preselectedCustomerCode)) || custList[0];
        setSelectedCustomerCode(targetCust.customerCode);
        setSelectedRouteId(targetCust.routeId || (routeList[0]?.id || 'RT-01'));
        if (user?.role === 'AGENT') {
          setSelectedAgentId(user.userId || user.id);
        } else if (targetCust.assignedAgentId) {
          setSelectedAgentId(targetCust.assignedAgentId);
        } else if (agentList.length > 0) {
          setSelectedAgentId(agentList[0].userId || agentList[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load data for loan disbursal:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerCode(cust.customerCode);
    if (cust.routeId) {
      setSelectedRouteId(cust.routeId);
    }
    if (cust.assignedAgentId) {
      setSelectedAgentId(cust.assignedAgentId);
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

    const routeObj = routes.find((r) => r.id === selectedRouteId || r.routeId === selectedRouteId || r.id === customer.routeId) || routes[0] || {
      id: 'RT-01',
      routeId: 'RT-01',
      name: 'Main Road Beat',
      assignedAgentId: selectedAgentId || 'USR-02',
      assignedAgentName: 'Ramesh Varma',
    };

    const agentObj = agents.find((a) => a.id === selectedAgentId || a.userId === selectedAgentId) || {
      id: 'USR-02',
      userId: 'USR-02',
      name: 'Ramesh Varma',
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
        areaId: customer.areaId || routeObj.areaId || 'AREA-01',
        areaName: customer.areaName || routeObj.areaName || 'Rajahmundry Urban',
        routeId: routeObj.id || routeObj.routeId || 'RT-01',
        routeName: routeObj.name || 'Main Road Beat',
        agentId: agentObj.userId || agentObj.id || 'USR-02',
        agentName: agentObj.name || 'Ramesh Varma',
        disbursementDate: new Date().toISOString().split('T')[0],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remarks: remarks.trim() || `${loanType} finance disbursed at office counter`,
      };

      await ApiService.disburseLoan(loanPayload);

      Alert.alert(
        'Loan Disbursed Successfully',
        `New loan disbursed for ${customer.fullName} assigned to ${agentObj.name} with EMI of ₹${installmentEmi}/${loanType === 'WEEKLY' ? 'Wk' : 'Mo'}. Saved to database.`,
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
        subtitle="Customer Loan Scheme Onboarding"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Customer Selector Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Borrower Customer *</Text>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            placeholder="Search borrower by name or phone..."
            placeholderTextColor={Colors.textMuted}
            value={customerSearch}
            onChangeText={setCustomerSearch}
          />

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
              <View style={styles.customerListGrid}>
                {customers
                  .filter((c) => {
                    if (!customerSearch.trim()) return true;
                    const q = customerSearch.toLowerCase();
                    return (
                      c.fullName.toLowerCase().includes(q) ||
                      c.customerCode.toLowerCase().includes(q) ||
                      c.phone.includes(q)
                    );
                  })
                  .map((c) => {
                    const isSelected = selectedCustomerCode === c.customerCode;
                    return (
                      <TouchableOpacity
                        key={c.id || c.customerCode}
                        onPress={() => handleSelectCustomer(c)}
                        style={[styles.customerSelectCard, isSelected && styles.customerSelectCardActive]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.customerNameText, isSelected && styles.customerNameTextActive]}>
                            {c.fullName}
                          </Text>
                          <Text style={styles.customerMetaText}>
                            {c.customerCode} • {c.phone} • {c.areaName || 'Urban'}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedCheckCircle}>
                            <Check size={12} color="#FFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Assigned Recovery Officer / Agent / Admin Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Recovery Officer (Admin / Agent) *</Text>
          <Text style={styles.cardSubtitle}>Select field agent or admin officer responsible for EMI collection on this loan:</Text>
          <View style={styles.agentGrid}>
            {agents.map((ag) => {
              const isSelected = selectedAgentId === ag.id || selectedAgentId === ag.userId;
              const isAdmin = ag.role === 'ADMIN';
              return (
                <TouchableOpacity
                  key={ag.id || ag.userId}
                  onPress={() => setSelectedAgentId(ag.userId || ag.id || 'USR-02')}
                  style={[styles.agentSelectCard, isSelected && styles.agentSelectCardActive]}
                >
                  <View style={styles.agentSelectHeader}>
                    <View style={[styles.agentAvatar, isSelected && styles.agentAvatarActive, isAdmin && { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Text style={[styles.agentAvatarText, isSelected && styles.agentAvatarTextActive, isAdmin && { color: Colors.warning }]}>
                        {ag.name ? ag.name.slice(0, 2).toUpperCase() : 'AG'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.agentNameText, isSelected && styles.agentNameTextActive]}>
                          {ag.name}
                        </Text>
                        <View style={[styles.roleTag, isAdmin ? styles.adminTag : styles.agentTag]}>
                          <Text style={[styles.roleTagText, isAdmin ? styles.adminTagText : styles.agentTagText]}>
                            {isAdmin ? 'ADMIN' : 'AGENT'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.agentPhoneText}>{ag.phone || ag.loginId || ag.userId}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedCheckCircle}>
                        <Check size={12} color="#FFF" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Collection Beat Route Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Beat Route *</Text>
          <View style={styles.routeChipsRow}>
            {routes.map((r) => {
              const isSelected = selectedRouteId === r.id || selectedRouteId === r.routeId;
              return (
                <TouchableOpacity
                  key={r.id || r.routeId}
                  onPress={() => setSelectedRouteId(r.id || r.routeId || '')}
                  style={[styles.routeChip, isSelected && styles.routeChipActive]}
                >
                  <Text style={[styles.routeChipText, isSelected && styles.routeChipTextActive]}>
                    {r.name} ({r.code || 'Route'})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  customerListGrid: {
    gap: 8,
  },
  customerSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  customerSelectCardActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#2563EB',
  },
  customerNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  customerNameTextActive: {
    color: Colors.primaryLight,
  },
  customerMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  agentGrid: {
    gap: 8,
  },
  agentSelectCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  agentSelectCardActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#2563EB',
  },
  agentSelectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  agentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  agentAvatarActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  agentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  agentAvatarTextActive: {
    color: '#FFF',
  },
  agentNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  agentNameTextActive: {
    color: Colors.primaryLight,
  },
  agentPhoneText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  adminTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  agentTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  adminTagText: {
    color: Colors.warning,
  },
  agentTagText: {
    color: Colors.primaryLight,
  },
  selectedCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeChipsRow: {
    gap: 8,
  },
  routeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  routeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  routeChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  routeChipTextActive: {
    color: '#FFF',
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
