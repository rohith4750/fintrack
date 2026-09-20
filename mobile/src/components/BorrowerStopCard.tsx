import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Customer, Loan } from '../types';
import { Phone, MapPin, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Navigation2 } from 'lucide-react-native';
import { openGoogleMapsNavigation } from '../services/location';

interface BorrowerStopCardProps {
  customer: Customer;
  loan: Loan;
  onCollect: () => void;
  onViewDetails: () => void;
}

export const BorrowerStopCard: React.FC<BorrowerStopCardProps> = ({
  customer,
  loan,
  onCollect,
  onViewDetails,
}) => {
  // Calculate paid weeks accurately
  const paidCount = (loan.installments || []).filter((i) => i.status === 'PAID').length;
  const calculatedWeeks = Math.round(loan.totalPaidAmount / (loan.installmentAmount || 1));
  const paidWeeks = Math.min(loan.durationUnits, Math.max(paidCount, calculatedWeeks));
  const progressPercent = Math.round((paidWeeks / (loan.durationUnits || 1)) * 100);

  const isClosed = loan.status === 'CLOSED' || loan.outstandingBalance <= 0;
  const isOverdue = loan.status === 'OVERDUE' || loan.status === 'DEFAULTED';
  const isPaidToday = (loan.installments || []).some(
    (i) => i.status === 'PAID' && i.paidDate === '2026-09-20'
  );

  const handleCall = () => {
    if (customer.phone) {
      Linking.openURL(`tel:${customer.phone.replace(/[^0-9+]/g, '')}`);
    }
  };

  const handleNavigate = () => {
    openGoogleMapsNavigation(
      customer.latitude,
      customer.longitude,
      customer.fullName,
      customer.address
    );
  };

  return (
    <View style={[styles.card, isOverdue && !isClosed && styles.overdueCard]}>
      {/* Header: Customer Name, Code, and Status Badge */}
      <View style={styles.header}>
        <View style={styles.nameGroup}>
          <Text style={styles.customerName} numberOfLines={1}>
            {customer.fullName}
          </Text>
          <Text style={styles.customerMeta}>
            {customer.customerCode} • {loan.loanNumber}
          </Text>
        </View>

        {isClosed ? (
          <View style={styles.closedBadge}>
            <CheckCircle2 size={12} color={Colors.success} />
            <Text style={styles.closedText}>Fully Paid</Text>
          </View>
        ) : isPaidToday ? (
          <View style={styles.paidBadge}>
            <CheckCircle2 size={12} color={Colors.success} />
            <Text style={styles.paidText}>Paid Today</Text>
          </View>
        ) : isOverdue ? (
          <View style={styles.overdueBadge}>
            <AlertCircle size={12} color={Colors.danger} />
            <Text style={styles.overdueText}>Overdue</Text>
          </View>
        ) : (
          <View style={styles.dueBadge}>
            <Text style={styles.dueText}>Due Today</Text>
          </View>
        )}
      </View>

      {/* Address & Beat Location with Navigation Link */}
      <TouchableOpacity onPress={handleNavigate} style={styles.locationRow}>
        <MapPin size={13} color={Colors.primaryLight} />
        <Text style={styles.addressText} numberOfLines={1}>
          {customer.landmark ? `${customer.landmark} • ` : ''}{customer.address}, {customer.city}
        </Text>
        <Navigation2 size={12} color={Colors.primaryLight} />
      </TouchableOpacity>

      {/* Repayment Progress & Weeks Tracker */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.weeksText}>
            <Text style={styles.weeksHighlight}>{paidWeeks}</Text> / {loan.durationUnits} Wks Paid ({progressPercent}%)
          </Text>
          <Text style={styles.installmentText}>
            EMI: ₹{loan.installmentAmount}/wk
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(4, progressPercent))}%`,
                backgroundColor: isClosed ? Colors.success : isOverdue ? Colors.danger : Colors.primaryLight,
              },
            ]}
          />
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Outstanding Balance:</Text>
          <Text style={[styles.balanceValue, isClosed && { color: Colors.success }]}>
            {isClosed ? '₹0 (Settled)' : `₹${loan.outstandingBalance.toLocaleString('en-IN')}`}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleNavigate} style={styles.navBtn}>
          <Navigation2 size={13} color="#FFF" />
          <Text style={styles.navBtnText}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCall} style={styles.callBtn}>
          <Phone size={13} color={Colors.text} />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onViewDetails} style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>Ledger</Text>
        </TouchableOpacity>

        {isClosed ? (
          <View style={styles.settledBadge}>
            <CheckCircle2 size={13} color={Colors.success} />
            <Text style={styles.settledBadgeText}>Fully Settled</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onCollect}
            style={[styles.collectBtn, isPaidToday && styles.collectBtnDisabled]}
          >
            <Sparkles size={13} color="#FFF" />
            <Text style={styles.collectBtnText}>
              {isPaidToday ? 'Collect Advance' : `Collect ₹${loan.installmentAmount}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  overdueCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameGroup: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  customerMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  closedText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  dueBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  progressSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weeksText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  weeksHighlight: {
    color: Colors.text,
    fontWeight: '700',
  },
  installmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  detailsBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  collectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  collectBtnDisabled: {
    backgroundColor: Colors.successDark,
  },
  collectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  settledBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  settledBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
});
