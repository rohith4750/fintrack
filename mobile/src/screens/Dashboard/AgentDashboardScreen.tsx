import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { KpiCard } from '../../components/KpiCard';
import { ApiService } from '../../services/api';
import { Loan, Route } from '../../types';
import {
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Clock,
} from 'lucide-react-native';

export const AgentDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const [assignedRoutes, assignedLoans] = await Promise.all([
        ApiService.getAssignedRoutes(user.userId || user.id),
        ApiService.getAssignedLoans(user.userId || user.id),
      ]);
      setRoutes(assignedRoutes);
      setLoans(assignedLoans);
    } catch (e) {
      console.log('Error loading dashboard data', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const todayCollected = user?.todayCollected || 18500;
  const todayTarget = user?.todayTarget || 30000;
  const targetPercent = Math.min(100, Math.round((todayCollected / todayTarget) * 100));

  const cashLimit = user?.maxDailyCashLimit || 75000;
  const cashLimitPercent = Math.min(100, Math.round((todayCollected / cashLimit) * 100));

  const overdueLoans = loans.filter(
    (l) => l.status === 'OVERDUE' || l.status === 'DEFAULTED'
  );

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Field Operations"
        subtitle={`Beat Collection Portal • ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Quick Action Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BeatCollection')}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Sparkles size={12} color="#FFF" />
              <Text style={styles.heroBadgeText}>LIVE BEAT ASSIGNED</Text>
            </View>
            <Text style={styles.heroTitle}>Start Daily Beat Collection</Text>
            <Text style={styles.heroDesc}>
              {routes.length} Assigned Routes • {loans.length} Borrowers queued for recovery
            </Text>
          </View>
          <View style={styles.heroAction}>
            <ChevronRight size={24} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Operational KPI Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Operational Metrics</Text>
          <Text style={styles.sectionBadge}>Field Officer View</Text>
        </View>

        <KpiCard
          label="Today's Collection vs Target"
          value={`₹${todayCollected.toLocaleString('en-IN')}`}
          subValue={`Target: ₹${todayTarget.toLocaleString('en-IN')} (${targetPercent}% Achieved)`}
          icon={<IndianRupee size={20} color={Colors.primaryLight} />}
          variant="primary"
          progress={targetPercent}
        />

        <KpiCard
          label="Cash-in-Hand vs Safety Limit"
          value={`₹${todayCollected.toLocaleString('en-IN')}`}
          subValue={`Max Daily Cash Limit: ₹${cashLimit.toLocaleString('en-IN')} (${cashLimitPercent}% Utilized)`}
          icon={<ShieldCheck size={20} color={Colors.warning} />}
          variant={cashLimitPercent > 80 ? 'danger' : 'warning'}
          progress={cashLimitPercent}
        />

        <View style={styles.kpiRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <KpiCard
              label="Recovery Efficiency"
              value={`${user?.recoveryEfficiency || 94.2}%`}
              subValue="On-time Rate"
              icon={<TrendingUp size={18} color={Colors.success} />}
              variant="success"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <KpiCard
              label="Overdue Watchlist"
              value={`${overdueLoans.length} Loans`}
              subValue="Priority Follow-up"
              icon={<AlertTriangle size={18} color={Colors.danger} />}
              variant="danger"
            />
          </View>
        </View>

        {/* Assigned Beats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Assigned Routes & Beats</Text>
        </View>

        {routes.map((rt) => {
          const routeProgress = Math.round((rt.todayCollected / (rt.todayTarget || 1)) * 100);
          return (
            <TouchableOpacity
              key={rt.id}
              onPress={() => navigation.navigate('BeatCollection', { routeId: rt.id })}
              style={styles.routeCard}
            >
              <View style={styles.routeHeader}>
                <View style={styles.routeTitleGroup}>
                  <MapPin size={16} color={Colors.primaryLight} />
                  <Text style={styles.routeName}>{rt.name}</Text>
                </View>
                <Text style={styles.routeCode}>{rt.code}</Text>
              </View>

              <View style={styles.routeStatsRow}>
                <Text style={styles.routeStatsText}>
                  Collected: <Text style={styles.boldText}>₹{rt.todayCollected.toLocaleString('en-IN')}</Text> / ₹{rt.todayTarget.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.routePercentText}>{routeProgress}%</Text>
              </View>

              <View style={styles.routeProgressBg}>
                <View style={[styles.routeProgressFill, { width: `${Math.min(100, routeProgress)}%` }]} />
              </View>

              <View style={styles.routeFooter}>
                <Text style={styles.routeCustomersText}>{rt.totalCustomers} Borrowers on Beat</Text>
                <View style={styles.openBeatPill}>
                  <Text style={styles.openBeatText}>Open Beat</Text>
                  <ArrowUpRight size={12} color={Colors.primaryLight} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Priority Overdue List */}
        {overdueLoans.length > 0 && (
          <View style={styles.overdueSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Immediate Attention Overdue</Text>
            </View>

            {overdueLoans.map((l) => (
              <View key={l.id} style={styles.overdueItem}>
                <View style={styles.overdueInfo}>
                  <Text style={styles.overdueName}>{l.customerName}</Text>
                  <Text style={styles.overdueMeta}>
                    {l.customerCode} • {l.routeName}
                  </Text>
                </View>
                <View style={styles.overdueAmountGroup}>
                  <Text style={styles.overdueAmount}>₹{l.installmentAmount} Due</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CollectPayment', { loanId: l.id })}
                    style={styles.overdueCollectBtn}
                  >
                    <Text style={styles.overdueCollectText}>Collect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
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
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  heroDesc: {
    fontSize: 12,
    color: '#E0E7FF',
    marginTop: 2,
  },
  heroAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiRow: {
    flexDirection: 'row',
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  routeCode: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  routeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeStatsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  boldText: {
    color: Colors.text,
    fontWeight: '700',
  },
  routePercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  routeProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 4,
  },
  routeProgressFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  routeCustomersText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  openBeatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openBeatText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  overdueSection: {
    marginTop: 10,
  },
  overdueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  overdueInfo: {
    flex: 1,
  },
  overdueName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  overdueMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overdueAmountGroup: {
    alignItems: 'flex-end',
  },
  overdueAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.danger,
    marginBottom: 4,
  },
  overdueCollectBtn: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overdueCollectText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});
