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
      {/* Top Brand Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Shield size={38} color={Colors.primaryLight} />
        </View>
        <Text style={styles.brandTitle}>FINTRACK</Text>
        <Text style={styles.brandSubtitle}>Microfinance Regional Terminal</Text>
      </View>

      {/* PIN Prompt Section */}
      <View style={styles.promptContainer}>
        <View style={styles.lockRow}>
          <Lock size={16} color={Colors.textSecondary} />
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
        ) : (
          <Text style={styles.hintText}></Text>
        )}

        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primaryLight} />
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
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
            <Delete size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footerNote}>
        End-to-End Encrypted Microfinance Terminal • Offline Enabled
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingVertical: 45,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  promptContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  promptDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 12,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  pinDotError: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
  },
  errorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyButton: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  keyButtonSide: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
  },
});
