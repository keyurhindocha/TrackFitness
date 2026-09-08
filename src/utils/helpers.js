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
