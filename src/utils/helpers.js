export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const pad = (n) => String(n).padStart(2, '0');

// Formats a Date as YYYY-MM-DD in the device's own timezone.
// toISOString() converts to UTC first, which rolls the date forward for
// anyone west of UTC in the evening: 22:56 on Sep 7 in New York is already
// Sep 8 in UTC, so a workout logged at night was filed under tomorrow.
export const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Parses YYYY-MM-DD as local midnight. `new Date('2026-09-07')` parses it as
// UTC midnight, which is the previous day for western timezones.
export const parseDateString = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getTodayString = () => toDateString(new Date());

export const formatDate = (dateString) => {
  const date = parseDateString(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString) =>
  parseDateString(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

export const getMonthKey = (dateString) => dateString.slice(0, 7);

// Returns the current workout streak (consecutive days with a workout ending today or yesterday).
export const getStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return 0;

  const dateSet = new Set(workouts.map((w) => w.date));
  const today = getTodayString();
  const latestDate = [...dateSet].sort().reverse()[0];

  // Streak only alive if most recent workout is today or yesterday
  const yesterday = parseDateString(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (latestDate !== today && latestDate !== toDateString(yesterday)) return 0;

  // Walk backwards counting consecutive days, stepping by calendar day rather
  // than by a fixed 24 hours so the cursor cannot drift over a clock change.
  let streak = 0;
  const cursor = parseDateString(latestDate);
  while (dateSet.has(toDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

// Returns the week number (Mon-Sun) start date string for a given date.
export const getWeekStart = (dateString) => {
  const d = parseDateString(dateString);
  const dow = d.getDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
  d.setDate(d.getDate() + diff);
  return toDateString(d);
};

// Returns workouts per week for the last N weeks (array of { week, count }).
export const getWeeklyVolume = (workouts, weeks = 8) => {
  const counts = {};
  workouts.forEach((w) => {
    const week = getWeekStart(w.date);
    counts[week] = (counts[week] || 0) + 1;
  });
  const today = getTodayString();
  const result = [];
  const cursor = parseDateString(getWeekStart(today));
  for (let i = 0; i < weeks; i++) {
    const key = toDateString(cursor);
    result.unshift({ week: key, count: counts[key] || 0 });
    cursor.setDate(cursor.getDate() - 7);
  }
  return result;
};

// Renders one set as "27.5 lbs × 7 reps".
// Non-breaking spaces keep a set together, so a list of sets only ever wraps
// between sets, never mid-phrase ("27.5 lbs × 7" / "reps").
export const formatSet = (set, unit) =>
  `${set.weight}\u00a0${unit}\u00a0\u00d7\u00a0${set.reps}\u00a0reps`;

// Whole-day difference between a date string and today, in local time.
export const daysAgo = (dateString) => {
  const then = parseDateString(dateString).getTime();
  const now = parseDateString(getTodayString()).getTime();
  return Math.round((now - then) / 86400000);
};

export const describeDaysAgo = (dateString) => {
  const days = daysAgo(dateString);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
};

// What this exercise looked like last time, and the bar to beat.
// `excludeWorkoutId` drops the session being edited, so editing a workout
// does not measure it against itself.
export const getExerciseStats = (workouts, exerciseName, excludeWorkoutId = null) => {
  const key = exerciseName.trim().toLowerCase();
  const empty = {
    hasHistory: false,
    lastSession: null,
    bestWeight: 0,
    bestRepsAtBestWeight: 0,
  };
  if (!key) return empty;

  const sorted = workouts
    .filter((w) => w.id !== excludeWorkoutId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  let lastSession = null;
  let bestWeight = 0;
  let bestRepsAtBestWeight = 0;
  let seen = false;

  sorted.forEach((workout) => {
    workout.exercises.forEach((ex) => {
      if (ex.name.trim().toLowerCase() !== key) return;
      const sets = ex.sets.filter((s) => (Number(s.reps) || 0) > 0);
      if (sets.length === 0) return;

      seen = true;
      if (!lastSession) lastSession = { date: workout.date, sets };

      sets.forEach((s) => {
        const weight = Number(s.weight) || 0;
        const reps = Number(s.reps) || 0;
        // Bodyweight work stays comparable: weight is 0 on both sides, so the
        // rep count is what moves.
        if (weight > bestWeight) {
          bestWeight = weight;
          bestRepsAtBestWeight = reps;
        } else if (weight === bestWeight && reps > bestRepsAtBestWeight) {
          bestRepsAtBestWeight = reps;
        }
      });
    });
  });

  return { hasHistory: seen, lastSession, bestWeight, bestRepsAtBestWeight };
};

// A set beats the record if it is heavier than anything logged before, or
// matches the best weight for more reps. Never flags the first ever session,
// where there is nothing to beat.
export const isSetPR = (set, stats) => {
  if (!stats || !stats.hasHistory) return false;
  const weight = parseFloat(set.weight) || 0;
  const reps = parseInt(set.reps, 10) || 0;
  if (reps <= 0) return false;
  if (weight > stats.bestWeight) return true;
  return weight === stats.bestWeight && reps > stats.bestRepsAtBestWeight;
};

// Clean-day streaks from a list of dates that had a cheat logged.
// `current` counts the clean days since the most recent cheat, treating today
// as clean until something is logged; `best` is the longest clean run between
// any two cheats, or the current run if that is longer. Null when nothing has
// ever been logged, since there is no history to measure a streak against.
export const getCleanStreaks = (cheatDates) => {
  const dates = [...new Set(cheatDates)].sort();
  if (dates.length === 0) return { current: null, best: null };

  const current = Math.max(0, daysAgo(dates[dates.length - 1]));

  let best = current;
  for (let i = 1; i < dates.length; i++) {
    const gap = daysAgo(dates[i - 1]) - daysAgo(dates[i]) - 1;
    if (gap > best) best = gap;
  }
  return { current, best };
};
