import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  InputAccessoryView,
  Keyboard,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { saveWorkout, updateWorkout, getWorkouts } from '../storage/storage';
import {
  generateId,
  getTodayString,
  formatDate,
  formatSet,
  describeDaysAgo,
  getExerciseStats,
  isSetPR,
} from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS, CALENDAR_THEME } from '../utils/theme';
import { useUnit } from '../context/UnitContext';
import { showAlert } from '../components/AlertHost';

const KEYBOARD_ACCESSORY_ID = 'workout-inputs';

const BASE_EXERCISES = [
  'Barbell Row', 'Bench Press', 'Bicep Curls', 'Deadlift',
  'Dips', 'Leg Press', 'Overhead Press', 'Pull-ups',
  'Squat', 'Tricep Pushdown',
];

export default function LogWorkoutScreen({ navigation, route }) {
  const { unit } = useUnit();
  const editingWorkout = route.params?.workout ?? null;

  const [exercises, setExercises] = useState(() =>
    editingWorkout
      ? editingWorkout.exercises.map((ex) => ({
          id: generateId(),
          name: ex.name,
          sets: ex.sets.map((s) => ({
            weight: s.weight > 0 ? String(s.weight) : '',
            reps: s.reps > 0 ? String(s.reps) : '',
            carried: false,
          })),
        }))
      : []
  );
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [exerciseSuggestions, setExerciseSuggestions] = useState(BASE_EXERCISES);
  const [history, setHistory] = useState([]);
  const scrollRef = useRef(null);
  const today = getTodayString();
  const [workoutDate, setWorkoutDate] = useState(editingWorkout?.date ?? today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    getWorkouts().then((workouts) => {
      setHistory(workouts);
      const past = workouts.flatMap((w) => w.exercises.map((e) => e.name));
      const merged = Array.from(new Set([...past, ...BASE_EXERCISES]));
      setExerciseSuggestions(merged);
    });
  }, []);

  // Weight to add for a one-tap overload, sized to the plates you actually have.
  const INCREMENTS = unit === 'kg' ? [1, 2.5] : [2.5, 5];

  const statsFor = (name) => getExerciseStats(history, name, editingWorkout?.id);

  const setsFromLast = (name, delta) => {
    const { lastSession } = statsFor(name);
    if (!lastSession) return null;
    return lastSession.sets.map((s) => {
      const weight = Math.round(((Number(s.weight) || 0) + delta) * 100) / 100;
      return {
        weight: weight > 0 ? String(weight) : '',
        reps: String(Number(s.reps) || 0),
        carried: false,
      };
    });
  };

  const applyFromLast = (exerciseId, name, delta) => {
    const sets = setsFromLast(name, delta);
    if (!sets) return;
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets } : ex))
    );
  };

  const addExercise = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Carry last session's numbers in as a starting point. They are marked
    // `carried` so they render muted until you confirm or change them —
    // otherwise last week's weights look exactly like today's effort.
    let previousSets = [];
    try {
      const workouts = history.length ? history : await getWorkouts();
      const { lastSession } = getExerciseStats(workouts, trimmed, editingWorkout?.id);
      if (lastSession) {
        previousSets = lastSession.sets.map((s) => ({
          weight: s.weight > 0 ? String(s.weight) : '',
          reps: s.reps > 0 ? String(s.reps) : '',
          carried: true,
        }));
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
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const last = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { weight: '', reps: '' };
        return { ...ex, sets: [...ex.sets, { weight: last.weight, reps: last.reps, carried: false }] };
      })
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
        sets[setIdx] = { ...sets[setIdx], [field]: value, carried: false };
        return { ...ex, sets };
      })
    );
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      showAlert('No exercises', 'Add at least one exercise before saving.');
      return;
    }
    const workout = {
      id: editingWorkout?.id ?? generateId(),
      date: workoutDate,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.map((s) => ({
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
        })),
      })),
    };
    if (editingWorkout) {
      await updateWorkout(workout);
    } else {
      await saveWorkout(workout);
    }
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
        {/* Date header — tap to change the day this workout is filed under */}
        <TouchableOpacity
          style={styles.dateHeader}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Workout date: ${formatDate(workoutDate)}. Tap to change.`}
        >
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.dateHeading}>{formatDate(workoutDate)}</Text>
          {workoutDate !== today && (
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>
                {workoutDate > today ? 'Future' : 'Past'}
              </Text>
            </View>
          )}
          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>

        {exercises.map((exercise) => {
          const stats = statsFor(exercise.name);
          const hasPR = exercise.sets.some((s) => isSetPR(s, stats));
          return (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNameRow}>
                <View style={styles.exerciseAccent} />
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {hasPR && (
                  <View style={styles.prChip}>
                    <Ionicons name="trophy" size={10} color={COLORS.highlight} />
                    <Text style={styles.prChipText}>PR</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeExercise(exercise.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.removeExBtn}
              >
                <Ionicons name="close" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {stats.lastSession && (
              <View style={styles.lastPanel}>
                <View style={styles.lastHeaderRow}>
                  <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.lastHeaderText}>
                    Last time · {formatDate(stats.lastSession.date)} ({describeDaysAgo(stats.lastSession.date)})
                  </Text>
                </View>
                <Text style={styles.lastSetsText}>
                  {stats.lastSession.sets.map((s) => formatSet(s, unit)).join('  ·  ')}
                </Text>
                <Text style={styles.lastBestText}>
                  Best: {stats.bestWeight > 0 ? `${stats.bestWeight} ${unit} × ` : ''}
                  {stats.bestRepsAtBestWeight} reps
                </Text>

                <View style={styles.overloadRow}>
                  <TouchableOpacity
                    style={styles.overloadChip}
                    onPress={() => applyFromLast(exercise.id, exercise.name, 0)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.overloadChipText}>Repeat</Text>
                  </TouchableOpacity>
                  {INCREMENTS.map((inc) => (
                    <TouchableOpacity
                      key={inc}
                      style={[styles.overloadChip, styles.overloadChipStrong]}
                      onPress={() => applyFromLast(exercise.id, exercise.name, inc)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.overloadChipText, styles.overloadChipTextStrong]}>
                        +{inc} {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {exercise.sets.length > 0 && (
              <View style={styles.setsTableHeader}>
                <Text style={[styles.colLabel, styles.colSet]}>SET</Text>
                <Text style={[styles.colLabel, styles.colWeight]}>{unit.toUpperCase()}</Text>
                <Text style={[styles.colLabel, styles.colReps]}>REPS</Text>
                <View style={styles.colDelete} />
              </View>
            )}

            {exercise.sets.map((set, si) => {
              const pr = isSetPR(set, stats);
              const inputStyle = [
                styles.setInput,
                set.carried && styles.setInputCarried,
                pr && styles.setInputPR,
              ];
              return (
              <View key={si} style={styles.setRow}>
                <View style={[styles.setNumWrap, styles.colSet, pr && styles.setNumWrapPR]}>
                  <Text style={[styles.setNum, pr && styles.setNumPR]}>{si + 1}</Text>
                </View>
                <TextInput
                  style={[...inputStyle, styles.colWeight]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="decimal-pad"
                  value={set.weight}
                  onChangeText={(v) => updateSet(exercise.id, si, 'weight', v)}
                  returnKeyType="next"
                  selectTextOnFocus
                  inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
                />
                <TextInput
                  style={[...inputStyle, styles.colReps]}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={set.reps}
                  onChangeText={(v) => updateSet(exercise.id, si, 'reps', v)}
                  selectTextOnFocus
                  inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
                />
                <TouchableOpacity
                  style={[styles.colDelete, styles.removeSetBtn]}
                  onPress={() => removeSet(exercise.id, si)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="remove-circle-outline" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              );
            })}

            <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)} activeOpacity={0.7}>
              <Ionicons name="add" size={15} color={COLORS.primary} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
          );
        })}

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
              {exerciseSuggestions
                .filter((n) =>
                  !newName.trim() || n.toLowerCase().includes(newName.toLowerCase().trim())
                )
                .map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.quickChip,
                      newName.trim().toLowerCase() === name.toLowerCase() && styles.quickChipActive,
                    ]}
                    onPress={() => addExercise(name)}
                  >
                    <Text style={[
                      styles.quickChipText,
                      newName.trim().toLowerCase() === name.toLowerCase() && styles.quickChipTextActive,
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

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.pickerBackdrop} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.pickerCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>Workout date</Text>
            <Calendar
              current={workoutDate}
              onDayPress={(day) => {
                setWorkoutDate(day.dateString);
                setShowDatePicker(false);
              }}
              markedDates={{
                [workoutDate]: { selected: true, selectedColor: COLORS.primary },
              }}
              theme={CALENDAR_THEME}
            />
            <View style={styles.pickerActions}>
              <TouchableOpacity
                onPress={() => {
                  setWorkoutDate(today);
                  setShowDatePicker(false);
                }}
                style={styles.pickerTodayBtn}
              >
                <Text style={styles.pickerTodayText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.pickerCancelBtn}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
          <View style={styles.keyboardBar}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.keyboardDoneBtn}>
              <Text style={styles.keyboardDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: LAYOUT.screenPadding, paddingBottom: 16 },

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
  datePill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  datePillText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  pickerBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    ...SHADOWS.card,
  },
  pickerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  pickerTodayBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: LAYOUT.pillRadius,
    backgroundColor: COLORS.primary,
  },
  pickerTodayText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  pickerCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: LAYOUT.pillRadius,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerCancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
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

  prChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.highlightSoft,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  prChipText: {
    color: COLORS.highlight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  lastPanel: {
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 14,
  },
  lastHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lastHeaderText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  lastSetsText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  lastBestText: {
    color: COLORS.highlight,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  overloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  overloadChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: LAYOUT.pillRadius,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  overloadChipStrong: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  overloadChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  overloadChipTextStrong: {
    color: COLORS.primary,
  },

  setInputCarried: {
    color: COLORS.textMuted,
    borderStyle: 'dashed',
  },
  setInputPR: {
    borderColor: COLORS.highlight,
    backgroundColor: COLORS.highlightSoft,
    color: COLORS.text,
    borderStyle: 'solid',
  },
  setNumWrapPR: {
    backgroundColor: COLORS.highlightSoft,
  },
  setNumPR: {
    color: COLORS.highlight,
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
  // `minWidth: 0` lets these shrink below the input's intrinsic content width.
  // On the web an <input> is a flex item with `min-width: auto`, so without this
  // the weight and reps fields refuse to shrink and REPS is pushed off-screen.
  // React Native already defaults minWidth to 0, so native layout is unchanged.
  // textAlign centres the column headings over the values, which are centred.
  colWeight: { flex: 1, minWidth: 0, marginRight: 8, textAlign: 'center' },
  colReps: { flex: 1, minWidth: 0, marginRight: 8, textAlign: 'center' },
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

  keyboardBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  keyboardDoneBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  keyboardDoneText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
