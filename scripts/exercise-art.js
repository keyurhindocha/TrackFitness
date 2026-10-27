// Pose and scenery definitions for every exercise diagram.
//
// Convention: the LEFT panel is the position the working phase begins from
// (the stretch), the RIGHT panel is where it ends (the contraction). Where
// "start of rep" would mislead — a squat begins standing but *works* from the
// bottom — the panel carries its own label.
//
// Angles are absolute SVG angles: 0 points right, 90 points down, -90 up.
// A pose may `anchor` one joint to a fixed point; the figure then slides so
// that joint lands there, which keeps feet on the floor and hands on the bar
// across both panels.

const s = require('./lib/scene');

const FLOOR = 412;
const ANKLE = 404; // ankle centre when the foot is flat on the floor
const floor = (y = FLOOR) => s.floor(y);

// Standing legs: thigh/shin angles that put the hip directly over the ankle.
const STANCE = { thigh: 80, thighLen: 64, shin: 100, shinLen: 64, foot: 0, footLen: 24 };
const STANCE_BACK = { ...STANCE, foot: 180 };

// ---------------------------------------------------------------- chest

const benchPress = {
  slug: 'bench-press',
  name: 'Bench Press',
  primary: ['chest'],
  secondary: ['triceps', 'delts'],
  view: { scale: 1.18, dy: 10 },
  start: {
    label: 'Bottom — bar at chest',
    pose: {
      hip: [252, 300], torso: 180, torsoLen: 72,
      upperArm: 65, upperArmLen: 30, foreArm: -78,
      upperArmFar: 74, foreArmFar: -70,
      thigh: 45, thighLen: 60, shin: 80, shinLen: 72, foot: 0,
      thighFar: 52, shinFar: 86,
      facing: -1,
    },
    gear: (k) => floor() + s.bench({ x: 120, y: 316, len: 232, floorY: FLOOR }) + s.barbellAt(k),
    cues: ['Bar touches mid-chest', 'Elbows about 45° from the torso', 'Shoulder blades pinned back'],
  },
  finish: {
    label: 'Lockout',
    pose: {
      hip: [252, 300], torso: 180, torsoLen: 72,
      upperArm: -85, foreArm: -90,
      upperArmFar: -79, foreArmFar: -93,
      thigh: 45, thighLen: 60, shin: 80, shinLen: 72, foot: 0,
      thighFar: 52, shinFar: 86,
      facing: -1,
    },
    gear: (k) => floor() + s.bench({ x: 120, y: 316, len: 232, floorY: FLOOR }) + s.barbellAt(k),
    cues: ['Press up and slightly back', 'Elbows straight, not slammed locked', 'Feet planted, glutes on the bench'],
  },
};

const inclineBenchPress = {
  slug: 'incline-bench-press',
  name: 'Incline Bench Press',
  primary: ['chest', 'delts'],
  secondary: ['triceps'],
  view: { scale: 1.1, dy: 6 },
  start: {
    label: 'Bottom — bar at upper chest',
    pose: {
      hip: [288, 322], torso: 158, torsoLen: 76,
      upperArm: 52, upperArmLen: 32, foreArm: -84,
      upperArmFar: 60, foreArmFar: -76,
      thigh: 52, thighLen: 58, shin: 80, shinLen: 68, foot: 0,
      thighFar: 60, shinFar: 86,
      facing: -1,
    },
    gear: (k) =>
      floor() +
      s.pad(302, 334, 156, -32) +
      s.pad(300, 336, 110, 2) +
      s.legs(222, 352, 316, FLOOR) +
      s.barbellAt(k, { half: 102 }),
    cues: ['Bench at 30°, no steeper', 'Bar meets the collarbone line', 'Ribs down, lower back flat'],
  },
  finish: {
    label: 'Lockout',
    pose: {
      hip: [288, 322], torso: 158, torsoLen: 76,
      upperArm: -72, foreArm: -84,
      upperArmFar: -66, foreArmFar: -90,
      thigh: 52, thighLen: 58, shin: 80, shinLen: 68, foot: 0,
      thighFar: 60, shinFar: 86,
      facing: -1,
    },
    gear: (k) =>
      floor() +
      s.pad(302, 334, 156, -32) +
      s.pad(300, 336, 110, 2) +
      s.legs(222, 352, 316, FLOOR) +
      s.barbellAt(k, { half: 102 }),
    cues: ['Drive the bar up over the eyes', 'Keep the shoulders pulled back', 'Stop just short of locking out'],
  },
};

