import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { KpiCard } from '../../components/KpiCard';
import { ApiService } from '../../services/api';
import { Loan, Route, Customer, Expense } from '../../types';
import {
  TrendingUp,
  WalletCards,
  Users,
  AlertTriangle,
  Plus,
  Receipt,
  FileText,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building,
  Banknote,
  Sparkles,
  IndianRupee,
} from 'lucide-react-native';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [handovers, setHandovers] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = useCallback(async () => {
    try {
      const [allLoans, allRoutes, allCustomers, allHandovers, allCollections] = await Promise.all([
        ApiService.getLoans(),
        ApiService.getRoutes(),
        ApiService.getCustomers(),
        ApiService.getHandovers(),
        ApiService.getTodayCollections(),
      ]);
      setLoans(allLoans);
      setRoutes(allRoutes);
      setCustomers(allCustomers);
      setHandovers(allHandovers);
      setCollections(allCollections);
    } catch (e) {
      console.log('Error loading admin DB data', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAdminData();
    }, [loadAdminData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleVerifyHandover = async (handoverId: string) => {
    try {
      const success = await ApiService.verifyHandover(handoverId, user?.name || 'Rajesh Kumar (Admin)');
      if (success) {
        setHandovers((prev) =>
          prev.map((h) => (h.id === handoverId ? { ...h, status: 'VERIFIED' } : h))
        );
      }
    } catch (e) {}
  };

  // Deep Financial Statistics
  const totalDisbursed = loans.reduce((sum, l) => sum + (Number(l.principalAmount) || 0), 0);
  const totalRepayable = loans.reduce((sum, l) => sum + (Number(l.totalRepayableAmount) || 0), 0);
  const totalCollected = loans.reduce((sum, l) => sum + (Number(l.totalPaidAmount) || 0), 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);
  const grossProfitMargin = totalRepayable - totalDisbursed;
  const roiYield = totalDisbursed > 0 ? ((grossProfitMargin / totalDisbursed) * 100).toFixed(1) : '0';
  const recoveryProgress = totalRepayable > 0 ? Math.round((totalCollected / totalRepayable) * 100) : 0;

  const overdueLoans = loans.filter((l) => l.status === 'OVERDUE' || l.status === 'DEFAULTED');
  const overdueCount = overdueLoans.length;
  const overdueCapitalAtRisk = overdueLoans.reduce((sum, l) => sum + (Number(l.outstandingBalance) || 0), 0);

  const todayCashTotal = handovers.reduce((sum, h) => sum + (Number(h.totalCashAmount) || 0), 0);
  const todayUpiTotal = collections.filter(c => c.paymentMethod === 'UPI').reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const todayTotalCollected = collections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Admin Control Center"
        subtitle="Executive Finance & Regional Operations"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Quick Create Action Grid (2x2) */}
        <View style={styles.actionGridContainer}>
          <View style={styles.actionGridRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminDisburseLoan')}
              style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Disburse Loan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('AdminCreateCustomer')}
              style={[styles.actionBtn, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder }]}
            >
              <Users size={16} color={Colors.primaryLight} />
              <Text style={[styles.actionBtnText, { color: Colors.text }]}>Add Customer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionGridRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminCreateAgent')}
              style={[styles.actionBtn, { backgroundColor: 'rgba(59, 130, 246, 0.12)', borderWidth: 1, borderColor: Colors.primaryLight }]}
            >
              <ShieldCheck size={16} color={Colors.primaryLight} />
              <Text style={[styles.actionBtnText, { color: Colors.primaryLight }]}>Add Agent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('AdminCreateRoute')}
              style={[styles.actionBtn, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderWidth: 1, borderColor: Colors.warning }]}
            >
              <MapPin size={16} color={Colors.warning} />
              <Text style={[styles.actionBtnText, { color: Colors.warning }]}>Add Beat Route</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Executive Portfolio Investment & Returns Analysis */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio Financial Analysis</Text>
          <View style={styles.adminPill}>
            <ShieldCheck size={12} color={Colors.success} />
            <Text style={styles.adminPillText}>Executive P&L</Text>
          </View>
        </View>

        {/* Executive P&L Hero Card */}
        <View style={styles.heroProfitCard}>
          <View style={styles.heroProfitTop}>
            <View>
              <Text style={styles.heroProfitOverline}>PROJECTED NET PROFIT</Text>
              <Text style={styles.heroProfitValue}>+₹{grossProfitMargin.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.roiBadge}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={styles.roiBadgeText}>+{roiYield}% ROI</Text>
            </View>
          </View>

          <View style={styles.heroMetricsGrid}>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>Capital Invested</Text>
              <Text style={styles.heroMetricVal}>₹{totalDisbursed.toLocaleString('en-IN')}</Text>
              <Text style={styles.heroMetricSub}>{loans.length} Loans Disbursed</Text>
            </View>

            <View style={styles.heroMetricDivider} />

            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>Expected Returns</Text>
              <Text style={[styles.heroMetricVal, { color: Colors.warning }]}>
                ₹{totalRepayable.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.heroMetricSub}>Principal + Interest</Text>
            </View>
          </View>

          {/* Recovery Progress Bar */}
          <View style={styles.heroRecoveryBox}>
            <View style={styles.heroRecoveryHeader}>
              <Text style={styles.heroRecoveryLabel}>Capital Recovered Till Date</Text>
              <Text style={styles.heroRecoveryPercent}>
                ₹{totalCollected.toLocaleString('en-IN')} ({recoveryProgress}%)
              </Text>
            </View>
            <View style={styles.heroRecoveryTrack}>
              <View style={[styles.heroRecoveryBar, { width: `${Math.min(100, Math.max(2, recoveryProgress))}%` }]} />
            </View>
          </View>
        </View>

        {/* Key Financial Stat Cards */}
        <View style={styles.kpiRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <KpiCard
              label="Capital Invested"
              value={`₹${totalDisbursed.toLocaleString('en-IN')}`}
              subValue="Principal Outflow"
              icon={<WalletCards size={18} color={Colors.primaryLight} />}
              variant="primary"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <KpiCard
              label="Expected Returns"
              value={`₹${totalRepayable.toLocaleString('en-IN')}`}
              subValue="Gross Contracted Value"
              icon={<TrendingUp size={18} color={Colors.warning} />}
              variant="warning"
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <KpiCard
              label="Net Interest Profit"
              value={`₹${grossProfitMargin.toLocaleString('en-IN')}`}
              subValue={`+${roiYield}% Yield Margin`}
              icon={<Sparkles size={18} color={Colors.success} />}
              variant="success"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <KpiCard
              label="Recovered Capital"
              value={`₹${totalCollected.toLocaleString('en-IN')}`}
              subValue={`${recoveryProgress}% Total Repaid`}
              icon={<ShieldCheck size={18} color={Colors.success} />}
              variant="success"
              progress={recoveryProgress}
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <KpiCard
              label="Market Outstanding"
              value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
              subValue="Active in Market"
              icon={<Building size={18} color={Colors.primaryLight} />}
              variant="primary"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <KpiCard
              label="At-Risk / Overdue"
              value={`₹${overdueCapitalAtRisk.toLocaleString('en-IN')}`}
              subValue={`${overdueCount} Accounts Overdue`}
              icon={<AlertTriangle size={18} color={Colors.danger} />}
              variant="danger"
            />
          </View>
        </View>

        {/* Live Today's Inflow */}
        <KpiCard
          label="Today's Total Field Collections"
          value={`₹${todayTotalCollected.toLocaleString('en-IN')}`}
          subValue={`Cash: ₹${todayCashTotal.toLocaleString('en-IN')} • UPI: ₹${todayUpiTotal.toLocaleString('en-IN')} (${collections.length} receipts)`}
          icon={<Banknote size={20} color={Colors.success} />}
          variant="success"
        />

        {/* Live Field Cash Handovers & Denominations Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Agent Cash Handovers & Denominations</Text>
          <View style={styles.adminPill}>
            <ShieldCheck size={12} color={Colors.primaryLight} />
            <Text style={[styles.adminPillText, { color: Colors.primaryLight }]}>
              {handovers.length} Submissions
            </Text>
          </View>
        </View>

        {handovers.length === 0 ? (
          <View style={[styles.card, { padding: 14, alignItems: 'center' }]}>
            <Text style={{ fontSize: 12, color: Colors.textMuted }}>
              No day-end cash handovers submitted yet for today.
            </Text>
          </View>
        ) : (
          handovers.map((h) => {
            const isVerified = h.status === 'VERIFIED';
            const den = h.denominations || {};
            const denList = Object.entries(den)
              .filter(([_, count]: any) => count > 0)
              .map(([key, count]) => `${count}x ₹${key.replace('notes', '')}`);

            return (
              <View key={h.id || h.handoverNumber} style={[styles.card, styles.handoverCard]}>
                <View style={styles.handoverHeader}>
                  <View>
                    <Text style={styles.handoverAgentName}>{h.agentName}</Text>
                    <Text style={styles.handoverMeta}>
                      Voucher #{h.handoverNumber || h.id} • {h.time || 'Evening'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, isVerified ? styles.statusBadgeVerified : styles.statusBadgePending]}>
                    <Text style={[styles.statusBadgeText, isVerified ? styles.statusBadgeTextVerified : styles.statusBadgeTextPending]}>
                      {isVerified ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {/* Amount breakdown */}
                <View style={styles.handoverAmountRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.handoverLabel}>Cash Handed Over</Text>
                    <Text style={styles.handoverCashVal}>
                      ₹{(Number(h.totalCashAmount) || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  {Number(h.totalUpiAmount) > 0 && (
                    <View style={{ flex: 1 }}>
                      <Text style={styles.handoverLabel}>UPI Collections</Text>
                      <Text style={styles.handoverUpiVal}>
                        ₹{(Number(h.totalUpiAmount) || 0).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Denomination Notes */}
                {denList.length > 0 && (
                  <View style={styles.denominationsBox}>
                    <Text style={styles.denominationsTitle}>Denomination Breakdown:</Text>
                    <Text style={styles.denominationsText}>
                      {denList.join('  •  ')}
                    </Text>
                  </View>
                )}

                {/* Admin Verify Button */}
                {!isVerified && (
                  <TouchableOpacity
                    onPress={() => handleVerifyHandover(h.id)}
                    style={styles.verifyBtn}
                  >
                    <ShieldCheck size={14} color="#FFF" />
                    <Text style={styles.verifyBtnText}>Verify & Accept Cash Bundle</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {/* Quick Navigation Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Management Modules</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminAgentCollections')}
          style={styles.menuCard}
        >
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
            <Receipt size={20} color={Colors.primaryLight} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Agent Collections Ledger</Text>
            <Text style={styles.menuSub}>{collections.length} Receipts • Filter by Agent, Cash vs UPI</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminLoans')}
          style={styles.menuCard}
        >
          <View style={styles.menuIconBox}>
            <WalletCards size={20} color={Colors.primaryLight} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Loan Portfolio Management</Text>
            <Text style={styles.menuSub}>{loans.length} Disbursed Loans • Full Ledger & Schedules</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminCustomers')}
          style={styles.menuCard}
        >
          <View style={styles.menuIconBox}>
            <Users size={20} color={Colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Customer & Borrower Directory</Text>
            <Text style={styles.menuSub}>{customers.length} Verified Borrowers • KYC Records</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminRouteArea')}
          style={styles.menuCard}
        >
          <View style={styles.menuIconBox}>
            <MapPin size={20} color={Colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Area & Route Operations</Text>
            <Text style={styles.menuSub}>{routes.length} Active Regional Beats • Agent Assignment</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminExpenses')}
          style={styles.menuCard}
        >
          <View style={styles.menuIconBox}>
            <Receipt size={20} color={Colors.danger} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Office Expenses & Accounts</Text>
            <Text style={styles.menuSub}>Track Operational Expenses & Vouchers</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminHandovers')}
          style={styles.menuCard}
        >
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Banknote size={20} color={Colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Cash Handovers & Denominations</Text>
            <Text style={styles.menuSub}>Vault Notes (₹500, ₹200, ₹100) • Agent Cash Reconciliation</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminAgents')}
          style={styles.menuCard}
        >
          <View style={styles.menuIconBox}>
            <ShieldCheck size={20} color={Colors.primaryLight} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Field Force & Agent Roster</Text>
            <Text style={styles.menuSub}>Staff Directory • Mobile PIN Management • Limits</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
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
  actionGridContainer: {
    marginBottom: 16,
    gap: 10,
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  kpiRow: {
    flexDirection: 'row',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  handoverCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  handoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  handoverAgentName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  handoverMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgePending: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  statusBadgeVerified: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTextPending: {
    color: Colors.warning,
  },
  statusBadgeTextVerified: {
    color: Colors.success,
  },
  handoverAmountRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  handoverLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  handoverCashVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 2,
  },
  handoverUpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryLight,
    marginTop: 2,
  },
  denominationsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  denominationsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  denominationsText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    height: 38,
    borderRadius: 8,
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroProfitCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  heroProfitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroProfitOverline: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroProfitValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  roiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  roiBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroMetricItem: {
    flex: 1,
  },
  heroMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  heroMetricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  heroMetricSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  heroMetricDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 12,
  },
  heroRecoveryBox: {
    marginTop: 2,
  },
  heroRecoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroRecoveryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  heroRecoveryPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  heroRecoveryTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroRecoveryBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});
