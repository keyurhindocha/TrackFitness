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

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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

const matched = [];
const skipped = [];

for (const file of fs.readdirSync(inputDir).sort()) {
  const ext = path.extname(file).toLowerCase();
  if (!SRC_EXT.includes(ext)) continue;
  const slug = lookup.get(key(path.basename(file, ext)));
  if (!slug) {
    skipped.push(file);
    continue;
  }
  const dest = path.join(OUT, `${slug}.jpg`);
  execFileSync('python3', [
    '-I', '-c',
    'import sys\n' +
      'from PIL import Image\n' +
      'src, dest, cap = sys.argv[1], sys.argv[2], int(sys.argv[3])\n' +
      'im = Image.open(src).convert("RGB")\n' +
      'w, h = im.size\n' +
      'if w > cap: im = im.resize((cap, round(h * cap / w)), Image.LANCZOS)\n' +
      'im.save(dest, quality=86, optimize=True, progressive=True)\n',
    path.join(inputDir, file), dest, String(MAX_WIDTH),
  ]);
  // Drop a stale copy under a different extension for the same exercise.
  ['.png', '.jpeg', '.webp'].forEach((e) => {
    const old = path.join(OUT, slug + e);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  });
  matched.push(`${file} → ${slug}.jpg`);
}

matched.forEach((m) => console.log(`  ${m}`));
if (skipped.length) {
  console.log(`\nno exercise matched these — rename them after the exercise:`);
  skipped.forEach((f) => console.log(`  ${f}`));
}
console.log(`\n${matched.length} imported. Run \`npm run build:art\` to register them.`);
