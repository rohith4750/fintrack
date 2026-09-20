import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  progress?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = 'primary',
  progress,
}) => {
  const getAccentColor = () => {
    switch (variant) {
      case 'success': return Colors.success;
      case 'warning': return Colors.warning;
      case 'danger': return Colors.danger;
      default: return Colors.primary;
    }
  };

  const getAccentBg = () => {
    switch (variant) {
      case 'success': return Colors.successLight;
      case 'warning': return Colors.warningLight;
      case 'danger': return Colors.dangerLight;
      default: return Colors.primaryBg;
    }
  };

  const accent = getAccentColor();
  const accentBg = getAccentBg();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: accentBg }]}>
          {icon}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={[styles.value, { color: Colors.text }]}>{value}</Text>
      {subValue && <Text style={styles.subValue}>{subValue}</Text>}

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  subValue: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '400',
    lineHeight: 16,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.surfaceBorder,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
