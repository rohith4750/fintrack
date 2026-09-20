import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { BorrowerStopCard } from '../../components/BorrowerStopCard';
import { ApiService } from '../../services/api';
import { Customer, Loan, Route } from '../../types';
import { Search, Filter, MapPin, CheckCircle2, Clock, AlertTriangle } from 'lucide-react-native';

export const BeatCollectionScreen: React.FC<{ route?: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();
  const initialRouteId = route?.params?.routeId;

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRouteId || 'ALL');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CLOSED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user, selectedRouteId]);

  const loadData = async () => {
    if (!user) return;
    try {
      const agentId = user.userId || user.id;
      const [assignedRoutes, assignedLoans] = await Promise.all([
        ApiService.getAssignedRoutes(agentId),
        ApiService.getAssignedLoans(
          agentId,
          selectedRouteId === 'ALL' ? undefined : selectedRouteId
        ),
      ]);

      // Only show routes that actually have borrowers/loans on them
      const routeIdsWithLoans = new Set(assignedLoans.map((l) => l.routeId));
      const activeRoutes = assignedRoutes.filter(
        (r) => routeIdsWithLoans.has(r.id) || routeIdsWithLoans.has(r.routeId || '')
      );
      setRoutes(activeRoutes.length > 0 ? activeRoutes : []);
      setLoans(assignedLoans);
    } catch (e) {
      console.log('Error loading beat collection data', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filtered Loans
  const filteredLoans = loans.filter((l) => {
    // Route Filter
    if (selectedRouteId !== 'ALL' && l.routeId !== selectedRouteId) return false;

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = l.customerName.toLowerCase().includes(term);
      const matchCode = l.customerCode.toLowerCase().includes(term);
      const matchPhone = l.phone.includes(term);
      const matchLoan = l.loanNumber.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchPhone && !matchLoan) return false;
    }

    // Status Filter
    const isClosed = l.status === 'CLOSED' || l.outstandingBalance <= 0;
    const isPaidToday = (l.installments || []).some(
      (i) => i.status === 'PAID' && i.paidDate === '2026-09-20'
    );
    const isOverdue = (l.status === 'OVERDUE' || l.status === 'DEFAULTED') && !isClosed;

    if (statusFilter === 'PAID' && !isPaidToday) return false;
    if (statusFilter === 'PENDING' && (isPaidToday || isClosed)) return false;
    if (statusFilter === 'OVERDUE' && !isOverdue) return false;
    if (statusFilter === 'CLOSED' && !isClosed) return false;

    return true;
  });

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Beat Route Collection"
        subtitle="Stop-by-Stop Borrower Recovery Sequence"
      />

      {/* Route Filter Selector */}
      <View style={styles.routeSelectorBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'ALL', name: 'All Assigned Routes' }, ...routes]}
          keyExtractor={(item: { id: string; name: string }) => item.id}
          renderItem={({ item }: { item: { id: string; name: string } }) => {
            const isSelected = selectedRouteId === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedRouteId(item.id)}
                style={[styles.routePill, isSelected && styles.routePillActive]}
              >
                <MapPin size={12} color={isSelected ? '#FFF' : Colors.textMuted} />
                <Text style={[styles.routePillText, isSelected && styles.routePillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.routePillContainer}
        />
      </View>

      {/* Search and Status Chips */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search borrower by name, code, phone..."
            placeholderTextColor={Colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.statusChipsRow}>
          {[
            { id: 'ALL', label: 'All Stops' },
            { id: 'PENDING', label: 'Pending Due' },
            { id: 'PAID', label: 'Paid Today' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'CLOSED', label: 'Closed' },
          ].map((chip) => {
            const isSelected = statusFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                onPress={() => setStatusFilter(chip.id as any)}
                style={[styles.statusChip, isSelected && styles.statusChipActive]}
              >
                <Text style={[styles.statusChipText, isSelected && styles.statusChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Borrower List */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item: Loan) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Borrowers Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or status filter</Text>
          </View>
        }
        renderItem={({ item }: { item: Loan }) => {
          const cust = customers.find((c) => c.id === item.customerId || c.customerCode === item.customerCode) || {
            id: item.customerId,
            customerCode: item.customerCode,
            fullName: item.customerName,
            phone: item.phone,
            address: item.routeName,
            city: item.areaName,
            areaId: item.areaId,
            areaName: item.areaName,
            routeId: item.routeId,
            routeName: item.routeName,
            assignedAgentId: item.agentId,
            totalLoans: 1,
            activeLoanAmount: item.principalAmount,
            totalOutstanding: item.outstandingBalance,
            kycStatus: 'VERIFIED',
          };

          return (
            <BorrowerStopCard
              customer={cust}
              loan={item}
              onCollect={() =>
                navigation.navigate('CollectPayment', {
                  loanId: item.id,
                  customerId: cust.id,
                })
              }
              onViewDetails={() =>
                navigation.navigate('LoanLedger', {
                  loanId: item.id,
                  loan: item,
                })
              }
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  routeSelectorBar: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    paddingVertical: 8,
  },
  routePillContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  routePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  routePillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  routePillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: Colors.primary,
  },
  statusChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
