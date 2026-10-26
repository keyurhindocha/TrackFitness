// Shared scenery helpers used by the exercise definitions.

const g = require('./gear');
const { PALETTE, line, rect, circle, project } = require('./draw');

const CENTER = 264;

// A loaded barbell seen from the side: the bar runs across the body and the
// near plate sits clear of it, which is the only way a side view reads as
// "barbell" rather than "stick".
const barbell = ({ x, y, half = 108, r = 26 }) =>
  line([x - half, y], [x + half, y], { stroke: '#c9ced6', width: 8 }) +
  g.plate({ x: x - half, y, r }) +
  g.plate({ x: x + half, y, r });

// Lat-pulldown / cable-row style tower: upright, top beam, pulley, stack.
const tower = ({ x, floorY, top = 96, pulleyX, pulleyY = 112, stackH = 200 }) =>
  g.upright({ x, yTop: top, yBottom: floorY }) +
  (pulleyX !== undefined ? g.beam({ x1: x, x2: pulleyX, y: top + 8 }) : '') +
  (pulleyX !== undefined ? g.pulley({ x: pulleyX, y: pulleyY }) : '') +
  g.stack({ x: x - 56, y: floorY, h: stackH });

// Low pulley at floor level, for seated rows and cable curls.
const lowTower = ({ x, floorY, stackH = 180 }) =>
  g.upright({ x, yTop: floorY - stackH - 30, yBottom: floorY }) +
  g.stack({ x: x - 56, y: floorY, h: stackH }) +
  g.pulley({ x: x - 18, y: floorY - 26, r: 10 });

const frame = ({ x1, x2, y, floorY }) =>
  g.upright({ x: x1, yTop: y, yBottom: floorY }) +
  g.upright({ x: x2, yTop: y, yBottom: floorY }) +
  g.beam({ x1, x2, y });

// Joint-attached variants: the weight goes where the hand actually is, so a
// pose and its apparatus can never drift apart.
const barbellAt = (sk, o = {}) => barbell({ x: sk.near.wrist[0], y: sk.near.wrist[1], ...o });
const dumbbellAt = (sk, o = {}) => g.dumbbellEnd({ x: sk.near.wrist[0], y: sk.near.wrist[1], ...o });
const dumbbellPair = (sk, o = {}) =>
  g.dumbbellEnd({ x: sk.far.wrist[0], y: sk.far.wrist[1], r: (o.r || 15) - 2 }) +
  g.dumbbellEnd({ x: sk.near.wrist[0], y: sk.near.wrist[1], ...o });
const handleAt = (sk, o = {}) =>
  g.barHandle({ x: sk.near.wrist[0], y: sk.near.wrist[1], len: 34, angle: 90, ...o });
const cableTo = (sk, from, o = {}) => g.cable(from, sk.near.wrist, o);

module.exports = {
  ...g, barbell, tower, lowTower, frame, CENTER, PALETTE, line, rect, circle, project,
  barbellAt, dumbbellAt, dumbbellPair, handleAt, cableTo,
};
