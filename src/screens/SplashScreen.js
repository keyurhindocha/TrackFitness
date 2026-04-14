import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Timing ────────────────────────────────────────────────────────────────
const RING_IN    = 700;   // rings bloom in
const ICON_IN    = 320;   // icon pop
const TEXT_IN    = 380;   // name slides up
const TAG_IN     = 280;   // tagline fades
const HOLD       = 900;   // pause at full opacity
const FADE_OUT   = 480;   // final screen fade

// ─── Ring config ───────────────────────────────────────────────────────────
const RINGS = [
  { size: 112, borderWidth: 2,   borderOpacity: 0.55, fillOpacity: 0.10, delay: 0   },
  { size: 172, borderWidth: 1.5, borderOpacity: 0.25, fillOpacity: 0.04, delay: 70  },
  { size: 234, borderWidth: 1,   borderOpacity: 0.12, fillOpacity: 0.02, delay: 140 },
];

function ring(opacity, size, borderWidth, borderOpacity, fillOpacity) {
  const r = size / 2;
  const borderColor = `rgba(255, 107, 53, ${borderOpacity})`;
  const backgroundColor = `rgba(255, 107, 53, ${fillOpacity})`;
  return {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: r,
    borderWidth,
    borderColor,
    backgroundColor,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: borderOpacity * 1.4,
    shadowRadius: size * 0.18,
    elevation: 0,
  };
}

export default function SplashScreen({ onFinish }) {
  // Per-ring animated values
  const ringScales   = RINGS.map(() => useRef(new Animated.Value(0.5)).current);
  const ringOpacities = RINGS.map(() => useRef(new Animated.Value(0)).current);

  const iconScale   = useRef(new Animated.Value(0.25)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  const nameTranslate = useRef(new Animated.Value(22)).current;
  const nameOpacity   = useRef(new Animated.Value(0)).current;

  const tagOpacity  = useRef(new Animated.Value(0)).current;

  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Build staggered ring animations
    const ringAnims = RINGS.map((cfg, i) =>
      Animated.sequence([
        Animated.delay(cfg.delay),
        Animated.parallel([
          Animated.spring(ringScales[i], {
            toValue: 1,
            useNativeDriver: true,
            tension: 38 - i * 4,
            friction: 9 + i,
          }),
          Animated.timing(ringOpacities[i], {
            toValue: 1,
            duration: RING_IN,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    Animated.sequence([
      // Phase 1: Rings + icon bloom in simultaneously
      Animated.parallel([
        ...ringAnims,
        Animated.sequence([
          Animated.delay(180),
          Animated.parallel([
            Animated.spring(iconScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 90,
              friction: 5,
            }),
            Animated.timing(iconOpacity, {
              toValue: 1,
              duration: ICON_IN,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // Phase 2: Name slides up
      Animated.parallel([
        Animated.timing(nameTranslate, {
          toValue: 0,
          duration: TEXT_IN,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: TEXT_IN,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Phase 3: Tagline fades in
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: TAG_IN,
        useNativeDriver: true,
      }),

      // Phase 4: Hold
      Animated.delay(HOLD),

      // Phase 5: Fade everything out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      {/* ── Concentric rings ── */}
      <View style={styles.ringStack}>
        {RINGS.map((cfg, i) => (
          <Animated.View
            key={i}
            style={[
              ring(
                ringOpacities[i],
                cfg.size,
                cfg.borderWidth,
                cfg.borderOpacity,
                cfg.fillOpacity
              ),
              {
                opacity: ringOpacities[i],
                transform: [{ scale: ringScales[i] }],
              },
            ]}
          />
        ))}

        {/* ── Icon circle ── */}
        <Animated.View
          style={[
            styles.iconCircle,
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          <Ionicons name="barbell" size={46} color={COLORS.primary} />
        </Animated.View>
      </View>

      {/* ── Text block ── */}
      <Animated.View
        style={[
          styles.textBlock,
          { opacity: nameOpacity, transform: [{ translateY: nameTranslate }] },
        ]}
      >
        <Text style={styles.appName}>
          Track<Text style={styles.appNameAccent}>Fitness</Text>
        </Text>
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Every rep. Every pound.
        </Animated.Text>
      </Animated.View>

      {/* ── Bottom brand line ── */}
      <Animated.Text style={[styles.bottomLabel, { opacity: tagOpacity }]}>
        Built for lifters who track
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  // Rings share the same anchor point
  ringStack: {
    width: RINGS[RINGS.length - 1].size,
    height: RINGS[RINGS.length - 1].size,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    // orange glow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 10,
  },

  textBlock: {
    alignItems: 'center',
    marginTop: 36,
    gap: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  appNameAccent: {
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },

  bottomLabel: {
    position: 'absolute',
    bottom: 52,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
