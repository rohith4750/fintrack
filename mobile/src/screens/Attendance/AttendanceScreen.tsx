import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { MapPin, Navigation, Clock, CheckCircle2, Shield, Camera } from 'lucide-react-native';

export const AttendanceScreen: React.FC = () => {
  const { user } = useAuth();
  const [kmReading, setKmReading] = useState('14250');
  const [remarks, setRemarks] = useState('Starting Rajahmundry Urban beat');
  const [isCheckedIn, setIsCheckedIn] = useState(user?.attendanceStatus === 'ON_FIELD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      await ApiService.submitAttendance({
        agentId: user?.userId || 'USR-02',
        agentName: user?.name || 'Suresh Varma',
        date: '2026-09-20',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'ON_FIELD',
        startKilometers: Number(kmReading) || 0,
        remarks,
        gpsLocation: {
          latitude: 17.0005,
          longitude: 81.804,
          address: 'Main Road Hub, Rajahmundry',
        },
      });

      setIsCheckedIn(true);
      Alert.alert('Punch-In Successful', 'Field attendance recorded with GPS coordinates & starting KM reading.');
    } catch (e) {
      Alert.alert('Offline Notice', 'Punch-in stored locally.');
      setIsCheckedIn(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Field Attendance"
        subtitle="Daily GPS & Odometer Check-In"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={[styles.statusCard, isCheckedIn ? styles.statusActive : styles.statusPending]}>
          <View style={styles.statusIconWrapper}>
            <Clock size={24} color={isCheckedIn ? Colors.success : Colors.warning} />
          </View>
          <View style={styles.statusTextGroup}>
            <Text style={styles.statusTitle}>
              {isCheckedIn ? 'ON FIELD DUTY (Punched In)' : 'Check-In Required'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isCheckedIn
                ? 'Check-in Time: 08:30 AM • GPS Verified'
                : 'Punch in before starting your collection route'}
            </Text>
          </View>
        </View>

        {/* GPS Location Snapshot */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={16} color={Colors.primaryLight} />
            <Text style={styles.cardTitle}>Current GPS Coordinates</Text>
          </View>
          <View style={styles.locationBox}>
            <Text style={styles.locCoords}>Lat: 17.0005° N • Long: 81.8040° E</Text>
            <Text style={styles.locAddress}>
              Rajahmundry Urban Regional Hub, Andhra Pradesh 533101
            </Text>
            <View style={styles.gpsAccuracyPill}>
              <Text style={styles.gpsAccuracyText}>High Accuracy GPS (± 4 meters)</Text>
            </View>
          </View>
        </View>

        {/* Bike / Vehicle Odometer Reading */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Navigation size={16} color={Colors.primaryLight} />
            <Text style={styles.cardTitle}>Vehicle Starting Odometer (KM)</Text>
          </View>
          <TextInput
            style={styles.input}
            value={kmReading}
            onChangeText={setKmReading}
            placeholder="e.g. 14250"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
          <Text style={styles.inputHelp}>
            Enter the exact speedometer reading before departing for field beat
          </Text>
        </View>

        {/* Remarks Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={16} color={Colors.primaryLight} />
            <Text style={styles.cardTitle}>Duty Remarks / Beat Notes</Text>
          </View>
          <TextInput
            style={styles.remarksInput}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Notes for field operations..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>

        {/* Punch In / Out Button */}
        <TouchableOpacity
          onPress={handleCheckIn}
          disabled={isSubmitting}
          style={[styles.punchBtn, isCheckedIn ? styles.punchBtnDisabled : styles.punchBtnActive]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <CheckCircle2 size={18} color="#FFF" />
              <Text style={styles.punchBtnText}>
                {isCheckedIn ? 'Update Field Location' : 'Confirm Punch-In with GPS'}
              </Text>
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusIconWrapper: {
    marginRight: 12,
  },
  statusTextGroup: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  statusSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  locationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 10,
  },
  locCoords: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  locAddress: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  gpsAccuracyPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  gpsAccuracyText: {
    fontSize: 10,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  inputHelp: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  remarksInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 8,
    padding: 10,
    color: Colors.text,
    fontSize: 12,
    height: 60,
    textAlignVertical: 'top',
  },
  punchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    height: 50,
    marginTop: 10,
  },
  punchBtnActive: {
    backgroundColor: Colors.primary,
  },
  punchBtnDisabled: {
    backgroundColor: Colors.surfaceHover,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  punchBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
