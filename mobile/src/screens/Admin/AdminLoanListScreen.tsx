import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { Loan } from '../../types';
import {
  Search,
  Plus,
  WalletCards,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ChevronRight,
  MoreVertical,
  Banknote,
} from 'lucide-react-native';

export const AdminLoanListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'CLOSED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    const list = await ApiService.getLoans();
    setLoans(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const filteredLoans = loans.filter((l) => {
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      const match =
        l.loanNumber.toLowerCase().includes(t) ||
        l.customerName.toLowerCase().includes(t) ||
        l.customerCode.toLowerCase().includes(t);
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    return true;
  });

  const handleDeleteLoan = (loan: Loan) => {
    Alert.alert(
      'Delete Loan Record',
      `Are you sure you want to delete Loan ${loan.loanNumber} for ${loan.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await ApiService.deleteLoan(loan.id);
            setLoans((prev) => prev.filter((item) => item.id !== loan.id));
            Alert.alert('Deleted', `Loan ${loan.loanNumber} has been removed.`);
          },
        },
      ]
    );
  };

  const handleToggleStatus = (loan: Loan) => {
    const nextStatus = loan.status === 'ACTIVE' ? 'CLOSED' : loan.status === 'CLOSED' ? 'OVERDUE' : 'ACTIVE';
    Alert.alert(
      'Update Loan Status',
      `Change status of ${loan.loanNumber} from ${loan.status} to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Mark as ${nextStatus}`,
          onPress: async () => {
            await ApiService.updateLoan(loan.id, { status: nextStatus as any });
            setLoans((prev) =>
              prev.map((item) => (item.id === loan.id ? { ...item, status: nextStatus as any } : item))
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Loan Portfolio"
        subtitle={`${loans.length} Total Loans • Full Ledger`}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminDisburseLoan')}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        }
      />

      {/* Search & Status Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search loan #, customer name, code..."
            placeholderTextColor={Colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.filtersRow}>
          {(['ALL', 'ACTIVE', 'OVERDUE', 'CLOSED'] as const).map((s) => {
            const isSelected = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setStatusFilter(s)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Loans FlatList */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Loan }) => {
          const isOverdue = item.status === 'OVERDUE';
          const isClosed = item.status === 'CLOSED';
          const paidWeeks = Math.min(
            item.durationUnits,
            Math.round(item.totalPaidAmount / (item.installmentAmount || 1))
          );
          const progressPercent = Math.round((paidWeeks / (item.durationUnits || 1)) * 100);

          return (
            <View style={[styles.loanCard, isOverdue && styles.overdueCard]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('LoanLedger', {
                    loanId: item.id,
                    loan: item,
                  })
                }
                style={styles.loanTop}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.loanMeta}>
                    {item.loanNumber} • {item.customerCode} • {item.routeName}
                  </Text>
                </View>
                <View
                  style={
                    isOverdue
                      ? styles.overdueBadge
                      : isClosed
                      ? styles.closedBadge
                      : styles.activeBadge
                  }
                >
                  <Text
                    style={
                      isOverdue
                        ? styles.overdueText
                        : isClosed
                        ? styles.closedText
                        : styles.activeText
                    }
                  >
                    {item.status}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.loanStats}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Principal</Text>
                  <Text style={styles.statVal}>₹{item.principalAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Total Paid</Text>
                  <Text style={[styles.statVal, { color: Colors.success }]}>
                    ₹{item.totalPaidAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Outstanding</Text>
                  <Text style={[styles.statVal, { color: Colors.warning }]}>
                    ₹{item.outstandingBalance.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressBox}>
                <Text style={styles.progressText}>
                  {paidWeeks} of {item.durationUnits} Wks ({progressPercent}%) • ₹{item.installmentAmount}/{item.loanType === 'WEEKLY' ? 'wk' : 'mo'}
                </Text>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, Math.max(4, progressPercent))}%`,
                        backgroundColor: isOverdue ? Colors.danger : Colors.primaryLight,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Quick Actions (Collect, Status, Delete) */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CollectPayment', {
                      loanId: item.id || item.loanNumber,
                      loan: item,
                    })
                  }
                  style={styles.cardActionBtn}
                >
                  <Banknote size={14} color={Colors.primaryLight} />
                  <Text style={styles.cardActionText}>Collect EMI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleToggleStatus(item)}
                  style={styles.cardActionBtn}
                >
                  <CheckCircle2 size={14} color={Colors.warning} />
                  <Text style={[styles.cardActionText, { color: Colors.warning }]}>Status</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteLoan(item)}
                  style={styles.cardActionBtn}
                >
                  <Trash2 size={14} color={Colors.danger} />
                  <Text style={[styles.cardActionText, { color: Colors.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    marginLeft: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  loanCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  overdueCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  loanTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  loanMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  overdueBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overdueText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  closedBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  closedText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  loanStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 14,
    marginBottom: 10,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBox: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.surfaceBorder,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
});
