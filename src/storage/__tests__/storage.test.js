import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getWorkouts,
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  getCheatDays,
  saveCheatDay,
  deleteCheatDay,
  getFavoriteExercises,
  saveFavoriteExercises,
  getGoals,
  saveGoal,
  deleteGoal,
  getUnit,
  saveUnit,
  convertAllWorkoutWeights,
  exportAllData,
  importAllData,
} from '../storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

const workout = (id, date = '2026-09-07', weight = 100) => ({
  id,
  date,
  exercises: [{ name: 'Bench Press', sets: [{ reps: 8, weight }] }],
});

describe('workouts', () => {
  it('starts empty', async () => {
    expect(await getWorkouts()).toEqual([]);
  });

  it('saves newest first', async () => {
    await saveWorkout(workout('a'));
    await saveWorkout(workout('b'));
    expect((await getWorkouts()).map((w) => w.id)).toEqual(['b', 'a']);
  });

  it('updates a workout in place, including its date', async () => {
    await saveWorkout(workout('a'));
    await saveWorkout(workout('b'));
    await updateWorkout({ ...workout('a'), date: '2026-09-01' });
    const ws = await getWorkouts();
    expect(ws.map((w) => w.id)).toEqual(['b', 'a']);
    expect(ws[1].date).toBe('2026-09-01');
  });

  it('ignores an update for an id that does not exist', async () => {
    await saveWorkout(workout('a'));
    await updateWorkout(workout('ghost'));
    expect((await getWorkouts()).map((w) => w.id)).toEqual(['a']);
  });

  it('deletes by id', async () => {
    await saveWorkout(workout('a'));
    await saveWorkout(workout('b'));
    await deleteWorkout('a');
    expect((await getWorkouts()).map((w) => w.id)).toEqual(['b']);
  });

  it('recovers from corrupted stored JSON', async () => {
    await AsyncStorage.setItem('@trackfitness_workouts', '{not json');
    expect(await getWorkouts()).toEqual([]);
  });
});

describe('cheat days', () => {
  const day = (date, items) => ({ id: date, date, items });

  it('starts empty', async () => {
    expect(await getCheatDays()).toEqual([]);
  });

  it('prepends a new date', async () => {
    await saveCheatDay(day('2026-09-01', [{ text: 'Cookie', tag: 'cookie' }]));
    await saveCheatDay(day('2026-09-02', [{ text: 'Cake', tag: 'cake' }]));
    expect((await getCheatDays()).map((d) => d.date)).toEqual(['2026-09-02', '2026-09-01']);
  });

  it('replaces an existing date in place rather than duplicating it', async () => {
    await saveCheatDay(day('2026-09-01', [{ text: 'Cookie' }]));
    await saveCheatDay(day('2026-09-02', [{ text: 'Cake' }]));
    await saveCheatDay(day('2026-09-01', [{ text: 'Cookie' }, { text: 'Ice cream' }]));
    const days = await getCheatDays();
    expect(days.map((d) => d.date)).toEqual(['2026-09-02', '2026-09-01']);
    expect(days[1].items).toHaveLength(2);
  });

  it('keeps legacy string items as stored', async () => {
    await saveCheatDay(day('2026-09-01', ['Two cookies']));
    expect((await getCheatDays())[0].items).toEqual(['Two cookies']);
  });

  it('deletes a date', async () => {
    await saveCheatDay(day('2026-09-01', [{ text: 'Cookie' }]));
    await saveCheatDay(day('2026-09-02', [{ text: 'Cake' }]));
    await deleteCheatDay('2026-09-01');
    expect((await getCheatDays()).map((d) => d.date)).toEqual(['2026-09-02']);
  });

  it('recovers from corrupted stored JSON', async () => {
    await AsyncStorage.setItem('@trackfitness_cheat_days', 'oops');
    expect(await getCheatDays()).toEqual([]);
  });
});

describe('goals', () => {
  it('appends new goals and updates existing ones by id', async () => {
    await saveGoal({ id: 'g1', type: 'weekly_frequency', title: 'Train 4x', target: 4 });
    await saveGoal({ id: 'g2', type: 'weight_target', title: 'Bench 225', target: 225 });
    await saveGoal({ id: 'g1', type: 'weekly_frequency', title: 'Train 5x', target: 5 });
    const goals = await getGoals();
    expect(goals.map((g) => g.id)).toEqual(['g1', 'g2']);
    expect(goals[0].target).toBe(5);
  });

  it('deletes by id', async () => {
    await saveGoal({ id: 'g1', title: 'a' });
    await saveGoal({ id: 'g2', title: 'b' });
    await deleteGoal('g1');
    expect((await getGoals()).map((g) => g.id)).toEqual(['g2']);
  });
});

