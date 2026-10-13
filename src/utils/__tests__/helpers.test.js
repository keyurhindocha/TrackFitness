import {
  generateId,
  toDateString,
  parseDateString,
  getTodayString,
  formatDate,
  formatDateShort,
  getMonthKey,
  getStreak,
  getWeekStart,
  getWeeklyVolume,
  formatSet,
  daysAgo,
  describeDaysAgo,
  getExerciseStats,
  isSetPR,
  getCleanStreaks,
} from '../helpers';

// Thursday, local noon.
const NOW = new Date(2026, 8, 10, 12, 0, 0);

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

const workout = (id, date, exercises) => ({ id, date, exercises });
const ex = (name, sets) => ({
  name,
  sets: sets.map(([weight, reps]) => ({ weight, reps })),
});

describe('timezone', () => {
  it('runs in a western timezone so the UTC rollover bug is reproducible', () => {
    expect(new Date(2026, 8, 7, 22, 56).toISOString().slice(0, 10)).toBe('2026-09-08');
  });
});

describe('generateId', () => {
  it('returns distinct non-empty strings', () => {
    const ids = new Set(Array.from({ length: 200 }, generateId));
    expect(ids.size).toBe(200);
    ids.forEach((id) => expect(typeof id).toBe('string'));
  });
});

describe('date strings', () => {
  it('formats a late-evening local time under the local day, not the UTC day', () => {
    expect(toDateString(new Date(2026, 8, 7, 22, 56))).toBe('2026-09-07');
  });

  it('zero-pads month and day', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('parses as local midnight, not UTC midnight', () => {
    const d = parseDateString('2026-09-07');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 8, 7, 0]);
  });

  it('round-trips through parse and format', () => {
    ['2026-01-01', '2026-03-08', '2026-11-01', '2026-12-31'].forEach((s) => {
      expect(toDateString(parseDateString(s))).toBe(s);
    });
  });

  it('returns today in local time', () => {
    expect(getTodayString()).toBe('2026-09-10');
    jest.setSystemTime(new Date(2026, 8, 10, 23, 59));
    expect(getTodayString()).toBe('2026-09-10');
  });

  it('formats for display without shifting the day', () => {
    expect(formatDate('2026-09-07')).toBe('Mon, Sep 7');
    expect(formatDateShort('2026-09-07')).toBe('Sep 7');
  });

  it('extracts the month key', () => {
    expect(getMonthKey('2026-09-07')).toBe('2026-09');
  });
});