const chestPress = {
  slug: 'chest-press',
  name: 'Chest Press (Machine)',
  primary: ['chest'],
  secondary: ['triceps', 'delts'],
  view: { scale: 1.12 },
  start: {
    label: 'Start — handles at the chest',
    pose: {
      hip: [226, 306], torso: -98, torsoLen: 76,
      upperArm: 8, upperArmLen: 32, foreArm: -16,
      upperArmFar: 18, foreArmFar: -6,
      thigh: 6, thighLen: 60, shin: 82, shinLen: 64, foot: 0,
      thighFar: 14, shinFar: 88,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(208, 306, 112, -98) +
      s.pad(224, 336, 100, 2) +
      s.legs(202, 300, 344, FLOOR) +
      s.frame({ x1: 374, x2: 418, y: 186, floorY: FLOOR }) +
      s.stack({ x: 382, y: FLOOR, h: 186 }) +
      s.line([374, 232], [k.near.wrist[0], k.near.wrist[1]], { stroke: s.PALETTE.equipmentLight, width: 7 }),
    gearFront: (k) => s.handleAt(k, { angle: 0, len: 30 }),
    cues: ['Handles level with the sternum', 'Back and head flat on the pad', 'Stretch without letting the shoulders roll forward'],
  },
  finish: {
    label: 'Finish — arms extended',
    pose: {
      hip: [226, 306], torso: -98, torsoLen: 76,
      upperArm: -4, foreArm: -2,
      upperArmFar: 6, foreArmFar: 8,
      thigh: 6, thighLen: 60, shin: 82, shinLen: 64, foot: 0,
      thighFar: 14, shinFar: 88,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(208, 306, 112, -98) +
      s.pad(224, 336, 100, 2) +
      s.legs(202, 300, 344, FLOOR) +
      s.frame({ x1: 374, x2: 418, y: 186, floorY: FLOOR }) +
      s.stack({ x: 382, y: FLOOR, h: 186 }) +
      s.line([374, 232], [k.near.wrist[0], k.near.wrist[1]], { stroke: s.PALETTE.equipmentLight, width: 7 }),
    gearFront: (k) => s.handleAt(k, { angle: 0, len: 30 }),
    cues: ['Push until the elbows are long', 'Squeeze the chest at the end of the push', 'Control the weight all the way back'],
  },
};

const chestFly = {
  slug: 'chest-fly',
  name: 'Chest Fly',
  primary: ['chest'],
  secondary: ['delts'],
  view: { scale: 1.12 },
  start: {
    label: 'Start — arms open',
    pose: {
      hip: [230, 306], torso: -96, torsoLen: 76,
      upperArm: -6, upperArmLen: 50, foreArm: 10, foreArmLen: 42,
      upperArmFar: 4, foreArmFar: 20,
      thigh: 8, thighLen: 60, shin: 82, shinLen: 64, foot: 0,
      thighFar: 16, shinFar: 88,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(212, 306, 112, -96) +
      s.pad(228, 336, 96, 2) +
      s.legs(206, 300, 344, FLOOR) +
      s.frame({ x1: 398, x2: 436, y: 176, floorY: FLOOR }) +
      s.line([398, 206], [k.near.wrist[0], k.near.wrist[1]], { stroke: s.PALETTE.equipmentLight, width: 7 }),
    gearFront: (k) => s.handleAt(k, { angle: 70, len: 26 }),
    cues: ['Set a soft elbow bend, then keep it', 'Open until the chest stretches', 'Never let the hands drop behind the shoulders'],
  },
  finish: {
    label: 'Finish — arms together',
    pose: {
      hip: [230, 306], torso: -96, torsoLen: 76,
      upperArm: -46, upperArmLen: 50, foreArm: -30, foreArmLen: 42,
      upperArmFar: -38, foreArmFar: -22,
      thigh: 8, thighLen: 60, shin: 82, shinLen: 64, foot: 0,
      thighFar: 16, shinFar: 88,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(212, 306, 112, -96) +
      s.pad(228, 336, 96, 2) +
      s.legs(206, 300, 344, FLOOR) +
      s.frame({ x1: 398, x2: 436, y: 176, floorY: FLOOR }) +
      s.line([398, 206], [k.near.wrist[0], k.near.wrist[1]], { stroke: s.PALETTE.equipmentLight, width: 7 }),
    gearFront: (k) => s.handleAt(k, { angle: 80, len: 26 }),
    cues: ['Hug the arms together over the chest', 'The elbow angle never changes', 'Squeeze for a beat, then reverse slowly'],
  },
};

const pushUp = {
  slug: 'push-up',
  name: 'Push-Up',
  primary: ['chest'],
  secondary: ['triceps', 'abs', 'delts'],
  view: { scale: 1.3, dy: -20 },
  start: {
    label: 'Bottom',
    pose: {
      hip: [268, 330], torso: 176, torsoLen: 78,
      upperArm: 34, upperArmLen: 40, foreArm: 96, foreArmLen: 48,
      upperArmFar: 42, foreArmFar: 100,
      thigh: -2, thighLen: 64, shin: 2, shinLen: 64, foot: 62,
      thighFar: 2, shinFar: 6,
      facing: -1,
      anchor: { joint: 'wrist', at: [196, ANKLE] },
    },
    gear: () => floor(),
    cues: ['Chest an inch off the floor', 'Elbows tucked to roughly 45°', 'Body in one straight line, hips level'],
  },
  finish: {
    label: 'Top',
    pose: {
      hip: [268, 300], torso: 176, torsoLen: 78,
      upperArm: 74, upperArmLen: 44, foreArm: 92, foreArmLen: 48,
      upperArmFar: 80, foreArmFar: 94,
      thigh: -4, thighLen: 64, shin: 0, shinLen: 64, foot: 62,
      thighFar: 0, shinFar: 4,
      facing: -1,
      anchor: { joint: 'wrist', at: [196, ANKLE] },
    },
    gear: () => floor(),
    cues: ['Push the floor away, arms long', 'Squeeze the glutes so the hips stay up', 'Head in line with the spine'],
  },
};

const dips = {
  slug: 'dips',
  name: 'Dips',
  primary: ['chest', 'triceps'],
  secondary: ['delts'],
  view: { scale: 1.18, dy: -10 },
  start: {
    label: 'Bottom',
    pose: {
      hip: [264, 300], torso: -84, torsoLen: 78,
      upperArm: 112, upperArmLen: 44, foreArm: 66, foreArmLen: 44,
      upperArmFar: 106, foreArmFar: 72,
      thigh: 54, thighLen: 60, shin: 126, shinLen: 60, foot: -168,
      thighFar: 60, shinFar: 120,
      facing: 1,
      anchor: { joint: 'wrist', at: [286, 268] },
    },
    gear: () =>
      floor() +
      s.upright({ x: 180, yTop: 268, yBottom: FLOOR }) +
      s.upright({ x: 392, yTop: 268, yBottom: FLOOR }) +
      s.beam({ x1: 180, x2: 392, y: 404, h: 9 }) +
      s.line([228, 268], [344, 268], { stroke: '#c9ced6', width: 9 }),
    cues: ['Lower until the upper arm is parallel', 'Lean the torso forward a touch', 'Shoulders stay down, away from the ears'],
  },
  finish: {
    label: 'Top',
    pose: {
      hip: [264, 250], torso: -86, torsoLen: 78,
      upperArm: 96, upperArmLen: 44, foreArm: 90, foreArmLen: 44,
      upperArmFar: 90, foreArmFar: 94,
      thigh: 54, thighLen: 60, shin: 126, shinLen: 60, foot: -168,
      thighFar: 60, shinFar: 120,
      facing: 1,
      anchor: { joint: 'wrist', at: [286, 268] },
    },
    gear: () =>
      floor() +
      s.upright({ x: 180, yTop: 268, yBottom: FLOOR }) +
      s.upright({ x: 392, yTop: 268, yBottom: FLOOR }) +
      s.beam({ x1: 180, x2: 392, y: 404, h: 9 }) +
      s.line([228, 268], [344, 268], { stroke: '#c9ced6', width: 9 }),
    arrowJoint: 'hip',
    cues: ['Press up to straight arms', 'Don’t shrug at the top', 'Keep the ribs down — no swinging'],
  },
};

// ---------------------------------------------------------------- back

const latPulldown = {
  slug: 'lat-pulldown',
  name: 'Lat Pulldown',
  primary: ['lats'],
  secondary: ['biceps', 'upper back'],
  view: { scale: 1.14, dy: 8 },
  start: {
    pose: {
      hip: [244, 312], torso: -95, torsoLen: 78,
      upperArm: -78, foreArm: -80,
      upperArmFar: -88, foreArmFar: -72,
      thigh: 0, thighLen: 62, shin: 85, shinLen: 68, foot: 0,
      thighFar: 6, shinFar: 90,
      facing: 1,
    },
    gear: (k) =>
      floor(384) +
      s.upright({ x: 432, yTop: 96, yBottom: 384 }) +
      s.beam({ x1: 432, x2: 256, y: 104 }) +
      s.stack({ x: 376, y: 384, h: 200 }) +
      s.pulley({ x: 258, y: 118 }) +
      s.cable([258, 130], k.near.wrist) +
      s.beam({ x1: 292, x2: 432, y: 248, h: 10 }) +
      s.upright({ x: 292, yTop: 248, yBottom: 282, w: 10 }) +
      s.pad(176, 334, 134, 0) +
      s.legs(186, 292, 340, 384),
    gearFront: (k) => s.handleAt(k, { angle: 0, len: 150 }) + s.roller({ x: 292, y: 296, r: 16 }),
    cues: ['Arms fully extended, lats stretched', 'Thigh pads snug so you stay seated', 'Chest up, a slight lean back'],
  },
  finish: {
    pose: {
      hip: [244, 312], torso: -99, torsoLen: 78,
      upperArm: 100, foreArm: -22,
      upperArmFar: 94, foreArmFar: -16,
      thigh: 0, thighLen: 62, shin: 85, shinLen: 68, foot: 0,
      thighFar: 6, shinFar: 90,
      facing: 1,
    },
    gear: (k) =>
      floor(384) +
      s.upright({ x: 432, yTop: 96, yBottom: 384 }) +
      s.beam({ x1: 432, x2: 256, y: 104 }) +
      s.stack({ x: 376, y: 384, h: 200 }) +
      s.pulley({ x: 258, y: 118 }) +
      s.cable([258, 130], k.near.wrist) +
      s.beam({ x1: 292, x2: 432, y: 248, h: 10 }) +
      s.upright({ x: 292, yTop: 248, yBottom: 282, w: 10 }) +
      s.pad(176, 334, 134, 0) +
      s.legs(186, 292, 340, 384),
    gearFront: (k) => s.handleAt(k, { angle: 0, len: 150 }) + s.roller({ x: 292, y: 296, r: 16 }),
    cues: ['Bar to the upper chest, never behind the neck', 'Drive the elbows down and back', 'Shoulders down, squeeze the lats'],
  },
};

const pullUp = {
  slug: 'pull-up',
  name: 'Pull-Up',
  primary: ['lats'],
  secondary: ['biceps', 'upper back'],
  view: { scale: 1.18, dy: -6 },
  start: {
    label: 'Dead hang',
    pose: {
      hip: [264, 300], torso: -92, torsoLen: 78,
      upperArm: -84, foreArm: -88,
      upperArmFar: -96, foreArmFar: -92,
      thigh: 82, thighLen: 60, shin: 102, shinLen: 60, foot: 16,
      thighFar: 88, shinFar: 106,
      facing: 1,
      anchor: { joint: 'wrist', at: [264, 148] },
    },
    gear: () =>
      s.upright({ x: 142, yTop: 120, yBottom: 452 }) +
      s.upright({ x: 386, yTop: 120, yBottom: 452 }) +
      s.beam({ x1: 142, x2: 386, y: 128 }) +
      s.line([168, 148], [360, 148], { stroke: '#c9ced6', width: 9 }),
    arrowJoint: 'hip',
    cues: ['Hang with the arms straight', 'Grip just outside shoulder width', 'Pull the shoulders down before you pull up'],
  },
  finish: {
    label: 'Chin over the bar',
    pose: {
      hip: [264, 232], torso: -92, torsoLen: 78,
      upperArm: 146, upperArmLen: 44, foreArm: -74,
      upperArmFar: 152, foreArmFar: -68,
      thigh: 82, thighLen: 60, shin: 102, shinLen: 60, foot: 16,
      thighFar: 88, shinFar: 106,
      facing: 1,
      anchor: { joint: 'wrist', at: [264, 148] },
    },
    gear: () =>
      s.upright({ x: 142, yTop: 120, yBottom: 452 }) +
      s.upright({ x: 386, yTop: 120, yBottom: 452 }) +
      s.beam({ x1: 142, x2: 386, y: 128 }) +
      s.line([168, 148], [360, 148], { stroke: '#c9ced6', width: 9 }),
    arrowJoint: 'hip',
    cues: ['Pull the chest toward the bar', 'Elbows drive down to the ribs', 'No kipping — control the way down'],
  },
};

const seatedCableRow = {
  slug: 'seated-cable-row',
  name: 'Seated Cable Row',
  primary: ['upper back', 'lats'],
  secondary: ['biceps', 'rear delts'],
  view: { scale: 1.1, dy: 4 },
  start: {
    label: 'Start — arms extended',
    pose: {
      hip: [218, 318], torso: -72, torsoLen: 78,
      upperArm: 14, foreArm: 2,
      upperArmFar: 20, foreArmFar: 8,
      thigh: -4, thighLen: 64, shin: 48, shinLen: 64, foot: -46,
      thighFar: 2, shinFar: 54,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.beam({ x1: 136, x2: 452, y: 400, h: 12 }) +
      s.lowTower({ x: 452, floorY: 400, stackH: 176 }) +
      s.pad(144, 338, 112, 0) +
      s.legs(150, 240, 344, 400) +
      s.pad(398, 348, 64, -68) +
      s.cable([434, 380], k.near.wrist, { sag: 8 }),
    gearFront: (k) => s.handleAt(k, { angle: 90, len: 30 }),
    cues: ['Reach forward and let the shoulder blades spread', 'Keep a flat back — don’t round over', 'Knees softly bent, feet braced'],
  },
  finish: {
    label: 'Finish — handle at the ribs',
    pose: {
      hip: [218, 318], torso: -84, torsoLen: 78,
      upperArm: 132, upperArmLen: 44, foreArm: 2,
      upperArmFar: 126, foreArmFar: 8,
      thigh: -4, thighLen: 64, shin: 48, shinLen: 64, foot: -46,
      thighFar: 2, shinFar: 54,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.beam({ x1: 136, x2: 452, y: 400, h: 12 }) +
      s.lowTower({ x: 452, floorY: 400, stackH: 176 }) +
      s.pad(144, 338, 112, 0) +
      s.legs(150, 240, 344, 400) +
      s.pad(398, 348, 64, -68) +
      s.cable([434, 380], k.near.wrist, { sag: 8 }),
    gearFront: (k) => s.handleAt(k, { angle: 90, len: 30 }),
    cues: ['Pull to the navel, elbows past the ribs', 'Squeeze the shoulder blades together', 'Torso stays still — don’t row with your back'],
  },
};

const barbellRow = {
  slug: 'barbell-row',
  name: 'Barbell Row',
  primary: ['upper back', 'lats'],
  secondary: ['biceps', 'lower back'],
  view: { scale: 1.16, dy: -4 },
  start: {
    label: 'Start — bar hanging',
    pose: {
      hip: [240, 290], torso: -26, torsoLen: 80,
      upperArm: 86, foreArm: 90,
      upperArmFar: 92, foreArmFar: 88,
      thigh: 68, thighLen: 62, shin: 98, shinLen: 62, foot: 0, footLen: 24,
      thighFar: 74, shinFar: 102,
      facing: 1,
      anchor: { joint: 'ankle', at: [228, ANKLE] },
    },
    gear: (k) => floor() + s.barbellAt(k, { half: 96, r: 30 }),
    cues: ['Hinge to roughly 45°, back flat', 'Bar hangs straight under the shoulders', 'Knees soft, weight through the mid-foot'],
  },
  finish: {
    label: 'Finish — bar at the stomach',
    pose: {
      hip: [240, 290], torso: -26, torsoLen: 80,
      upperArm: 148, upperArmLen: 44, foreArm: 84,
      upperArmFar: 154, foreArmFar: 82,
      thigh: 68, thighLen: 62, shin: 98, shinLen: 62, foot: 0, footLen: 24,
      thighFar: 74, shinFar: 102,
      facing: 1,
      anchor: { joint: 'ankle', at: [228, ANKLE] },
    },
    gear: (k) => floor() + s.barbellAt(k, { half: 96, r: 30 }),
    cues: ['Pull the bar to the lower ribs', 'Elbows travel back, not out', 'The torso angle never changes'],
  },
};

const dumbbellRow = {
  slug: 'dumbbell-row',
  name: 'Dumbbell Row',
  primary: ['lats', 'upper back'],
  secondary: ['biceps'],
  view: { scale: 1.16, dy: 2 },
  start: {
    label: 'Start — arm extended',
    pose: {
      hip: [300, 272], torso: -6, torsoLen: 82,
      upperArm: 86, foreArm: 90,
      upperArmFar: 152, upperArmLen: 46, foreArmFar: 100,
      thigh: 86, thighLen: 62, shin: 92, shinLen: 62, foot: 0,
      thighFar: 172, shinFar: 90, footFar: 0,
      facing: 1,
    },
    gear: () => floor() + s.bench({ x: 268, y: 306, len: 164, floorY: FLOOR }),
    gearFront: (k) => s.dumbbellAt(k, { r: 17 }),
    cues: ['One hand and one knee on the bench', 'Let the weight hang, shoulder stretched', 'Back flat and level, hips square'],
  },
  finish: {
    label: 'Finish — elbow past the ribs',
    pose: {
      hip: [300, 272], torso: -6, torsoLen: 82,
      upperArm: 160, upperArmLen: 44, foreArm: 84,
      upperArmFar: 152, upperArmLen2: 46, foreArmFar: 100,
      thigh: 86, thighLen: 62, shin: 92, shinLen: 62, foot: 0,
      thighFar: 172, shinFar: 90, footFar: 0,
      facing: 1,
    },
    gear: () => floor() + s.bench({ x: 268, y: 306, len: 164, floorY: FLOOR }),
    gearFront: (k) => s.dumbbellAt(k, { r: 17 }),
    cues: ['Row to the hip, elbow close to the body', 'The shoulder blade moves first, then the arm', 'No twisting the torso to finish the rep'],
  },
};

const backExtension = {
  slug: 'back-extension',
  name: 'Back Extension',
  primary: ['lower back'],
  secondary: ['glutes', 'hamstrings'],
  view: { scale: 1.2, dy: -4 },
  start: {
    label: 'Bottom — hinged down',
    pose: {
      hip: [262, 282], torso: 62, torsoLen: 82,
      upperArm: 110, upperArmLen: 42, foreArm: 158, foreArmLen: 42,
      upperArmFar: 116, foreArmFar: 164,
      thigh: 6, thighLen: 62, shin: 52, shinLen: 62, foot: 8,
      thighFar: 12, shinFar: 58,
      facing: 1,
    },
    gear: () =>
      floor() +
      s.pad(224, 284, 80, 16) +
      s.upright({ x: 252, yTop: 296, yBottom: FLOOR }) +
      s.beam({ x1: 252, x2: 366, y: 402, h: 10 }) +
      s.upright({ x: 360, yTop: 330, yBottom: 402, w: 10 }) +
      s.roller({ x: 360, y: 338, r: 15 }) +
      s.roller({ x: 360, y: 376, r: 15 }),
    arrowJoint: 'head',
    cues: ['Hinge at the hip, not through the spine', 'Pads just below the hip bone', 'Only go as low as the hamstrings allow'],
  },
  finish: {
    label: 'Top — body in line',
    pose: {
      hip: [262, 282], torso: -2, torsoLen: 82,
      upperArm: 96, upperArmLen: 42, foreArm: 148, foreArmLen: 42,
      upperArmFar: 102, foreArmFar: 154,
      thigh: 6, thighLen: 62, shin: 52, shinLen: 62, foot: 8,
      thighFar: 12, shinFar: 58,
      facing: 1,
    },
    gear: () =>
      floor() +
      s.pad(224, 284, 80, 16) +
      s.upright({ x: 252, yTop: 296, yBottom: FLOOR }) +
      s.beam({ x1: 252, x2: 366, y: 402, h: 10 }) +
      s.upright({ x: 360, yTop: 330, yBottom: 402, w: 10 }) +
      s.roller({ x: 360, y: 338, r: 15 }) +
      s.roller({ x: 360, y: 376, r: 15 }),
    arrowJoint: 'head',
    cues: ['Stop when the body is straight', 'Squeeze the glutes at the top', 'Never arch past neutral'],
  },
};

// ---------------------------------------------------------------- shoulders

const shoulderPress = {
  slug: 'shoulder-press',
  name: 'Shoulder Press',
  primary: ['delts'],
  secondary: ['triceps', 'traps'],
  view: { scale: 1.12, dy: 4 },
  start: {
    label: 'Start — hands at shoulder height',
    pose: {
      hip: [240, 310], torso: -92, torsoLen: 78,
      upperArm: 104, upperArmLen: 44, foreArm: -72,
      upperArmFar: 98, foreArmFar: -66,
      thigh: 4, thighLen: 62, shin: 84, shinLen: 66, foot: 0,
      thighFar: 10, shinFar: 90,
      facing: 1,
    },
    gear: () =>
      floor() +
      s.pad(220, 334, 104, 0) +
      s.pad(206, 300, 76, -96) +
      s.legs(214, 310, 340, FLOOR),
    gearFront: (k) => s.dumbbellPair(k, { r: 16 }),
    cues: ['Start with the hands just above the shoulders', 'Elbows slightly in front of the body', 'Ribs down — don’t arch the lower back'],
  },
  finish: {
    label: 'Finish — arms overhead',
    pose: {
      hip: [240, 310], torso: -92, torsoLen: 78,
      upperArm: -80, foreArm: -88,
      upperArmFar: -74, foreArmFar: -94,
      thigh: 4, thighLen: 62, shin: 84, shinLen: 66, foot: 0,
      thighFar: 10, shinFar: 90,
      facing: 1,
    },
    gear: () =>
      floor() +
      s.pad(220, 334, 104, 0) +
      s.pad(206, 300, 76, -96) +
      s.legs(214, 310, 340, FLOOR),
    gearFront: (k) => s.dumbbellPair(k, { r: 16 }),
    cues: ['Press until the arms are straight overhead', 'Weights finish stacked over the shoulders', 'Shrug slightly at the top, then lower slowly'],
  },
};

const lateralRaise = {
  slug: 'lateral-raise',
  name: 'Lateral Raise',
  primary: ['delts'],
  secondary: ['traps'],
  view: { scale: 1.14 },
  start: {
    label: 'Start — arms at the sides',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 86, foreArm: 88,
      upperArmFar: 94, foreArmFar: 92,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 15 }),
    cues: ['Stand tall, weights beside the thighs', 'Tiny bend in the elbows, held throughout', 'Brace the core so the torso stays still'],
  },
  finish: {
    label: 'Finish — arms at shoulder height',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 8, foreArm: 4,
      upperArmFar: 16, foreArmFar: 12,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 15 }),
    cues: ['Lift to shoulder height, no higher', 'Lead with the elbows, not the hands', 'No swinging — lower under control'],
  },
};

const rearDeltFly = {
  slug: 'rear-delt-fly',
  name: 'Rear Delt Fly',
  primary: ['rear delts'],
  secondary: ['upper back', 'traps'],
  view: { scale: 1.14, dy: -4 },
  start: {
    label: 'Start — arms hanging',
    pose: {
      hip: [240, 292], torso: -22, torsoLen: 80,
      upperArm: 84, foreArm: 86,
      upperArmFar: 92, foreArmFar: 90,
      thigh: 70, thighLen: 62, shin: 98, shinLen: 62, foot: 0, footLen: 24,
      thighFar: 76, shinFar: 102,
      facing: 1,
      anchor: { joint: 'ankle', at: [232, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 15 }),
    cues: ['Hinge forward until the chest faces the floor', 'Let the weights hang under the shoulders', 'Flat back, chin tucked'],
  },
  finish: {
    label: 'Finish — arms spread wide',
    pose: {
      hip: [240, 292], torso: -22, torsoLen: 80,
      upperArm: 2, foreArm: 10,
      upperArmFar: 10, foreArmFar: 18,
      thigh: 70, thighLen: 62, shin: 98, shinLen: 62, foot: 0, footLen: 24,
      thighFar: 76, shinFar: 102,
      facing: 1,
      anchor: { joint: 'ankle', at: [232, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 15 }),
    cues: ['Open out to a T, thumbs level with the shoulders', 'Squeeze the shoulder blades, don’t shrug', 'Light weight — this one is never heavy'],
  },
};

const facePull = {
  slug: 'face-pull',
  name: 'Face Pull',
  primary: ['rear delts'],
  secondary: ['upper back', 'traps'],
  view: { scale: 1.1, dy: 4 },
  start: {
    label: 'Start — arms extended',
    pose: {
      ...STANCE,
      hip: [222, 290], torso: -92, torsoLen: 80,
      upperArm: -6, foreArm: 0,
      upperArmFar: 4, foreArmFar: 8,
      facing: 1,
      anchor: { joint: 'ankle', at: [214, ANKLE] },
    },
    gear: (k) =>
      floor() +
      s.upright({ x: 440, yTop: 120, yBottom: FLOOR }) +
      s.stack({ x: 418, y: FLOOR, h: 192 }) +
      s.pulley({ x: 428, y: 196 }) +
      s.cable([418, 196], k.near.wrist, { sag: 6 }),
    gearFront: (k) => s.handleAt(k, { angle: 70, len: 30 }),
    cues: ['Rope set at about eye height', 'Start with the arms long, shoulders stretched', 'Stand tall with a braced core'],
  },
  finish: {
    label: 'Finish — rope at the face',
    pose: {
      ...STANCE,
      hip: [222, 290], torso: -92, torsoLen: 80,
      upperArm: -36, foreArm: -72,
      upperArmFar: -28, foreArmFar: -66,
      facing: 1,
      anchor: { joint: 'ankle', at: [214, ANKLE] },
    },
    gear: (k) =>
      floor() +
      s.upright({ x: 440, yTop: 120, yBottom: FLOOR }) +
      s.stack({ x: 418, y: FLOOR, h: 192 }) +
      s.pulley({ x: 428, y: 196 }) +
      s.cable([418, 196], k.near.wrist, { sag: 6 }),
    gearFront: (k) => s.handleAt(k, { angle: 70, len: 30 }),
    cues: ['Pull the rope toward the forehead', 'Elbows finish high, hands wide', 'Rotate the knuckles back and squeeze'],
  },
};

// ---------------------------------------------------------------- arms

const bicepCurl = {
  slug: 'bicep-curl',
  name: 'Bicep Curl',
  primary: ['biceps'],
  secondary: ['forearms'],
  view: { scale: 1.14 },
  start: {
    label: 'Start — arms straight',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 88, foreArm: 92,
      upperArmFar: 94, foreArmFar: 96,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 16 }),
    cues: ['Arms hanging straight, elbows at your sides', 'Shoulders back, chest up', 'Palms facing forward'],
  },
  finish: {
    label: 'Finish — curled to the shoulder',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 86, foreArm: -56,
      upperArmFar: 92, foreArmFar: -50,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 16 }),
    cues: ['Curl until the biceps are fully shortened', 'Elbows stay pinned — no swinging', 'Lower slowly, all the way to straight'],
  },
};

