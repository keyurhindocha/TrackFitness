import React, { useState } from 'react';
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
import { saveWorkout } from '../storage/storage';
import { generateId, getTodayString, formatDate } from '../utils/helpers';
import { COLORS } from '../utils/theme';

const QUICK_EXERCISES = [
  'Barbell Row', 'Bench Press', 'Bicep Curls', 'Deadlift',
  'Dips', 'Leg Press', 'Overhead Press', 'Pull-ups',
  'Squat', 'Tricep Pushdown',
];

export default function LogWorkoutScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const today = getTodayString();

  const addExercise = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setExercises((prev) => [
      ...prev,
      { id: generateId(), name: trimmed, sets: [] },
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
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.dateHeading}>{formatDate(today)}</Text>

        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {exercise.sets.length > 0 && (
              <View style={styles.setsTableHeader}>
                <Text style={[styles.colLabel, styles.colSet]}>SET</Text>
                <Text style={[styles.colLabel, styles.colWeight]}>KG</Text>
                <Text style={[styles.colLabel, styles.colReps]}>REPS</Text>
                <View style={styles.colDelete} />
              </View>
            )}

            {exercise.sets.map((set, si) => (
              <View key={si} style={styles.setRow}>
                <Text style={[styles.setNum, styles.colSet]}>{si + 1}</Text>
                <TextInput
                  style={[styles.setInput, styles.colWeight]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  value={set.weight}
                  onChangeText={(v) => updateSet(exercise.id, si, 'weight', v)}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.setInput, styles.colReps]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={set.reps}
                  onChangeText={(v) => updateSet(exercise.id, si, 'reps', v)}
                />
                <TouchableOpacity
                  style={styles.colDelete}
                  onPress={() => removeSet(exercise.id, si)}
                >
                  <Ionicons name="remove-circle-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)}>
              <Text style={styles.addSetText}>+ Add Set</Text>
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
              contentContainerStyle={{ gap: 8 }}
              keyboardShouldPersistTaps="always"
            >
              {QUICK_EXERCISES.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={styles.quickChip}
                  onPress={() => addExercise(name)}
                >
                  <Text style={styles.quickChipText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.inputBtn, styles.inputBtnPrimary]}
                onPress={() => addExercise(newName)}
              >
                <Text style={styles.inputBtnPrimaryText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.inputBtn}
                onPress={() => { setShowInput(false); setNewName(''); }}
              >
                <Text style={styles.inputBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={() => setShowInput(true)}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  dateHeading: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  setsTableHeader: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  colLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  colSet: { width: 36 },
  colWeight: { flex: 1 },
  colReps: { flex: 1 },
  colDelete: { width: 32, alignItems: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  setNum: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  setInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 16,
    marginRight: 8,
  },
  addSetBtn: {
    marginTop: 6,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addSetText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
    gap: 10,
  },
  nameInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  quickList: { marginHorizontal: -4 },
  quickChip: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickChipText: { color: COLORS.textSecondary, fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8 },
  inputBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
  },
  inputBtnPrimary: { backgroundColor: COLORS.primary },
  inputBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  inputBtnPrimaryText: { color: '#fff', fontWeight: '700' },
  addExerciseBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: 16,
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
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
