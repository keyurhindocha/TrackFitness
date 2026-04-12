export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const getTodayString = () =>
  new Date().toISOString().split('T')[0];

export const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getMonthKey = (dateString) => dateString.slice(0, 7);

// Returns the current workout streak (consecutive days with a workout ending today or yesterday).
export const getStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return 0;

  const dateSet = new Set(workouts.map((w) => w.date));
  const today = getTodayString();
  const todayMs = new Date(today).getTime();
  const DAY = 86400000;

  // Streak only alive if most recent workout is today or yesterday
  const latestDate = [...dateSet].sort().reverse()[0];
  const latestMs = new Date(latestDate).getTime();
  const gap = Math.round((todayMs - latestMs) / DAY);
  if (gap > 1) return 0;

  // Walk backwards counting consecutive days
  let streak = 0;
  let cursor = latestMs;
  while (dateSet.has(new Date(cursor).toISOString().split('T')[0])) {
    streak++;
    cursor -= DAY;
  }

  return streak;
};

// Returns the week number (Mon-Sun) start date string for a given date.
export const getWeekStart = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dow = d.getDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
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
  let cursor = new Date(getWeekStart(today));
  for (let i = 0; i < weeks; i++) {
    const key = cursor.toISOString().split('T')[0];
    result.unshift({ week: key, count: counts[key] || 0 });
    cursor.setDate(cursor.getDate() - 7);
  }
  return result;
};
