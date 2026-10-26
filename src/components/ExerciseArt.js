import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getExerciseArt } from '../data/exerciseArt';
import { getExercisePhoto } from '../data/exercisePhotos';
import { COLORS } from '../utils/theme';

// Both the photographs and the generated schematics are drawn in the same
// two-panel landscape shape, so one aspect ratio covers either source.
export const ART_ASPECT = 1120 / 660;

/**
 * The start/finish diagram for an exercise. A real illustration dropped into
 * assets/exercises/<slug>.jpg wins; otherwise the generated schematic is used.
 *
 * Returns null when neither exists, so callers can decide what to show instead.
 */
export default function ExerciseArt({ slug, width, style }) {
  const { width: screenWidth } = useWindowDimensions();
  const [failed, setFailed] = useState(false);
  const w = width || screenWidth;
  const h = w / ART_ASPECT;

  const photo = failed ? null : getExercisePhoto(slug);
  if (photo) {
    return (
      <Image
        source={photo}
        style={[{ width: w, height: h }, styles.art, style]}
        resizeMode="contain"
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }

  const xml = getExerciseArt(slug);
  if (!xml) return null;

  return (
    <View style={[{ width: w, height: h }, styles.art, style]}>
      <SvgXml xml={xml} width="100%" height="100%" />
    </View>
  );
}

export function ArtPlaceholder({ width, style }) {
  const { width: screenWidth } = useWindowDimensions();
  const w = width || screenWidth;
  return (
    <View style={[{ width: w, height: w / ART_ASPECT }, styles.art, styles.placeholder, style]}>
      <Ionicons name="image-outline" size={28} color={COLORS.textMuted} />
      <Text style={styles.placeholderText}>No diagram for this one yet</Text>
    </View>
  );
}

export const hasExerciseArt = (slug) => !!(getExercisePhoto(slug) || getExerciseArt(slug));

const styles = StyleSheet.create({
  art: {
    borderRadius: 14,
    backgroundColor: COLORS.backgroundSoft,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  placeholderText: { color: COLORS.textMuted, fontSize: 13 },
});
