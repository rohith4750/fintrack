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
} from 'lucide-react-native';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [allLoans, allRoutes, allCustomers] = await Promise.all([
        ApiService.getLoans(),
        ApiService.getRoutes(),
        ApiService.getCustomers(),
      ]);
      setLoans(allLoans);
      setRoutes(allRoutes);
      setCustomers(allCustomers);
    } catch (e) {
      console.log('Error loading admin DB data', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  // Admin Financial Calculations
  const totalDisbursed = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalRepayable = loans.reduce((sum, l) => sum + l.totalRepayableAmount, 0);
  const totalCollected = loans.reduce((sum, l) => sum + l.totalPaidAmount, 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const grossProfitMargin = totalRepayable - totalDisbursed;
  const overdueCount = loans.filter((l) => l.status === 'OVERDUE' || l.status === 'DEFAULTED').length;

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
        {/* Quick Create Action Bar */}
        <View style={styles.actionGrid}>
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

          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCreateAgent')}
            style={[styles.actionBtn, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: Colors.primaryLight }]}
          >
            <ShieldCheck size={16} color={Colors.primaryLight} />
            <Text style={[styles.actionBtnText, { color: Colors.primaryLight }]}>Add Agent</Text>
          </TouchableOpacity>
        </View>

        {/* Company Financial Metrics (Admin Only) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Company Financial Overview</Text>
          <View style={styles.adminPill}>
            <ShieldCheck size={12} color={Colors.success} />
            <Text style={styles.adminPillText}>Admin P&L Access</Text>
          </View>
        </View>

        <KpiCard
          label="Total Active Portfolio"
          value={`₹${totalDisbursed.toLocaleString('en-IN')}`}
          subValue={`Total Repayable: ₹${totalRepayable.toLocaleString('en-IN')}`}
          icon={<WalletCards size={20} color={Colors.primaryLight} />}
          variant="primary"
        />

        <View style={styles.kpiRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <KpiCard
              label="Total Collected"
              value={`₹${totalCollected.toLocaleString('en-IN')}`}
              subValue="Recovered till date"
              icon={<TrendingUp size={18} color={Colors.success} />}
              variant="success"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <KpiCard
              label="Net Profit Margin"
              value={`₹${grossProfitMargin.toLocaleString('en-IN')}`}
              subValue="Interest Profit"
              icon={<TrendingUp size={18} color={Colors.warning} />}
              variant="warning"
            />
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <KpiCard
              label="Total Outstanding"
              value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
              subValue={`${loans.length} Active Loans`}
              icon={<Building size={18} color={Colors.primaryLight} />}
              variant="primary"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <KpiCard
              label="Overdue Watchlist"
              value={`${overdueCount} Accounts`}
              subValue="Immediate follow-up"
              icon={<AlertTriangle size={18} color={Colors.danger} />}
              variant="danger"
            />
          </View>
        </View>

        {/* Quick Navigation Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Management Modules</Text>
        </View>

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
            <Text style={styles.menuSub}>Track Branch Expenses & Vouchers</Text>
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
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
