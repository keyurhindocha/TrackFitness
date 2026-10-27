#!/usr/bin/env node
// Brings real exercise illustrations into the app.
//
//   npm run import:art -- ~/Downloads/exercise-images
//
// Every image in the folder is matched to an exercise by filename (the guide's
// name, slug or any of its aliases — spaces, dashes and case are ignored),
// resized to fit 1400px, re-encoded as JPEG and written to
// assets/exercises/<slug>.jpg, replacing the generated schematic for that
// movement. Anything that cannot be matched is listed and left alone.
//
// Downloads usually arrive with a hash stuck on the end
// ("barbell_back_squat_8bd40f37.jpg"), so a filename that *starts* with an
// exercise name and ends in nothing but a hash counts as a match.

const fs = require('fs');
const path = require('path');
const { fitToWidth, encoder } = require('./lib/encode');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'exercises');
const SRC_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];
const MAX_WIDTH = 1400;

const inputDir = process.argv[2];
if (!inputDir) {
  console.error('usage: npm run import:art -- <folder-of-images>');
  process.exit(1);
}
if (!fs.existsSync(inputDir)) {
  console.error(`no such folder: ${inputDir}`);
  process.exit(1);
}

// Pull the name/alias → slug table straight out of the guide data so the two
// can never drift apart.
const guideSource = fs.readFileSync(path.join(ROOT, 'src', 'data', 'exerciseGuides.js'), 'utf8');
const key = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '');
const lookup = new Map();
for (const block of guideSource.split(/\n  \{\n/).slice(1)) {
  const slug = (block.match(/slug: '([^']+)'/) || [])[1];
  if (!slug) continue;
  const labels = [slug, (block.match(/name: '([^']+)'/) || [])[1] || ''];
  const aliases = (block.match(/aliases: \[([^\]]*)\]/s) || [])[1] || '';
  for (const m of aliases.matchAll(/'([^']+)'/g)) labels.push(m[1]);
  labels.filter(Boolean).forEach((l) => {
    if (!lookup.has(key(l))) lookup.set(key(l), slug);
  });
}

// Longest name first, so "barbell bench press" is preferred over "bench".
const labelsByLength = [...lookup.keys()].sort((a, b) => b.length - a.length);
const isHash = (rest) => rest.length >= 6 && /^[0-9a-f]+$/.test(rest);

const resolve = (base) => {
  const k = key(base);
  if (lookup.has(k)) return lookup.get(k);
  // Fall back to the longest exercise name this filename starts with, as long
  // as everything after it is just a hash. A tie between two different
  // exercises is left unmatched rather than guessed at.
  const candidates = labelsByLength.filter(
    (label) => k.startsWith(label) && isHash(k.slice(label.length))
  );
  if (!candidates.length) return undefined;
  const best = candidates[0].length;
  const slugs = new Set(
    candidates.filter((l) => l.length === best).map((l) => lookup.get(l))
  );
  return slugs.size === 1 ? [...slugs][0] : undefined;
};

const matched = [];
const skipped = [];
const failed = [];

for (const file of fs.readdirSync(inputDir).sort()) {
  const ext = path.extname(file).toLowerCase();
  if (!SRC_EXT.includes(ext)) continue;
  const slug = resolve(path.basename(file, ext));
  if (!slug) {
    skipped.push(file);
    continue;
  }
  // One bad file should not abandon the rest of the folder.
  let written;
  try {
    written = fitToWidth(path.join(inputDir, file), path.join(OUT, `${slug}.jpg`), MAX_WIDTH);
  } catch (err) {
    failed.push(`${file}: ${err.message.split('\n')[0]}`);
    continue;
  }
  // Drop a stale copy of the same exercise under a different extension.
  ['.jpg', '.png', '.jpeg', '.webp'].forEach((e) => {
    const old = path.join(OUT, slug + e);
    if (old !== written.path && fs.existsSync(old)) fs.unlinkSync(old);
  });
  matched.push(`${file} → ${path.basename(written.path)}`);
}

matched.forEach((m) => console.log(`  ${m}`));

if (!encoder() && matched.length) {
  console.log(
    `\nno image tool found (sips, magick, convert, ffmpeg, python3+Pillow) —\n` +
      `copied the originals through at full size instead.`
  );
}
if (skipped.length) {
  console.log(`\nno exercise matched these — rename them after the exercise:`);
  skipped.forEach((f) => console.log(`  ${f}`));
}
if (failed.length) {
  console.log(`\ncould not read these:`);
  failed.forEach((f) => console.log(`  ${f}`));
}
console.log(`\n${matched.length} imported. Run \`npm run build:art\` to register them.`);
