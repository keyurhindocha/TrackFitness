import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveWorkout, getWorkouts } from '../storage/storage';
import { generateId, getTodayString, formatDate } from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';
import { useUnit } from '../context/UnitContext';

const QUICK_EXERCISES = [
  'Barbell Row', 'Bench Press', 'Bicep Curls', 'Deadlift',
  'Dips', 'Leg Press', 'Overhead Press', 'Pull-ups',
  'Squat', 'Tricep Pushdown',
];

export default function LogWorkoutScreen({ navigation }) {
  const { unit } = useUnit();
  const [exercises, setExercises] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const scrollRef = useRef(null);
  const today = getTodayString();

  const addExercise = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Look up the most recent sets for this exercise to pre-populate
    let previousSets = [];
    try {
      const allWorkouts = await getWorkouts();
      const sorted = [...allWorkouts].sort((a, b) => b.date.localeCompare(a.date));
      for (const workout of sorted) {
        const match = workout.exercises.find(
          (e) => e.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (match && match.sets.length > 0) {
          previousSets = match.sets.map((s) => ({
            weight: s.weight > 0 ? String(s.weight) : '',
            reps: s.reps > 0 ? String(s.reps) : '',
          }));
          break;
        }
      }
    } catch (_) {
      // If lookup fails, just start with empty sets
    }

    setExercises((prev) => [
      ...prev,
      { id: generateId(), name: trimmed, sets: previousSets },
    ]);
    setNewName('');
    setShowInput(false);
  };

  const removeExercise = (id) =>
    setExercises((prev) => prev.filter((ex) => ex.id !== id));

  const addSet = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: '', weight: '' }] }
          : ex
      )
    );
  };

  const removeSet = (exerciseId, setIdx) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) }
          : ex
      )
    );
  };

  const updateSet = (exerciseId, setIdx, field, value) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const sets = [...ex.sets];
        sets[setIdx] = { ...sets[setIdx], [field]: value };
        return { ...ex, sets };
      })
    );
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise before saving.');
      return;
    }
    const workout = {
      id: generateId(),
      date: today,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
        })),
      })),
    };
    await saveWorkout(workout);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Date header */}
        <View style={styles.dateHeader}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.dateHeading}>{formatDate(today)}</Text>
        </View>

        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNameRow}>
                <View style={styles.exerciseAccent} />
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeExercise(exercise.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.removeExBtn}
              >
                <Ionicons name="close" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {exercise.sets.length > 0 && (
              <View style={styles.setsTableHeader}>
                <Text style={[styles.colLabel, styles.colSet]}>SET</Text>
                <Text style={[styles.colLabel, styles.colWeight]}>{unit.toUpperCase()}</Text>
                <Text style={[styles.colLabel, styles.colReps]}>REPS</Text>
                <View style={styles.colDelete} />
              </View>
            )}

            {exercise.sets.map((set, si) => (
              <View key={si} style={styles.setRow}>
                <View style={[styles.setNumWrap, styles.colSet]}>
                  <Text style={styles.setNum}>{si + 1}</Text>
                </View>
                <TextInput
                  style={[styles.setInput, styles.colWeight]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  value={set.weight}
                  onChangeText={(v) => updateSet(exercise.id, si, 'weight', v)}
                  returnKeyType="next"
                  selectTextOnFocus
                />
                <TextInput
                  style={[styles.setInput, styles.colReps]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={set.reps}
                  onChangeText={(v) => updateSet(exercise.id, si, 'reps', v)}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.colDelete, styles.removeSetBtn]}
                  onPress={() => removeSet(exercise.id, si)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="remove-circle-outline" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)} activeOpacity={0.7}>
              <Ionicons name="add" size={15} color={COLORS.primary} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {showInput ? (
          <View style={styles.inputCard}>
            <TextInput
              style={styles.nameInput}
              placeholder="Exercise name..."
              placeholderTextColor={COLORS.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={() => addExercise(newName)}
              returnKeyType="done"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickList}
              contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
              keyboardShouldPersistTaps="always"
            >
              {QUICK_EXERCISES.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.quickChip,
                    newName === name && styles.quickChipActive,
                  ]}
                  onPress={() => addExercise(name)}
                >
                  <Text style={[
                    styles.quickChipText,
                    newName === name && styles.quickChipTextActive,
                  ]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.inputBtn}
                onPress={() => { setShowInput(false); setNewName(''); }}
              >
                <Text style={styles.inputBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.inputBtn, styles.inputBtnPrimary]}
                onPress={() => addExercise(newName)}
              >
                <Text style={styles.inputBtnPrimaryText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={() => setShowInput(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {exercises.length > 0 && (
          <Text style={styles.footerMeta}>
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} · {exercises.reduce((n, ex) => n + ex.sets.length, 0)} sets
          </Text>
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: LAYOUT.screenPadding, paddingBottom: 130 },

  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  dateHeading: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  exerciseAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  exerciseName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  removeExBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  setsTableHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  colLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  colSet: { width: 38 },
  colWeight: { flex: 1, marginRight: 8 },
  colReps: { flex: 1, marginRight: 8 },
  colDelete: { width: 32, alignItems: 'center' },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  setNum: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  setInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeSetBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  addSetBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  addSetText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 12,
    gap: 12,
    ...SHADOWS.soft,
  },
  nameInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickList: { marginHorizontal: -4 },
  quickChip: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  quickChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  quickChipTextActive: { color: COLORS.primary, fontWeight: '700' },

  inputRow: { flexDirection: 'row', gap: 8 },
  inputBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  inputBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
  inputBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  addExerciseBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addExerciseText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },

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
    gap: 8,
  },
  footerMeta: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
