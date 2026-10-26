// The lifter: a side-view figure built from joint angles, plus the muscle
// shading that makes each diagram say *what* it is training.

const {
  PALETTE, project, perp, shift, mid,
  line, polyline, circle, ellipse,
} = require('./draw');

const ANCHORS = {
  hip: (s) => s.hip,
  shoulder: (s) => s.shoulder,
  head: (s) => s.head,
  wrist: (s) => s.near.wrist,
  elbow: (s) => s.near.elbow,
  knee: (s) => s.near.knee,
  ankle: (s) => s.near.ankle,
  toe: (s) => s.near.toe,
  ankleFar: (s) => s.far.ankle,
  wristFar: (s) => s.far.wrist,
};

const LIMB = {
  torso: 30,
  upperArm: 13,
  foreArm: 11,
  thigh: 17,
  shin: 13,
  foot: 8,
  neck: 11,
  head: 16,
};

const DEFAULTS = {
  torsoLen: 72,
  upperArmLen: 46,
  foreArmLen: 44,
  thighLen: 60,
  shinLen: 60,
  footLen: 22,
  facing: 1,
};

// Resolves a pose into named joint coordinates. Far-side limbs reuse the near
// side's angles unless the pose overrides them, which is what makes split
// stances (lunges) and single-arm work readable.
function skeleton(pose) {
  const p = { ...DEFAULTS, ...pose };
  // `anchor` pins a joint to a fixed point — the hands on a pull-up bar, the
  // feet on the floor — and slides the whole figure to suit. Without it the
  // two panels of a diagram drift apart and the apparatus stops lining up.
  if (p.anchor) {
    const probe = skeleton({ ...pose, anchor: null });
    const at = ANCHORS[p.anchor.joint](probe);
    p.hip = [
      p.hip[0] + p.anchor.at[0] - at[0],
      p.hip[1] + p.anchor.at[1] - at[1],
    ];
  }
  const hip = p.hip;
  const shoulder = project(hip, p.torso, p.torsoLen);
  const neck = project(hip, p.torso, p.torsoLen + 6);
  const head = project(neck, p.neck ?? p.torso, LIMB.head + 5);

  const build = (upperDeg, foreDeg, thighDeg, shinDeg, footDeg) => {
    const elbow = project(shoulder, upperDeg, p.upperArmLen);
    const wrist = project(elbow, foreDeg, p.foreArmLen);
    const knee = project(hip, thighDeg, p.thighLen);
    const ankle = project(knee, shinDeg, p.shinLen);
    const toe = project(ankle, footDeg, p.footLen);
    return { elbow, wrist, knee, ankle, toe };
  };

  const near = build(p.upperArm, p.foreArm, p.thigh, p.shin, p.foot ?? 0 * p.facing);
  const far = build(
    p.upperArmFar ?? p.upperArm,
    p.foreArmFar ?? p.foreArm,
    p.thighFar ?? p.thigh,
    p.shinFar ?? p.shin,
    p.footFar ?? p.foot ?? 0
  );

  return { ...p, hip, shoulder, neck, head, near, far, facing: p.facing };
}

// Perpendicular offset that points toward the chest side of the figure.
const frontward = (s, a, b, amount) => {
  const n = perp(a, b);
  // perp() is a quarter turn clockwise; for a figure facing right that points
  // backwards along a downward-running limb, so flip with the facing.
  return [n[0] * amount * -s.facing, n[1] * amount * -s.facing];
};

const offsetSeg = (s, a, b, amount) => {
  const d = frontward(s, a, b, amount);
  return [
    [a[0] + d[0], a[1] + d[1]],
    [b[0] + d[0], b[1] + d[1]],
  ];
};

