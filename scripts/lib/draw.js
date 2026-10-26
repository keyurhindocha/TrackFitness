// Primitives for the exercise form diagrams.
//
// Every diagram is a side view drawn in a panel's own coordinate space, so a
// pose is a handful of joint angles rather than a pile of absolute points.
// Angles are absolute and measured the way SVG measures them: 0 points right,
// 90 points *down*, -90 points up.

const DEG = Math.PI / 180;

const PALETTE = {
  page: '#101010',
  panel: '#181818',
  panelBorder: '#2a2a2a',
  bodyNear: '#dcdcdc',
  bodyFar: '#7c7c7c',
  bodyLine: '#101010',
  muscle: '#e8453c',
  muscleSecondary: '#ff9d4d',
  equipment: '#454b54',
  equipmentLight: '#646c78',
  cable: '#9aa1ac',
  arrow: '#ff6b35',
  text: '#ffffff',
  textMuted: '#8a8a8a',
  accent: '#ff6b35',
};

const r2 = (n) => Math.round(n * 100) / 100;
const project = (p, deg, len) => [
  p[0] + Math.cos(deg * DEG) * len,
  p[1] + Math.sin(deg * DEG) * len,
];

// Unit vector perpendicular to a→b, rotated a quarter turn clockwise on screen.
const perp = (a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
};

const shift = (p, n, by) => [p[0] + n[0] * by, p[1] + n[1] * by];
const mid = (a, b, t = 0.5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------- primitives

const line = (a, b, { stroke, width = 2, cap = 'round', opacity = 1, dash } = {}) =>
  `<path d="M${r2(a[0])} ${r2(a[1])} L${r2(b[0])} ${r2(b[1])}" fill="none" stroke="${stroke}" ` +
  `stroke-width="${width}" stroke-linecap="${cap}" opacity="${opacity}"` +
  `${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const polyline = (pts, { stroke, width = 2, opacity = 1 } = {}) =>
  `<path d="M${pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join(' L')}" fill="none" stroke="${stroke}" ` +
  `stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;

const circle = (c, r, { fill = 'none', stroke, width = 2, opacity = 1 } = {}) =>
  `<circle cx="${r2(c[0])}" cy="${r2(c[1])}" r="${r2(r)}" fill="${fill}"` +
  `${stroke ? ` stroke="${stroke}" stroke-width="${width}"` : ''} opacity="${opacity}"/>`;

const ellipse = (c, rx, ry, { fill = 'none', rotate = 0, opacity = 1, stroke, width = 2 } = {}) =>
  `<ellipse cx="${r2(c[0])}" cy="${r2(c[1])}" rx="${r2(rx)}" ry="${r2(ry)}" fill="${fill}"` +
  `${stroke ? ` stroke="${stroke}" stroke-width="${width}"` : ''} opacity="${opacity}"` +
  `${rotate ? ` transform="rotate(${r2(rotate)} ${r2(c[0])} ${r2(c[1])})"` : ''}/>`;

const rect = (x, y, w, h, { fill = 'none', rx = 0, stroke, width = 2, rotate, opacity = 1 } = {}) =>
  `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(rx)}" fill="${fill}"` +
  `${stroke ? ` stroke="${stroke}" stroke-width="${width}"` : ''} opacity="${opacity}"` +
  `${rotate ? ` transform="rotate(${r2(rotate[0])} ${r2(rotate[1])} ${r2(rotate[2])})"` : ''}/>`;

const text = (p, str, { size = 13, fill = PALETTE.text, weight = 600, anchor = 'start', spacing = 0, upper = false } = {}) =>
  `<text x="${r2(p[0])}" y="${r2(p[1])}" fill="${fill}" font-size="${size}" font-weight="${weight}" ` +
  `text-anchor="${anchor}" font-family="'Helvetica Neue',Helvetica,Arial,sans-serif" ` +
  `letter-spacing="${spacing}">${esc(upper ? String(str).toUpperCase() : str)}</text>`;

// A quadratic arc with an arrowhead, used to show which way the weight travels.
const arrow = (from, to, { bend = 0.25, stroke = PALETTE.arrow, width = 4 } = {}) => {
  const n = perp(from, to);
  const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (dist < 12) return '';
  const c = shift(mid(from, to), n, dist * bend);
  // Tangent at the end of a quadratic curve points away from the control point.
  const ang = Math.atan2(to[1] - c[1], to[0] - c[0]) / DEG;
  const head = 11;
  const h1 = project(to, ang + 150, head);
  const h2 = project(to, ang - 150, head);
  return (
    `<path d="M${r2(from[0])} ${r2(from[1])} Q${r2(c[0])} ${r2(c[1])} ${r2(to[0])} ${r2(to[1])}" ` +
    `fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" opacity="0.95"/>` +
    `<path d="M${r2(h1[0])} ${r2(h1[1])} L${r2(to[0])} ${r2(to[1])} L${r2(h2[0])} ${r2(h2[1])}" ` +
    `fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
};

module.exports = {
  DEG, PALETTE, r2, project, perp, shift, mid, esc,
  line, polyline, circle, ellipse, rect, text, arrow,
};
