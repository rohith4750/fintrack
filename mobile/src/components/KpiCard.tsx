import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  progress?: number; // 0 to 100
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'primary',
  progress,
}) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'danger':
        return Colors.danger;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getBorderColor() }]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.iconWrapper}>{icon}</View>
      </View>

      <Text style={Typography.currencyLarge}>{value}</Text>
      {subValue && <Text style={styles.subValue}>{subValue}</Text>}

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: getBorderColor() }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  subValue: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