// Muscle shading. Each entry returns SVG drawn on top of the limbs, so a
// highlighted muscle reads as "this is the bit doing the work".
const MUSCLES = {
  chest: (s, o) => {
    const c = shift(mid(s.hip, s.shoulder, 0.78), frontward(s, s.hip, s.shoulder, 1), 9);
    return ellipse(c, 15, 11, { fill: o.fill, opacity: o.opacity, rotate: angleOf(s.hip, s.shoulder) });
  },
  lats: (s, o) => {
    const c = shift(mid(s.hip, s.shoulder, 0.62), frontward(s, s.hip, s.shoulder, -1), 10);
    return ellipse(c, 11, 22, { fill: o.fill, opacity: o.opacity, rotate: angleOf(s.hip, s.shoulder) });
  },
  'upper back': (s, o) => {
    const c = shift(mid(s.hip, s.shoulder, 0.8), frontward(s, s.hip, s.shoulder, -1), 9);
    return ellipse(c, 11, 16, { fill: o.fill, opacity: o.opacity, rotate: angleOf(s.hip, s.shoulder) });
  },
  traps: (s, o) => {
    const c = shift(mid(s.shoulder, s.neck, 0.6), frontward(s, s.hip, s.shoulder, -1), 7);
    return ellipse(c, 10, 8, { fill: o.fill, opacity: o.opacity });
  },
  'lower back': (s, o) => {
    const c = shift(mid(s.hip, s.shoulder, 0.26), frontward(s, s.hip, s.shoulder, -1), 9);
    return ellipse(c, 10, 15, { fill: o.fill, opacity: o.opacity, rotate: angleOf(s.hip, s.shoulder) });
  },
  abs: (s, o) => {
    const c = shift(mid(s.hip, s.shoulder, 0.4), frontward(s, s.hip, s.shoulder, 1), 9);
    return ellipse(c, 9, 17, { fill: o.fill, opacity: o.opacity, rotate: angleOf(s.hip, s.shoulder) });
  },
  delts: (s, o) => circle(s.shoulder, 11, { fill: o.fill, opacity: o.opacity }),
  'rear delts': (s, o) =>
    circle(shift(s.shoulder, frontward(s, s.hip, s.shoulder, -1), 5), 10, { fill: o.fill, opacity: o.opacity }),
  biceps: (s, o) => {
    const [a, b] = offsetSeg(s, s.shoulder, s.near.elbow, 3);
    return line(a, b, { stroke: o.fill, width: 11, opacity: o.opacity });
  },
  triceps: (s, o) => {
    const [a, b] = offsetSeg(s, s.shoulder, s.near.elbow, -3);
    return line(a, b, { stroke: o.fill, width: 11, opacity: o.opacity });
  },
  forearms: (s, o) => line(s.near.elbow, s.near.wrist, { stroke: o.fill, width: 9, opacity: o.opacity }),
  quads: (s, o) => {
    const [a, b] = offsetSeg(s, s.hip, s.near.knee, 4);
    return line(a, b, { stroke: o.fill, width: 14, opacity: o.opacity });
  },
  hamstrings: (s, o) => {
    const [a, b] = offsetSeg(s, s.hip, s.near.knee, -4);
    return line(a, b, { stroke: o.fill, width: 14, opacity: o.opacity });
  },
  glutes: (s, o) =>
    ellipse(shift(s.hip, frontward(s, s.hip, s.shoulder, -1), 10), 13, 12, { fill: o.fill, opacity: o.opacity }),
  calves: (s, o) => {
    const [a, b] = offsetSeg(s, s.near.knee, s.near.ankle, -4);
    return line(a, b, { stroke: o.fill, width: 11, opacity: o.opacity });
  },
};

const angleOf = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90;

// `primary` and `secondary` are muscle keys from MUSCLES; anything the map does
// not know is simply not shaded (the guide text still lists it).
function drawMuscles(s, primary = [], secondary = []) {
  const draw = (keys, opts) =>
    keys
      .map((k) => MUSCLES[k])
      .filter(Boolean)
      .map((fn) => fn(s, opts))
      .join('');
  return (
    draw(secondary, { fill: PALETTE.muscleSecondary, opacity: 0.5 }) +
    draw(primary, { fill: PALETTE.muscle, opacity: 0.78 })
  );
}

function drawFigure(pose) {
  const s = skeleton(pose);
  const far = [
    polyline([s.shoulder, s.far.elbow, s.far.wrist], { stroke: PALETTE.bodyFar, width: LIMB.upperArm - 1 }),
    polyline([s.hip, s.far.knee, s.far.ankle], { stroke: PALETTE.bodyFar, width: LIMB.thigh - 2 }),
    line(s.far.ankle, s.far.toe, { stroke: PALETTE.bodyFar, width: LIMB.foot }),
  ].join('');

  const torso = [
    line(s.hip, s.neck, { stroke: PALETTE.bodyNear, width: LIMB.torso }),
    line(s.neck, s.head, { stroke: PALETTE.bodyNear, width: LIMB.neck }),
  ].join('');

  const nearLeg = [
    line(s.hip, s.near.knee, { stroke: PALETTE.bodyNear, width: LIMB.thigh }),
    line(s.near.knee, s.near.ankle, { stroke: PALETTE.bodyNear, width: LIMB.shin }),
    line(s.near.ankle, s.near.toe, { stroke: PALETTE.bodyNear, width: LIMB.foot }),
  ].join('');

  const nearArm = [
    line(s.shoulder, s.near.elbow, { stroke: PALETTE.bodyNear, width: LIMB.upperArm }),
    line(s.near.elbow, s.near.wrist, { stroke: PALETTE.bodyNear, width: LIMB.foreArm }),
  ].join('');

  const head = circle(s.head, LIMB.head, { fill: PALETTE.bodyNear });

  return {
    skeleton: s,
    // Muscles sit between the body and the arm so shading on the torso is not
    // hidden by a limb crossing in front of it.
    svg: (primary, secondary) =>
      far + torso + nearLeg + head + drawMuscles(s, primary, secondary) + nearArm,
  };
}

module.exports = { skeleton, drawFigure, drawMuscles, MUSCLES, LIMB, ANCHORS };