describe('favorites', () => {
  it('round-trips', async () => {
    expect(await getFavoriteExercises()).toEqual([]);
    await saveFavoriteExercises(['Squat', 'Bench Press']);
    expect(await getFavoriteExercises()).toEqual(['Squat', 'Bench Press']);
  });
});

describe('unit preference', () => {
  it('defaults to lbs', async () => {
    expect(await getUnit()).toBe('lbs');
  });

  it('persists kg', async () => {
    await saveUnit('kg');
    expect(await getUnit()).toBe('kg');
  });

  it('falls back to lbs for an unrecognised value', async () => {
    await AsyncStorage.setItem('@trackfitness_unit', 'stone');
    expect(await getUnit()).toBe('lbs');
  });
});

describe('convertAllWorkoutWeights', () => {
  const sets = (ws) => ws[0].exercises[0].sets.map((s) => s.weight);

  it('converts lbs to kg rounded to one decimal', async () => {
    await saveWorkout({
      id: 'a',
      date: '2026-09-07',
      exercises: [{ name: 'Bench', sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: '135' }] }],
    });
    await convertAllWorkoutWeights('lbs', 'kg');
    expect(sets(await getWorkouts())).toEqual([102.1, 61.2]);
  });

  it('converts kg to lbs', async () => {
    await saveWorkout(workout('a', '2026-09-07', 100));
    await convertAllWorkoutWeights('kg', 'lbs');
    expect(sets(await getWorkouts())).toEqual([220.5]);
  });

  it('leaves zero and empty weights alone', async () => {
    await saveWorkout({
      id: 'a',
      date: '2026-09-07',
      exercises: [{ name: 'Pull Up', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: '' }] }],
    });
    await convertAllWorkoutWeights('lbs', 'kg');
    expect(sets(await getWorkouts())).toEqual([0, '']);
  });

  it('does nothing when the units match', async () => {
    await saveWorkout(workout('a', '2026-09-07', 225));
    await convertAllWorkoutWeights('lbs', 'lbs');
    expect(sets(await getWorkouts())).toEqual([225]);
  });

  it('preserves everything but the weights', async () => {
    const original = workout('a', '2026-09-07', 200);
    await saveWorkout(original);
    await convertAllWorkoutWeights('lbs', 'kg');
    const [converted] = await getWorkouts();
    expect(converted.id).toBe('a');
    expect(converted.date).toBe('2026-09-07');
    expect(converted.exercises[0].name).toBe('Bench Press');
    expect(converted.exercises[0].sets[0].reps).toBe(8);
  });

  it('stays within rounding error on a round trip', async () => {
    await saveWorkout(workout('a', '2026-09-07', 225));
    await convertAllWorkoutWeights('lbs', 'kg');
    await convertAllWorkoutWeights('kg', 'lbs');
    expect(Math.abs(sets(await getWorkouts())[0] - 225)).toBeLessThanOrEqual(0.2);
  });
});

describe('export / import', () => {
  it('exports workouts, cheat days and goals', async () => {
    await saveWorkout(workout('a'));
    await saveCheatDay({ id: 'c', date: '2026-09-07', items: [{ text: 'Cookie' }] });
    await saveGoal({ id: 'g', title: 'Train' });
    const data = await exportAllData();
    expect(Object.keys(data).sort()).toEqual(['cheatDays', 'goals', 'workouts']);
    expect(data.workouts).toHaveLength(1);
    expect(data.cheatDays).toHaveLength(1);
    expect(data.goals).toHaveLength(1);
  });

  it('restores an export into an empty store', async () => {
    await saveWorkout(workout('a'));
    await saveCheatDay({ id: 'c', date: '2026-09-07', items: [{ text: 'Cookie' }] });
    await saveGoal({ id: 'g', title: 'Train' });
    const backup = JSON.parse(JSON.stringify(await exportAllData()));

    await AsyncStorage.clear();
    await importAllData(backup);

    expect(await exportAllData()).toEqual(backup);
  });

  it('replaces existing data rather than merging', async () => {
    await saveWorkout(workout('old'));
    await importAllData({ workouts: [workout('new')], cheatDays: [], goals: [] });
    expect((await getWorkouts()).map((w) => w.id)).toEqual(['new']);
  });

  it('treats missing sections in a backup as empty', async () => {
    await saveWorkout(workout('a'));
    await importAllData({ workouts: [workout('b')] });
    expect((await getWorkouts()).map((w) => w.id)).toEqual(['b']);
    expect(await getCheatDays()).toEqual([]);
    expect(await getGoals()).toEqual([]);
  });

  it('does not touch the unit preference', async () => {
    await saveUnit('kg');
    await importAllData({ workouts: [], cheatDays: [], goals: [] });
    expect(await getUnit()).toBe('kg');
  });
});
