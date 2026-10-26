import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExerciseArt, { ArtPlaceholder, ART_ASPECT } from './ExerciseArt';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';

const Section = ({ icon, title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={13} color={COLORS.textSecondary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const Step = ({ index, text }) => (
  <View style={styles.step}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{index}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const Fault = ({ text }) => (
  <View style={styles.fault}>
    <Ionicons name="close-circle" size={15} color={COLORS.danger} style={styles.faultIcon} />
    <Text style={styles.faultText}>{text}</Text>
  </View>
);

const MuscleChip = ({ label, tone }) => (
  <View style={[styles.chip, tone === 'primary' ? styles.chipPrimary : styles.chipSecondary]}>
    <View style={[styles.chipDot, tone === 'primary' ? styles.dotPrimary : styles.dotSecondary]} />
    <Text style={[styles.chipText, tone === 'primary' ? styles.chipTextPrimary : styles.chipTextSecondary]}>
      {label}
    </Text>
  </View>
);

/**
 * The form guide for one exercise: the start/finish diagram, the muscles it
 * trains, how to set up, how to run the rep, and what usually goes wrong.
 */
export default function ExerciseGuideModal({ guide, visible, onClose }) {
  const { width, height } = useWindowDimensions();
  const [zoomed, setZoomed] = useState(false);

  if (!guide) return null;

  // Leave room for the sheet's own padding on either side.
  const sheetWidth = Math.min(width - 24, 560);
  const artWidth = sheetWidth - 28;

  // The diagram is wide; blown up it fills the screen's short edge, which is
  // what makes the cue text under each panel readable on a phone.
  const zoomWidth = Math.max(width, height * 0.96 * ART_ASPECT);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { width: sheetWidth, maxHeight: height * 0.9 }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{guide.name}</Text>
              <Text style={styles.subtitle}>
                {guide.category} · {guide.equipment}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity activeOpacity={0.9} onPress={() => setZoomed(true)}>
              <ExerciseArt slug={guide.slug} width={artWidth} />
              <View style={styles.zoomHint}>
                <Ionicons name="expand-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.zoomHintText}>Tap to enlarge</Text>
              </View>
            </TouchableOpacity>

            <Section icon="body-outline" title="Muscles worked">
              <View style={styles.chipRow}>
                {guide.primary.map((m) => (
                  <MuscleChip key={m} label={m} tone="primary" />
                ))}
                {guide.secondary.map((m) => (
                  <MuscleChip key={m} label={m} tone="secondary" />
                ))}
              </View>
            </Section>

            <Section icon="locate-outline" title="Set up">
              {guide.setup.map((t, i) => (
                <Step key={i} index={i + 1} text={t} />
              ))}
            </Section>

            <Section icon="repeat-outline" title="The rep">
              {guide.execution.map((t, i) => (
                <Step key={i} index={i + 1} text={t} />
              ))}
            </Section>

            <Section icon="warning-outline" title="Common mistakes">
              {guide.mistakes.map((t, i) => (
                <Fault key={i} text={t} />
              ))}
            </Section>

            {!!guide.tip && (
              <View style={styles.tip}>
                <Ionicons name="bulb-outline" size={16} color={COLORS.highlight} />
                <Text style={styles.tipText}>{guide.tip}</Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>

      {/* Full-screen diagram: scroll sideways to read both panels. */}
      <Modal visible={zoomed} transparent animationType="fade" onRequestClose={() => setZoomed(false)}>
        <View style={styles.zoomBackdrop}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zoomContent}
            maximumZoomScale={3}
          >
            <ExerciseArt slug={guide.slug} width={zoomWidth} />
          </ScrollView>
          <TouchableOpacity
            style={styles.zoomClose}
            onPress={() => setZoomed(false)}
            accessibilityRole="button"
            accessibilityLabel="Close diagram"
          >
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: { flex: 1, gap: 3 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  subtitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { flexGrow: 0 },
  bodyContent: { padding: 14, gap: 16 },

  zoomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 7,
  },
  zoomHintText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },

  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  chipPrimary: { backgroundColor: COLORS.dangerSoft, borderColor: 'rgba(248,113,113,0.35)' },
  chipSecondary: { backgroundColor: COLORS.surfaceElevated, borderColor: COLORS.border },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  dotPrimary: { backgroundColor: COLORS.danger },
  dotSecondary: { backgroundColor: COLORS.highlight },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextPrimary: { color: COLORS.danger },
  chipTextSecondary: { color: COLORS.textSecondary },

  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  stepText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 20 },

  fault: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  faultIcon: { marginTop: 2 },
  faultText: { flex: 1, color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },

  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: COLORS.highlightSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    padding: 12,
  },
  tipText: { flex: 1, color: COLORS.highlight, fontSize: 13, lineHeight: 19, fontWeight: '500' },

  zoomBackdrop: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  zoomContent: { alignItems: 'center' },
  zoomClose: {
    position: 'absolute',
    top: 44,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
