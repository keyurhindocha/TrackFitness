import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

const HOLD_DURATION = 1000; // ms to hold at full opacity before fade-out
const IN_DURATION = 600;
const OUT_DURATION = 450;

export default function SplashScreen({ onFinish }) {
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Ring blooms in
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: IN_DURATION,
          useNativeDriver: true,
        }),
      ]),
      // 2. Icon pops in with spring
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 6,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 3. App name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      // 4. Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 5. Hold
      Animated.delay(HOLD_DURATION),
      // 6. Fade the whole screen out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.ring,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      >
        {/* Inner icon circle */}
        <Animated.View
          style={[
            styles.iconCircle,
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          <Ionicons name="barbell" size={48} color={COLORS.primary} />
        </Animated.View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        Track<Text style={styles.appNameAccent}>Fitness</Text>
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Train hard. Track smart.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    zIndex: 999,
  },
  ring: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1.5,
    borderColor: 'rgba(94, 234, 212, 0.35)',
    backgroundColor: 'rgba(94, 234, 212, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    // outer glow via shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 20,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  appNameAccent: {
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: -12,
  },
});