describe('getStreak', () => {
  it('is 0 with no workouts', () => {
    expect(getStreak([])).toBe(0);
    expect(getStreak(null)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const ws = ['2026-09-10', '2026-09-09', '2026-09-08'].map((d, i) => workout(i, d, []));
    expect(getStreak(ws)).toBe(3);
  });

  it('stays alive when the latest workout was yesterday', () => {
    const ws = ['2026-09-09', '2026-09-08'].map((d, i) => workout(i, d, []));
    expect(getStreak(ws)).toBe(2);
  });

  it('is 0 once the latest workout is two days old', () => {
    expect(getStreak([workout(1, '2026-09-08', [])])).toBe(0);
  });

  it('stops at the first gap', () => {
    const ws = ['2026-09-10', '2026-09-09', '2026-09-07'].map((d, i) => workout(i, d, []));
    expect(getStreak(ws)).toBe(2);
  });

  it('counts two workouts on one day once', () => {
    const ws = [workout(1, '2026-09-10', []), workout(2, '2026-09-10', [])];
    expect(getStreak(ws)).toBe(1);
  });

  it('does not drift over the November daylight-saving change', () => {
    jest.setSystemTime(new Date(2026, 10, 3, 12));
    const ws = ['2026-11-03', '2026-11-02', '2026-11-01', '2026-10-31', '2026-10-30'].map(
      (d, i) => workout(i, d, [])
    );
    expect(getStreak(ws)).toBe(5);
  });

  it('does not drift over the March daylight-saving change', () => {
    jest.setSystemTime(new Date(2026, 2, 9, 12));
    const ws = ['2026-03-09', '2026-03-08', '2026-03-07', '2026-03-06'].map((d, i) =>
      workout(i, d, [])
    );
    expect(getStreak(ws)).toBe(4);
  });
});

describe('getWeekStart', () => {
  it('maps any weekday to its Monday', () => {
    expect(getWeekStart('2026-09-07')).toBe('2026-09-07'); // Mon
    expect(getWeekStart('2026-09-09')).toBe('2026-09-07'); // Wed
  });

  it('treats Sunday as the end of the week', () => {
    expect(getWeekStart('2026-09-13')).toBe('2026-09-07');
  });

  it('crosses month and year boundaries', () => {
    expect(getWeekStart('2026-01-01')).toBe('2025-12-29');
  });
});

describe('getWeeklyVolume', () => {
  it('returns N weeks oldest first, ending with the current week', () => {
    const result = getWeeklyVolume([], 4);
    expect(result.map((r) => r.week)).toEqual([
      '2026-08-17',
      '2026-08-24',
      '2026-08-31',
      '2026-09-07',
    ]);
    expect(result.every((r) => r.count === 0)).toBe(true);
  });

  it('counts workouts into their week and ignores ones outside the window', () => {
    const ws = [
      workout(1, '2026-09-07', []),
      workout(2, '2026-09-10', []),
      workout(3, '2026-08-31', []),
      workout(4, '2025-01-01', []),
    ];
    const result = getWeeklyVolume(ws, 3);
    expect(result.map((r) => r.count)).toEqual([0, 1, 2]);
  });

  it('defaults to eight weeks', () => {
    expect(getWeeklyVolume([])).toHaveLength(8);
  });
});

describe('formatSet', () => {
  it('uses non-breaking spaces so a set never wraps mid-phrase', () => {
    const text = formatSet({ weight: 27.5, reps: 7 }, 'lbs');
    expect(text).toBe('27.5 lbs × 7 reps');
    expect(text).not.toMatch(/ /);
  });
});

describe('daysAgo / describeDaysAgo', () => {
  it('counts whole local days', () => {
    expect(daysAgo('2026-09-10')).toBe(0);
    expect(daysAgo('2026-09-09')).toBe(1);
    expect(daysAgo('2026-09-03')).toBe(7);
    expect(daysAgo('2026-09-11')).toBe(-1);
  });

  it('is exact across a daylight-saving change', () => {
    jest.setSystemTime(new Date(2026, 10, 2, 12));
    expect(daysAgo('2026-11-01')).toBe(1);
    expect(daysAgo('2026-10-31')).toBe(2);
    jest.setSystemTime(new Date(2026, 2, 9, 12));
    expect(daysAgo('2026-03-08')).toBe(1);
  });

  it('describes recent and distant dates', () => {
    expect(describeDaysAgo('2026-09-10')).toBe('today');
    expect(describeDaysAgo('2026-09-11')).toBe('today');
    expect(describeDaysAgo('2026-09-09')).toBe('yesterday');
    expect(describeDaysAgo('2026-09-05')).toBe('5 days ago');
    expect(describeDaysAgo('2026-08-27')).toBe('2 weeks ago');
    expect(describeDaysAgo('2026-06-10')).toBe('3 months ago');
  });
});

describe('getExerciseStats', () => {
  const history = [
    workout('a', '2026-09-01', [ex('Bench Press', [[135, 8], [155, 5]])]),
    workout('b', '2026-09-08', [ex('Bench Press', [[145, 8], [155, 6]]), ex('Squat', [[225, 5]])]),
    workout('c', '2026-08-20', [ex('bench press', [[165, 3]])]),
  ];

  it('is empty for an unknown exercise or blank name', () => {
    expect(getExerciseStats(history, 'Deadlift').hasHistory).toBe(false);
    expect(getExerciseStats(history, '   ')).toEqual({
      hasHistory: false,
      lastSession: null,
      bestWeight: 0,
      bestRepsAtBestWeight: 0,
    });
  });

  it('finds the most recent session regardless of storage order', () => {
    const stats = getExerciseStats(history, 'Bench Press');
    expect(stats.lastSession.date).toBe('2026-09-08');
    expect(stats.lastSession.sets).toEqual([
      { weight: 145, reps: 8 },
      { weight: 155, reps: 6 },
    ]);
  });

  it('matches names case-insensitively and ignores surrounding whitespace', () => {
    const stats = getExerciseStats(history, '  BENCH press ');
    expect(stats.hasHistory).toBe(true);
    expect(stats.bestWeight).toBe(165);
  });

  it('tracks the best weight and the most reps at that weight', () => {
    const stats = getExerciseStats(history.slice(0, 2), 'Bench Press');
    expect(stats.bestWeight).toBe(155);
    expect(stats.bestRepsAtBestWeight).toBe(6);
  });

  it('can exclude the workout being edited', () => {
    const stats = getExerciseStats(history, 'Bench Press', 'b');
    expect(stats.lastSession.date).toBe('2026-09-01');
    expect(stats.bestRepsAtBestWeight).toBe(3);
  });

  it('ignores sets with no reps and sessions made only of them', () => {
    const ws = [
      workout('x', '2026-09-09', [ex('Curl', [[50, 0], ['', '']])]),
      workout('y', '2026-09-02', [ex('Curl', [[40, 10]])]),
    ];
    const stats = getExerciseStats(ws, 'Curl');
    expect(stats.lastSession.date).toBe('2026-09-02');
    expect(stats.bestWeight).toBe(40);
  });

  it('keeps bodyweight work comparable by reps', () => {
    const ws = [workout('p', '2026-09-08', [ex('Pull Up', [[0, 8], [0, 10], [0, 6]])])];
    const stats = getExerciseStats(ws, 'Pull Up');
    expect(stats.hasHistory).toBe(true);
    expect(stats.bestWeight).toBe(0);
    expect(stats.bestRepsAtBestWeight).toBe(10);
  });

  it('accepts string weights and reps from text inputs', () => {
    const ws = [workout('s', '2026-09-08', [ex('Row', [['100', '8']])])];
    expect(getExerciseStats(ws, 'Row').bestWeight).toBe(100);
  });

  it('does not mutate the workouts array', () => {
    const ws = history.slice();
    getExerciseStats(ws, 'Bench Press');
    expect(ws.map((w) => w.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('isSetPR', () => {
  const stats = { hasHistory: true, bestWeight: 155, bestRepsAtBestWeight: 6 };

  it('flags a heavier set', () => {
    expect(isSetPR({ weight: '160', reps: '1' }, stats)).toBe(true);
  });

  it('flags the best weight for more reps', () => {
    expect(isSetPR({ weight: 155, reps: 7 }, stats)).toBe(true);
  });

  it('does not flag a tie', () => {
    expect(isSetPR({ weight: 155, reps: 6 }, stats)).toBe(false);
  });

  it('does not flag lighter weight, however many reps', () => {
    expect(isSetPR({ weight: 100, reps: 30 }, stats)).toBe(false);
  });

  it('never flags a set with no reps', () => {
    expect(isSetPR({ weight: 500, reps: '' }, stats)).toBe(false);
    expect(isSetPR({ weight: 500, reps: 0 }, stats)).toBe(false);
  });

  it('never flags the first ever session', () => {
    expect(isSetPR({ weight: 500, reps: 5 }, { hasHistory: false })).toBe(false);
    expect(isSetPR({ weight: 500, reps: 5 }, null)).toBe(false);
  });

  it('flags more bodyweight reps', () => {
    const bw = { hasHistory: true, bestWeight: 0, bestRepsAtBestWeight: 10 };
    expect(isSetPR({ weight: '', reps: 11 }, bw)).toBe(true);
    expect(isSetPR({ weight: 0, reps: 10 }, bw)).toBe(false);
  });
});

describe('getCleanStreaks', () => {
  it('is null/null when nothing has been logged', () => {
    expect(getCleanStreaks([])).toEqual({ current: null, best: null });
  });

  it('is 0 on a day with a cheat', () => {
    expect(getCleanStreaks(['2026-09-10'])).toEqual({ current: 0, best: 0 });
  });

  it('counts clean days since the last cheat', () => {
    expect(getCleanStreaks(['2026-09-05'])).toEqual({ current: 5, best: 5 });
  });

  it('finds the longest gap between cheats', () => {
    const result = getCleanStreaks(['2026-08-01', '2026-08-10', '2026-09-08']);
    expect(result).toEqual({ current: 2, best: 28 });
  });

  it('keeps the current run as best when it is the longest', () => {
    const result = getCleanStreaks(['2026-09-01', '2026-09-03']);
    expect(result).toEqual({ current: 7, best: 7 });
  });

  it('treats back-to-back cheat days as a zero gap', () => {
    expect(getCleanStreaks(['2026-09-08', '2026-09-09', '2026-09-10']).best).toBe(0);
  });

  it('ignores duplicate and unordered dates', () => {
    const result = getCleanStreaks(['2026-09-08', '2026-08-01', '2026-09-08', '2026-08-10']);
    expect(result).toEqual({ current: 2, best: 28 });
  });

  it('never reports a negative streak for a future date', () => {
    expect(getCleanStreaks(['2026-09-15']).current).toBe(0);
  });
});
