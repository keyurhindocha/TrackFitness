// Equipment pieces. Enough of a machine to recognise it from across the gym —
// the point is the body position, not a parts catalogue.

const { PALETTE, line, polyline, circle, rect, project } = require('./draw');

const E = PALETTE.equipment;
const EL = PALETTE.equipmentLight;

const floor = (y, x0 = 10, x1 = 520) =>
  line([x0, y], [x1, y], { stroke: EL, width: 3, opacity: 0.6 });

// A padded surface at any angle: bench, back rest, seat.
const pad = (x, y, len, angle = 0, thick = 14) =>
  rect(x, y - thick / 2, len, thick, { fill: E, rx: thick / 2, rotate: [angle, x, y] });

const legs = (x1, x2, yTop, yBottom) =>
  [
    line([x1, yTop], [x1, yBottom], { stroke: E, width: 8 }),
    line([x2, yTop], [x2, yBottom], { stroke: E, width: 8 }),
    line([x1, yBottom], [x2, yBottom], { stroke: E, width: 6 }),
  ].join('');

// Flat or incline bench seen from the side.
const bench = ({ x, y, len = 190, angle = 0, floorY }) =>
  pad(x, y, len, angle) +
  legs(x + 18, x + len - 24, y + 6, floorY);

// A barbell seen end-on: the plate is a disc, the bar a dot through it.
const plate = ({ x, y, r = 26 }) =>
  circle([x, y], r, { fill: '#20242a', stroke: EL, width: 5 }) +
  circle([x, y], r * 0.38, { fill: E }) +
  circle([x, y], 5, { fill: '#c9ced6' });

// A dumbbell seen end-on.
const dumbbellEnd = ({ x, y, r = 15 }) =>
  circle([x, y], r, { fill: '#20242a', stroke: EL, width: 4 }) +
  circle([x, y], 4.5, { fill: '#c9ced6' });

// Weight-stack tower with a pulley. `pulley` is where the cable leaves it.
const stack = ({ x, y, w = 48, h = 210, plates = 8 }) => {
  const parts = [rect(x, y - h, w, h, { fill: '#14181d', stroke: E, width: 4, rx: 4 })];
  const gap = (h - 16) / plates;
  for (let i = 0; i < plates; i++) {
    parts.push(rect(x + 7, y - h + 10 + i * gap, w - 14, gap - 4, { fill: i < 3 ? EL : E, rx: 2 }));
  }
  parts.push(line([x + w / 2, y - h], [x + w / 2, y - h - 26], { stroke: E, width: 6 }));
  return parts.join('');
};

// Vertical upright of a machine frame.
const upright = ({ x, yTop, yBottom, w = 12 }) =>
  rect(x - w / 2, yTop, w, yBottom - yTop, { fill: E, rx: 3 });

const beam = ({ x1, x2, y, h = 12 }) =>
  rect(Math.min(x1, x2), y - h / 2, Math.abs(x2 - x1), h, { fill: E, rx: 3 });

const pulley = ({ x, y, r = 12 }) =>
  circle([x, y], r, { fill: '#20242a', stroke: EL, width: 4 }) + circle([x, y], 3, { fill: EL });

// A cable, drawn with a touch of slack so it does not read as a steel rod.
const cable = (from, to, { sag = 0 } = {}) => {
  const cx = (from[0] + to[0]) / 2;
  const cy = (from[1] + to[1]) / 2 + sag;
  return `<path d="M${from[0]} ${from[1]} Q${cx} ${cy} ${to[0]} ${to[1]}" fill="none" ` +
    `stroke="${PALETTE.cable}" stroke-width="3"/>`;
};

// A straight bar attachment seen edge-on (lat bar, pushdown bar, row handle).
const barHandle = ({ x, y, len = 34, angle = 90 }) => {
  const a = project([x, y], angle, -len / 2);
  const b = project([x, y], angle, len / 2);
  return line(a, b, { stroke: '#c9ced6', width: 9 });
};

// Padded roller for leg extensions / curls / lat-pulldown thigh pads.
const roller = ({ x, y, r = 15 }) =>
  circle([x, y], r, { fill: E, stroke: EL, width: 3 });

module.exports = {
  floor, pad, legs, bench, plate, dumbbellEnd, stack,
  upright, beam, pulley, cable, barHandle, roller,
};
