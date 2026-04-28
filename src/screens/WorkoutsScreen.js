import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getWorkouts, deleteWorkout } from '../storage/storage';
import { formatDate } from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const exerciseTitle = (exercises) => {
  if (exercises.length === 0) return 'No exercises';
  const names = exercises.map((e) => e.name);
  if (names.length <= 3) return names.join(', ');
  return names.slice(0, 3).join(', ') + ` +${names.length - 3} more`;
};

export default function WorkoutsScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then(setWorkouts);
    }, [])
  );

  const sections = useMemo(() => {
    const grouped = {};
    workouts.forEach((w) => {
      if (!grouped[w.date]) grouped[w.date] = [];
      grouped[w.date].push(w);
    });
    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({ title: date, data: grouped[date] }));
  }, [workouts]);

  const handleToggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === id ? null : id));
  };

  const handleEdit = (item) => {
    navigation.navigate('LogWorkout', { workout: item });
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Workout', 'Remove this workout permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(id);
          setWorkouts((prev) => prev.filter((w) => w.id !== id));
        },
      },
    ]);
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionDot} />
      <Text style={styles.sectionTitle}>{formatDate(section.title)}</Text>
    </View>
  );

  const renderWorkout = ({ item }) => {
    const isExpanded = expanded === item.id;
    const totalSets = item.exercises.reduce((n, ex) => n + ex.sets.length, 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleToggle(item.id)}
        activeOpacity={0.75}
      >
        <View style={styles.accentBar} />

        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.workoutTitle} numberOfLines={2}>
                {exerciseTitle(item.exercises)}
              </Text>
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Ionicons name="layers-outline" size={11} color={COLORS.textMuted} />
                  <Text style={styles.pillText}>
                    {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.pill}>
                  <Ionicons name="repeat-outline" size={11} color={COLORS.textMuted} />
                  <Text style={styles.pillText}>{totalSets} sets</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.editBtn}
              >
                <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              </TouchableOpacity>
              <View style={[styles.chevronWrap, isExpanded && styles.chevronWrapActive]}>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color={isExpanded ? COLORS.primary : COLORS.textSecondary}
                />
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.exerciseList}>
              {item.exercises.map((ex, i) => (
                <View key={i} style={styles.exerciseRow}>
                  <View style={styles.exerciseDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.setsText}>
                      {ex.sets.map((s) => `${s.weight} × ${s.reps}`).join('  ·  ')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkout}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="barbell-outline" size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>No workouts yet</Text>
            <Text style={styles.emptySubText}>Hit the button below to log your first session</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('LogWorkout')}
          activeOpacity={0.85}
        >
          <View style={styles.startBtnIcon}>
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.startBtnText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: LAYOUT.screenPadding, paddingBottom: 110 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  accentBar: {
    width: 4,
    backgroundColor: COLORS.primary,
    opacity: 0.7,
  },
  cardInner: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: { flex: 1, gap: 6 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },

  workoutTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },

  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(248,113,113,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronWrapActive: {
    backgroundColor: COLORS.primaryLight,
  },

  exerciseList: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    opacity: 0.7,
  },
  exerciseName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  setsText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 18 },

  empty: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  emptySubText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: COLORS.background,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  startBtnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
