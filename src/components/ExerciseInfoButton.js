import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { findExerciseGuide } from '../data/exerciseGuides';
import ExerciseGuideModal from './ExerciseGuideModal';
import { COLORS } from '../utils/theme';

/**
 * The (i) next to an exercise name. Renders nothing for an exercise the app
 * has no guide for, so a custom name never shows a button that opens empty.
 *
 * @param {string} name  exercise name as it was logged
 * @param {number} [size]
 */
export default function ExerciseInfoButton({ name, size = 18, style }) {
  const [open, setOpen] = useState(false);
  const guide = findExerciseGuide(name);
  if (!guide) return null;

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[styles.btn, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`How to do ${guide.name}`}
      >
        <Ionicons name="information-circle-outline" size={size} color={COLORS.primary} />
      </TouchableOpacity>
      <ExerciseGuideModal guide={guide} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
});
