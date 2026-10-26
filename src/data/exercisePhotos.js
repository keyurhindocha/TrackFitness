// GENERATED FILE — do not edit by hand.
// One entry per real illustration in assets/exercises/. Regenerate with
// `npm run build:art` after adding or removing an image.

export const EXERCISE_PHOTOS = {
  'bench-press': require('../../assets/exercises/bench-press.jpg'),
  'lat-pulldown': require('../../assets/exercises/lat-pulldown.jpg'),
  'romanian-deadlift': require('../../assets/exercises/romanian-deadlift.jpg'),
  'shoulder-press': require('../../assets/exercises/shoulder-press.jpg'),
  'squat': require('../../assets/exercises/squat.jpg'),
};

export const getExercisePhoto = (slug) => EXERCISE_PHOTOS[slug] || null;
