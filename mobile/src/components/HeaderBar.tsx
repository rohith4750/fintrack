import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff, RefreshCw, LogOut, ArrowLeft } from 'lucide-react-native';

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
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundSecondary} />

      {/* Top row: Agent Profile pill & Online status */}
      <View style={styles.topRow}>
        <View style={styles.agentInfo}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={20} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPill}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.slice(0, 2).toUpperCase() || 'FO'}</Text>
              </View>
              <View>
                <Text style={styles.agentName}>{user?.name || 'Field Officer'}</Text>
                <Text style={styles.agentRole}>Field Beat Agent • {user?.userId || 'USR-02'}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {pendingCount > 0 ? (
            <TouchableOpacity onPress={syncNow} disabled={isSyncing} style={styles.syncPill}>
              <RefreshCw size={12} color={Colors.warning} />
              <Text style={styles.syncText}>{isSyncing ? 'Syncing...' : `${pendingCount} Offline`}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.onlinePill}>
              <Wifi size={12} color={Colors.success} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}

          {rightAction || (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <LogOut size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={Typography.h2}>{title}</Text>
        {subtitle && <Text style={Typography.bodySmall}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  avatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  agentName: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  agentRole: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  onlineText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  syncText: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  titleRow: {
    marginTop: 4,
  },
});
