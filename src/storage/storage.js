import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUTS_KEY = '@trackfitness_workouts';
const CHEAT_DAYS_KEY = '@trackfitness_cheat_days';
const FAVORITES_KEY = '@trackfitness_favorites';
const GOALS_KEY = '@trackfitness_goals';

// ─── Workouts ────────────────────────────────────────────────────────────────

export const getWorkouts = async () => {
  try {
    const json = await AsyncStorage.getItem(WORKOUTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveWorkout = async (workout) => {
  const workouts = await getWorkouts();
  workouts.unshift(workout);
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
};

export const updateWorkout = async (workout) => {
  const workouts = await getWorkouts();
  const idx = workouts.findIndex((w) => w.id === workout.id);
  if (idx >= 0) {
    workouts[idx] = workout;
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  }
};

export const deleteWorkout = async (id) => {
  const workouts = await getWorkouts();
  await AsyncStorage.setItem(
    WORKOUTS_KEY,
    JSON.stringify(workouts.filter((w) => w.id !== id))
  );
};

// ─── Cheat Days / Nutrition ───────────────────────────────────────────────────
// Items can be strings (legacy) or objects: { text: string, tag?: string }

export const getCheatDays = async () => {
  try {
    const json = await AsyncStorage.getItem(CHEAT_DAYS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveCheatDay = async (cheatDay) => {
  const cheatDays = await getCheatDays();
  const idx = cheatDays.findIndex((d) => d.date === cheatDay.date);
  if (idx >= 0) {
    cheatDays[idx] = cheatDay;
  } else {
    cheatDays.unshift(cheatDay);
  }
  await AsyncStorage.setItem(CHEAT_DAYS_KEY, JSON.stringify(cheatDays));
};

export const deleteCheatDay = async (date) => {
  const cheatDays = await getCheatDays();
  await AsyncStorage.setItem(
    CHEAT_DAYS_KEY,
    JSON.stringify(cheatDays.filter((d) => d.date !== date))
  );
};

// ─── Favorite Exercises ───────────────────────────────────────────────────────

export const getFavoriteExercises = async () => {
  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveFavoriteExercises = async (favorites) => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

// ─── Goals ────────────────────────────────────────────────────────────────────
// Goal schema:
// { id, type: 'weekly_frequency'|'monthly_frequency'|'weight_target', title, target, exerciseName?, createdAt }

export const getGoals = async () => {
  try {
    const json = await AsyncStorage.getItem(GOALS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveGoal = async (goal) => {
  const goals = await getGoals();
  const idx = goals.findIndex((g) => g.id === goal.id);
  if (idx >= 0) {
    goals[idx] = goal;
  } else {
    goals.push(goal);
  }
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const deleteGoal = async (id) => {
  const goals = await getGoals();
  await AsyncStorage.setItem(
    GOALS_KEY,
    JSON.stringify(goals.filter((g) => g.id !== id))
  );
};

// ─── Unit Preference ─────────────────────────────────────────────────────────

const UNIT_KEY = '@trackfitness_unit';

export const getUnit = async () => {
  try {
    const val = await AsyncStorage.getItem(UNIT_KEY);
    return val === 'kg' ? 'kg' : 'lbs';
  } catch {
    return 'lbs';
  }
};

export const saveUnit = async (unit) => {
  await AsyncStorage.setItem(UNIT_KEY, unit);
};

export const convertAllWorkoutWeights = async (fromUnit, toUnit) => {
  if (fromUnit === toUnit) return;
  const factor = toUnit === 'kg' ? 1 / 2.20462 : 2.20462;
  const workouts = await getWorkouts();
  const converted = workouts.map((w) => ({
    ...w,
    exercises: w.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({
        ...s,
        weight:
          s.weight > 0
            ? Math.round(parseFloat(s.weight) * factor * 10) / 10
            : s.weight,
      })),
    })),
  }));
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(converted));
};

// ─── Bulk Export / Import ─────────────────────────────────────────────────────

export const exportAllData = async () => {
  const [workouts, cheatDays, goals] = await Promise.all([
    getWorkouts(),
    getCheatDays(),
    getGoals(),
  ]);
  return { workouts, cheatDays, goals };
};

export const importAllData = async ({ workouts, cheatDays, goals }) => {
  await AsyncStorage.multiSet([
    [WORKOUTS_KEY, JSON.stringify(workouts ?? [])],
    [CHEAT_DAYS_KEY, JSON.stringify(cheatDays ?? [])],
    [GOALS_KEY, JSON.stringify(goals ?? [])],
  ]);
};
