import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { User, Route, Customer, Loan } from '../../types';
import {
  Search,
  Filter,
  Users,
  Banknote,
  Receipt,
  Smartphone,
  ShieldCheck,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Printer,
  CheckCircle2,
} from 'lucide-react-native';

export const AdminAgentCollectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedAgentId, setSelectedAgentId] = useState<string>('ALL');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'ALL' | 'CASH' | 'UPI'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agentList, routeList, colList, loanList, custList] = await Promise.all([
        ApiService.getAgents(),
        ApiService.getRoutes(),
        ApiService.getTodayCollections(),
        ApiService.getLoans(),
        ApiService.getCustomers(),
      ]);
      setAgents(agentList);
      setRoutes(routeList);
      setCollections(colList);
      setLoans(loanList);
      setCustomers(custList);
    } catch (e) {
      console.error('Failed to load agent collection ledger:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter collections
  const filteredCollections = collections.filter((c) => {
    // Agent Filter
    if (selectedAgentId !== 'ALL' && c.agentId !== selectedAgentId && c.agentName !== selectedAgentId) {
      return false;
    }
    // Route Filter
    if (selectedRouteId !== 'ALL' && c.routeId !== selectedRouteId && c.routeName !== selectedRouteId) {
      return false;
    }
    // Payment Method
    if (paymentMethodFilter !== 'ALL' && c.paymentMethod !== paymentMethodFilter) {
      return false;
    }
    // Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCustomer = (c.customerName || '').toLowerCase().includes(term);
      const matchCode = (c.customerCode || '').toLowerCase().includes(term);
      const matchReceipt = (c.receiptNumber || '').toLowerCase().includes(term);
      const matchLoan = (c.loanNumber || '').toLowerCase().includes(term);
      const matchAgent = (c.agentName || '').toLowerCase().includes(term);
      if (!matchCustomer && !matchCode && !matchReceipt && !matchLoan && !matchAgent) {
        return false;
      }
    }
    return true;
  });

  // KPI Calculations based on filtered view
  const totalAmount = filteredCollections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalCash = filteredCollections
    .filter((c) => c.paymentMethod === 'CASH')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalUpi = filteredCollections
    .filter((c) => c.paymentMethod === 'UPI')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const selectedAgentObj = agents.find((a) => a.id === selectedAgentId || a.userId === selectedAgentId);

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Agent Collections Ledger"
        subtitle="Dedicated Field Agent Collection Register"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Quick Action Bar to Denominations and Disburse */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminHandovers')}
            style={[styles.topActionBtn, { backgroundColor: '#1E293B', borderColor: '#3B82F6' }]}
          >
            <Banknote size={15} color="#60A5FA" />
            <Text style={[styles.topActionText, { color: '#93C5FD' }]}>Vault Denominations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AdminDisburseLoan')}
            style={[styles.topActionBtn, { backgroundColor: Colors.primary }]}
          >
            <Plus size={15} color="#FFF" />
            <Text style={[styles.topActionText, { color: '#FFF' }]}>New Loan Disburse</Text>
          </TouchableOpacity>
        </View>

        {/* Agent Filter Horizontal Bar */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>Filter By Collecting Agent:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.agentPillsRow}>
            <TouchableOpacity
              onPress={() => setSelectedAgentId('ALL')}
              style={[styles.agentPill, selectedAgentId === 'ALL' && styles.agentPillActive]}
            >
              <Users size={12} color={selectedAgentId === 'ALL' ? '#FFF' : Colors.textMuted} />
              <Text style={[styles.agentPillText, selectedAgentId === 'ALL' && styles.agentPillTextActive]}>
                All Agents ({agents.length})
              </Text>
            </TouchableOpacity>

            {agents.map((ag) => {
              const isSelected = selectedAgentId === ag.id || selectedAgentId === ag.userId;
              return (
                <TouchableOpacity
                  key={ag.id}
                  onPress={() => setSelectedAgentId(ag.userId || ag.id)}
                  style={[styles.agentPill, isSelected && styles.agentPillActive]}
                >
                  <ShieldCheck size={12} color={isSelected ? '#FFF' : Colors.primaryLight} />
                  <Text style={[styles.agentPillText, isSelected && styles.agentPillTextActive]}>
                    {ag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Financial KPI Summary Cards */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiHeaderText}>
              {selectedAgentObj ? `${selectedAgentObj.name}'s Collection` : 'Total Regional Collections'}
            </Text>
            <Text style={styles.kpiBadge}>{filteredCollections.length} Receipts</Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiLabel}>TOTAL COLLECTED</Text>
              <Text style={styles.kpiTotalVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.kpiBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 12 }]}>
              <Text style={styles.kpiLabel}>CASH COLLECTED</Text>
              <Text style={styles.kpiCashVal}>₹{totalCash.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.kpiBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 12 }]}>
              <Text style={styles.kpiLabel}>UPI COLLECTED</Text>
              <Text style={styles.kpiUpiVal}>₹{totalUpi.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar & Payment Method Chips */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={15} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search receipt #, borrower, loan #..."
              placeholderTextColor={Colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <View style={styles.methodChipsRow}>
            {[
              { id: 'ALL', label: 'All Modes' },
              { id: 'CASH', label: 'Cash Only' },
              { id: 'UPI', label: 'UPI Only' },
            ].map((m) => {
              const isSelected = paymentMethodFilter === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setPaymentMethodFilter(m.id as any)}
                  style={[styles.methodChip, isSelected && styles.methodChipActive]}
                >
                  <Text style={[styles.methodChipText, isSelected && styles.methodChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Receipts & Collection Items */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Live Collection Receipts Register</Text>
          <Text style={styles.listSub}>{filteredCollections.length} Records</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: 30 }} />
        ) : filteredCollections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Receipt size={32} color={Colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Collections Found</Text>
            <Text style={styles.emptySub}>
              {selectedAgentId !== 'ALL'
                ? 'This agent has not recorded any payments yet today.'
                : 'No collections match the selected filters.'}
            </Text>
          </View>
        ) : (
          filteredCollections.map((col) => {
            const isCash = col.paymentMethod === 'CASH';
            const isUpi = col.paymentMethod === 'UPI';

            return (
              <View key={col.id || col.receiptNumber} style={styles.receiptCard}>
                <View style={styles.receiptTop}>
                  <View>
                    <Text style={styles.receiptCustomerName}>{col.customerName}</Text>
                    <Text style={styles.receiptMeta}>
                      {col.customerCode} • Loan #{col.loanNumber}
                    </Text>
                  </View>
                  <View style={styles.receiptAmountBox}>
                    <Text style={styles.receiptAmountVal}>
                      ₹{(Number(col.amount) || 0).toLocaleString('en-IN')}
                    </Text>
                    <View
                      style={[
                        styles.methodBadge,
                        isCash ? styles.methodBadgeCash : styles.methodBadgeUpi,
                      ]}
                    >
                      <Text
                        style={[
                          styles.methodBadgeText,
                          isCash ? styles.methodBadgeTextCash : styles.methodBadgeTextUpi,
                        ]}
                      >
                        {col.paymentMethod}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Details Footer */}
                <View style={styles.receiptDetails}>
                  <View style={styles.detailItem}>
                    <ShieldCheck size={12} color={Colors.textMuted} />
                    <Text style={styles.detailText}>Agent: {col.agentName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={12} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{col.routeName || 'Branch Area'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Calendar size={12} color={Colors.textMuted} />
                    <Text style={styles.detailText}>
                      {col.collectionDate ? `${col.collectionDate}${col.time ? ` • ${col.time}` : ''}` : col.time || 'Today'}
                    </Text>
                  </View>
                </View>

                {col.upiTransactionId && (
                  <View style={styles.upiRefBox}>
                    <Smartphone size={12} color="#A855F7" />
                    <Text style={styles.upiRefText}>UPI Ref: {col.upiTransactionId}</Text>
                  </View>
                )}

                {/* Action Row */}
                <View style={styles.receiptActionRow}>
                  <Text style={styles.balanceText}>
                    Balance Left: ₹{(Number(col.balanceAfterPayment) || 0).toLocaleString('en-IN')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ReceiptView', { collection: col })}
                    style={styles.printBtn}
                  >
                    <Printer size={13} color="#FFF" />
                    <Text style={styles.printBtnText}>View Receipt</Text>
                  </TouchableOpacity>
                </View>
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
  topActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  topActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: 14,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  agentPillsRow: {
    gap: 8,
  },
  agentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  agentPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  agentPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  agentPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  kpiContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 14,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryLight,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiBox: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  kpiTotalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 2,
  },
  kpiCashVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 2,
  },
  kpiUpiVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#A855F7',
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
  },
  methodChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  methodChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: Colors.primary,
  },
  methodChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  methodChipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  receiptCustomerName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  receiptMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  receiptAmountBox: {
    alignItems: 'flex-end',
  },
  receiptAmountVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  methodBadgeCash: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  methodBadgeUpi: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  methodBadgeTextCash: {
    color: '#10B981',
  },
  methodBadgeTextUpi: {
    color: '#A855F7',
  },
  receiptDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  upiRefBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  upiRefText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#C084FC',
    fontWeight: '700',
  },
  receiptActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  balanceText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  printBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});