const hammerCurl = {
  slug: 'hammer-curl',
  name: 'Hammer Curl',
  primary: ['biceps', 'forearms'],
  secondary: [],
  view: { scale: 1.14 },
  start: {
    label: 'Start — arms straight',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 88, foreArm: 92,
      upperArmFar: 94, foreArmFar: 96,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 16 }),
    cues: ['Neutral grip — thumbs facing forward', 'Elbows tight to the ribs', 'Stand tall, no leaning back'],
  },
  finish: {
    label: 'Finish — curled up',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 86, foreArm: -58,
      upperArmFar: 92, foreArmFar: -52,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 16 }),
    cues: ['Keep the palms facing each other the whole way', 'Squeeze at the top for a beat', 'Control the lowering — that is the growth half'],
  },
};

const tricepPushdown = {
  slug: 'tricep-pushdown',
  name: 'Tricep Pushdown',
  primary: ['triceps'],
  secondary: [],
  view: { scale: 1.12, dy: 4 },
  start: {
    label: 'Start — elbows bent',
    pose: {
      ...STANCE,
      hip: [238, 290], torso: -90, torsoLen: 80,
      upperArm: 84, foreArm: 8,
      upperArmFar: 90, foreArmFar: 16,
      facing: 1,
      anchor: { joint: 'ankle', at: [230, ANKLE] },
    },
    gear: (k) =>
      floor() +
      s.upright({ x: 436, yTop: 114, yBottom: FLOOR }) +
      s.stack({ x: 414, y: FLOOR, h: 196 }) +
      s.pulley({ x: 424, y: 134 }) +
      s.cable([414, 134], k.near.wrist, { sag: 4 }),
    gearFront: (k) => s.handleAt(k, { angle: 0, len: 44 }),
    cues: ['Elbows pinned to the ribs', 'Start with the bar around chest height', 'Slight forward lean, core braced'],
  },
  finish: {
    label: 'Finish — arms locked out',
    pose: {
      ...STANCE,
      hip: [238, 290], torso: -90, torsoLen: 80,
      upperArm: 84, foreArm: 84,
      upperArmFar: 90, foreArmFar: 90,
      facing: 1,
      anchor: { joint: 'ankle', at: [230, ANKLE] },
    },
    gear: (k) =>
      floor() +
      s.upright({ x: 436, yTop: 114, yBottom: FLOOR }) +
      s.stack({ x: 414, y: FLOOR, h: 196 }) +
      s.pulley({ x: 424, y: 134 }) +
      s.cable([414, 134], k.near.wrist, { sag: 4 }),
    gearFront: (k) => s.handleAt(k, { angle: 0, len: 44 }),
    cues: ['Push down until the arms are straight', 'Only the forearms move', 'Squeeze the triceps, then return under control'],
  },
};

