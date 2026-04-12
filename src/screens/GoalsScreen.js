import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getGoals, saveGoal, deleteGoal, getWorkouts } from '../storage/storage';
import { generateId, getTodayString, getMonthKey, getWeekStart } from '../utils/helpers';
import { COLORS, LAYOUT, SHADOWS } from '../utils/theme';

const GOAL_TYPES = [
  {
    key: 'weekly_frequency',
    label: 'Weekly workouts',
    description: 'Hit a workout count each week',
    icon: 'calendar-outline',
    color: COLORS.primary,
    unit: 'workouts/week',
  },
  {
    key: 'monthly_frequency',
    label: 'Monthly workouts',
    description: 'Hit a workout count each month',
    icon: 'trophy-outline',
    color: COLORS.secondary,
    unit: 'workouts/month',
  },
  {
    key: 'weight_target',
    label: 'Lift a weight',
    description: 'Reach a target weight on an exercise',
    icon: 'barbell-outline',
    color: COLORS.highlight,
    unit: 'kg',
  },
];

const getTypeInfo = (key) => GOAL_TYPES.find((t) => t.key === key) || GOAL_TYPES[0];

function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const done = pct >= 100;
  return (
    <View style={barStyles.track}>
      <View style={[
        barStyles.fill,
        { width: `${pct}%`, backgroundColor: done ? COLORS.success : color },
      ]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: LAYOUT.pillRadius,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: LAYOUT.pillRadius,
  },
});

// Compute current progress for a goal given workout history
function computeProgress(goal, workouts) {
  const today = getTodayString();
  switch (goal.type) {
    case 'weekly_frequency': {
      const weekStart = getWeekStart(today);
      const count = workouts.filter((w) => w.date >= weekStart && w.date <= today).length;
      return { current: count, max: goal.target, label: `${count} / ${goal.target} this week` };
    }
    case 'monthly_frequency': {
      const month = getMonthKey(today);
      const count = workouts.filter((w) => getMonthKey(w.date) === month).length;
      return { current: count, max: goal.target, label: `${count} / ${goal.target} this month` };
    }
    case 'weight_target': {
      if (!goal.exerciseName) return { current: 0, max: goal.target, label: '0 / ' + goal.target + 'kg' };
      let best = 0;
      workouts.forEach((w) => {
        w.exercises.forEach((ex) => {
          if (ex.name === goal.exerciseName) {
            ex.sets.forEach((s) => {
              if ((s.weight || 0) > best) best = s.weight;
            });
          }
        });
      });
      return {
        current: best,
        max: goal.target,
        label: `${best}kg / ${goal.target}kg on ${goal.exerciseName}`,
      };
    }
    default:
      return { current: 0, max: goal.target, label: '' };
  }
}

