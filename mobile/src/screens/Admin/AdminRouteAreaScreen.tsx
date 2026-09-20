import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { Route } from '../../types';
import { MapPin, Plus, User, Target, Trash2, Edit3, Check, X } from 'lucide-react-native';

export const AdminRouteAreaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  // Form states
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [areaName, setAreaName] = useState('Rajahmundry Urban');
  const [agentName, setAgentName] = useState('Suresh Varma');
  const [dailyTarget, setDailyTarget] = useState('25000');

  const loadRoutes = useCallback(async () => {
    try {
      const list = await ApiService.getRoutes();
      setRoutes(list);
    } catch (e) {
      console.error('Failed to load routes:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoutes();
    }, [loadRoutes])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  };

  const handleStartEdit = (r: Route) => {
    setEditingRouteId(r.id);
    setRouteName(r.name);
    setRouteCode(r.code);
    setAreaName(r.areaName || 'Rajahmundry Urban');
    setAgentName(r.assignedAgentName);
    setDailyTarget(String(r.todayTarget));
  };

  const handleSaveEdit = async () => {
    if (!routeName.trim() || !routeCode.trim()) {
      Alert.alert('Validation Error', 'Name and Code cannot be empty.');
      return;
    }

    setRoutes((prev) =>
      prev.map((r) =>
        r.id === editingRouteId
          ? {
              ...r,
              name: routeName.trim(),
              code: routeCode.trim().toUpperCase(),
              areaName: areaName.trim() || 'Rajahmundry Urban',
              assignedAgentName: agentName,
              todayTarget: Number(dailyTarget) || r.todayTarget,
            }
          : r
      )
    );

    if (editingRouteId) {
      await ApiService.updateRoute(editingRouteId, {
        name: routeName.trim(),
        code: routeCode.trim().toUpperCase(),
        areaName: areaName.trim() || 'Rajahmundry Urban',
        assignedAgentName: agentName,
        todayTarget: Number(dailyTarget),
      });
    }

    setEditingRouteId(null);
    setRouteName('');
    setRouteCode('');
    setAreaName('Rajahmundry Urban');
    Alert.alert('Updated', 'Route details updated.');
  };

  const handleDeleteRoute = (r: Route) => {
    Alert.alert(
      'Delete Beat Route',
      `Are you sure you want to delete ${r.name} (${r.code})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setRoutes((prev) => prev.filter((item) => item.id !== r.id));
            await ApiService.deleteRoute(r.id);
            Alert.alert('Deleted', `Route ${r.name} has been removed.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Area & Route Operations"
        subtitle={`${routes.length} Active Regional Beats`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCreateRoute')}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Top Banner with Quick Create Button */}
        <View style={styles.topBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.topBannerTitle}>Regional Beat Routes</Text>
            <Text style={styles.topBannerSub}>
              {routes.length} beats active in Rajahmundry Central
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createRouteBtn}
            onPress={() => navigation.navigate('AdminCreateRoute')}
          >
            <Plus size={15} color="#FFF" />
            <Text style={styles.createRouteBtnText}>Add Beat Route</Text>
          </TouchableOpacity>
        </View>

        {/* Create / Edit Route Card */}
        {editingRouteId && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Edit Beat Route</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Route Name *</Text>
              <TextInput
                style={styles.input}
                value={routeName}
                onChangeText={setRouteName}
                placeholder="e.g. Alcot Gardens & Innespeta"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Operational Area / Region *</Text>
              <TextInput
                style={styles.input}
                value={areaName}
                onChangeText={setAreaName}
                placeholder="e.g. Rajahmundry Urban, Danavaipeta"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Route Code *</Text>
              <TextInput
                style={styles.input}
                value={routeCode}
                onChangeText={setRouteCode}
                placeholder="e.g. RT-RJY-04"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assigned Field Officer</Text>
              <TextInput
                style={styles.input}
                value={agentName}
                onChangeText={setAgentName}
                placeholder="Suresh Varma"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Target (₹)</Text>
              <TextInput
                style={styles.input}
                value={dailyTarget}
                onChangeText={setDailyTarget}
                keyboardType="numeric"
                placeholder="25000"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  setEditingRouteId(null);
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading Spinner */}
        {loading && (
          <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginVertical: 24 }} />
        )}

        {/* Empty State Card */}
        {!loading && routes.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <MapPin size={32} color={Colors.warning} />
            </View>
            <Text style={styles.emptyTitle}>No Beat Routes Configured</Text>
            <Text style={styles.emptySub}>
              No collection beats found in this operational zone. Create your first operational route to assign field officers and start loan collections.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => navigation.navigate('AdminCreateRoute')}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.emptyActionBtnText}>Create First Beat Route</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing Routes List */}
        {!loading && routes.length > 0 && (
          <Text style={styles.sectionTitle}>Existing Operational Beats</Text>
        )}

        {routes.map((r) => (
          <View key={r.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routeTitleRow}>
                <MapPin size={16} color={Colors.primaryLight} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeName}>{r.name}</Text>
                  <Text style={styles.routeAreaSub}>{r.areaName || 'Rajahmundry Urban'}</Text>
                </View>
              </View>
              <Text style={styles.routeCode}>{r.code}</Text>
            </View>

            <View style={styles.routeMetaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Assigned Officer</Text>
                <Text style={styles.metaVal}>{r.assignedAgentName}</Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Daily Target</Text>
                <Text style={[styles.metaVal, { color: Colors.primaryLight }]}>
                  ₹{(r.todayTarget || 0).toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Customers</Text>
                <Text style={styles.metaVal}>{r.totalCustomers || 0} Borrowers</Text>
              </View>
            </View>

            {/* Quick Actions (Edit, Delete) */}
            <View style={styles.cardActionRow}>
              <TouchableOpacity
                onPress={() => handleStartEdit(r)}
                style={styles.cardActionBtn}
              >
                <Edit3 size={14} color={Colors.warning} />
                <Text style={[styles.cardActionText, { color: Colors.warning }]}>Edit Beat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteRoute(r)}
                style={styles.cardActionBtn}
              >
                <Trash2 size={14} color={Colors.danger} />
                <Text style={[styles.cardActionText, { color: Colors.danger }]}>Delete Beat</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
    gap: 12,
  },
  topBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  topBannerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  createRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createRouteBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginVertical: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.text,
    fontSize: 13,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  routeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  routeAreaSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  routeCode: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  cardActionRow: {
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
  },
});
