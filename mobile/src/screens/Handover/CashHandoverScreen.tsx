import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { DenominationTable } from '../../components/DenominationTable';
import { ApiService } from '../../services/api';
import { CashDenomination, Collection } from '../../types';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileCheck,
  Banknote,
  QrCode,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from 'lucide-react-native';

export const CashHandoverScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Denominations start clean at 0 (no hardcoded/faulty defaults)
  const [denominations, setDenominations] = useState<CashDenomination>({
    notes2000: 0,
    notes500: 0,
    notes200: 0,
    notes100: 0,
    notes50: 0,
    notes20: 0,
    notes10: 0,
    coins: 0,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);

  // Fetch live collections and handovers on mount and whenever screen is focused
  const loadData = async () => {
    if (!user) return;
    try {
      const [colList, handList] = await Promise.all([
        ApiService.getTodayCollections(user.userId),
        ApiService.getHandovers(),
      ]);
      setCollections(Array.isArray(colList) ? colList : []);
      setHandovers(Array.isArray(handList) ? handList : []);
    } catch (e) {
      console.log('Error loading cash handover live data:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter collections for this logged-in agent
  const myCollections = collections.filter(
    (c) => c.agentId === user?.userId || c.agentName === user?.name
  );

  // STRICT CASH ISOLATION: Only collections with paymentMethod === 'CASH'
  const cashCollections = myCollections.filter((c) => c.paymentMethod === 'CASH');
  const totalCashCollected = cashCollections.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );

  // UPI collections (Direct to bank, strictly excluded from physical cash handover)
  const upiCollections = myCollections.filter((c) => c.paymentMethod === 'UPI');
  const totalUpiCollected = upiCollections.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );

  // Handovers already submitted by this agent
  const myHandovers = handovers.filter(
    (h) => h.agentId === user?.userId || h.agentName === user?.name
  );
  const alreadyHandedOverCash = myHandovers.reduce(
    (sum, h) => sum + (Number(h.totalCashAmount) || 0),
    0
  );

  // The actual physical cash in hand that needs to be handed over
  const remainingCashToHandover = Math.max(0, totalCashCollected - alreadyHandedOverCash);

  // Calculate counted denominations
  const notesConfig: Array<{ key: keyof CashDenomination; multiplier: number }> = [
    { key: 'notes2000', multiplier: 2000 },
    { key: 'notes500', multiplier: 500 },
    { key: 'notes200', multiplier: 200 },
    { key: 'notes100', multiplier: 100 },
    { key: 'notes50', multiplier: 50 },
    { key: 'notes20', multiplier: 20 },
    { key: 'notes10', multiplier: 10 },
    { key: 'coins', multiplier: 1 },
  ];

  const totalCalculated = notesConfig.reduce(
    (sum, item) => sum + (denominations[item.key] || 0) * item.multiplier,
    0
  );

  const handleDenominationChange = (key: keyof CashDenomination, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: count,
    }));
  };

  // Quick helper to auto-fill denominations for remaining cash
  const handleAutoFill = () => {
    let rem = remainingCashToHandover;
    const newDenom: CashDenomination = {
      notes2000: 0,
      notes500: 0,
      notes200: 0,
      notes100: 0,
      notes50: 0,
      notes20: 0,
      notes10: 0,
      coins: 0,
    };
    if (rem >= 500) {
      newDenom.notes500 = Math.floor(rem / 500);
      rem %= 500;
    }
    if (rem >= 200) {
      newDenom.notes200 = Math.floor(rem / 200);
      rem %= 200;
    }
    if (rem >= 100) {
      newDenom.notes100 = Math.floor(rem / 100);
      rem %= 100;
    }
    if (rem >= 50) {
      newDenom.notes50 = Math.floor(rem / 50);
      rem %= 50;
    }
    if (rem >= 20) {
      newDenom.notes20 = Math.floor(rem / 20);
      rem %= 20;
    }
    if (rem >= 10) {
      newDenom.notes10 = Math.floor(rem / 10);
      rem %= 10;
    }
    newDenom.coins = rem;
    setDenominations(newDenom);
  };

  const handleClear = () => {
    setDenominations({
      notes2000: 0,
      notes500: 0,
      notes200: 0,
      notes100: 0,
      notes50: 0,
      notes20: 0,
      notes10: 0,
      coins: 0,
    });
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const record = await ApiService.submitCashHandover({
        agentId: user?.userId || 'USR-02',
        agentName: user?.name || 'Suresh Varma',
        date: todayStr,
        time: nowTime,
        totalCollections: cashCollections.length,
        totalCashAmount: totalCalculated,
        totalUpiAmount: totalUpiCollected,
        denominations,
        handedOverTo: 'FinTrack Central Vault (Admin)',
        status: 'SUBMITTED',
        managerRemarks: `Physical cash handover of ₹${totalCalculated} (${cashCollections.length} cash collections)`,
      });

      setVoucher(record);
      setIsSubmitted(true);
      Alert.alert('Handover Submitted', `Cash Handover Voucher #${record.handoverNumber || record.id} generated.`);
      await loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit handover.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitHandover = () => {
    if (remainingCashToHandover <= 0 && totalCalculated <= 0) {
      Alert.alert('No Pending Cash', 'You have no pending physical cash to hand over.');
      return;
    }

    if (totalCalculated <= 0) {
      Alert.alert('Count Required', 'Please enter your physical currency note counts.');
      return;
    }

    const diff = totalCalculated - remainingCashToHandover;
    if (diff !== 0) {
      Alert.alert(
        'Discrepancy Detected',
        `Counted Cash: ₹${totalCalculated.toLocaleString('en-IN')}\nExpected Cash: ₹${remainingCashToHandover.toLocaleString('en-IN')}\nDifference: ${diff > 0 ? '+' : ''}₹${diff.toLocaleString('en-IN')}\n\nDo you wish to submit with this discrepancy?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm & Submit', onPress: executeSubmit },
        ]
      );
    } else {
      executeSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Day-End Cash Handover"
        subtitle="Physical Cash & Denomination Reconciliation"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Central Vault Handover Info */}
        <View style={styles.branchCard}>
          <View style={styles.branchIconWrapper}>
            <Building2 size={20} color={Colors.primaryLight} />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchName}>FinTrack Central Cash Vault</Text>
            <Text style={styles.branchSub}>
              Vault Deposit Code: VLT-CENTRAL • Main Cashier Counter
            </Text>
          </View>
        </View>

        {/* Live Cash vs UPI Summary Card */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Banknote size={14} color={Colors.success} />
                <Text style={styles.metricLabel}>PHYSICAL CASH</Text>
              </View>
              <Text style={styles.metricCashVal}>₹{totalCashCollected.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricSub}>{cashCollections.length} Cash Collections</Text>
            </View>

            <View style={[styles.metricItem, styles.metricItemBorder]}>
              <View style={styles.metricHeader}>
                <QrCode size={14} color={Colors.primaryLight} />
                <Text style={styles.metricLabel}>DIGITAL UPI QR</Text>
              </View>
              <Text style={styles.metricUpiVal}>₹{totalUpiCollected.toLocaleString('en-IN')}</Text>
              <Text style={styles.metricSub}>Direct to Bank ({upiCollections.length})</Text>
            </View>
          </View>

          <View style={styles.vaultProgressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressTitle}>Handover Reconciliation Status</Text>
              <Text style={styles.progressBalance}>
                Pending in Hand: <Text style={{ color: remainingCashToHandover > 0 ? Colors.warning : Colors.success, fontWeight: '800' }}>₹{remainingCashToHandover.toLocaleString('en-IN')}</Text>
              </Text>
            </View>
            {alreadyHandedOverCash > 0 && (
              <Text style={styles.alreadyHandedText}>
                ✓ ₹{alreadyHandedOverCash.toLocaleString('en-IN')} already submitted to vault today
              </Text>
            )}
          </View>
        </View>

        {/* Newly Submitted Voucher View */}
        {isSubmitted && voucher ? (
          <View style={styles.voucherCard}>
            <View style={styles.voucherHeader}>
              <CheckCircle2 size={24} color={Colors.success} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.voucherTitle}>Handover Voucher Generated</Text>
                <Text style={styles.voucherSub}>
                  Voucher #{voucher.handoverNumber || voucher.id}
                </Text>
              </View>
            </View>

            <View style={styles.voucherDivider} />

            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Physical Cash Deposited:</Text>
              <Text style={styles.vVal}>₹{(Number(voucher.totalCashAmount) || 0).toLocaleString('en-IN')}.00</Text>
            </View>
            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Depositing Agent:</Text>
              <Text style={styles.vVal}>{user?.name} ({user?.userId})</Text>
            </View>
            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Vault Destination:</Text>
              <Text style={styles.vVal}>{voucher.handedOverTo || 'Central Vault (Admin)'}</Text>
            </View>
            <View style={styles.voucherRow}>
              <Text style={styles.vLabel}>Status:</Text>
              <Text style={[styles.vVal, { color: Colors.warning }]}>SUBMITTED (Awaiting Admin Verification)</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                setVoucher(null);
                handleClear();
              }}
              style={styles.newSubmissionBtn}
            >
              <Text style={styles.newSubmissionText}>Record Another Handover / Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('AgentDashboard')}
              style={styles.returnBtn}
            >
              <Text style={styles.returnBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : remainingCashToHandover === 0 && totalCashCollected > 0 ? (
          /* All Cash Cleared Banner */
          <View style={styles.allClearedCard}>
            <CheckCircle2 size={32} color={Colors.success} />
            <Text style={styles.allClearedTitle}>All Cash Handed Over</Text>
            <Text style={styles.allClearedSub}>
              All physical cash collected today (₹{totalCashCollected.toLocaleString('en-IN')}) has been completely submitted to the Central Cash Vault.
            </Text>
            {upiCollections.length > 0 && (
              <Text style={styles.upiNoteText}>
                Remaining ₹{totalUpiCollected.toLocaleString('en-IN')} was collected via UPI QR and is directly settled in the bank account.
              </Text>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('AgentDashboard')}
              style={styles.returnBtn}
            >
              <Text style={styles.returnBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : totalCashCollected === 0 ? (
          /* No Physical Cash Collected Banner */
          <View style={styles.noCashCard}>
            <AlertCircle size={28} color={Colors.primaryLight} />
            <Text style={styles.noCashTitle}>No Physical Cash in Hand</Text>
            <Text style={styles.noCashSub}>
              No physical cash collections recorded for today yet.
              {upiCollections.length > 0
                ? ` You collected ₹${totalUpiCollected.toLocaleString('en-IN')} via UPI QR, which was directly credited to the bank account.`
                : ' As you collect cash EMIs on the beat, they will appear here automatically.'}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('BeatCollection')}
              style={styles.returnBtn}
            >
              <Text style={styles.returnBtnText}>Open Beat Route</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Denomination Entry Form */
          <>
            {/* Quick Action Helpers */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity onPress={handleAutoFill} style={styles.autoFillBtn}>
                <Sparkles size={13} color="#FFF" />
                <Text style={styles.autoFillText}>
                  Auto-Match Notes (₹{remainingCashToHandover.toLocaleString('en-IN')})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <RotateCcw size={13} color={Colors.textSecondary} />
                <Text style={styles.clearText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Currency Denomination Counter Table */}
            <DenominationTable
              denominations={denominations}
              onChange={handleDenominationChange}
              expectedAmount={remainingCashToHandover}
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
                    Submit Cash Handover (₹{totalCalculated.toLocaleString('en-IN')})
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
  metricsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricItemBorder: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.surfaceBorder,
    paddingLeft: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  metricCashVal: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.success,
  },
  metricUpiVal: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  vaultProgressSection: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    padding: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressBalance: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alreadyHandedText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  autoFillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  autoFillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  allClearedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginVertical: 12,
  },
  allClearedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 10,
  },
  allClearedSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  upiNoteText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noCashCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 12,
  },
  noCashTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 10,
  },
  noCashSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
    paddingVertical: 5,
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
  newSubmissionBtn: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  newSubmissionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  returnBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
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

