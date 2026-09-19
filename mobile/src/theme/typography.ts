import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  body: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  caption: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyLarge: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  currencyMedium: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
});
