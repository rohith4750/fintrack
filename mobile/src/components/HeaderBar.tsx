import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff, RefreshCw, LogOut, ArrowLeft, Bell } from 'lucide-react-native';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightAction,
}) => {
  const { user, logout } = useAuth();
  const { isOnline, pendingCount, syncNow, isSyncing } = useOffline();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={20} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandName}>FinTrack</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {pendingCount > 0 ? (
            <TouchableOpacity onPress={syncNow} disabled={isSyncing} style={styles.syncPill}>
              <RefreshCw size={11} color={Colors.warning} />
              <Text style={styles.syncText}>{isSyncing ? 'Syncing' : `${pendingCount} pending`}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Live</Text>
            </View>
          )}

          {rightAction || (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <LogOut size={17} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        {showBack && (
          <Text style={styles.pageTitle}>{title}</Text>
        )}
        {!showBack && (
          <>
            <Text style={styles.greeting}>
              {`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0] || 'Admin'} 👋`}
            </Text>
            <Text style={styles.pageTitle}>{title}</Text>
          </>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  onlineText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  syncText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    padding: 7,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  titleRow: {
    gap: 2,
  },
  greeting: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '400',
  },
});
