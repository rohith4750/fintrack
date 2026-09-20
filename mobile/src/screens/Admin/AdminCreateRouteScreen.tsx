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
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { Route } from '../../types';
import {
  MapPin,
  Check,
  ShieldCheck,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react-native';

export const AdminCreateRouteScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [areaName, setAreaName] = useState('Rajahmundry Urban');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [collectionFrequency, setCollectionFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const agentList = await ApiService.getAgents();
      setAgents(agentList);
      if (agentList.length > 0) {
        setSelectedAgentId(agentList[0].userId || agentList[0].id);
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Validation Error', 'Please enter a Beat Route Name.');
      return;
    }

    if (!routeCode.trim()) {
      Alert.alert('Validation Error', 'Please enter a unique Route Code (e.g. RT-01).');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignedAgent = agents.find(
        (a) => a.userId === selectedAgentId || a.id === selectedAgentId
      );

      const payload: Omit<Route, 'id'> = {
        name: routeName.trim(),
        code: routeCode.trim().toUpperCase(),
        areaId: 'RT-01',
        areaName: areaName.trim() || 'Rajahmundry Urban',
        assignedAgentId: selectedAgentId || 'USR-02',
        assignedAgentName: assignedAgent?.name || 'Assigned Officer',
        collectionDay: collectionFrequency === 'WEEKLY' ? 'Tuesday' : collectionFrequency,
        totalCustomers: 0,
        todayCollected: 0,
      };

      const created = await ApiService.addRoute(payload);

      Alert.alert(
        'Beat Route Created',
        `Route "${created.name}" (${created.code}) in ${created.areaName} created successfully.`,
        [
          {
            text: 'View Routes',
            onPress: () => {
              navigation.replace('AdminRouteArea');
            },
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Creation Failed', e.message || 'Could not create beat route. Check connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Add Beat Route"
        subtitle="Regional Collection Beat & Officer Assignment"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Basic Route Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={18} color={Colors.primaryLight} />
            <Text style={styles.cardTitle}>Beat Route & Area Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Route Name *</Text>
            <TextInput
              style={styles.input}
              value={routeName}
              onChangeText={(text) => {
                setRouteName(text);
                if (!routeCode && text.length > 2) {
                  const suggested = `RT-${text.slice(0, 3).toUpperCase()}-01`;
                  setRouteCode(suggested);
                }
              }}
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
            <Text style={styles.inputHint}>Single operational zone for this beat route</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Route Code *</Text>
            <TextInput
              style={styles.input}
              value={routeCode}
              onChangeText={(t) => setRouteCode(t.toUpperCase())}
              placeholder="e.g. RT-RJY-01"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            <Text style={styles.inputHint}>Short identifier printed on collection receipts</Text>
          </View>
        </View>

        {/* Officer Assignment */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color={Colors.success} />
            <Text style={styles.cardTitle}>Assigned Field Officer</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: 12 }} />
          ) : agents.length === 0 ? (
            <View style={styles.emptyAgents}>
              <Text style={styles.emptyAgentsText}>
                No agents registered yet. You can assign later or add an agent from Dashboard.
              </Text>
            </View>
          ) : (
            <View style={styles.agentList}>
              {agents.map((agent) => {
                const isSelected = selectedAgentId === (agent.userId || agent.id);
                return (
                  <TouchableOpacity
                    key={agent.id || agent.userId}
                    style={[styles.agentOption, isSelected && styles.agentOptionSelected]}
                    onPress={() => setSelectedAgentId(agent.userId || agent.id)}
                  >
                    <View style={styles.agentInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.agentName, isSelected && styles.agentNameSelected]}>
                          {agent.name}
                        </Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: agent.role === 'ADMIN' ? Colors.warning : Colors.primaryLight }}>
                          • {agent.role === 'ADMIN' ? 'Admin Officer' : 'Field Officer'}
                        </Text>
                      </View>
                      <Text style={styles.agentMeta}>
                        ID: {agent.userId || 'USR'} • {agent.phone || 'Field Officer'}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Collection Schedule */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color={Colors.warning} />
            <Text style={styles.cardTitle}>Collection Schedule</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Collection Cadence</Text>
            <View style={styles.freqRow}>
              {(['WEEKLY', 'DAILY', 'MONTHLY'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.freqBtn, collectionFrequency === freq && styles.freqBtnActive]}
                  onPress={() => setCollectionFrequency(freq)}
                >
                  <Calendar
                    size={14}
                    color={collectionFrequency === freq ? '#FFF' : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.freqBtnText,
                      collectionFrequency === freq && styles.freqBtnTextActive,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleCreateRoute}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Check size={18} color="#FFF" />
              <Text style={styles.submitBtnText}>Create & Activate Beat Route</Text>
            </>
          )}
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
    paddingBottom: 90,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
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
  inputHint: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
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
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 44,
  },
  readOnlyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  agentList: {
    gap: 8,
  },
  agentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  agentOptionSelected: {
    borderColor: Colors.primaryLight,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  agentNameSelected: {
    color: Colors.primaryLight,
  },
  agentMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.primaryLight,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryLight,
  },
  emptyAgents: {
    padding: 12,
    alignItems: 'center',
  },
  emptyAgentsText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  freqBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  freqBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  freqBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
