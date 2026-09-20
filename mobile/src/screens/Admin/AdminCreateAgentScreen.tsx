import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { User, AgentPermissions, Route } from '../../types';
import {
  UserPlus,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  MapPin,
  Check,
  Banknote,
  Smartphone,
  Edit,
} from 'lucide-react-native';

export const AdminCreateAgentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [pin, setPin] = useState('1234');
  const [password, setPassword] = useState('agentpassword');
  const [showPin, setShowPin] = useState(false);

  // Financial & Route
  const [maxCashLimit, setMaxCashLimit] = useState('75000');
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);

  // Permissions
  const [canCollectCash, setCanCollectCash] = useState(true);
  const [canCollectUPI, setCanCollectUPI] = useState(true);
  const [canEditCustomer, setCanEditCustomer] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const list = await ApiService.getRoutes();
      setRoutes(list);
      if (list.length > 0) {
        setSelectedRouteIds([list[0].id]);
      }
    } catch (e) {
      console.error('Failed to load routes:', e);
    }
  };

  const toggleRouteSelection = (routeId: string) => {
    if (selectedRouteIds.includes(routeId)) {
      if (selectedRouteIds.length > 1) {
        setSelectedRouteIds(selectedRouteIds.filter((id) => id !== routeId));
      }
    } else {
      setSelectedRouteIds([...selectedRouteIds, routeId]);
    }
  };

  const handleCreateAgent = async () => {
    if (!name.trim() || !phone.trim() || !pin.trim()) {
      Alert.alert('Validation Error', 'Agent Full Name, Mobile Phone, and 4-Digit PIN are required.');
      return;
    }

    if (pin.trim().length !== 4) {
      Alert.alert('Validation Error', 'PIN must be exactly 4 numeric digits.');
      return;
    }

    setIsSubmitting(true);
    try {
      const perms: AgentPermissions = {
        canCollectCash,
        canCollectUPI,
        canEditCustomer,
        canDisburseLoan: false,
        maxDailyCashLimit: Number(maxCashLimit) || 75000,
      };

      const newAgentPayload: Omit<User, 'id'> = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || `${loginId.trim().toLowerCase() || 'agent'}@fintrack.in`,
        role: 'AGENT',
        status: 'ACTIVE',
        loginId: loginId.trim().toUpperCase() || `AGT-${phone.slice(-4)}`,
        pin: pin.trim(),
        password: password.trim() || 'agentpassword',
        recoveryEfficiency: 95.0,
        todayCollected: 0,
        attendanceStatus: 'ON_FIELD',
        maxDailyCashLimit: Number(maxCashLimit) || 75000,
        assignedRouteIds: selectedRouteIds,
        permissions: perms,
      };

      const created = await ApiService.addAgent(newAgentPayload);

      Alert.alert(
        'Agent Provisioned Successfully',
        `Field Officer ${created.name} provisioned with Login PIN: ${created.pin}. Stored in database.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to provision agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Provision Field Agent"
        subtitle="Agent Roster & Mobile PIN Setup"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <ShieldCheck size={16} color={Colors.primaryLight} />
          <Text style={styles.securityNoticeText}>
            Admin Master Security: Field agents use this 4-digit PIN to authenticate in the field.
          </Text>
        </View>

        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Agent Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Agent Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. M. Rajesh Kumar"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (!loginId && text.length >= 4) {
                  setLoginId(`AGT-${text.slice(-4)}`);
                }
              }}
              placeholder="e.g. +91 98480 45678"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rajesh.m@fintrack.in"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Credentials & PIN (Admin-Assigned App Access) */}
        <View style={[styles.card, styles.credentialsCard]}>
          <View style={styles.credHeader}>
            <Lock size={16} color={Colors.primaryLight} />
            <Text style={styles.credTitle}>Admin-Assigned App Access Credentials</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Login ID / Staff Code</Text>
            <TextInput
              style={[styles.input, { textTransform: 'uppercase' }]}
              value={loginId}
              onChangeText={setLoginId}
              placeholder="e.g. AGT-RJY-05"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.pinHeader}>
              <Text style={styles.inputLabel}>Quick 4-Digit Mobile PIN *</Text>
              <TouchableOpacity onPress={() => setShowPin(!showPin)} style={styles.showPinBtn}>
                {showPin ? <EyeOff size={14} color={Colors.primaryLight} /> : <Eye size={14} color={Colors.primaryLight} />}
                <Text style={styles.showPinText}>{showPin ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.pinInput,
              ]}
              value={pin}
              onChangeText={setPin}
              maxLength={4}
              keyboardType="number-pad"
              secureTextEntry={!showPin}
              placeholder="1234"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.helperText}>Agent enters this PIN to instantly unlock mobile collections.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Default Account Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="agentpassword"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Cash Limit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Field Cash Holding Limit</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Max Daily Cash Holding Limit (₹)</Text>
            <TextInput
              style={[styles.input, { color: Colors.success }]}
              value={maxCashLimit}
              onChangeText={setMaxCashLimit}
              keyboardType="numeric"
              placeholder="75000"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.helperText}>Threshold for mandatory cash handover / vault deposit</Text>
          </View>
        </View>

        {/* Route Allocation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign Operational Beat Routes</Text>
          <View style={styles.routeChipsRow}>
            {routes.map((r) => {
              const routeKey = r.id;
              const isSelected = selectedRouteIds.includes(routeKey);
              return (
                <TouchableOpacity
                  key={routeKey}
                  onPress={() => toggleRouteSelection(routeKey)}
                  style={[styles.routeChip, isSelected && styles.routeChipActive]}
                >
                  <MapPin size={14} color={isSelected ? '#FFF' : Colors.textSecondary} />
                  <Text style={[styles.routeChipText, isSelected && styles.routeChipTextActive]}>
                    {r.code} • {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Agent Collection Permissions</Text>

          <View style={styles.permRow}>
            <View style={styles.permInfo}>
              <Text style={styles.permTitle}>Collect Cash Payments</Text>
              <Text style={styles.permSub}>Allow physical cash collection on field</Text>
            </View>
            <Switch
              value={canCollectCash}
              onValueChange={setCanCollectCash}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.permRow}>
            <View style={styles.permInfo}>
              <Text style={styles.permTitle}>Collect UPI Payments</Text>
              <Text style={styles.permSub}>Allow dynamic BharatPe / QR collection</Text>
            </View>
            <Switch
              value={canCollectUPI}
              onValueChange={setCanCollectUPI}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.permRow}>
            <View style={styles.permInfo}>
              <Text style={styles.permTitle}>Edit Customer Details</Text>
              <Text style={styles.permSub}>Allow field agent to update address & phone</Text>
            </View>
            <Switch
              value={canEditCustomer}
              onValueChange={setCanEditCustomer}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Save & Provision Button */}
        <TouchableOpacity
          onPress={handleCreateAgent}
          disabled={isSubmitting}
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <UserPlus size={18} color="#FFF" />
              <Text style={styles.submitBtnText}>Provision Field Agent</Text>
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
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 14,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryLight,
    lineHeight: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  credentialsCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  credHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  credTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
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
  pinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  showPinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showPinText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  pinInput: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryLight,
    textAlign: 'center',
    letterSpacing: 8,
  },
  helperText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  routeChipsRow: {
    gap: 8,
  },
  routeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  routeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  routeChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  routeChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  permInfo: {
    flex: 1,
    marginRight: 10,
  },
  permTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  permSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
