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
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Rajahmundry');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState('RT-01');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const list = await ApiService.getRoutes();
      setRoutes(list);
      if (list.length > 0) {
        setSelectedRouteId(list[0].id);
      }
    } catch (e) {
      console.error('Failed to load routes:', e);
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
      assignedAgentId: 'USR-02',
    };

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
        assignedAgentId: routeObj.assignedAgentId || 'USR-02',
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
        `Customer ${newCust.fullName} (${newCust.customerCode}) has been registered and synced with database.`,
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

        {/* Route Allocation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Operational Beat Route</Text>
          <View style={styles.routeChipsRow}>
            {routes.map((r) => {
              const isSelected = selectedRouteId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedRouteId(r.id)}
                  style={[styles.routeChip, isSelected && styles.routeChipActive]}
                >
                  <MapPin size={14} color={isSelected ? '#FFF' : Colors.textSecondary} />
                  <Text style={[styles.routeChipText, isSelected && styles.routeChipTextActive]}>
                    {r.name}
                  </Text>
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
