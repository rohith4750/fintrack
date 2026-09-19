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
import { getCurrentGpsPosition, openGoogleMapsNavigation } from '../../services/location';
import { Customer, Route } from '../../types';
import {
  UserPlus,
  Check,
  MapPin,
  Shield,
  Compass,
  Navigation2,
} from 'lucide-react-native';

export const AdminCreateCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Rajahmundry');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState('RT-01');
  const [selectedAgentId, setSelectedAgentId] = useState('USR-02');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routeList, agentList] = await Promise.all([
        ApiService.getRoutes(),
        ApiService.getAgents(),
      ]);
      setRoutes(routeList);
      setAgents(agentList);
      if (routeList.length > 0) {
        setSelectedRouteId(routeList[0].id || routeList[0].routeId || 'RT-01');
        if (routeList[0].assignedAgentId) {
          setSelectedAgentId(routeList[0].assignedAgentId);
        }
      }
      if (agentList.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentList[0].userId || agentList[0].id || 'USR-02');
      }
    } catch (e) {
      console.error('Failed to load routes/agents:', e);
    }
  };

  const handleRouteSelect = (rId: string) => {
    setSelectedRouteId(rId);
    const r = routes.find((item) => item.id === rId || item.routeId === rId);
    if (r?.assignedAgentId) {
      setSelectedAgentId(r.assignedAgentId);
    }
  };

  const handleAgentSelect = (aId: string) => {
    setSelectedAgentId(aId);
    const matchingRoute = routes.find((r) => r.assignedAgentId === aId);
    if (matchingRoute) {
      setSelectedRouteId(matchingRoute.id || matchingRoute.routeId || 'RT-01');
    }
  };

  const handleCaptureGps = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentGpsPosition();
      setLatitude(pos.latitude.toFixed(6));
      setLongitude(pos.longitude.toFixed(6));
      if (pos.address && !address) {
        setAddress(pos.address);
      }
      Alert.alert(
        'GPS Position Captured',
        `Lat: ${pos.latitude.toFixed(5)}, Lng: ${pos.longitude.toFixed(5)}\nGoogle Maps navigation will now direct directly to this location.`
      );
    } catch (err: any) {
      Alert.alert('GPS Location Error', err.message || 'Could not fetch current coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Validation Error', 'Please enter Full Name, Phone, and Address.');
      return;
    }

    const routeObj = routes.find((r) => r.id === selectedRouteId || r.routeId === selectedRouteId) || routes[0] || {
      id: 'RT-01',
      routeId: 'RT-01',
      name: 'Main Road Beat',
      areaId: 'AREA-01',
      areaName: 'Rajahmundry Urban',
      assignedAgentId: selectedAgentId || 'USR-02',
    };

    const agentObj = agents.find((a) => a.id === selectedAgentId || a.userId === selectedAgentId);

    setIsSubmitting(true);
    try {
      const latNum = latitude ? parseFloat(latitude) : undefined;
      const lngNum = longitude ? parseFloat(longitude) : undefined;

      const payload: Omit<Customer, 'id' | 'customerCode'> = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        aadhaarNumber: aadhaarNumber.trim() || 'XXXX-XXXX-1234',
        address: address.trim(),
        city: city.trim(),
        areaId: routeObj.areaId || 'AREA-01',
        areaName: routeObj.areaName || 'Rajahmundry Urban',
        routeId: routeObj.id || routeObj.routeId || 'RT-01',
        routeName: routeObj.name,
        assignedAgentId: agentObj?.userId || agentObj?.id || selectedAgentId || 'USR-02',
        totalLoans: 0,
        activeLoanAmount: 0,
        totalOutstanding: 0,
        kycStatus: 'VERIFIED',
        guarantorName: guarantorName.trim(),
        guarantorPhone: guarantorPhone.trim(),
        latitude: latNum,
        longitude: lngNum,
        landmark: landmark.trim() || undefined,
        locationAddress: address.trim(),
      };

      const newCust = await ApiService.addCustomer(payload);

      Alert.alert(
        'Borrower Created Successfully',
        `Customer ${newCust.fullName} (${newCust.customerCode}) registered under Agent ${agentObj?.name || 'Assigned Agent'}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Onboard Borrower"
        subtitle="New Customer KYC & GPS Pinning"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Borrower Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Venkata Satyanarayana"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +91 98480 12345"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Aadhaar Card Number</Text>
            <TextInput
              style={styles.input}
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              placeholder="e.g. 5432-8765-1234"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* GPS Location & Address Card */}
        <View style={[styles.card, styles.gpsCard]}>
          <View style={styles.gpsHeader}>
            <MapPin size={16} color={Colors.primaryLight} />
            <Text style={styles.gpsTitle}>Borrower Doorstep GPS & Address</Text>
          </View>

          {/* Capture Current GPS Button */}
          <TouchableOpacity
            onPress={handleCaptureGps}
            disabled={isLocating}
            style={styles.captureGpsBtn}
          >
            {isLocating ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Compass size={16} color="#FFF" />
                <Text style={styles.captureGpsBtnText}>Capture Current GPS Location</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.coordRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                placeholder="e.g. 16.989065"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                placeholder="e.g. 81.783972"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Prominent Landmark</Text>
            <TextInput
              style={styles.input}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite Kotipalli SBI ATM / Water Tank"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street Address & Door No *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. D.No 12-4-5, Market Street"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City / Town</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Rajahmundry"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Field Agent Assignment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Field Officer / Agent *</Text>
          <Text style={styles.cardSubtitle}>Directly select the field agent responsible for this borrower:</Text>
          <View style={styles.agentGrid}>
            {agents.map((ag) => {
              const isSelected = selectedAgentId === ag.id || selectedAgentId === ag.userId;
              return (
                <TouchableOpacity
                  key={ag.id || ag.userId}
                  onPress={() => handleAgentSelect(ag.userId || ag.id)}
                  style={[styles.agentSelectCard, isSelected && styles.agentSelectCardActive]}
                >
                  <View style={styles.agentSelectHeader}>
                    <View style={[styles.agentAvatar, isSelected && styles.agentAvatarActive]}>
                      <Text style={[styles.agentAvatarText, isSelected && styles.agentAvatarTextActive]}>
                        {ag.name ? ag.name.slice(0, 2).toUpperCase() : 'AG'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.agentNameText, isSelected && styles.agentNameTextActive]}>
                        {ag.name}
                      </Text>
                      <Text style={styles.agentPhoneText}>{ag.phone || ag.loginId}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedCheckCircle}>
                        <Check size={12} color="#FFF" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Route Allocation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Collection Beat Route *</Text>
          <Text style={styles.cardSubtitle}>Select operating route for scheduled recovery visits:</Text>
          <View style={styles.routeChipsRow}>
            {routes.map((r) => {
              const isSelected = selectedRouteId === r.id || selectedRouteId === r.routeId;
              return (
                <TouchableOpacity
                  key={r.id || r.routeId}
                  onPress={() => handleRouteSelect(r.id || r.routeId || '')}
                  style={[styles.routeChip, isSelected && styles.routeChipActive]}
                >
                  <MapPin size={14} color={isSelected ? '#FFF' : Colors.textSecondary} />
                  <View>
                    <Text style={[styles.routeChipText, isSelected && styles.routeChipTextActive]}>
                      {r.name}
                    </Text>
                    <Text style={[styles.routeAreaText, isSelected && styles.routeAreaTextActive]}>
                      {r.areaName || r.code}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Guarantor Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guarantor Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guarantor Full Name</Text>
            <TextInput
              style={styles.input}
              value={guarantorName}
              onChangeText={setGuarantorName}
              placeholder="e.g. K. Venkata Rao"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guarantor Phone</Text>
            <TextInput
              style={styles.input}
              value={guarantorPhone}
              onChangeText={setGuarantorPhone}
              placeholder="e.g. +91 98480 99887"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleCreateCustomer}
          disabled={isSubmitting}
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <UserPlus size={18} color="#FFF" />
              <Text style={styles.submitBtnText}>Onboard Borrower</Text>
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
    marginBottom: 14,
  },
  gpsCard: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  captureGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 44,
    borderRadius: 10,
    marginBottom: 14,
  },
  captureGpsBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  coordRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  agentGrid: {
    gap: 8,
  },
  agentSelectCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  agentSelectCardActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#2563EB',
  },
  agentSelectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  agentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  agentAvatarActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  agentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  agentAvatarTextActive: {
    color: '#FFF',
  },
  agentNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  agentNameTextActive: {
    color: Colors.primaryLight,
  },
  agentPhoneText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  selectedCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeAreaText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  routeAreaTextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
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
