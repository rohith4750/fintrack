import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import {
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  RefreshCw,
  Coins,
  IndianRupee,
} from 'lucide-react-native';

export const AdminHandoverScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHandovers();
  }, []);

  const loadHandovers = async () => {
    try {
      setLoading(true);
      const list = await ApiService.getHandovers();
      setHandovers(list);
    } catch (e) {
      console.error('Failed to load handovers:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHandovers();
    setRefreshing(false);
  };

  const handleVerify = async (handoverId: string) => {
    try {
      const success = await ApiService.verifyHandover(handoverId, user?.name || 'Rajesh Kumar (Admin)');
      if (success) {
        Alert.alert('Voucher Verified', 'Cash bundle successfully verified and credited to branch vault.');
        setHandovers((prev) =>
          prev.map((h) => (h.id === handoverId ? { ...h, status: 'VERIFIED' } : h))
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to verify handover.');
    }
  };

  // Aggregate denominations across all submitted handovers
  const aggregateDenominations: { [key: string]: number } = {
    '500': 0,
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
  };

  let totalPhysicalCash = 0;
  let totalUpiAmount = 0;

  handovers.forEach((h) => {
    totalPhysicalCash += Number(h.totalCashAmount) || 0;
    totalUpiAmount += Number(h.totalUpiAmount) || 0;
    const den = h.denominations || {};
    Object.keys(den).forEach((key) => {
      const denomKey = key.replace('notes', '');
      if (aggregateDenominations[denomKey] !== undefined) {
        aggregateDenominations[denomKey] += Number(den[key]) || 0;
      }
    });
  });

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Cash Handovers & Denominations"
        subtitle="Agent Vault Reconciliation & Currency Breakdown"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Total Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Banknote size={20} color="#60A5FA" />
            <Text style={styles.summaryTitle}>Today's Regional Collection Vault</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>PHYSICAL CASH VAULT</Text>
              <Text style={styles.cashBigVal}>₹{totalPhysicalCash.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 12 }}>
              <Text style={styles.summaryLabel}>DIGITAL UPI ENTRIES</Text>
              <Text style={styles.upiBigVal}>₹{totalUpiAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Aggregate Denomination Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Coins size={16} color={Colors.warning} />
            <Text style={styles.cardTitle}>Total Currency Notes in Vault</Text>
          </View>

          <View style={styles.denomTable}>
            {Object.entries(aggregateDenominations).map(([note, count]) => {
              const value = parseInt(note) * count;
              return (
                <View key={note} style={styles.denomRow}>
                  <View style={styles.noteBadge}>
                    <Text style={styles.noteBadgeText}>₹{note}</Text>
                  </View>
                  <Text style={styles.denomCountText}>x {count} notes</Text>
                  <Text style={styles.denomValueText}>₹{value.toLocaleString('en-IN')}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Agent Submissions List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Agent Day-End Settlement Vouchers</Text>
          <Text style={styles.voucherCountText}>{handovers.length} Records</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: 20 }} />
        ) : handovers.length === 0 ? (
          <View style={[styles.card, { padding: 18, alignItems: 'center' }]}>
            <Text style={{ color: Colors.textMuted, fontSize: 13 }}>
              No cash handover vouchers recorded in database yet.
            </Text>
          </View>
        ) : (
          handovers.map((h) => {
            const isVerified = h.status === 'VERIFIED';
            const den = h.denominations || {};
            const activeNotes = Object.entries(den).filter(([_, count]: any) => count > 0);

            return (
              <View key={h.id || h.handoverNumber} style={styles.voucherCard}>
                <View style={styles.voucherTop}>
                  <View>
                    <Text style={styles.agentName}>{h.agentName}</Text>
                    <Text style={styles.voucherSub}>
                      Voucher #{h.handoverNumber || h.id} • {h.date} at {h.time}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      isVerified ? styles.statusPillVerified : styles.statusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isVerified ? styles.statusTextVerified : styles.statusTextPending,
                      ]}
                    >
                      {isVerified ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {/* Amounts */}
                <View style={styles.amountBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Physical Cash</Text>
                    <Text style={styles.cashAmount}>
                      ₹{(Number(h.totalCashAmount) || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Handed Over To</Text>
                    <Text style={styles.handoverTarget}>{h.handedOverTo || 'Admin'}</Text>
                  </View>
                </View>

                {/* Denomination Notes */}
                {activeNotes.length > 0 && (
                  <View style={styles.voucherDenoms}>
                    <Text style={styles.voucherDenomTitle}>Denominations:</Text>
                    <Text style={styles.voucherDenomContent}>
                      {activeNotes
                        .map(([k, count]) => `${count}x ₹${k.replace('notes', '')}`)
                        .join('   •   ')}
                    </Text>
                  </View>
                )}

                {/* Action button */}
                {!isVerified && (
                  <TouchableOpacity
                    onPress={() => handleVerify(h.id)}
                    style={styles.verifyBtn}
                  >
                    <ShieldCheck size={16} color="#FFF" />
                    <Text style={styles.verifyBtnText}>Verify & Accept Physical Cash</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  cashBigVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.successDark,
    marginTop: 2,
  },
  upiBigVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  denomTable: {
    gap: 8,
  },
  denomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noteBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    minWidth: 50,
    alignItems: 'center',
  },
  noteBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  denomCountText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  denomValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  voucherCountText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  voucherCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  voucherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  voucherSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillPending: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  statusPillVerified: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextPending: {
    color: Colors.warning,
  },
  statusTextVerified: {
    color: Colors.success,
  },
  amountBox: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cashAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.success,
    marginTop: 2,
  },
  handoverTarget: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  voucherDenoms: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  voucherDenomTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  voucherDenomContent: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    height: 42,
    borderRadius: 10,
    marginTop: 4,
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
