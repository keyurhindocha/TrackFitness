// Fit an image inside a width cap and write it out, using whatever the machine
// already has. No dependency is added for this: a handful of illustrations is
// not worth an image library in package.json, and every platform ships at
// least one of these (sips on macOS, ImageMagick or ffmpeg on Linux).
//
// If none of them is available the file is copied through untouched, which is
// fine — it just stays whatever size it arrived at.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const run = (cmd, args) =>
  execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

const available = (cmd) => {
  try {
    execFileSync('command', ['-v', cmd], { stdio: 'ignore', shell: '/bin/sh' });
    return true;
  } catch {
    return false;
  }
};

const BACKENDS = [
  {
    name: 'sips',
    // macOS ships this. -Z would also *enlarge* a small image, so only pass it
    // when the source is actually wider than the cap.
    encode(src, dest, cap) {
      const width = Number((run('sips', ['-g', 'pixelWidth', src]).match(/pixelWidth:\s*(\d+)/) || [])[1]);
      const args = [];
      if (width && width > cap) args.push('-Z', String(cap));
      args.push('-s', 'format', 'jpeg', '-s', 'formatOptions', '86', src, '--out', dest);
      run('sips', args);
    },
  },
  {
    name: 'magick',
    // `1400x>` is ImageMagick for "shrink to fit, never enlarge".
    encode: (src, dest, cap) => run('magick', [src, '-resize', `${cap}x>`, '-quality', '86', dest]),
  },
  {
    name: 'convert',
    encode: (src, dest, cap) => run('convert', [src, '-resize', `${cap}x>`, '-quality', '86', dest]),
  },
  {
    name: 'ffmpeg',
    encode: (src, dest, cap) =>
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src,
        '-vf', `scale='min(${cap},iw)':-2`, '-q:v', '3', dest]),
  },
  {
    name: 'python3',
    encode(src, dest, cap) {
      run('python3', ['-I', '-c',
        'import sys\n' +
        'from PIL import Image\n' +
        'src, dest, cap = sys.argv[1], sys.argv[2], int(sys.argv[3])\n' +
        'im = Image.open(src).convert("RGB")\n' +
        'w, h = im.size\n' +
        'if w > cap: im = im.resize((cap, round(h * cap / w)), Image.LANCZOS)\n' +
        'im.save(dest, quality=86, optimize=True, progressive=True)\n',
        src, dest, String(cap)]);
    },
  },
];

let chosen;

/** The backend that will be used, or null when the file is copied as-is. */
function encoder() {
  if (chosen === undefined) {
    chosen = BACKENDS.find((b) => available(b.name)) || null;
  }
  return chosen;
}

// Magic bytes, so a file that is not an image is never copied into the app
// where it would shadow the working diagram for that exercise.
const SIGNATURES = [
  [0xff, 0xd8, 0xff], // jpeg
  [0x89, 0x50, 0x4e, 0x47], // png
  [0x47, 0x49, 0x46, 0x38], // gif
  [0x42, 0x4d], // bmp
];

function looksLikeImage(file) {
  const head = Buffer.alloc(12);
  const fd = fs.openSync(file, 'r');
  try {
    fs.readSync(fd, head, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (head.slice(0, 4).toString('ascii') === 'RIFF' && head.slice(8, 12).toString('ascii') === 'WEBP') {
    return true;
  }
  return SIGNATURES.some((sig) => sig.every((b, i) => head[i] === b));
}

/**
 * Write `src` to `dest` as a JPEG no wider than `cap`.
 *
 * Throws if the image cannot be read. A failure here means a broken file, and
 * writing it anyway would shadow the generated diagram with something that
 * will not render.
 *
 * @returns {{ path: string, converted: boolean }} where it landed — with no
 *   encoder on the machine the file is copied through under its own extension.
 */
function fitToWidth(src, dest, cap) {
  const backend = encoder();
  if (backend) {
    try {
      backend.encode(src, dest, cap);
    } catch (err) {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      const detail = (err.stderr || '').toString().trim().split('\n').pop();
      throw new Error(detail || err.message.split('\n')[0]);
    }
    if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      throw new Error(`${backend.name} produced nothing`);
    }
    return { path: dest, converted: true };
  }

  if (!looksLikeImage(src)) throw new Error('not a readable image');
  const copy = dest.replace(/\.jpg$/, path.extname(src).toLowerCase());
  fs.copyFileSync(src, copy);
  return { path: copy, converted: false };
}

module.exports = { fitToWidth, encoder, looksLikeImage };