const overheadTricepExtension = {
  slug: 'overhead-tricep-extension',
  name: 'Overhead Tricep Extension',
  primary: ['triceps'],
  secondary: [],
  view: { scale: 1.14 },
  start: {
    label: 'Start — weight behind the head',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: -74, foreArm: 168, foreArmLen: 46,
      upperArmFar: -80, foreArmFar: 174,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellAt(k, { r: 18 }),
    cues: ['Elbows point at the ceiling, close together', 'Lower the weight behind the head', 'Ribs down — don’t let the back arch'],
  },
  finish: {
    label: 'Finish — arms straight overhead',
    pose: {
      ...STANCE,
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: -80, foreArm: -86, foreArmLen: 46,
      upperArmFar: -86, foreArmFar: -92,
      facing: 1,
      anchor: { joint: 'ankle', at: [264, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellAt(k, { r: 18 }),
    cues: ['Extend until the elbows are straight', 'Upper arms stay vertical the whole rep', 'Keep the head neutral, eyes forward'],
  },
};

// ---------------------------------------------------------------- legs

const squat = {
  slug: 'squat',
  name: 'Squat',
  primary: ['quads', 'glutes'],
  secondary: ['hamstrings', 'lower back', 'abs'],
  view: { scale: 1.16 },
  start: {
    label: 'Bottom',
    pose: {
      hip: [220, 326], torso: -52, torsoLen: 78,
      upperArm: 112, foreArm: -70,
      upperArmFar: 118, foreArmFar: -64,
      thigh: 20, thighLen: 64, shin: 118, shinLen: 64, foot: 0, footLen: 26,
      thighFar: 26, shinFar: 112,
      facing: 1,
      anchor: { joint: 'ankle', at: [250, ANKLE] },
    },
    gear: (k) => floor() + s.barbell({ x: k.shoulder[0] - 8, y: k.shoulder[1] + 10, half: 112, r: 30 }),
    arrowJoint: 'hip',
    cues: ['Hips below the knee crease', 'Knees track out over the toes', 'Chest proud, back flat, heels planted'],
  },
  finish: {
    label: 'Standing',
    pose: {
      ...STANCE,
      hip: [250, 278], torso: -88, torsoLen: 78,
      upperArm: 112, foreArm: -70,
      upperArmFar: 118, foreArmFar: -64,
      footLen: 26,
      facing: 1,
      anchor: { joint: 'ankle', at: [250, ANKLE] },
    },
    gear: (k) => floor() + s.barbell({ x: k.shoulder[0] - 8, y: k.shoulder[1] + 10, half: 112, r: 30 }),
    arrowJoint: 'hip',
    cues: ['Drive through the whole foot', 'Hips and shoulders rise together', 'Stand tall, glutes squeezed — don’t hyperextend'],
  },
};

const legPress = {
  slug: 'leg-press',
  name: 'Leg Press',
  primary: ['quads', 'glutes'],
  secondary: ['hamstrings'],
  view: { scale: 1.1, dy: 6 },
  start: {
    label: 'Bottom — knees bent',
    pose: {
      hip: [218, 300], torso: -142, torsoLen: 76,
      upperArm: 20, upperArmLen: 42, foreArm: 70, foreArmLen: 40,
      upperArmFar: 26, foreArmFar: 76,
      thigh: -34, thighLen: 64, shin: 42, shinLen: 64, foot: -50,
      thighFar: -28, shinFar: 48,
      facing: 1,
    },
    gear: () =>
      floor() +
      s.pad(236, 318, 110, 142) +
      s.pad(220, 320, 92, 36) +
      s.legs(166, 232, 336, FLOOR) +
      s.beam({ x1: 300, x2: 416, y: 196, h: 14 }) +
      s.pad(404, 238, 108, 108),
    gearFront: () => '',
    arrowJoint: 'knee',
    cues: ['Lower until the knees reach about 90°', 'Feet shoulder-width, flat on the platform', 'Lower back stays glued to the pad'],
  },
  finish: {
    label: 'Top — legs extended',
    pose: {
      hip: [218, 300], torso: -142, torsoLen: 76,
      upperArm: 20, upperArmLen: 42, foreArm: 70, foreArmLen: 40,
      upperArmFar: 26, foreArmFar: 76,
      thigh: -22, thighLen: 64, shin: -16, shinLen: 64, foot: -74,
      thighFar: -16, shinFar: -10,
      facing: 1,
    },
    gear: () =>
      floor() +
      s.pad(236, 318, 110, 142) +
      s.pad(220, 320, 92, 36) +
      s.legs(166, 232, 336, FLOOR) +
      s.beam({ x1: 348, x2: 464, y: 148, h: 14 }) +
      s.pad(452, 190, 108, 108),
    arrowJoint: 'knee',
    cues: ['Press until the legs are nearly straight', 'Never snap the knees into lock', 'Push through the heels, not the toes'],
  },
};

const legExtension = {
  slug: 'leg-extension',
  name: 'Leg Extension',
  primary: ['quads'],
  secondary: [],
  view: { scale: 1.14, dy: 4 },
  start: {
    label: 'Start — knees bent',
    pose: {
      hip: [224, 302], torso: -96, torsoLen: 78,
      upperArm: 76, upperArmLen: 44, foreArm: 30, foreArmLen: 42,
      upperArmFar: 82, foreArmFar: 36,
      thigh: 0, thighLen: 64, shin: 84, shinLen: 64, foot: 0,
      thighFar: 6, shinFar: 90,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(196, 326, 114, 0) +
      s.pad(186, 294, 70, -96) +
      s.legs(202, 292, 332, FLOOR) +
      s.beam({ x1: 292, x2: 330, y: 374, h: 10 }) +
      s.line([k.near.ankle[0], k.near.ankle[1]], [330, 374], { stroke: s.PALETTE.equipment, width: 8 }),
    gearFront: (k) => s.roller({ x: k.near.ankle[0], y: k.near.ankle[1], r: 16 }),
    arrowJoint: 'ankle',
    cues: ['Knees level with the machine’s pivot', 'Pad sits on the shin, just above the foot', 'Sit back, hold the handles, hips down'],
  },
  finish: {
    label: 'Finish — legs straight',
    pose: {
      hip: [224, 302], torso: -96, torsoLen: 78,
      upperArm: 76, upperArmLen: 44, foreArm: 30, foreArmLen: 42,
      upperArmFar: 82, foreArmFar: 36,
      thigh: 0, thighLen: 64, shin: -2, shinLen: 64, foot: 0,
      thighFar: 6, shinFar: 4,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(196, 326, 114, 0) +
      s.pad(186, 294, 70, -96) +
      s.legs(202, 292, 332, FLOOR) +
      s.beam({ x1: 292, x2: 330, y: 374, h: 10 }) +
      s.line([k.near.ankle[0], k.near.ankle[1]], [330, 374], { stroke: s.PALETTE.equipment, width: 8 }),
    gearFront: (k) => s.roller({ x: k.near.ankle[0], y: k.near.ankle[1], r: 16 }),
    arrowJoint: 'ankle',
    cues: ['Straighten the knees fully', 'Squeeze the quads for a beat at the top', 'Lower slowly — don’t let the stack drop'],
  },
};

const seatedLegCurl = {
  slug: 'seated-leg-curl',
  name: 'Seated Leg Curl',
  primary: ['hamstrings'],
  secondary: ['calves'],
  view: { scale: 1.14, dy: 4 },
  start: {
    label: 'Start — legs extended',
    pose: {
      hip: [224, 302], torso: -96, torsoLen: 78,
      upperArm: 76, upperArmLen: 44, foreArm: 30, foreArmLen: 42,
      upperArmFar: 82, foreArmFar: 36,
      thigh: 0, thighLen: 64, shin: -4, shinLen: 64, foot: 40,
      thighFar: 6, shinFar: 2,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(196, 326, 114, 0) +
      s.pad(186, 294, 70, -96) +
      s.legs(202, 292, 332, FLOOR) +
      s.roller({ x: 300, y: 278, r: 16 }) +
      s.line([k.near.ankle[0], k.near.ankle[1] + 2], [340, 226], { stroke: s.PALETTE.equipment, width: 8 }),
    gearFront: (k) => s.roller({ x: k.near.ankle[0], y: k.near.ankle[1] + 4, r: 16 }),
    arrowJoint: 'ankle',
    cues: ['Knees in line with the pivot', 'Pad across the back of the ankle', 'Thigh pad locked down so the hips can’t lift'],
  },
  finish: {
    label: 'Finish — heels pulled under',
    pose: {
      hip: [224, 302], torso: -96, torsoLen: 78,
      upperArm: 76, upperArmLen: 44, foreArm: 30, foreArmLen: 42,
      upperArmFar: 82, foreArmFar: 36,
      thigh: 0, thighLen: 64, shin: 86, shinLen: 64, foot: 40,
      thighFar: 6, shinFar: 92,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(196, 326, 114, 0) +
      s.pad(186, 294, 70, -96) +
      s.legs(202, 292, 332, FLOOR) +
      s.roller({ x: 300, y: 278, r: 16 }) +
      s.line([k.near.ankle[0], k.near.ankle[1] + 2], [340, 226], { stroke: s.PALETTE.equipment, width: 8 }),
    gearFront: (k) => s.roller({ x: k.near.ankle[0], y: k.near.ankle[1] + 4, r: 16 }),
    arrowJoint: 'ankle',
    cues: ['Curl the heels as far under the seat as they go', 'Point the toes up to bias the hamstrings', 'Hips stay down — no bouncing out of the seat'],
  },
};

const lunge = {
  slug: 'lunge',
  name: 'Lunge',
  primary: ['quads', 'glutes'],
  secondary: ['hamstrings', 'calves'],
  view: { scale: 1.14 },
  start: {
    label: 'Bottom — back knee down',
    pose: {
      hip: [250, 316], torso: -88, torsoLen: 78,
      upperArm: 88, foreArm: 90,
      upperArmFar: 94, foreArmFar: 94,
      thigh: 10, thighLen: 64, shin: 96, shinLen: 64, foot: 0, footLen: 24,
      thighFar: 128, shinFar: 24, footFar: -20,
      facing: 1,
      anchor: { joint: 'ankle', at: [314, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 15 }),
    cues: ['Front shin vertical, knee over the ankle', 'Back knee lowers toward the floor', 'Torso upright, weight on the front heel'],
  },
  finish: {
    label: 'Top — standing tall',
    pose: {
      hip: [250, 280], torso: -90, torsoLen: 78,
      upperArm: 88, foreArm: 90,
      upperArmFar: 94, foreArmFar: 94,
      thigh: 76, thighLen: 64, shin: 100, shinLen: 64, foot: 0, footLen: 24,
      thighFar: 104, shinFar: 76, footFar: 0,
      facing: 1,
      anchor: { joint: 'ankle', at: [292, ANKLE] },
    },
    gear: () => floor(),
    gearFront: (k) => s.dumbbellPair(k, { r: 15 }),
    arrowJoint: 'hip',
    cues: ['Drive up through the front heel', 'Finish standing tall, hips square', 'Keep the ribcage stacked over the pelvis'],
  },
};

const hipThrust = {
  slug: 'hip-thrust',
  name: 'Hip Thrust',
  primary: ['glutes'],
  secondary: ['hamstrings', 'quads'],
  view: { scale: 1.14, dy: 10 },
  start: {
    label: 'Bottom — hips down',
    pose: {
      hip: [250, 346], torso: -32, torsoLen: 76,
      upperArm: 24, upperArmLen: 44, foreArm: 88, foreArmLen: 42,
      upperArmFar: 30, foreArmFar: 94,
      thigh: -38, thighLen: 62, shin: 66, shinLen: 62, foot: 0,
      thighFar: -32, shinFar: 72,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(160, 296, 110, 0) +
      s.legs(170, 254, 302, FLOOR) +
      s.barbell({ x: k.hip[0] + 6, y: k.hip[1] - 18, half: 104, r: 28 }),
    arrowJoint: 'hip',
    cues: ['Shoulder blades on the bench edge', 'Bar across the hip crease, on a pad', 'Shins vertical at the top — set the feet for that'],
  },
  finish: {
    label: 'Top — hips locked out',
    pose: {
      hip: [250, 300], torso: -6, torsoLen: 76,
      upperArm: 18, upperArmLen: 44, foreArm: 92, foreArmLen: 42,
      upperArmFar: 24, foreArmFar: 98,
      thigh: 4, thighLen: 62, shin: 88, shinLen: 62, foot: 0,
      thighFar: 10, shinFar: 94,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.pad(160, 296, 110, 0) +
      s.legs(170, 254, 302, FLOOR) +
      s.barbell({ x: k.hip[0] + 6, y: k.hip[1] - 18, half: 104, r: 28 }),
    arrowJoint: 'hip',
    cues: ['Drive the hips until the torso is level', 'Squeeze the glutes hard, ribs down', 'Chin tucked — look at the far wall, not up'],
  },
};

const calfRaise = {
  slug: 'calf-raise',
  name: 'Calf Raise',
  primary: ['calves'],
  secondary: [],
  view: { scale: 1.14 },
  start: {
    label: 'Bottom — heels dropped',
    pose: {
      hip: [264, 290], torso: -90, torsoLen: 80,
      upperArm: 88, foreArm: 92,
      upperArmFar: 94, foreArmFar: 96,
      thigh: 82, thighLen: 64, shin: 98, shinLen: 64, foot: -16, footLen: 26,
      thighFar: 86, shinFar: 102, footFar: -16,
      facing: 1,
      anchor: { joint: 'toe', at: [296, 362] },
    },
    gear: () => floor() + s.beam({ x1: 244, x2: 332, y: 376, h: 28 }) + s.legs(252, 324, 390, FLOOR),
    arrowJoint: 'hip',
    cues: ['Balls of the feet on the step', 'Let the heels sink below the step', 'Legs straight, hold something for balance'],
  },
  finish: {
    label: 'Top — up on the toes',
    pose: {
      hip: [264, 268], torso: -90, torsoLen: 80,
      upperArm: 88, foreArm: 92,
      upperArmFar: 94, foreArmFar: 96,
      thigh: 82, thighLen: 64, shin: 98, shinLen: 64, foot: -42, footLen: 26,
      thighFar: 86, shinFar: 102, footFar: -42,
      facing: 1,
      anchor: { joint: 'toe', at: [296, 362] },
    },
    gear: () => floor() + s.beam({ x1: 244, x2: 332, y: 376, h: 28 }) + s.legs(252, 324, 390, FLOOR),
    arrowJoint: 'hip',
    cues: ['Rise as high onto the toes as you can', 'Pause a full second at the top', 'Lower slowly for the stretch'],
  },
};

const deadlift = {
  slug: 'deadlift',
  name: 'Deadlift',
  primary: ['hamstrings', 'glutes', 'lower back'],
  secondary: ['quads', 'upper back', 'forearms'],
  view: { scale: 1.14 },
  start: {
    label: 'Start — bar on the floor',
    pose: {
      hip: [196, 331], torso: -30, torsoLen: 78,
      upperArm: 92, foreArm: 88,
      upperArmFar: 96, foreArmFar: 86,
      thigh: 10, thighLen: 64, shin: 100, shinLen: 64, foot: 0, footLen: 26,
      thighFar: 16, shinFar: 104,
      facing: 1,
    },
    gear: (k) => floor() + s.barbellAt(k, { half: 110, r: 30 }),
    arrowJoint: 'hip',
    cues: ['Bar over the mid-foot, touching the shins', 'Hips above the knees, chest up, back flat', 'Take the slack out of the bar before you pull'],
  },
  finish: {
    label: 'Lockout',
    pose: {
      ...STANCE,
      hip: [248, 278], torso: -88, torsoLen: 78,
      upperArm: 90, foreArm: 90,
      upperArmFar: 94, foreArmFar: 94,
      footLen: 26,
      facing: 1,
      anchor: { joint: 'ankle', at: [248, ANKLE] },
    },
    gear: (k) => floor() + s.barbellAt(k, { half: 110, r: 30 }),
    arrowJoint: 'hip',
    cues: ['Stand tall, hips and knees locked', 'Bar stays against the legs the whole way', 'Squeeze the glutes — don’t lean back'],
  },
};

const romanianDeadlift = {
  slug: 'romanian-deadlift',
  name: 'Romanian Deadlift',
  primary: ['hamstrings', 'glutes'],
  secondary: ['lower back', 'forearms'],
  view: { scale: 1.14 },
  start: {
    label: 'Bottom — bar below the knees',
    pose: {
      hip: [230, 300], torso: -18, torsoLen: 80,
      upperArm: 102, foreArm: 100,
      upperArmFar: 106, foreArmFar: 104,
      thigh: 62, thighLen: 64, shin: 94, shinLen: 64, foot: 0, footLen: 26,
      thighFar: 68, shinFar: 98,
      facing: 1,
      anchor: { joint: 'ankle', at: [242, ANKLE] },
    },
    gear: (k) => floor() + s.barbellAt(k, { half: 108, r: 30 }),
    arrowJoint: 'hip',
    cues: ['Push the hips back, knees barely bend', 'Bar drags down the thighs and shins', 'Stop when the hamstrings run out of stretch'],
  },
  finish: {
    label: 'Top — standing',
    pose: {
      ...STANCE,
      hip: [242, 278], torso: -88, torsoLen: 80,
      upperArm: 90, foreArm: 90,
      upperArmFar: 94, foreArmFar: 94,
      footLen: 26,
      facing: 1,
      anchor: { joint: 'ankle', at: [242, ANKLE] },
    },
    gear: (k) => floor() + s.barbellAt(k, { half: 108, r: 30 }),
    arrowJoint: 'hip',
    cues: ['Drive the hips forward to stand', 'Finish tall with the glutes squeezed', 'Back stays flat from start to finish'],
  },
};

// ---------------------------------------------------------------- core

const plank = {
  slug: 'plank',
  name: 'Plank',
  primary: ['abs'],
  secondary: ['glutes', 'delts'],
  view: { scale: 1.3, dy: -18 },
  start: {
    label: 'Hold — body in line',
    pose: {
      hip: [268, 322], torso: 176, torsoLen: 78,
      upperArm: 54, upperArmLen: 44, foreArm: 178, foreArmLen: 46,
      upperArmFar: 60, foreArmFar: 176,
      thigh: -2, thighLen: 64, shin: 2, shinLen: 64, foot: 62,
      thighFar: 2, shinFar: 6,
      facing: -1,
      anchor: { joint: 'wrist', at: [160, ANKLE] },
    },
    gear: () => floor(),
    arrowJoint: null,
    cues: ['Elbows under the shoulders', 'Hips level with the shoulders', 'Squeeze the glutes and brace the stomach'],
  },
  finish: {
    label: 'Common fault — hips sagging',
    pose: {
      hip: [268, 352], torso: 166, torsoLen: 78,
      upperArm: 48, upperArmLen: 44, foreArm: 174, foreArmLen: 46,
      upperArmFar: 54, foreArmFar: 172,
      thigh: -16, thighLen: 64, shin: -10, shinLen: 64, foot: 48,
      thighFar: -12, shinFar: -6,
      facing: -1,
      anchor: { joint: 'wrist', at: [160, ANKLE] },
    },
    gear: () => floor(),
    arrowJoint: null,
    cues: ['Hips drop, lower back takes the load', 'Fix it by tucking the pelvis under', 'Stop the set when the line breaks'],
  },
};

const hangingLegRaise = {
  slug: 'hanging-leg-raise',
  name: 'Hanging Leg Raise',
  primary: ['abs'],
  secondary: ['forearms'],
  view: { scale: 1.1, dy: -6 },
  start: {
    label: 'Start — hanging straight',
    pose: {
      hip: [264, 300], torso: -92, torsoLen: 78,
      upperArm: -88, foreArm: -90,
      upperArmFar: -96, foreArmFar: -94,
      thigh: 84, thighLen: 62, shin: 92, shinLen: 62, foot: 30,
      thighFar: 88, shinFar: 96,
      facing: 1,
      anchor: { joint: 'wrist', at: [264, 136] },
    },
    gear: () =>
      s.upright({ x: 150, yTop: 110, yBottom: 460 }) +
      s.upright({ x: 378, yTop: 110, yBottom: 460 }) +
      s.beam({ x1: 150, x2: 378, y: 118 }) +
      s.line([176, 136], [352, 136], { stroke: '#c9ced6', width: 9 }),
    arrowJoint: 'ankle',
    cues: ['Hang still — kill the swing first', 'Shoulders pulled down, not slack', 'Legs together, toes pointed'],
  },
  finish: {
    label: 'Finish — legs lifted',
    pose: {
      hip: [264, 300], torso: -96, torsoLen: 78,
      upperArm: -88, foreArm: -90,
      upperArmFar: -96, foreArmFar: -94,
      thigh: 0, thighLen: 62, shin: -6, shinLen: 62, foot: -30,
      thighFar: 6, shinFar: 0,
      facing: 1,
      anchor: { joint: 'wrist', at: [264, 136] },
    },
    gear: () =>
      s.upright({ x: 150, yTop: 110, yBottom: 460 }) +
      s.upright({ x: 378, yTop: 110, yBottom: 460 }) +
      s.beam({ x1: 150, x2: 378, y: 118 }) +
      s.line([176, 136], [352, 136], { stroke: '#c9ced6', width: 9 }),
    arrowJoint: 'ankle',
    cues: ['Lift to at least hip height', 'Curl the pelvis up at the top', 'Lower slowly — no swinging back down'],
  },
};

const cableCrunch = {
  slug: 'cable-crunch',
  name: 'Cable Crunch',
  primary: ['abs'],
  secondary: [],
  view: { scale: 1.12, dy: 6 },
  start: {
    label: 'Start — torso upright',
    pose: {
      hip: [250, 320], torso: -86, torsoLen: 78,
      upperArm: -52, upperArmLen: 44, foreArm: -108, foreArmLen: 42,
      upperArmFar: -46, foreArmFar: -114,
      thigh: 10, thighLen: 62, shin: -86, shinLen: 62, foot: -170,
      thighFar: 16, shinFar: -92,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.upright({ x: 436, yTop: 112, yBottom: FLOOR }) +
      s.stack({ x: 414, y: FLOOR, h: 198 }) +
      s.pulley({ x: 424, y: 130 }) +
      s.cable([414, 130], k.near.wrist, { sag: 4 }),
    gearFront: (k) => s.handleAt(k, { angle: 60, len: 28 }),
    arrowJoint: 'head',
    cues: ['Kneel under the pulley, rope beside the ears', 'Hips stay back over the heels', 'Hands fixed — they never pull the weight'],
  },
  finish: {
    label: 'Finish — crunched down',
    pose: {
      hip: [250, 320], torso: -58, torsoLen: 78,
      upperArm: -30, upperArmLen: 44, foreArm: -92, foreArmLen: 42,
      upperArmFar: -24, foreArmFar: -98,
      thigh: 10, thighLen: 62, shin: -86, shinLen: 62, foot: -170,
      thighFar: 16, shinFar: -92,
      facing: 1,
    },
    gear: (k) =>
      floor() +
      s.upright({ x: 436, yTop: 112, yBottom: FLOOR }) +
      s.stack({ x: 414, y: FLOOR, h: 198 }) +
      s.pulley({ x: 424, y: 130 }) +
      s.cable([414, 130], k.near.wrist, { sag: 4 }),
    gearFront: (k) => s.handleAt(k, { angle: 60, len: 28 }),
    arrowJoint: 'head',
    cues: ['Round the spine down toward the knees', 'Elbows drive to the thighs', 'Crunch with the abs, not by bending the hips'],
  },
};

module.exports = {
  benchPress, inclineBenchPress, chestPress, chestFly, pushUp, dips,
  latPulldown, pullUp, seatedCableRow, barbellRow, dumbbellRow, backExtension,
  shoulderPress, lateralRaise, rearDeltFly, facePull,
  bicepCurl, hammerCurl, tricepPushdown, overheadTricepExtension,
  squat, legPress, legExtension, seatedLegCurl, lunge, hipThrust, calfRaise,
  deadlift, romanianDeadlift,
  plank, hangingLegRaise, cableCrunch,
};
