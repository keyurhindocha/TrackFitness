import { getProgressSummaries, getWeightTrend, filterByExerciseName } from '../helpers';

const ex = (name, ...weights) => ({
  name,
  sets: weights.map((w) => ({ weight: String(w), reps: '10' })),
});

describe('getProgressSummaries', () => {
  it('returns an empty list with no workouts', () => {
    expect(getProgressSummaries([])).toEqual([]);
  });

  it('counts sessions, tracks the best weight, and orders weights oldest first', () => {
    // Stored newest-first, as saveWorkout does.
    const workouts = [
      { id: '3', date: '2026-11-10', exercises: [ex('Bench Press', 95, 90)] },
      { id: '1', date: '2026-11-01', exercises: [ex('Bench Press', 80)] },
      { id: '2', date: '2026-11-05', exercises: [ex('Bench Press', 100, 85)] },
    ];
    expect(getProgressSummaries(workouts)).toEqual([
      { name: 'Bench Press', sessions: 3, maxWeight: 100, weights: [80, 100, 95] },
    ]);
  });

  it('sorts exercises by session count, most first', () => {
    const workouts = [
      { id: '1', date: '2026-11-01', exercises: [ex('Curl', 20), ex('Squat', 100)] },
      { id: '2', date: '2026-11-02', exercises: [ex('Squat', 105)] },
    ];
    expect(getProgressSummaries(workouts).map((e) => e.name)).toEqual(['Squat', 'Curl']);
  });

  it('counts sessions with no weight but leaves them out of the weight history', () => {
    const workouts = [
      { id: '1', date: '2026-11-01', exercises: [ex('Push-up', 0)] },
      { id: '2', date: '2026-11-02', exercises: [{ name: 'Push-up', sets: [] }] },
      { id: '3', date: '2026-11-03', exercises: [ex('Push-up', 10)] },
    ];
    expect(getProgressSummaries(workouts)).toEqual([
      { name: 'Push-up', sessions: 3, maxWeight: 10, weights: [10] },
    ]);
  });

  it('treats blank or non-numeric weights as zero', () => {
    const workouts = [
      {
        id: '1',
        date: '2026-11-01',
        exercises: [{ name: 'Row', sets: [{ weight: '', reps: '8' }, { weight: 'abc', reps: '8' }, { weight: '42.5', reps: '8' }] }],
      },
    ];
    expect(getProgressSummaries(workouts)[0].maxWeight).toBe(42.5);
  });
});

describe('getWeightTrend', () => {
  it('is zero with fewer than two sessions', () => {
    expect(getWeightTrend([])).toBe(0);
    expect(getWeightTrend([50])).toBe(0);
  });

  it('compares the last two sessions only', () => {
    expect(getWeightTrend([10, 50, 60])).toBe(10);
    expect(getWeightTrend([100, 80])).toBe(-20);
    expect(getWeightTrend([27.5, 30])).toBe(2.5);
  });
});

describe('filterByExerciseName', () => {
  const items = [
    { name: 'Bench Press' },
    { name: 'Leg extension' },
    { name: 'Seated leg curl' },
    { name: 'Lat pulldown' },
  ];

  it('returns everything for an empty or blank query', () => {
    expect(filterByExerciseName(items, '')).toBe(items);
    expect(filterByExerciseName(items, '   ')).toBe(items);
    expect(filterByExerciseName(items, undefined)).toBe(items);
  });

  it('matches part of a name, ignoring case', () => {
    expect(filterByExerciseName(items, 'LEG').map((i) => i.name)).toEqual([
      'Leg extension',
      'Seated leg curl',
    ]);
  });

  it('ignores spaces around the query', () => {
    expect(filterByExerciseName(items, '  bench ').map((i) => i.name)).toEqual(['Bench Press']);
  });

  it('matches across words inside a name', () => {
    expect(filterByExerciseName(items, 'leg cu').map((i) => i.name)).toEqual(['Seated leg curl']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterByExerciseName(items, 'xyz')).toEqual([]);
  });
});
