import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { Loan, Installment, Collection } from '../../types';
import {
  WalletCards,
  Calendar,
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Users,
  TrendingUp,
  Receipt,
  IndianRupee,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

export const LoanLedgerScreen: React.FC<{ route: any; navigation: any }> = ({ route: navRoute, navigation }) => {
  const { user } = useAuth();
  const loanId = navRoute?.params?.loanId;
  const loanParam = navRoute?.params?.loan;

  const [loan, setLoan] = useState<Loan | null>(loanParam || null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllInstallments, setShowAllInstallments] = useState(false);

  useEffect(() => {
    loadLoanData();
  }, []);

  const loadLoanData = async () => {
    try {
      setLoading(true);

      // Load the specific loan with installments
      const allLoans = await ApiService.getLoans();
      const found = allLoans.find(
        (l) => l.id === loanId || l.loanNumber === loanId || l.id === loanParam?.id
      );
      if (found) setLoan(found);

      // Load collections for this loan
      const allCollections = await ApiService.getTodayCollections();
      const loanCollections = allCollections.filter(
        (c) => c.loanId === (found?.id || loanId) || c.loanNumber === (found?.loanNumber || '')
      );
      setCollections(loanCollections);
    } catch (e) {
      console.error('Failed to load loan ledger:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoanData();
    setRefreshing(false);
  };

  if (loading && !loan) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>Loan not found.</Text>
      </View>
    );
  }

  const installments = loan.installments || [];
  const paidInstallments = installments.filter((i) => i.status === 'PAID');
  const dueInstallments = installments.filter((i) => i.status === 'DUE');
  const overdueInstallments = installments.filter((i) => i.status === 'OVERDUE');
  const partialInstallments = installments.filter((i) => i.status === 'PARTIAL');

  const paidWeeks = Math.min(
    loan.durationUnits,
    Math.round(loan.totalPaidAmount / (loan.installmentAmount || 1))
  );
  const progressPercent = Math.round((paidWeeks / (loan.durationUnits || 1)) * 100);
  const isOverdue = loan.status === 'OVERDUE' || loan.status === 'DEFAULTED';
  const isClosed = loan.status === 'CLOSED';

  // Show only first 10 installments unless expanded
  const displayInstallments = showAllInstallments ? installments : installments.slice(0, 12);

  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return Colors.success;
      case 'OVERDUE': return Colors.danger;
      case 'PARTIAL': return Colors.warning;
      default: return Colors.textMuted;
    }
  };

  const getInstallmentStatusBg = (status: string) => {
    switch (status) {
      case 'PAID': return 'rgba(16, 185, 129, 0.15)';
      case 'OVERDUE': return 'rgba(239, 68, 68, 0.15)';
      case 'PARTIAL': return 'rgba(234, 179, 8, 0.15)';
      default: return 'rgba(148, 163, 184, 0.1)';
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Loan Ledger & Schedule"
        subtitle={`${loan.loanNumber} • ${loan.customerName}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Loan Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.identityName}>{loan.customerName}</Text>
              <Text style={styles.identityMeta}>
                {loan.customerCode} • {loan.phone}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isOverdue
                    ? 'rgba(239, 68, 68, 0.15)'
                    : isClosed
                    ? 'rgba(148, 163, 184, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isOverdue ? Colors.danger : isClosed ? Colors.textMuted : Colors.success,
                  },
                ]}
              >
                {loan.status}
              </Text>
            </View>
          </View>

          <View style={styles.identityDetails}>
            <View style={styles.detailChip}>
              <WalletCards size={12} color={Colors.primaryLight} />
              <Text style={styles.detailChipText}>{loan.loanNumber}</Text>
            </View>
            <View style={styles.detailChip}>
              <MapPin size={12} color={Colors.warning} />
              <Text style={styles.detailChipText}>{loan.routeName}</Text>
            </View>
            <View style={styles.detailChip}>
              <ShieldCheck size={12} color={Colors.primaryLight} />
              <Text style={styles.detailChipText}>{loan.agentName}</Text>
            </View>
            <View style={styles.detailChip}>
              <Calendar size={12} color={Colors.textMuted} />
              <Text style={styles.detailChipText}>{loan.loanType}</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary Card */}
        <View style={styles.finCard}>
          <Text style={styles.finCardTitle}>FINANCIAL BREAKDOWN</Text>

          <View style={styles.finGrid}>
            <View style={styles.finItem}>
              <Text style={styles.finLabel}>Principal Disbursed</Text>
              <Text style={styles.finValPrimary}>₹{loan.principalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.finItem}>
              <Text style={styles.finLabel}>Interest ({loan.interestRate}%)</Text>
              <Text style={styles.finValMuted}>₹{loan.interestAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.finItem}>
              <Text style={styles.finLabel}>Processing Fee</Text>
              <Text style={styles.finValMuted}>₹{loan.processingFee.toLocaleString('en-IN')}</Text>
            </View>
            <View style={[styles.finItem, styles.finItemHighlight]}>
              <Text style={styles.finLabel}>Total Repayable</Text>
              <Text style={styles.finValBold}>₹{loan.totalRepayableAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.finDivider} />

          <View style={styles.finGrid}>
            <View style={styles.finItem}>
              <Text style={styles.finLabel}>Total Paid</Text>
              <Text style={[styles.finValBold, { color: Colors.success }]}>
                ₹{loan.totalPaidAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.finItem}>
              <Text style={styles.finLabel}>Outstanding Balance</Text>
              <Text style={[styles.finValBold, { color: isOverdue ? Colors.danger : Colors.warning }]}>
                ₹{loan.outstandingBalance.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Repayment Progress</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(3, progressPercent))}%`,
                  backgroundColor: isOverdue ? Colors.danger : Colors.success,
                },
              ]}
            />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatVal}>{paidWeeks}</Text>
              <Text style={styles.progressStatLabel}>Paid</Text>
            </View>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatVal}>{loan.durationUnits - paidWeeks}</Text>
              <Text style={styles.progressStatLabel}>Remaining</Text>
            </View>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatVal}>{loan.durationUnits}</Text>
              <Text style={styles.progressStatLabel}>Total {loan.loanType === 'WEEKLY' ? 'Weeks' : 'Months'}</Text>
            </View>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatVal}>₹{loan.installmentAmount.toLocaleString('en-IN')}</Text>
              <Text style={styles.progressStatLabel}>Per {loan.loanType === 'WEEKLY' ? 'Week' : 'Month'}</Text>
            </View>
          </View>
        </View>

        {/* Loan Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>LOAN TIMELINE</Text>
          <View style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Disbursement Date</Text>
              <Text style={styles.timelineVal}>{loan.disbursementDate || loan.startDate}</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.primaryLight }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Start Date</Text>
              <Text style={styles.timelineVal}>{loan.startDate}</Text>
            </View>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: isOverdue ? Colors.danger : Colors.success }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>End Date (Maturity)</Text>
              <Text style={styles.timelineVal}>{loan.endDate}</Text>
            </View>
          </View>
        </View>

        {/* Installment Schedule Table */}
        <View style={styles.installmentSection}>
          <View style={styles.installmentHeader}>
            <Text style={styles.sectionTitle}>INSTALLMENT SCHEDULE</Text>
            <View style={styles.installmentBadges}>
              <View style={[styles.miniBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.miniBadgeText, { color: Colors.success }]}>{paidInstallments.length} Paid</Text>
              </View>
              {overdueInstallments.length > 0 && (
                <View style={[styles.miniBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Text style={[styles.miniBadgeText, { color: Colors.danger }]}>{overdueInstallments.length} Overdue</Text>
                </View>
              )}
              <View style={[styles.miniBadge, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}>
                <Text style={[styles.miniBadgeText, { color: Colors.textMuted }]}>{dueInstallments.length} Due</Text>
              </View>
            </View>
          </View>

          {installments.length === 0 ? (
            <View style={styles.emptyInstallments}>
              <FileText size={28} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No installment schedule generated yet.</Text>
              <Text style={styles.emptySubText}>
                Installments will appear after the first EMI is generated by the system.
              </Text>
            </View>
          ) : (
            <>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>#</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Due Date</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Amount</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Paid</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'right' }]}>Status</Text>
              </View>

              {displayInstallments.map((inst, idx) => (
                <View
                  key={`inst-${inst.installmentNumber || idx}`}
                  style={[
                    styles.tableRow,
                    idx % 2 === 0 && styles.tableRowAlt,
                  ]}
                >
                  <Text style={[styles.tableCell, { flex: 0.5, fontWeight: '700' }]}>
                    {inst.installmentNumber || idx + 1}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>
                    {inst.dueDate || '—'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    ₹{(inst.amount || loan.installmentAmount).toLocaleString('en-IN')}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flex: 1, color: inst.paidAmount > 0 ? Colors.success : Colors.textMuted },
                    ]}
                  >
                    {inst.paidAmount > 0 ? `₹${inst.paidAmount.toLocaleString('en-IN')}` : '—'}
                  </Text>
                  <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                    <View
                      style={[
                        styles.instStatusBadge,
                        { backgroundColor: getInstallmentStatusBg(inst.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.instStatusText,
                          { color: getInstallmentStatusColor(inst.status) },
                        ]}
                      >
                        {inst.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Show More / Less Toggle */}
              {installments.length > 12 && (
                <TouchableOpacity
                  onPress={() => setShowAllInstallments(!showAllInstallments)}
                  style={styles.showMoreBtn}
                >
                  {showAllInstallments ? (
                    <ChevronUp size={16} color={Colors.primaryLight} />
                  ) : (
                    <ChevronDown size={16} color={Colors.primaryLight} />
                  )}
                  <Text style={styles.showMoreText}>
                    {showAllInstallments
                      ? 'Show Less'
                      : `Show All ${installments.length} Installments`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Collection History */}
        {collections.length > 0 && (
          <View style={styles.collectionSection}>
            <Text style={styles.sectionTitle}>RECENT COLLECTION RECEIPTS</Text>
            {collections.map((col) => (
              <View key={col.id} style={styles.collectionCard}>
                <View style={styles.collectionTop}>
                  <View>
                    <Text style={styles.collectionReceipt}>{col.receiptNumber}</Text>
                    <Text style={styles.collectionDate}>{col.collectionDate} • {col.time}</Text>
                  </View>
                  <Text style={styles.collectionAmount}>
                    ₹{(Number(col.amount) || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.collectionMeta}>
                  <Text style={styles.collectionMetaText}>
                    {col.paymentMethod} • Agent: {col.agentName}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Action: Collect EMI */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CollectPayment', { loanId: loan.id, loan })}
          style={styles.collectBtn}
        >
          <Banknote size={18} color="#FFF" />
          <Text style={styles.collectBtnText}>Collect EMI Payment</Text>
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
    paddingBottom: 100,
  },
  identityCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 12,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  identityName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  identityMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  identityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailChipText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  finCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  finCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  finGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  finItem: {
    width: '47%',
    marginBottom: 4,
  },
  finItemHighlight: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  finValPrimary: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  finValMuted: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  finValBold: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 2,
  },
  finDivider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
    marginVertical: 10,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStatItem: {
    alignItems: 'center',
  },
  progressStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  progressStatLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.surfaceBorder,
    marginLeft: 4,
  },
  timelineContent: {},
  timelineLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  timelineVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  installmentSection: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  installmentBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  emptyInstallments: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  tableCell: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  instStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  instStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  collectionSection: {
    marginBottom: 12,
  },
  collectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 8,
  },
  collectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  collectionReceipt: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  collectionDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  collectionAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.success,
  },
  collectionMeta: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  collectionMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 12,
    marginTop: 6,
  },
  collectBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
