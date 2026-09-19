import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { User, Route } from '../../types';
import {
  UserPlus,
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  MapPin,
  TrendingUp,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Gauge,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react-native';

export const AdminAgentListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [agents, setAgents] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAgentForSecurity, setSelectedAgentForSecurity] = useState<User | null>(null);

  // Security Modal States
  const [editPin, setEditPin] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPinMask, setShowPinMask] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [agentList, routeList] = await Promise.all([
        ApiService.getAgents(),
        ApiService.getRoutes(),
      ]);
      setAgents(agentList);
      setRoutes(routeList);
    } catch (e) {
      console.error('Failed to load agents:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadAgents = async () => {
    const list = await ApiService.getAgents();
    setAgents(list);
  };

  const handleOpenSecurity = (agent: User) => {
    setSelectedAgentForSecurity(agent);
    setEditPin(agent.pin || '1234');
    setEditPassword(agent.password || 'agentpassword');
  };

  const handleSaveSecurity = async () => {
    if (!selectedAgentForSecurity) return;
    if (editPin.length !== 4) {
      Alert.alert('PIN Error', 'PIN must be exactly 4 numeric digits.');
      return;
    }

    await ApiService.updateAgentCredentials(selectedAgentForSecurity.id, {
      pin: editPin,
      password: editPassword,
    });

    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgentForSecurity.id
          ? { ...a, pin: editPin, password: editPassword }
          : a
      )
    );

    setSelectedAgentForSecurity(null);
    Alert.alert('Security Saved', `PIN for ${selectedAgentForSecurity.name} updated to ${editPin}.`);
  };

  const handleToggleStatus = async (agent: User) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await ApiService.updateAgentCredentials(agent.id, { status: nextStatus });
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a))
    );
    if (selectedAgentForSecurity) {
      setSelectedAgentForSecurity({ ...selectedAgentForSecurity, status: nextStatus });
    }
  };

  const handleDeleteAgent = (agent: User) => {
    Alert.alert(
      'Remove Field Officer',
      `Are you sure you want to remove ${agent.name} (${agent.loginId || agent.phone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await ApiService.deleteAgent(agent.id);
            setAgents((prev) => prev.filter((a) => a.id !== agent.id));
            Alert.alert('Removed', `${agent.name} removed from field roster.`);
          },
        },
      ]
    );
  };

  const filteredAgents = agents.filter((a) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      (a.loginId && a.loginId.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Field Force Administration"
        subtitle={`${agents.length} Provisioned Collection Agents`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCreateAgent')}
            style={styles.addBtn}
          >
            <UserPlus size={18} color="#FFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin Security Banner */}
        <View style={styles.securityBanner}>
          <ShieldCheck size={18} color={Colors.primaryLight} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityBannerTitle}>Centralized Security Mode</Text>
            <Text style={styles.securityBannerSub}>
              Admin maintains 100% control: Provision agents, manage 4-digit PINs, and audit collection limits.
            </Text>
          </View>
        </View>

        {/* Quick Search */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by agent name, phone, or staff code..."
            placeholderTextColor={Colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Agents List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Field Force Roster & Credentials</Text>
        </View>

        {filteredAgents.map((agent) => {
          const isSuspended = agent.status === 'SUSPENDED';
          const agentRoutes = routes.filter((r) =>
            agent.assignedRouteIds?.includes(r.id) || (r.routeId && agent.assignedRouteIds?.includes(r.routeId)) || r.assignedAgentId === agent.id || (agent.userId && r.assignedAgentId === agent.userId)
          );
          const percent = Math.min(
            100,
            Math.round(((agent.todayCollected || 0) / (agent.todayTarget || 1)) * 100)
          );

          return (
            <View
              key={agent.id}
              style={[styles.agentCard, isSuspended && styles.agentCardSuspended]}
            >
              {/* Header */}
              <View style={styles.agentTop}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {agent.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.agentInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <View
                      style={
                        isSuspended
                          ? styles.statusBadgeSuspended
                          : styles.statusBadgeActive
                      }
                    >
                      <Text
                        style={
                          isSuspended
                            ? styles.statusTextSuspended
                            : styles.statusTextActive
                        }
                      >
                        {isSuspended ? 'SUSPENDED' : agent.attendanceStatus || 'ON_FIELD'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.agentPhone}>
                    {agent.phone} • {agent.loginId || agent.id}
                  </Text>
                </View>
              </View>

              {/* Login ID & Quick PIN Badge */}
              <View style={styles.pinBadgeRow}>
                <View style={styles.loginIdTag}>
                  <Key size={13} color={Colors.textSecondary} />
                  <Text style={styles.loginIdText}>{agent.loginId || agent.id}</Text>
                </View>

                <View style={styles.pinTag}>
                  <Text style={styles.pinLabel}>PIN:</Text>
                  <Text style={styles.pinValue}>{agent.pin || '••••'}</Text>
                </View>
              </View>

              {/* Performance Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Recovery Eff.</Text>
                  <Text style={[styles.statVal, { color: Colors.success }]}>
                    {agent.recoveryEfficiency || 94.2}%
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Today Target</Text>
                  <Text style={styles.statVal}>
                    ₹{(agent.todayTarget || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Collected</Text>
                  <Text style={[styles.statVal, { color: Colors.primaryLight }]}>
                    ₹{(agent.todayCollected || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Beat Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Beat Target Progress</Text>
                  <Text style={styles.progressPercent}>{percent}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, Math.max(4, percent))}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Assigned Routes */}
              <View style={styles.routesRow}>
                <Text style={styles.routesLabel}>Assigned Beats:</Text>
                {agentRoutes.map((r) => (
                  <View key={r.id} style={styles.routeTag}>
                    <Text style={styles.routeTagText}>{r.code}</Text>
                  </View>
                ))}
              </View>

              {/* Card Actions (PIN/Security, Remove) */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleOpenSecurity(agent)}
                  style={styles.actionBtn}
                >
                  <Lock size={14} color={Colors.primaryLight} />
                  <Text style={styles.actionBtnText}>PIN & Security</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteAgent(agent)}
                  style={styles.actionBtn}
                >
                  <Trash2 size={14} color={Colors.danger} />
                  <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Daily Field Check-In Log Table */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Field Check-In & Kilometers Log</Text>
        </View>

        <View style={styles.attendanceTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.5 }]}>Agent</Text>
            <Text style={[styles.th, { flex: 1 }]}>Check-In</Text>
            <Text style={[styles.th, { flex: 1 }]}>Status</Text>
            <Text style={[styles.th, { flex: 1 }]}>Start KM</Text>
          </View>

          {agents.map((a, idx) => (
            <View key={a.id} style={styles.tableRow}>
              <Text style={[styles.tdBold, { flex: 1.5 }]} numberOfLines={1}>
                {a.name}
              </Text>
              <Text style={[styles.tdMono, { flex: 1 }]}>08:30 AM</Text>
              <View style={[styles.tdBadge, { flex: 1 }]}>
                <Text style={styles.tdBadgeText}>{a.attendanceStatus || 'ON_FIELD'}</Text>
              </View>
              <Text style={[styles.tdMono, { flex: 1 }]}>{120 + idx * 8} km</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Security & PIN Modal */}
      {selectedAgentForSecurity && (
        <Modal transparent animationType="fade" visible={!!selectedAgentForSecurity}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <ShieldCheck size={18} color={Colors.primaryLight} />
                <Text style={styles.modalTitle}>Admin PIN & Access Control</Text>
              </View>

              <View style={styles.modalAgentBox}>
                <Text style={styles.modalAgentName}>{selectedAgentForSecurity.name}</Text>
                <Text style={styles.modalAgentMeta}>
                  Login ID: {selectedAgentForSecurity.loginId || selectedAgentForSecurity.id} • {selectedAgentForSecurity.phone}
                </Text>
              </View>

              {/* PIN Input */}
              <View style={styles.modalInputGroup}>
                <View style={styles.modalLabelRow}>
                  <Text style={styles.modalInputLabel}>4-Digit Collection PIN *</Text>
                  <TouchableOpacity onPress={() => setShowPinMask(!showPinMask)}>
                    <Text style={styles.modalToggleText}>
                      {showPinMask ? 'Hide PIN' : 'Show PIN'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.modalPinInput, { letterSpacing: 8 }]}
                  value={editPin}
                  onChangeText={setEditPin}
                  maxLength={4}
                  keyboardType="number-pad"
                  secureTextEntry={!showPinMask}
                />
                <Text style={styles.modalHelper}>Agent enters this PIN to authenticate on mobile.</Text>
              </View>

              {/* Password */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Account Password</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editPassword}
                  onChangeText={setEditPassword}
                />
              </View>

              {/* Status Toggle */}
              <View style={styles.statusToggleRow}>
                <View>
                  <Text style={styles.statusToggleLabel}>Access Status:</Text>
                  <Text
                    style={
                      selectedAgentForSecurity.status === 'ACTIVE'
                        ? styles.statusActiveText
                        : styles.statusSuspendedText
                    }
                  >
                    {selectedAgentForSecurity.status}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleToggleStatus(selectedAgentForSecurity)}
                  style={[
                    styles.statusToggleBtn,
                    selectedAgentForSecurity.status === 'ACTIVE'
                      ? styles.statusToggleBtnDanger
                      : styles.statusToggleBtnSuccess,
                  ]}
                >
                  <Text style={styles.statusToggleBtnText}>
                    {selectedAgentForSecurity.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Modal Action Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  onPress={() => setSelectedAgentForSecurity(null)}
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSaveSecurity} style={styles.modalSaveBtn}>
                  <Text style={styles.modalSaveText}>Save Credentials</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 12,
  },
  securityBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  securityBannerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  searchBar: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
    marginBottom: 14,
  },
  searchInput: {
    color: Colors.text,
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  agentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
    overflow: 'hidden',
  },
  agentCardSuspended: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    opacity: 0.85,
  },
  agentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  agentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  statusBadgeSuspended: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTextSuspended: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
  },
  agentPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pinBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 14,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  loginIdTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  pinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pinLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  pinValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryLight,
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
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
  progressSection: {
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  progressBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
  routesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  routesLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  routeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.surfaceBorder,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  attendanceTable: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  tdBold: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  tdMono: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tdBadge: {
    alignSelf: 'flex-start',
  },
  tdBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  modalAgentBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalAgentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  modalAgentMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalToggleText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  modalPinInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.primaryLight,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  modalInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 40,
    color: Colors.text,
    fontSize: 13,
  },
  modalHelper: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  statusToggleLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  statusActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  statusSuspendedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusToggleBtnDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusToggleBtnSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1.5,
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
