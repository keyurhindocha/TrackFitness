#!/usr/bin/env node
// Renders every exercise definition to assets/exercises/<slug>.svg and inlines
// the same markup into src/data/exerciseArt.js so the bundler can ship it.
//
//   npm run build:art

const fs = require('fs');
const path = require('path');
const { render } = require('./lib/page');
const defs = require('./exercise-art');

const ROOT = path.join(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'assets', 'exercises');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'exerciseArt.js');

const exercises = Object.values(defs).sort((a, b) => a.slug.localeCompare(b.slug));

fs.mkdirSync(SVG_DIR, { recursive: true });

const slugs = new Set();
const entries = exercises.map((ex) => {
  if (slugs.has(ex.slug)) throw new Error(`duplicate slug: ${ex.slug}`);
  slugs.add(ex.slug);
  const svg = render(ex);
  fs.writeFileSync(path.join(SVG_DIR, `${ex.slug}.svg`), svg + '\n');
  return [ex.slug, svg];
});

// Drop any SVG whose definition has gone away, so the folder mirrors the source.
fs.readdirSync(SVG_DIR)
  .filter((f) => f.endsWith('.svg') && !slugs.has(f.replace(/\.svg$/, '')))
  .forEach((f) => fs.unlinkSync(path.join(SVG_DIR, f)));

const body = entries
  .map(([slug, svg]) => `  '${slug}': ${JSON.stringify(svg)},`)
  .join('\n');

fs.writeFileSync(
  DATA_FILE,
  `// GENERATED FILE — do not edit by hand.\n` +
    `// Source: scripts/exercise-art.js · regenerate with \`npm run build:art\`.\n` +
    `// The same markup is written to assets/exercises/<slug>.svg, which is the\n` +
    `// copy to open in a browser or swap out for your own artwork.\n\n` +
    `export const EXERCISE_ART = {\n${body}\n};\n\n` +
    `export const getExerciseArt = (slug) => EXERCISE_ART[slug] || null;\n`
);

// Real artwork dropped into assets/exercises/ wins over the generated
// schematic. Metro only understands literal require() paths, so the registry
// has to be written out rather than built at runtime.
const PHOTO_EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const PHOTO_FILE = path.join(ROOT, 'src', 'data', 'exercisePhotos.js');

const photos = fs
  .readdirSync(SVG_DIR)
  .filter((f) => PHOTO_EXT.includes(path.extname(f).toLowerCase()))
  .sort();

const unknown = photos.filter((f) => !slugs.has(path.basename(f, path.extname(f))));
if (unknown.length) {
  console.warn(
    `  warning: no exercise matches ${unknown.join(', ')} — rename to <slug>.jpg or they will be ignored`
  );
}

const known = photos.filter((f) => slugs.has(path.basename(f, path.extname(f))));

fs.writeFileSync(
  PHOTO_FILE,
  `// GENERATED FILE — do not edit by hand.\n` +
    `// One entry per real illustration in assets/exercises/. Regenerate with\n` +
    `// \`npm run build:art\` after adding or removing an image.\n\n` +
    `export const EXERCISE_PHOTOS = {\n` +
    known
      .map(
        (f) =>
          `  '${path.basename(f, path.extname(f))}': require('../../assets/exercises/${f}'),`
      )
      .join('\n') +
    `\n};\n\n` +
    `export const getExercisePhoto = (slug) => EXERCISE_PHOTOS[slug] || null;\n`
);

console.log(
  `${entries.length} diagrams → assets/exercises/ and src/data/exerciseArt.js\n` +
    `${known.length} illustration${known.length === 1 ? '' : 's'} → src/data/exercisePhotos.js`
);