export default function GoalsScreen({ navigation }) {
  const targetInputRef = useRef(null);
  const exerciseInputRef = useRef(null);
  const [goals, setGoals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('weekly_frequency');
  const [targetValue, setTargetValue] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [step, setStep] = useState(1); // 1 = pick type, 2 = configure

  useFocusEffect(
    useCallback(() => {
      Promise.all([getGoals(), getWorkouts()]).then(([g, w]) => {
        setGoals(g);
        setWorkouts(w);
      });
    }, [])
  );

  const resetModal = () => {
    setStep(1);
    setSelectedType('weekly_frequency');
    setTargetValue('');
    setExerciseName('');
  };

  const handleSaveGoal = async () => {
    const target = parseFloat(targetValue);
    if (!target || target <= 0) {
      Alert.alert('Invalid target', 'Enter a number greater than 0.');
      return;
    }
    if (selectedType === 'weight_target' && !exerciseName.trim()) {
      Alert.alert('Missing exercise', 'Enter an exercise name for this goal.');
      return;
    }

    const typeInfo = getTypeInfo(selectedType);
    const goal = {
      id: generateId(),
      type: selectedType,
      title: selectedType === 'weight_target'
        ? `${exerciseName.trim()} ${target}kg`
        : `${target} ${typeInfo.unit}`,
      target,
      exerciseName: selectedType === 'weight_target' ? exerciseName.trim() : undefined,
      createdAt: getTodayString(),
    };

    await saveGoal(goal);
    setGoals((prev) => [...prev, goal]);
    setShowModal(false);
    resetModal();
  };

  const handleDeleteGoal = (id) => {
    Alert.alert('Delete goal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGoal(id);
          setGoals((prev) => prev.filter((g) => g.id !== id));
        },
      },
    ]);
  };

  const completed = goals.filter((g) => {
    const { current, max } = computeProgress(g, workouts);
    return current >= max;
  }).length;

  useEffect(() => {
    if (!showModal || step !== 2) return;

    const focusTarget = selectedType === 'weight_target' ? exerciseInputRef : targetInputRef;
    const timer = setTimeout(() => {
      focusTarget.current?.focus();
    }, 220);

    return () => clearTimeout(timer);
  }, [showModal, step, selectedType]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Goals</Text>
          <Text style={styles.heroTitle}>Set targets, watch progress.</Text>
          <Text style={styles.heroSubtitle}>
            Define weekly frequency targets, monthly milestones, or weight goals on specific exercises.
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{goals.length}</Text>
              <Text style={styles.heroStatLabel}>Active goals</Text>
            </View>
            <View style={[styles.heroStat, completed > 0 && styles.heroStatDone]}>
              <Text style={[styles.heroStatValue, completed > 0 && { color: COLORS.success }]}>
                {completed}
              </Text>
              <Text style={styles.heroStatLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="flag-outline" size={34} color={COLORS.highlight} />
            </View>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubText}>
              Set your first goal — a weekly workout habit, a monthly target, or a weight to hit on a specific lift.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => setShowModal(true)}
              activeOpacity={0.88}
            >
              <Ionicons name="add-circle-outline" size={18} color={COLORS.background} />
              <Text style={styles.emptyAddBtnText}>Add First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your Goals</Text>
              <Text style={styles.sectionMeta}>{goals.length} active</Text>
            </View>

            {goals.map((goal) => {
              const typeInfo = getTypeInfo(goal.type);
              const { current, max, label } = computeProgress(goal, workouts);
              const done = current >= max;
              const pct = Math.round(Math.min((current / Math.max(max, 1)) * 100, 100));

              return (
                <View key={goal.id} style={[styles.goalCard, done && styles.goalCardDone]}>
                  <View style={styles.goalCardHeader}>
                    <View style={[styles.goalIcon, { backgroundColor: `${typeInfo.color}22` }]}>
                      <Ionicons name={typeInfo.icon} size={18} color={typeInfo.color} />
                    </View>
                    <View style={styles.goalCardTitle}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalSubtitle}>{typeInfo.label}</Text>
                    </View>
                    <View style={styles.goalCardRight}>
                      {done && (
                        <View style={styles.doneBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                          <Text style={styles.doneBadgeText}>Done</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteGoal(goal.id)}
                        style={styles.deleteGoalBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={14} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ProgressBar value={current} max={max} color={typeInfo.color} />

                  <View style={styles.goalProgressRow}>
                    <Text style={styles.goalProgressLabel}>{label}</Text>
                    <Text style={[
                      styles.goalPct,
                      { color: done ? COLORS.success : typeInfo.color },
                    ]}>
                      {pct}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {goals.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={22} color={COLORS.background} />
            <Text style={styles.addBtnText}>Add Goal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add goal modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowModal(false); resetModal(); }}
      >
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => { setShowModal(false); resetModal(); }}
          />
          <View style={styles.modalSheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalGrabber} />
              <Text style={styles.modalTitle}>
                {step === 1 ? 'Choose goal type' : 'Set your target'}
              </Text>

              {step === 1 ? (
                <View style={styles.typeList}>
                  {GOAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeOption,
                        selectedType === type.key && { borderColor: type.color, backgroundColor: `${type.color}14` },
                      ]}
                      onPress={() => setSelectedType(type.key)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.typeOptionIcon, { backgroundColor: `${type.color}22` }]}>
                        <Ionicons name={type.icon} size={20} color={type.color} />
                      </View>
                      <View style={styles.typeOptionCopy}>
                        <Text style={styles.typeOptionLabel}>{type.label}</Text>
                        <Text style={styles.typeOptionDesc}>{type.description}</Text>
                      </View>
                      {selectedType === type.key && (
                        <Ionicons name="checkmark-circle" size={18} color={type.color} />
                      )}
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[styles.modalNextBtn, { backgroundColor: getTypeInfo(selectedType).color }]}
                    onPress={() => setStep(2)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.modalNextBtnText}>Next</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.background} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.configForm}>
                  <Text style={styles.configLabel}>
                    {selectedType === 'weight_target' ? 'Target weight (kg)' : 'Target count'}
                  </Text>
                  <TextInput
                    ref={targetInputRef}
                    style={styles.configInput}
                    placeholder={selectedType === 'weight_target' ? '100' : '3'}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="decimal-pad"
                    value={targetValue}
                    onChangeText={setTargetValue}
                  />

                  {selectedType === 'weight_target' && (
                    <>
                      <Text style={styles.configLabel}>Exercise name</Text>
                      <TextInput
                        ref={exerciseInputRef}
                        style={styles.configInput}
                        placeholder="e.g. Bench Press"
                        placeholderTextColor={COLORS.textMuted}
                        value={exerciseName}
                        onChangeText={setExerciseName}
                      />
                    </>
                  )}

                  <View style={styles.configActions}>
                    <TouchableOpacity
                      style={styles.configBackBtn}
                      onPress={() => setStep(1)}
                    >
                      <Text style={styles.configBackBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.configSaveBtn, { backgroundColor: getTypeInfo(selectedType).color }]}
                      onPress={handleSaveGoal}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.configSaveBtnText}>Save Goal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.screenPadding, paddingBottom: 140 },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    ...SHADOWS.card,
  },
  heroEyebrow: {
    color: COLORS.highlight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  heroStat: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroStatDone: {
    backgroundColor: COLORS.successSoft,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  heroStatValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.cardRadius,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.highlightSoft,
    marginBottom: 16,
  },
  emptyText: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  emptySubText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.highlight,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  emptyAddBtnText: { color: COLORS.background, fontSize: 15, fontWeight: '800' },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionMeta: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.soft,
  },
  goalCardDone: {
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCardTitle: { flex: 1 },
  goalTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  goalSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  goalCardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successSoft,
    borderRadius: LAYOUT.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneBadgeText: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  deleteGoalBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
  },
  goalProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalProgressLabel: { color: COLORS.textSecondary, fontSize: 13 },
  goalPct: { fontSize: 13, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 82,
    paddingHorizontal: LAYOUT.screenPadding,
  },
  addBtn: {
    backgroundColor: COLORS.highlight,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...SHADOWS.card,
  },
  addBtnText: { color: COLORS.background, fontSize: 17, fontWeight: '800' },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: COLORS.borderStrong,
    maxHeight: '82%',
  },
  modalScrollContent: { paddingBottom: 8 },
  modalGrabber: {
    alignSelf: 'center',
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.borderStrong,
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeList: { gap: 10 },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionCopy: { flex: 1 },
  typeOptionLabel: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  typeOptionDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  modalNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 6,
  },
  modalNextBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 15 },
  configForm: { gap: 12 },
  configLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  configInput: {
    backgroundColor: COLORS.backgroundSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  configActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  configBackBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  configBackBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 14 },
  configSaveBtn: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  configSaveBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 14 },
});
