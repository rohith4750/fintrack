import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
  Platform,
  Animated,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { Shield, Delete, Lock, AlertCircle } from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Auto-submit instantly when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const triggerShake = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(80);
      } catch (err) { }
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePinSubmit = async (enteredPin: string) => {
    setError(null);
    try {
      const success = await login(enteredPin, enteredPin);
      if (!success) {
        triggerShake();
        setError('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setPin('');
        }, 250);
      }
    } catch (e) {
      triggerShake();
      setError('Incorrect Security PIN.');
      setTimeout(() => {
        setPin('');
      }, 250);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !isLoading) {
      setError(null);
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (!isLoading) {
      setError(null);
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      setError(null);
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Top Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Shield size={28} color={Colors.primaryLight} />
          </View>
          <Text style={styles.brandTitle}>FINTRACK</Text>
          <Text style={styles.brandSubtitle}>Microfinance Regional Terminal</Text>
        </View>

        {/* PIN Prompt Section */}
        <View style={styles.promptContainer}>
          <View style={styles.lockRow}>
            <Lock size={15} color={Colors.textSecondary} />
            <Text style={styles.promptTitle}>Enter 4-Digit Security PIN</Text>
          </View>
          <Text style={styles.promptDesc}>
            Enter your assigned PIN to unlock your terminal
          </Text>

          {/* 4 Interactive PIN Dots with Shake Animation */}
          <Animated.View
            style={[
              styles.pinDotsRow,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    isFilled && styles.pinDotFilled,
                    !!error && styles.pinDotError,
                  ]}
                />
              );
            })}
          </Animated.View>

          {error ? (
            <View style={styles.errorPill}>
              <AlertCircle size={13} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.primaryLight} />
              <Text style={styles.loadingText}>Verifying...</Text>
            </View>
          ) : (
            <View style={styles.statusPlaceholder} />
          )}
        </View>

        {/* Modern On-Screen Numeric Keypad */}
        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => handleKeyPress(n)}
                disabled={isLoading}
                style={styles.keyButton}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => handleKeyPress(n)}
                disabled={isLoading}
                style={styles.keyButton}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => handleKeyPress(n)}
                disabled={isLoading}
                style={styles.keyButton}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.keypadRow}>
            <TouchableOpacity
              onPress={handleClear}
              disabled={isLoading || pin.length === 0}
              style={styles.keyButtonSide}
              activeOpacity={0.6}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleKeyPress('0')}
              disabled={isLoading}
              style={styles.keyButton}
              activeOpacity={0.6}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={isLoading || pin.length === 0}
              style={styles.keyButtonSide}
              activeOpacity={0.6}
            >
              <Delete size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerNote}>
          End-to-End Encrypted Microfinance Terminal • Offline Enabled
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  promptDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  pinDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  pinDotError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    height: 24,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  statusPlaceholder: {
    height: 24,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
  },
  loadingText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  keyButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  keyButtonSide: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
  },
});
