import React, { useState, useEffect } from 'react';
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
  const [agentName, setAgentName] = useState('Suresh Varma');
  const [dailyTarget, setDailyTarget] = useState('25000');

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const list = await ApiService.getRoutes();
      setRoutes(list);
    } catch (e) {
      console.error('Failed to load routes:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  };

  const handleCreateRoute = async () => {
    if (!routeName.trim() || !routeCode.trim()) {
      Alert.alert('Validation Error', 'Please enter Route Name and Code.');
      return;
    }

    try {
      const created = await ApiService.addRoute({
        name: routeName.trim(),
        code: routeCode.trim().toUpperCase(),
        areaId: 'AREA-01',
        areaName: 'Rajahmundry Urban',
        assignedAgentId: 'USR-02',
        assignedAgentName: agentName,
        collectionDay: 'Tuesday',
        totalCustomers: 0,
        todayTarget: Number(dailyTarget) || 25000,
        todayCollected: 0,
      });

      setRoutes((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setShowAddRoute(false);
      setRouteName('');
      setRouteCode('');
      Alert.alert('Route Created', `Beat Route ${created.name} created successfully.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create route.');
    }
  };

  const handleStartEdit = (r: Route) => {
    setEditingRouteId(r.id);
    setRouteName(r.name);
    setRouteCode(r.code);
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
        assignedAgentName: agentName,
        todayTarget: Number(dailyTarget),
      });
    }

    setEditingRouteId(null);
    setRouteName('');
    setRouteCode('');
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
            onPress={() => {
              setEditingRouteId(null);
              setShowAddRoute(!showAddRoute);
            }}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Create / Edit Route Card */}
        {(showAddRoute || editingRouteId) && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingRouteId ? 'Edit Beat Route' : 'Create New Beat Route'}
            </Text>

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
                  setShowAddRoute(false);
                  setEditingRouteId(null);
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={editingRouteId ? handleSaveEdit : handleCreateRoute}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>
                  {editingRouteId ? 'Save Changes' : 'Create Route'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Existing Routes List */}
        <Text style={styles.sectionTitle}>Existing Operational Beats</Text>

        {routes.map((r) => (
          <View key={r.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routeTitleRow}>
                <MapPin size={16} color={Colors.primaryLight} />
                <Text style={styles.routeName}>{r.name}</Text>
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
