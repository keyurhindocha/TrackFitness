import {
  EXERCISE_GUIDES,
  findExerciseGuide,
  hasExerciseGuide,
  GUIDE_EXERCISE_NAMES,
} from '../exerciseGuides';
import { EXERCISE_ART } from '../exerciseArt';

// The names actually logged in the app, taken from a real export. These are
// the lookups that have to keep working.
const LOGGED_NAMES = {
  'Low Row': 'seated-cable-row',
  'Leg extension': 'leg-extension',
  'Bench Press': 'bench-press',
  'Lat pulldown': 'lat-pulldown',
  'Seated leg curl': 'seated-leg-curl',
  'Arm Curl': 'bicep-curl',
  'Tricep Pushdown': 'tricep-pushdown',
  'Shoulder press': 'shoulder-press',
  'Chest press': 'chest-press',
  'Dual pull row': 'seated-cable-row',
  'Bicep Curls': 'bicep-curl',
  'Rear deltoids': 'rear-delt-fly',
  'Back extension': 'back-extension',
  'Assisted dips': 'dips',
  'Assisted pull ups': 'pull-up',
  'Chest fly': 'chest-fly',
};

describe('exercise guide catalogue', () => {
  it('gives every guide a unique slug', () => {
    const slugs = EXERCISE_GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has a diagram for every guide', () => {
    EXERCISE_GUIDES.forEach((g) => {
      expect(EXERCISE_ART[g.slug]).toBeTruthy();
    });
  });

  it('does not ship a diagram with no guide behind it', () => {
    const slugs = new Set(EXERCISE_GUIDES.map((g) => g.slug));
    Object.keys(EXERCISE_ART).forEach((slug) => {
      expect(slugs.has(slug)).toBe(true);
    });
  });

  it('fills in every section of every guide', () => {
    EXERCISE_GUIDES.forEach((g) => {
      expect(g.name).toBeTruthy();
      expect(g.category).toBeTruthy();
      expect(g.equipment).toBeTruthy();
      expect(g.primary.length).toBeGreaterThan(0);
      expect(g.setup.length).toBeGreaterThan(0);
      expect(g.execution.length).toBeGreaterThan(0);
      expect(g.mistakes.length).toBeGreaterThan(0);
    });
  });

  it('never points two guides at the same name or alias', () => {
    const seen = new Map();
    EXERCISE_GUIDES.forEach((g) => {
      [g.name, ...g.aliases].forEach((label) => {
        const key = label.toLowerCase();
        expect(seen.has(key)).toBe(false);
        seen.set(key, g.slug);
      });
    });
  });

  it('offers every guide as an add-exercise suggestion', () => {
    expect(GUIDE_EXERCISE_NAMES).toHaveLength(EXERCISE_GUIDES.length);
  });
});

describe('findExerciseGuide', () => {
  it.each(Object.entries(LOGGED_NAMES))('matches %s', (logged, slug) => {
    expect(findExerciseGuide(logged)?.slug).toBe(slug);
  });

  it('ignores case, spacing and punctuation', () => {
    ['LAT PULLDOWN', 'lat  pulldown', 'Lat-Pulldown', ' lat pull down '].forEach((n) => {
      expect(findExerciseGuide(n)?.slug).toBe('lat-pulldown');
    });
  });

  it('looks through equipment modifiers', () => {
    expect(findExerciseGuide('Machine Chest Press')?.slug).toBe('chest-press');
    expect(findExerciseGuide('Dumbbell Shoulder Press')?.slug).toBe('shoulder-press');
    expect(findExerciseGuide('Assisted Pull Ups')?.slug).toBe('pull-up');
  });

  it('copes with plurals', () => {
    expect(findExerciseGuide('Squats')?.slug).toBe('squat');
    expect(findExerciseGuide('Lunges')?.slug).toBe('lunge');
  });

  it('returns null for an exercise it does not know', () => {
    expect(findExerciseGuide('Farmer Walk Thing')).toBeNull();
    expect(findExerciseGuide('')).toBeNull();
    expect(findExerciseGuide(undefined)).toBeNull();
    expect(hasExerciseGuide('Zercher Carry')).toBe(false);
  });

  it('does not confuse the leg curl with the leg extension', () => {
    expect(findExerciseGuide('Seated leg curl')?.slug).toBe('seated-leg-curl');
    expect(findExerciseGuide('Leg extension')?.slug).toBe('leg-extension');
  });
});
