import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { findExerciseGuide } from '../data/exerciseGuides';
import ExerciseArt from './ExerciseArt';
import ExerciseGuideModal from './ExerciseGuideModal';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';

/**
 * The diagram shown inline on a screen that is already about one exercise.
 * Tapping it opens the full guide. Renders nothing when there is no guide.
 */
export default function ExerciseGuideCard({ name, width }) {
  const [open, setOpen] = useState(false);
  const guide = findExerciseGuide(name);
  if (!guide) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={14} color={COLORS.primary} />
        <Text style={styles.headerText}>Form guide</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.headerLink}>Details</Text>
        <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
      </View>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setOpen(true)}>
        <ExerciseArt slug={guide.slug} width={width} />
      </TouchableOpacity>
      <ExerciseGuideModal guide={guide} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
    gap: 10,
    ...SHADOWS.soft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  headerLink: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
});
