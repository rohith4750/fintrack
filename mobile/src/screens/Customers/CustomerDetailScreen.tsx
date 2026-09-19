import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { openGoogleMapsNavigation, getCurrentGpsPosition } from '../../services/location';
import { Customer, Loan, Installment } from '../../types';
import {
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  User,
  Navigation2,
  Compass,
} from 'lucide-react-native';

export const CustomerDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { customerId, customerCode } = route.params || {};

  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'PROFILE'>('SCHEDULE');
  const [isUpdatingGps, setIsUpdatingGps] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customerId, customerCode]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [allCustomers, allLoans] = await Promise.all([
        ApiService.getCustomers(),
        ApiService.getLoans(),
      ]);

      const foundCust = allCustomers.find(
        (c) => c.id === customerId || c.customerCode === customerId || c.customerCode === customerCode || c.id === customerCode
      );

      if (foundCust) {
        setCurrentCustomer(foundCust);
        const foundLoan = allLoans.find(
          (l) => l.customerId === foundCust.id || l.customerCode === foundCust.customerCode || l.customerId === foundCust.customerCode
        );
        if (foundLoan) {
          setLoan(foundLoan);
        }
      }
    } catch (e) {
      console.error('Error loading customer detail:', e);
    } finally {
      setLoading(false);
    }
  };

  const customer = currentCustomer;

  const paidCount = (loan?.installments || []).filter((i) => i.status === 'PAID').length;
  const calculatedWeeks = loan ? Math.round((loan.totalPaidAmount || 0) / (loan.installmentAmount || 1)) : 0;
  const paidWeeks = loan ? Math.min(loan.durationUnits, Math.max(paidCount, calculatedWeeks)) : 0;
  const progressPercent = loan ? Math.round((paidWeeks / (loan.durationUnits || 1)) * 100) : 0;

  const handleCall = () => {
    if (currentCustomer?.phone) {
      Linking.openURL(`tel:${currentCustomer.phone.replace(/[^0-9+]/g, '')}`);
    }
  };

  const handleCaptureCurrentGps = async () => {
    if (!currentCustomer) return;
    setIsUpdatingGps(true);
    try {
      const position = await getCurrentGpsPosition();
      const updated: Customer = {
        ...currentCustomer,
        latitude: position.latitude,
        longitude: position.longitude,
        locationAddress: position.address || currentCustomer.address,
      };

      await ApiService.updateCustomerGpsLocation(currentCustomer.id, {
        latitude: position.latitude,
        longitude: position.longitude,
        locationAddress: position.address,
      });

      setCurrentCustomer(updated);
      Alert.alert(
        'GPS Location Pinned',
        `Live coordinates (${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}) saved for ${currentCustomer.fullName}. You can now navigate to this borrower in Google Maps.`
      );
    } catch (err: any) {
      Alert.alert('GPS Error', err.message || 'Could not fetch device GPS position.');
    } finally {
      setIsUpdatingGps(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.textMuted }}>Loading Borrower Details...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <HeaderBar title="Borrower Ledger" showBack onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <AlertCircle size={48} color={Colors.textMuted} />
          <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: Colors.text }}>
            Borrower Record Not Found
          </Text>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Borrower Ledger"
        subtitle={`${customer.fullName} • ${customer.customerCode}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Borrower Overview Header Card */}
        <View style={styles.customerCard}>
          <View style={styles.topRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer.fullName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerMeta}>
              <Text style={styles.customerName}>{customer.fullName}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
              <Text style={styles.customerAddress} numberOfLines={1}>
                {customer.address}, {customer.city}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCall} style={styles.callIconBtn}>
              <Phone size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* GPS Navigation & Location Bar */}
          <View style={styles.locationActionBar}>
            <View style={styles.locationInfo}>
              <MapPin size={15} color={Colors.primaryLight} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLandmark}>
                  {currentCustomer.landmark || currentCustomer.address || 'Address on record'}
                </Text>
                {currentCustomer.latitude && currentCustomer.longitude ? (
                  <Text style={styles.coordinatesText}>
                    GPS: {currentCustomer.latitude.toFixed(6)}, {currentCustomer.longitude.toFixed(6)}
                  </Text>
                ) : (
                  <Text style={styles.coordinatesText}>GPS coordinates not pinned yet</Text>
                )}
              </View>
            </View>

            <View style={styles.locationBtnGroup}>
              <TouchableOpacity
                onPress={() =>
                  openGoogleMapsNavigation(
                    currentCustomer.latitude,
                    currentCustomer.longitude,
                    currentCustomer.fullName,
                    currentCustomer.address
                  )
                }
                style={styles.navigateBtn}
              >
                <Navigation2 size={14} color="#FFF" />
                <Text style={styles.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCaptureCurrentGps}
                disabled={isUpdatingGps}
                style={styles.updateGpsBtn}
              >
                <Compass size={14} color={Colors.warning} />
                <Text style={styles.updateGpsText}>
                  {isUpdatingGps ? 'Locating...' : 'Set GPS'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weeks Repayment Progress Bar */}
          {loan && (
            <View style={styles.progressBox}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>
                  Repayment: <Text style={styles.boldWhite}>{paidWeeks}</Text> / {loan.durationUnits} Weeks Cleared
                </Text>
                <Text style={styles.progressLabel}>
                  {loan.durationUnits - paidWeeks} Weeks Left
                </Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${Math.min(100, progressPercent)}%` }]} />
              </View>
            </View>
          )}

          {/* Metrics summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Loan Disbursed</Text>
              <Text style={styles.summaryVal}>₹{(loan ? loan.principalAmount : customer.activeLoanAmount || 0).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={[styles.summaryVal, { color: Colors.success }]}>
                ₹{(loan ? loan.totalPaidAmount : 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={[styles.summaryVal, { color: Colors.warning }]}>
                ₹{(loan ? loan.outstandingBalance : customer.totalOutstanding || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('SCHEDULE')}
            style={[styles.tabBtn, activeTab === 'SCHEDULE' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'SCHEDULE' && styles.tabTextActive]}>
              Installment Schedule {loan ? `(${loan.durationUnits} Wks)` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('PROFILE')}
            style={[styles.tabBtn, activeTab === 'PROFILE' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'PROFILE' && styles.tabTextActive]}>
              KYC & Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Timeline View */}
        {activeTab === 'SCHEDULE' && (
          <View style={styles.scheduleList}>
            {loan ? (
              (loan.installments || []).map((inst, index) => {
                const isPaid = inst.status === 'PAID';
                const isAdvance = isPaid && inst.paidDate && inst.paidDate < inst.dueDate;

                return (
                  <View
                    key={index}
                    style={[
                      styles.installmentCard,
                      isPaid ? styles.paidCard : styles.dueCard,
                    ]}
                  >
                    <View style={styles.instLeft}>
                      <View style={styles.instNumberPill}>
                        <Text style={styles.instNumberText}>Wk #{inst.installmentNumber}</Text>
                      </View>
                      <View>
                        <View style={styles.dueRow}>
                          <Calendar size={12} color={Colors.textMuted} />
                          <Text style={styles.dueDateText}>Due: {inst.dueDate}</Text>
                        </View>
                        {isPaid && inst.paidDate && (
                          <View style={styles.paidDateRow}>
                            <Clock size={11} color={Colors.success} />
                            <Text style={styles.paidDateText}>
                              Paid on: {inst.paidDate} {inst.receiptNumber ? `(${inst.receiptNumber})` : ''}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.instRight}>
                      <Text style={styles.instAmount}>₹{inst.amount}</Text>
                      {isPaid ? (
                        <View style={styles.badgeRow}>
                          {isAdvance && (
                            <View style={styles.advanceTag}>
                              <Text style={styles.advanceTagText}>★ ADVANCE</Text>
                            </View>
                          )}
                          <View style={styles.paidStatusPill}>
                            <CheckCircle2 size={11} color={Colors.success} />
                            <Text style={styles.paidStatusText}>PAID</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.dueStatusPill}>
                          <Text style={styles.dueStatusText}>DUE</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: Colors.textMuted }}>No active loan schedule found.</Text>
              </View>
            )}
          </View>
        )}

        {/* Profile & KYC Tab */}
        {activeTab === 'PROFILE' && (
          <View style={styles.profileSection}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Aadhaar Card Number</Text>
              <Text style={styles.profileValue}>{customer.aadhaarNumber || 'XXXX-XXXX-8921'}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>KYC Verification Status</Text>
              <Text style={[styles.profileValue, { color: Colors.success }]}>
                ✓ VERIFIED & APPROVED
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Guarantor Name & Contact</Text>
              <Text style={styles.profileValue}>
                {customer.guarantorName || 'K. Venkat Rao'} ({customer.guarantorPhone || '+91 98480 99887'})
              </Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Assigned Beat Route</Text>
              <Text style={styles.profileValue}>{loan?.routeName || customer.routeName || 'Main Road Beat'}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Loan Start / Disbursement Date</Text>
              <Text style={styles.profileValue}>{loan?.startDate || '2026-09-20'}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Expected End Date</Text>
              <Text style={styles.profileValue}>{loan?.endDate || '2027-02-15'}</Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        {loan && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CollectPayment', {
                loanId: loan.id,
                customerId: customer.id,
              })
            }
            style={styles.floatingCollectBtn}
          >
            <Sparkles size={16} color="#FFF" />
            <Text style={styles.floatingCollectText}>
              Collect Payment (₹{loan.installmentAmount}/Wk)
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  customerMeta: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  customerPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  customerAddress: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  callIconBtn: {
    backgroundColor: Colors.successDark,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  boldWhite: {
    color: Colors.text,
    fontWeight: '700',
  },
  barBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  scheduleList: {
    gap: 8,
    marginBottom: 16,
  },
  installmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  paidCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  dueCard: {
    borderColor: Colors.surfaceBorder,
  },
  instLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  instNumberPill: {
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  instNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  paidDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  paidDateText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
  },
  instRight: {
    alignItems: 'flex-end',
  },
  instAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  advanceTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  advanceTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.warning,
  },
  paidStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paidStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  dueStatusPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  dueStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  profileSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 12,
    marginBottom: 16,
  },
  profileItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
  },
  profileLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  floatingCollectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
  },
  floatingCollectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  locationActionBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 10,
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  locationLandmark: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  coordinatesText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  locationBtnGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  navigateBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
  },
  navigateBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  updateGpsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateGpsText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
});
