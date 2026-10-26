// Composes one exercise into a two-panel diagram: start of rep, finish of rep.

const { PALETTE, text, rect, circle, arrow } = require('./draw');
const { drawFigure } = require('./figure');

const W = 1120;
const H = 660;
const PANEL_W = 528;
const PANEL_H = 536;
const PANEL_Y = 100;
const PANEL_X = [24, 568];

// The figure is drawn in a 528×440 stage and then scaled into the panel, so a
// pose only has to be laid out once at a comfortable working size.
const STAGE = { cx: 264, cy: 246, scale: 1.24 };

const JOINTS = {
  wrist: (s) => s.near.wrist,
  elbow: (s) => s.near.elbow,
  shoulder: (s) => s.shoulder,
  hip: (s) => s.hip,
  knee: (s) => s.near.knee,
  ankle: (s) => s.near.ankle,
  head: (s) => s.head,
};

const chipWidth = (label) => 11 + label.length * 7.4;

const chip = (x, y, label, color) =>
  rect(x, y, chipWidth(label), 24, { fill: 'rgba(255,255,255,0.05)', rx: 12 }) +
  circle([x + 13, y + 12], 4.5, { fill: color }) +
  text([x + 24, y + 16.5], label, { size: 12.5, weight: 700, fill: PALETTE.text });

function legend(primary, secondary) {
  const items = [
    ...primary.map((m) => ({ m, c: PALETTE.muscle })),
    ...secondary.map((m) => ({ m, c: PALETTE.muscleSecondary })),
  ];
  const widths = items.map((i) => chipWidth(i.m));
  const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 8;
  let x = (W - total) / 2;
  return items
    .map((it, i) => {
      const out = chip(x, 66, it.m, it.c);
      x += widths[i] + 8;
      return out;
    })
    .join('');
}

function panel(index, label, spec, ex, otherPose) {
  const x = PANEL_X[index];
  const fig = drawFigure(spec.pose);
  const s = fig.skeleton;

  let motion = '';
  const joint = spec.arrowJoint === null ? null : spec.arrowJoint || 'wrist';
  if (joint && otherPose && JOINTS[joint]) {
    const other = drawFigure(otherPose).skeleton;
    motion = arrow(JOINTS[joint](s), JOINTS[joint](other), { bend: spec.arrowBend ?? 0.22 });
  }

  const view = { ...STAGE, dx: 0, dy: 0, ...(ex.view || {}), ...(spec.view || {}) };
  const stage =
    `<g transform="translate(${view.dx} ${view.dy}) translate(${view.cx} ${view.cy}) ` +
    `scale(${view.scale}) translate(${-view.cx} ${-view.cy})">` +
    (spec.gear ? spec.gear(s) : '') +
    fig.svg(ex.primary || [], ex.secondary || []) +
    (spec.gearFront ? spec.gearFront(s) : '') +
    motion +
    '</g>';

  const cues = (spec.cues || [])
    .slice(0, 3)
    .map(
      (c, i) =>
        circle([24, 452 + i * 27], 3.5, { fill: PALETTE.accent }) +
        text([40, 457 + i * 27], c, { size: 15, weight: 500, fill: '#c8c8c8' })
    )
    .join('');

  return (
    `<g transform="translate(${x} ${PANEL_Y})">` +
    rect(0, 0, PANEL_W, PANEL_H, { fill: PALETTE.panel, rx: 18, stroke: PALETTE.panelBorder, width: 1.5 }) +
    `<g clip-path="url(#clip${index})">${stage}</g>` +
    rect(0, 0, PANEL_W, 38, { fill: 'rgba(255,107,53,0.12)', rx: 18 }) +
    rect(0, 22, PANEL_W, 16, { fill: 'rgba(255,107,53,0.12)' }) +
    text([20, 25], label, { size: 13, weight: 800, fill: PALETTE.accent, spacing: 1.4, upper: true }) +
    rect(20, 430, PANEL_W - 40, 1.5, { fill: PALETTE.panelBorder }) +
    cues +
    '</g>'
  );
}

function render(ex) {
  const primary = ex.primary || [];
  const secondary = ex.secondary || [];
  const clip = [0, 1]
    .map(
      (i) =>
        `<clipPath id="clip${i}"><rect x="0" y="0" width="${PANEL_W}" height="424" rx="18"/></clipPath>`
    )
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ` +
    `role="img" aria-label="${ex.name} form guide: start and finish of a rep">` +
    `<title>${ex.name} — form guide</title><defs>${clip}</defs>` +
    rect(0, 0, W, H, { fill: PALETTE.page }) +
    text([W / 2, 46], ex.name, { size: 31, weight: 800, fill: PALETTE.text, anchor: 'middle', spacing: 0.4 }) +
    legend(primary, secondary) +
    panel(0, ex.start.label || 'Start of rep', ex.start, ex, ex.finish.pose) +
    panel(1, ex.finish.label || 'Finish of rep', ex.finish, ex, ex.start.pose) +
    '</svg>'
  );
}

module.exports = { render, W, H, PANEL_W, PANEL_H };
