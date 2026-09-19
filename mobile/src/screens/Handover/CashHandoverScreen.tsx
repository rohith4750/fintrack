import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { DenominationTable } from '../../components/DenominationTable';
import { ApiService } from '../../services/api';
import { CashDenomination } from '../../types';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Receipt,
  FileCheck,
} from 'lucide-react-native';

export const CashHandoverScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const todayCashCollected = user?.todayCollected || 18500;

  const [denominations, setDenominations] = useState<CashDenomination>({
    notes2000: 0,
    notes500: 35, // 17,500
    notes200: 4,  // 800
    notes100: 2,  // 200
    notes50: 0,
    notes20: 0,
    notes10: 0,
    coins: 0,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherNo, setVoucherNo] = useState<string | null>(null);

  const handleDenominationChange = (key: keyof CashDenomination, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: count,
    }));
  };

  const handleSubmitHandover = async () => {
    setIsSubmitting(true);
    try {
      const record = await ApiService.submitCashHandover({
        agentId: user?.userId || 'USR-02',
        agentName: user?.name || 'Suresh Varma',
        date: '2026-09-20',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        totalCollections: 12,
        totalCashAmount: todayCashCollected,
        totalUpiAmount: 0,
        denominations,
        handedOverTo: 'Branch Cashier (Rajahmundry Main)',
        status: 'SUBMITTED',
        managerRemarks: 'Verified full cash bundle without shortages',
      });

      setVoucherNo(record.id);
      setIsSubmitted(true);
      Alert.alert('Handover Submitted', `Cash Handover Voucher #${record.id} generated.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit handover.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Day-End Cash Handover"
        subtitle="Physical Cash & Denomination Reconciliation"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Branch Handover Info */}
        <View style={styles.branchCard}>
          <View style={styles.branchIconWrapper}>
            <Building2 size={20} color={Colors.primaryLight} />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchName}>Rajahmundry Urban Regional Branch</Text>
            <Text style={styles.branchSub}>
              Branch Vault Code: BR-RJY-01 • Cashier Counter #1
            </Text>
          </View>
        </View>

        {isSubmitted && voucherNo ? (
          <View style={styles.voucherCard}>
            <View style={styles.voucherHeader}>
              <CheckCircle2 size={24} color={Colors.success} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.voucherTitle}>Handover Voucher Generated</Text>
                <Text style={styles.voucherSub}>Voucher ID: {voucherNo}</Text>
              </View>
            </View>

            <View style={styles.voucherDivider} />

            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Total Cash Amount:</Text>
              <Text style={styles.vVal}>₹{todayCashCollected.toLocaleString('en-IN')}.00</Text>
            </View>
            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Agent Name & ID:</Text>
              <Text style={styles.vVal}>{user?.name} ({user?.userId})</Text>
            </View>
            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Status:</Text>
              <Text style={[styles.vVal, { color: Colors.success }]}>SUBMITTED & VERIFIED</Text>
            </View>
            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Handed Over To:</Text>
              <Text style={styles.vVal}>Branch Cashier (Rajahmundry)</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.returnBtn}
            >
              <Text style={styles.returnBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Currency Denomination Counter Table */}
            <DenominationTable
              denominations={denominations}
              onChange={handleDenominationChange}
              expectedAmount={todayCashCollected}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitHandover}
              disabled={isSubmitting}
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <FileCheck size={18} color="#FFF" />
                  <Text style={styles.submitBtnText}>
                    Submit Day-End Cash Handover (₹{todayCashCollected.toLocaleString('en-IN')})
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
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  branchIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  branchSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  voucherCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  voucherSub: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  voucherDivider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 12,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  vLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  vVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  returnBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  returnBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    height: 52,
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
