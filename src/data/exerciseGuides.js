// What each exercise trains and what good form looks like.
//
// `aliases` is what makes this usable against a real log: the same movement
// gets typed as "Low Row", "Dual pull row" or "Seated cable row" depending on
// the day, and all three have to find the same guide.

export const EXERCISE_GUIDES = [
  // ------------------------------------------------------------------ chest
  {
    slug: 'bench-press',
    name: 'Bench Press',
    aliases: ['barbell bench press', 'flat bench press', 'flat bench', 'bench'],
    category: 'Chest',
    equipment: 'Barbell + bench',
    primary: ['Chest (pectoralis major)'],
    secondary: ['Triceps', 'Front deltoids'],
    setup: [
      'Lie back with your eyes under the bar; feet flat and wide.',
      'Pull the shoulder blades down and together and keep them pinned there.',
      'Grip a little wider than shoulder width, wrists stacked over the elbows.',
    ],
    execution: [
      'Unrack and bring the bar over your lower chest.',
      'Lower under control until the bar touches mid-chest, elbows about 45° from the torso.',
      'Press up and slightly back toward your eyes until the arms are straight.',
    ],
    mistakes: [
      'Flaring the elbows straight out to the sides — hard on the shoulder.',
      'Bouncing the bar off the ribs instead of controlling the lowering.',
      'Lifting the hips off the bench to get the weight moving.',
    ],
    tip: 'Think about pushing yourself away from the bar, not pushing the bar away from you.',
  },
  {
    slug: 'incline-bench-press',
    name: 'Incline Bench Press',
    aliases: ['incline press', 'incline barbell press', 'incline dumbbell press', 'incline chest press'],
    category: 'Chest',
    equipment: 'Barbell or dumbbells + incline bench',
    primary: ['Upper chest', 'Front deltoids'],
    secondary: ['Triceps'],
    setup: [
      'Set the bench to about 30° — steeper turns it into a shoulder press.',
      'Sit back with the shoulder blades pinned and the ribs down.',
      'Grip slightly wider than shoulder width.',
    ],
    execution: [
      'Lower the bar to the line of your collarbones.',
      'Keep the forearms vertical as you lower.',
      'Press up over the eyes, stopping just short of locking out.',
    ],
    mistakes: [
      'Setting the bench too steep and feeling it only in the shoulders.',
      'Arching hard off the bench, which flattens the incline out.',
      'Letting the bar drift down toward the belly.',
    ],
    tip: 'A 30° incline hits the upper chest; anything past 45° belongs to the delts.',
  },
  {
    slug: 'chest-press',
    name: 'Chest Press (Machine)',
    aliases: ['chest press', 'machine chest press', 'seated chest press', 'chest press machine', 'pec press'],
    category: 'Chest',
    equipment: 'Chest press machine',
    primary: ['Chest (pectoralis major)'],
    secondary: ['Triceps', 'Front deltoids'],
    setup: [
      'Set the seat so the handles sit level with your sternum.',
      'Back and head flat against the pad, feet planted.',
      'Shoulders pulled back and down before you take the weight.',
    ],
    execution: [
      'Press the handles forward until the elbows are long.',
      'Squeeze the chest for a beat at full extension.',
      'Return slowly until you feel a stretch, without letting the shoulders roll forward.',
    ],
    mistakes: [
      'Handles set too high, which turns it into an incline press.',
      'Letting the shoulders shrug up and forward at the end of the stretch.',
      'Half reps — stopping short on the way back.',
    ],
    tip: 'If your shoulders roll forward at the back of the rep, you have gone too far.',
  },
  {
    slug: 'chest-fly',
    name: 'Chest Fly',
    aliases: ['pec deck', 'pec fly', 'cable fly', 'dumbbell fly', 'chest flye', 'fly'],
    category: 'Chest',
    equipment: 'Cable, machine or dumbbells',
    primary: ['Chest (pectoralis major)'],
    secondary: ['Front deltoids'],
    setup: [
      'Set a soft bend in the elbows and keep that angle for the whole set.',
      'Chest up, shoulder blades back and down.',
      'Hands start level with the chest, not above the shoulders.',
    ],
    execution: [
      'Open the arms out until you feel the chest stretch.',
      'Hug the arms back together over the chest as if squeezing a barrel.',
      'Pause for a beat at the top, then reverse slowly.',
    ],
    mistakes: [
      'Bending and straightening the elbows — that makes it a press, not a fly.',
      'Going so deep that the shoulders take the load.',
      'Going heavy; the fly is a stretch-and-squeeze movement.',
    ],
    tip: 'Elbows lead, hands follow. The hands are just hooks.',
  },
  {
    slug: 'push-up',
    name: 'Push-Up',
    aliases: ['pushup', 'push ups', 'pushups', 'press up'],
    category: 'Chest',
    equipment: 'Bodyweight',
    primary: ['Chest (pectoralis major)'],
    secondary: ['Triceps', 'Core', 'Front deltoids'],
    setup: [
      'Hands just outside shoulder width, under the shoulders.',
      'Body in one line from heel to head.',
      'Squeeze the glutes and brace the stomach before the first rep.',
    ],
    execution: [
      'Lower until the chest is an inch off the floor, elbows tucked to about 45°.',
      'Push the floor away until the arms are straight.',
      'Keep the hips level the whole way — no sagging, no piking.',
    ],
    mistakes: [
      'Hips dropping, which loads the lower back.',
      'Head poking forward ahead of the chest.',
      'Flaring the elbows out to 90°.',
    ],
    tip: 'If the hips sag, stop the set — that rep is training your lower back, not your chest.',
  },
  {
    slug: 'dips',
    name: 'Dips',
    aliases: ['dip', 'chest dips', 'tricep dips', 'assisted dips', 'parallel bar dips'],
    category: 'Chest',
    equipment: 'Dip bars or assisted dip machine',
    primary: ['Chest (lower)', 'Triceps'],
    secondary: ['Front deltoids'],
    setup: [
      'Grip the bars and press up to straight arms.',
      'Shoulders pulled down away from the ears.',
      'Lean the torso forward slightly to bias the chest; stay upright for more triceps.',
    ],
    execution: [
      'Lower until the upper arm is roughly parallel to the floor.',
      'Keep the elbows tracking back rather than flaring wide.',
      'Press back up to straight arms without shrugging.',
    ],
    mistakes: [
      'Dropping below parallel and straining the shoulder joint.',
      'Swinging the legs to generate momentum.',
      'Letting the shoulders shrug up at the bottom.',
    ],
    tip: 'On the assisted machine a higher number means more help, not more work.',
  },

  // ------------------------------------------------------------------- back
  {
    slug: 'lat-pulldown',
    name: 'Lat Pulldown',
    aliases: ['lat pull down', 'pulldown', 'lat pull-down', 'wide grip pulldown', 'cable pulldown'],
    category: 'Back',
    equipment: 'Lat pulldown machine',
    primary: ['Lats (latissimus dorsi)'],
    secondary: ['Biceps', 'Mid-back', 'Rear deltoids'],
    setup: [
      'Set the thigh pads snug so you stay seated under load.',
      'Grip the bar wider than shoulder width, palms forward.',
      'Sit tall with the chest up and a slight lean back.',
    ],
    execution: [
      'Start with the arms fully extended and the lats stretched.',
      'Pull the bar to your upper chest by driving the elbows down and back.',
      'Squeeze the lats at the bottom, then let the bar rise slowly.',
    ],
    mistakes: [
      'Pulling the bar behind the neck — bad for the shoulders, no extra benefit.',
      'Leaning far back and turning it into a row.',
      'Yanking with the arms instead of starting the pull from the shoulder blades.',
    ],
    tip: 'Imagine putting your elbows in your back pockets.',
  },
  {
    slug: 'pull-up',
    name: 'Pull-Up',
    aliases: ['pull ups', 'pullup', 'pullups', 'assisted pull ups', 'assisted pullups', 'chin up', 'chin ups'],
    category: 'Back',
    equipment: 'Pull-up bar or assisted machine',
    primary: ['Lats (latissimus dorsi)'],
    secondary: ['Biceps', 'Mid-back', 'Core'],
    setup: [
      'Grip just outside shoulder width, palms facing away.',
      'Hang with the arms straight and the ribs down.',
      'Pull the shoulders down out of the ears before you bend an elbow.',
    ],
    execution: [
      'Pull your chest toward the bar, elbows driving down to your ribs.',
      'Clear the bar with your chin without craning your neck.',
      'Lower all the way back to a dead hang, under control.',
    ],
    mistakes: [
      'Kipping or swinging to get through reps.',
      'Stopping halfway down and never reaching a full hang.',
      'Shrugging the shoulders up at the bottom.',
    ],
    tip: 'On the assisted machine a higher number means more help, not more work.',
  },
  {
    slug: 'seated-cable-row',
    name: 'Seated Cable Row',
    aliases: [
      'low row', 'cable row', 'seated row', 'dual pull row', 'machine row',
      'seated low row', 'row machine', 'close grip row',
    ],
    category: 'Back',
    equipment: 'Cable row machine',
    primary: ['Mid-back (rhomboids, traps)', 'Lats'],
    secondary: ['Biceps', 'Rear deltoids'],
    setup: [
      'Feet braced on the plate, knees slightly bent.',
      'Sit tall — the torso is roughly upright, not laid back.',
      'Take the handle with the arms straight and the shoulder blades allowed to spread.',
    ],
    execution: [
      'Pull the handle to your navel, elbows travelling past the ribs.',
      'Squeeze the shoulder blades together at the end of the pull.',
      'Let the arms straighten slowly and the shoulder blades spread again.',
    ],
    mistakes: [
      'Rocking the torso back and forth to move the stack.',
      'Rounding the lower back on the stretch.',
      'Shrugging — the shoulders should go back, not up.',
    ],
    tip: 'Lead with your elbows; your hands are just holding on.',
  },
  {
    slug: 'barbell-row',
    name: 'Barbell Row',
    aliases: ['bent over row', 'bent-over row', 'bb row', 'pendlay row', 'barbell bent over row'],
    category: 'Back',
    equipment: 'Barbell',
    primary: ['Mid-back', 'Lats'],
    secondary: ['Biceps', 'Lower back', 'Rear deltoids'],
    setup: [
      'Hinge at the hips to about 45°, knees soft.',
      'Back flat, chest proud, weight through the mid-foot.',
      'Bar hanging straight down under the shoulders.',
    ],
    execution: [
      'Pull the bar into the lower ribs or upper stomach.',
      'Drive the elbows back, not out to the sides.',
      'Lower under control and hold the torso angle the whole set.',
    ],
    mistakes: [
      'Standing up a little on every rep to heave the bar.',
      'Rounding the lower back under load.',
      'Rowing to the chest instead of the stomach.',
    ],
    tip: 'If your torso angle changes during the set, the weight is too heavy.',
  },
  {
    slug: 'dumbbell-row',
    name: 'Dumbbell Row',
    aliases: ['one arm row', 'single arm row', 'db row', 'one arm dumbbell row', 'bench row'],
    category: 'Back',
    equipment: 'Dumbbell + bench',
    primary: ['Lats', 'Mid-back'],
    secondary: ['Biceps', 'Rear deltoids'],
    setup: [
      'One hand and the same-side knee on the bench.',
      'Back flat and level, hips square to the floor.',
      'Let the working arm hang straight down, shoulder stretched.',
    ],
    execution: [
      'Row the dumbbell to your hip, elbow close to the body.',
      'Let the shoulder blade move first, then the arm.',
      'Lower all the way back to a full stretch.',
    ],
    mistakes: [
      'Twisting the torso to finish the rep.',
      'Rowing to the armpit, which hands the work to the upper traps.',
      'Shortening the bottom of the range.',
    ],
    tip: 'Keep your chest facing the floor the whole set — no rotating.',
  },
  {
    slug: 'back-extension',
    name: 'Back Extension',
    aliases: ['hyperextension', 'hyper extension', 'roman chair', '45 degree back extension', 'lower back extension'],
    category: 'Back',
    equipment: 'Back extension bench or machine',
    primary: ['Lower back (erector spinae)'],
    secondary: ['Glutes', 'Hamstrings'],
    setup: [
      'Set the pad just below the hip bone so you can hinge freely.',
      'Feet locked in, legs straight.',
      'Arms crossed on the chest or hands at the temples.',
    ],
    execution: [
      'Hinge down at the hip — the spine stays neutral.',
      'Lower only as far as your hamstrings allow without the back rounding.',
      'Rise until the body is in one straight line and squeeze the glutes.',
    ],
    mistakes: [
      'Arching hard past neutral at the top.',
      'Rounding and un-rounding the spine instead of hinging at the hip.',
      'Pad set too high, which blocks the hinge.',
    ],
    tip: 'Stop at straight. Going past it is where lower backs get cranky.',
  },

  // -------------------------------------------------------------- shoulders
  {
    slug: 'shoulder-press',
    name: 'Shoulder Press',
    aliases: [
      'overhead press', 'military press', 'ohp', 'db shoulder press',
      'dumbbell shoulder press', 'machine shoulder press', 'seated shoulder press', 'press',
    ],
    category: 'Shoulders',
    equipment: 'Dumbbells, barbell or machine',
    primary: ['Deltoids (front and side)'],
    secondary: ['Triceps', 'Upper traps'],
    setup: [
      'Sit or stand tall, core braced, ribs pulled down.',
      'Start with the hands just above shoulder height.',
      'Elbows slightly in front of the body, not flared straight out.',
    ],
    execution: [
      'Press up until the arms are straight overhead.',
      'Finish with the weight stacked over the shoulders and the shoulders slightly shrugged.',
      'Lower back to shoulder height under control.',
    ],
    mistakes: [
      'Arching the lower back to turn it into an incline press.',
      'Pressing the weights out in front instead of overhead.',
      'Stopping short and never reaching a full lockout.',
    ],
    tip: 'Squeeze your glutes — it is the quickest way to stop the back arching.',
  },
  {
    slug: 'lateral-raise',
    name: 'Lateral Raise',
    aliases: ['side raise', 'lat raise', 'side lateral raise', 'dumbbell lateral raise', 'shoulder raise'],
    category: 'Shoulders',
    equipment: 'Dumbbells or cable',
    primary: ['Side deltoids'],
    secondary: ['Upper traps'],
    setup: [
      'Stand tall with the weights beside your thighs.',
      'Tiny bend in the elbows, held for the whole set.',
      'Brace the core so the torso cannot swing.',
    ],
    execution: [
      'Raise the arms out to the sides until they reach shoulder height.',
      'Lead with the elbows, keeping the hands slightly below them.',
      'Lower slowly — do not let gravity do the return.',
    ],
    mistakes: [
      'Swinging the weights up with a hip thrust.',
      'Going above shoulder height, which hands the work to the traps.',
      'Going too heavy and shrugging every rep.',
    ],
    tip: 'This is a small muscle. Light weight and clean reps beat heavy and sloppy.',
  },
  {
    slug: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    aliases: [
      'rear deltoids', 'rear delts', 'reverse fly', 'reverse pec deck',
      'rear delt flye', 'bent over lateral raise', 'rear deltoid',
    ],
    category: 'Shoulders',
    equipment: 'Dumbbells or reverse pec deck',
    primary: ['Rear deltoids'],
    secondary: ['Mid-back', 'Traps'],
    setup: [
      'Hinge forward until the chest faces the floor, or sit chest-first in the machine.',
      'Flat back, chin tucked.',
      'Arms hanging under the shoulders with a soft elbow bend.',
    ],
    execution: [
      'Open the arms out to a T, thumbs level with the shoulders.',
      'Squeeze the shoulder blades without shrugging.',
      'Lower under control back to the stretch.',
    ],
    mistakes: [
      'Using so much weight it becomes a row.',
      'Shrugging the shoulders toward the ears.',
      'Standing up as the set gets hard.',
    ],
    tip: 'Rear delts respond to reps, not load. Think 12–20 per set.',
  },
  {
    slug: 'face-pull',
    name: 'Face Pull',
    aliases: ['cable face pull', 'rope face pull'],
    category: 'Shoulders',
    equipment: 'Cable + rope',
    primary: ['Rear deltoids'],
    secondary: ['Mid-back', 'Rotator cuff', 'Traps'],
    setup: [
      'Set the rope at about eye height.',
      'Step back so the cable is under tension with the arms straight.',
      'Stand tall with a braced core.',
    ],
    execution: [
      'Pull the rope toward your forehead, hands splitting apart.',
      'Finish with the elbows high and the knuckles rotated back.',
      'Return slowly to a full stretch.',
    ],
    mistakes: [
      'Pulling to the chest instead of the face.',
      'Letting the elbows drop so it becomes a row.',
      'Leaning back to muscle heavy weight.',
    ],
    tip: 'The best insurance policy against cranky pressing shoulders.',
  },

  // ------------------------------------------------------------------- arms
  {
    slug: 'bicep-curl',
    name: 'Bicep Curl',
    aliases: [
      'bicep curls', 'biceps curl', 'arm curl', 'arm curls', 'curl', 'curls',
      'dumbbell curl', 'barbell curl', 'cable curl', 'machine curl', 'preacher curl',
    ],
    category: 'Arms',
    equipment: 'Dumbbells, barbell, cable or machine',
    primary: ['Biceps'],
    secondary: ['Forearms'],
    setup: [
      'Stand tall with the arms hanging straight and the palms forward.',
      'Elbows pinned to your sides.',
      'Shoulders back, chest up, core braced.',
    ],
    execution: [
      'Curl up until the biceps are fully shortened.',
      'Keep the elbows still — only the forearms move.',
      'Lower slowly all the way back to straight arms.',
    ],
    mistakes: [
      'Swinging the body to launch the weight.',
      'Letting the elbows drift forward, which brings the front delts in.',
      'Cutting the bottom of the range short.',
    ],
    tip: 'If your shoulders move, the weight is too heavy.',
  },
  {
    slug: 'hammer-curl',
    name: 'Hammer Curl',
    aliases: ['neutral grip curl', 'dumbbell hammer curl', 'hammer curls'],
    category: 'Arms',
    equipment: 'Dumbbells',
    primary: ['Biceps', 'Brachialis', 'Forearms'],
    secondary: [],
    setup: [
      'Hold the dumbbells with a neutral grip — palms facing each other.',
      'Elbows tight to the ribs.',
      'Stand tall, no leaning back.',
    ],
    execution: [
      'Curl up keeping the palms facing each other the whole way.',
      'Squeeze at the top for a beat.',
      'Lower slowly — the eccentric is where the size comes from.',
    ],
    mistakes: [
      'Rotating the wrists partway up (that is a normal curl).',
      'Using the shoulders to swing the weight.',
      'Bouncing out of the bottom.',
    ],
    tip: 'Hammer curls build the muscle that pushes the biceps up — great for arm thickness.',
  },
  {
    slug: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    aliases: [
      'triceps pushdown', 'tricep push down', 'cable pushdown', 'pushdown',
      'rope pushdown', 'tricep extension cable',
    ],
    category: 'Arms',
    equipment: 'Cable + bar or rope',
    primary: ['Triceps'],
    secondary: [],
    setup: [
      'Set the cable high and stand a short step back.',
      'Elbows pinned to the ribs, a slight forward lean.',
      'Start with the bar at around chest height.',
    ],
    execution: [
      'Push down until the arms are completely straight.',
      'Only the forearms move — the upper arms stay still.',
      'Let the bar rise slowly back to the start.',
    ],
    mistakes: [
      'Letting the elbows drift forward and away from the body.',
      'Leaning over the bar to press it down with body weight.',
      'Stopping short of a full lockout.',
    ],
    tip: 'Glue your upper arms to your sides and the triceps have nowhere to hide.',
  },
  {
    slug: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    aliases: [
      'overhead triceps extension', 'french press', 'skullcrusher', 'skull crusher',
      'tricep extension', 'triceps extension', 'overhead extension',
    ],
    category: 'Arms',
    equipment: 'Dumbbell, cable or EZ bar',
    primary: ['Triceps (long head)'],
    secondary: [],
    setup: [
      'Take the weight overhead with the elbows pointing at the ceiling.',
      'Upper arms close together and vertical.',
      'Ribs down so the lower back does not arch.',
    ],
    execution: [
      'Lower the weight behind the head under control.',
      'Keep the upper arms vertical the whole rep.',
      'Extend until the elbows are straight and squeeze.',
    ],
    mistakes: [
      'Letting the elbows flare out wide.',
      'Arching the lower back to get the weight up.',
      'Moving the upper arms instead of just the forearms.',
    ],
    tip: 'This is the one triceps move that trains the long head at full stretch — do it.',
  },

  // ------------------------------------------------------------------- legs
  {
    slug: 'squat',
    name: 'Squat',
    aliases: ['back squat', 'barbell squat', 'barbell back squat', 'squats', 'front squat', 'goblet squat'],
    category: 'Legs',
    equipment: 'Barbell + rack',
    primary: ['Quads', 'Glutes'],
    secondary: ['Hamstrings', 'Lower back', 'Core'],
    setup: [
      'Bar racked across the upper back, not the neck.',
      'Feet shoulder-width, toes turned slightly out.',
      'Big breath into the belly, brace, then unrack and step back.',
    ],
    execution: [
      'Sit the hips back and down, knees tracking out over the toes.',
      'Descend until the hip crease drops below the knee, if your mobility allows.',
      'Drive up through the whole foot — hips and shoulders rise together.',
    ],
    mistakes: [
      'Knees caving inward on the way up.',
      'Heels lifting off the floor.',
      'Hips shooting up first, leaving the chest behind.',
    ],
    tip: 'Spread the floor apart with your feet and the knees stop caving in.',
  },
  {
    slug: 'leg-press',
    name: 'Leg Press',
    aliases: ['seated leg press', 'machine leg press', 'horizontal leg press', '45 degree leg press'],
    category: 'Legs',
    equipment: 'Leg press machine',
    primary: ['Quads', 'Glutes'],
    secondary: ['Hamstrings'],
    setup: [
      'Feet shoulder-width and flat on the platform.',
      'Back and hips glued to the pad.',
      'Hold the handles and brace before you release the safeties.',
    ],
    execution: [
      'Lower until the knees reach roughly 90°.',
      'Keep the lower back pressed into the pad throughout.',
      'Press through the heels until the legs are nearly straight.',
    ],
    mistakes: [
      'Going so deep the hips curl up off the pad.',
      'Snapping the knees into a hard lock at the top.',
      'Pushing with the toes instead of the whole foot.',
    ],
    tip: 'The moment your tailbone lifts off the pad, you have gone too deep.',
  },
  {
    slug: 'leg-extension',
    name: 'Leg Extension',
    aliases: ['leg extensions', 'knee extension', 'quad extension', 'seated leg extension'],
    category: 'Legs',
    equipment: 'Leg extension machine',
    primary: ['Quads'],
    secondary: [],
    setup: [
      'Set the seat so your knees line up with the machine’s pivot.',
      'Pad resting on the shin just above the foot.',
      'Sit back, hold the handles, hips pressed down.',
    ],
    execution: [
      'Straighten the knees fully.',
      'Squeeze the quads for a beat at the top.',
      'Lower slowly — do not let the stack drop.',
    ],
    mistakes: [
      'Knees not lined up with the pivot, which strains the joint.',
      'Swinging the weight up with a hip thrust.',
      'Letting the weight slam down between reps.',
    ],
    tip: 'A one-second hold at the top is worth more than two extra reps.',
  },
  {
    slug: 'seated-leg-curl',
    name: 'Seated Leg Curl',
    aliases: ['leg curl', 'hamstring curl', 'lying leg curl', 'leg curls', 'seated hamstring curl'],
    category: 'Legs',
    equipment: 'Leg curl machine',
    primary: ['Hamstrings'],
    secondary: ['Calves'],
    setup: [
      'Knees in line with the machine’s pivot.',
      'Ankle pad across the back of the ankle, not the calf.',
      'Thigh pad locked down so the hips cannot lift.',
    ],
    execution: [
      'Curl the heels as far under the seat as they will go.',
      'Point the toes up toward your shins to bias the hamstrings.',
      'Return slowly to straight legs.',
    ],
    mistakes: [
      'Hips bouncing out of the seat to finish the rep.',
      'Only curling halfway.',
      'Letting the weight yank the legs straight on the return.',
    ],
    tip: 'Toes pulled up toward your shins makes the hamstrings work noticeably harder.',
  },
  {
    slug: 'lunge',
    name: 'Lunge',
    aliases: ['lunges', 'walking lunge', 'reverse lunge', 'split squat', 'bulgarian split squat', 'dumbbell lunge'],
    category: 'Legs',
    equipment: 'Bodyweight or dumbbells',
    primary: ['Quads', 'Glutes'],
    secondary: ['Hamstrings', 'Calves', 'Core'],
    setup: [
      'Step into a split stance, feet about hip-width apart side to side.',
      'Torso upright, core braced.',
      'Weight into the front heel.',
    ],
    execution: [
      'Lower the back knee toward the floor.',
      'Keep the front shin close to vertical with the knee over the ankle.',
      'Drive up through the front heel to stand tall, hips square.',
    ],
    mistakes: [
      'Leaning the torso forward over the front knee.',
      'Letting the front knee cave inward.',
      'Taking too short a step, which jams the front knee forward.',
    ],
    tip: 'A longer step hits the glutes; a shorter step hits the quads.',
  },
  {
    slug: 'hip-thrust',
    name: 'Hip Thrust',
    aliases: ['barbell hip thrust', 'glute bridge', 'hip thrusts', 'glute thrust'],
    category: 'Legs',
    equipment: 'Barbell + bench',
    primary: ['Glutes'],
    secondary: ['Hamstrings', 'Quads'],
    setup: [
      'Shoulder blades resting on the edge of the bench.',
      'Bar across the hip crease, on a pad.',
      'Set the feet so the shins will be vertical at the top.',
    ],
    execution: [
      'Drive the hips up until the torso is level with the knees.',
      'Squeeze the glutes hard at the top with the ribs pulled down.',
      'Lower under control without resting the bar on the floor.',
    ],
    mistakes: [
      'Over-extending the lower back instead of finishing with the glutes.',
      'Looking up at the ceiling, which drags the back into extension.',
      'Feet too close, turning it into a quad exercise.',
    ],
    tip: 'Tuck the chin and look at the wall ahead — the hips will find the right finish.',
  },
  {
    slug: 'calf-raise',
    name: 'Calf Raise',
    aliases: ['standing calf raise', 'seated calf raise', 'calf raises', 'calves', 'calf press'],
    category: 'Legs',
    equipment: 'Step, machine or Smith machine',
    primary: ['Calves'],
    secondary: [],
    setup: [
      'Balls of the feet on the step, heels hanging free.',
      'Legs straight for the gastrocnemius; bent for the soleus.',
      'Hold something for balance.',
    ],
    execution: [
      'Let the heels sink below the step for a full stretch.',
      'Rise as high onto the toes as you can.',
      'Pause a full second at the top, then lower slowly.',
    ],
    mistakes: [
      'Bouncing through a tiny range of motion.',
      'Skipping the stretch at the bottom.',
      'Rolling onto the outside edge of the foot.',
    ],
    tip: 'Calves respond to the pause at the top. Count to one on every rep.',
  },
  {
    slug: 'deadlift',
    name: 'Deadlift',
    aliases: ['conventional deadlift', 'deadlifts', 'barbell deadlift', 'sumo deadlift'],
    category: 'Legs',
    equipment: 'Barbell',
    primary: ['Hamstrings', 'Glutes', 'Lower back'],
    secondary: ['Quads', 'Upper back', 'Forearms'],
    setup: [
      'Bar over the mid-foot, almost touching the shins.',
      'Hinge down and grip just outside the knees.',
      'Hips above the knees, chest up, back flat, lats tight.',
    ],
    execution: [
      'Take the slack out of the bar, then push the floor away.',
      'Keep the bar dragging up the legs the whole way.',
      'Stand tall with the hips and knees locked, glutes squeezed.',
    ],
    mistakes: [
      'Letting the hips shoot up first so it becomes a stiff-leg pull.',
      'Rounding the lower back.',
      'Leaning back at the top to "finish" the lift.',
    ],
    tip: 'If the bar drifts away from your legs, the back takes the load instead of the hips.',
  },
  {
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    aliases: ['rdl', 'romanian dead lift', 'stiff leg deadlift', 'straight leg deadlift', 'dumbbell rdl'],
    category: 'Legs',
    equipment: 'Barbell or dumbbells',
    primary: ['Hamstrings', 'Glutes'],
    secondary: ['Lower back', 'Forearms'],
    setup: [
      'Stand tall holding the bar at the thighs.',
      'Soft bend in the knees, held constant.',
      'Shoulders back, lats tight, bar against the legs.',
    ],
    execution: [
      'Push the hips straight back and let the bar drag down the thighs.',
      'Stop when the hamstrings run out of stretch — usually just below the knee.',
      'Drive the hips forward to stand, finishing with the glutes.',
    ],
    mistakes: [
      'Bending the knees more as you descend, which turns it into a deadlift.',
      'Rounding the back to chase extra depth.',
      'Letting the bar drift forward away from the legs.',
    ],
    tip: 'Depth is set by your hamstrings, not by touching the floor.',
  },

  // ------------------------------------------------------------------- core
  {
    slug: 'plank',
    name: 'Plank',
    aliases: ['front plank', 'forearm plank', 'planks'],
    category: 'Core',
    equipment: 'Bodyweight',
    primary: ['Abs'],
    secondary: ['Glutes', 'Shoulders'],
    setup: [
      'Elbows directly under the shoulders.',
      'Body in one line from heel to head.',
      'Feet about hip-width for a stable base.',
    ],
    execution: [
      'Squeeze the glutes and brace the stomach as if about to be prodded.',
      'Hold the line — hips level with the shoulders.',
      'Breathe normally; end the set when the hips start to drop.',
    ],
    mistakes: [
      'Hips sagging, which loads the lower back.',
      'Hips piking up into an easy tent shape.',
      'Holding your breath.',
    ],
    tip: 'Thirty hard seconds beats two soft minutes.',
  },
  {
    slug: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    aliases: ['hanging knee raise', 'leg raise', 'leg raises', 'captains chair raise'],
    category: 'Core',
    equipment: 'Pull-up bar or captain’s chair',
    primary: ['Abs (especially lower)'],
    secondary: ['Hip flexors', 'Forearms'],
    setup: [
      'Hang with the shoulders pulled down, not slack.',
      'Legs together, toes pointed.',
      'Kill any swing before the first rep.',
    ],
    execution: [
      'Lift the legs to at least hip height.',
      'Curl the pelvis up at the top — that is the part the abs do.',
      'Lower slowly without letting the body swing.',
    ],
    mistakes: [
      'Swinging and using momentum.',
      'Stopping at 90° and never curling the pelvis.',
      'Dropping the legs and bouncing out of the bottom.',
    ],
    tip: 'Bend the knees if you cannot keep the legs straight — the abs do not care.',
  },
  {
    slug: 'cable-crunch',
    name: 'Cable Crunch',
    aliases: ['kneeling cable crunch', 'rope crunch', 'cable ab crunch', 'crunch', 'crunches'],
    category: 'Core',
    equipment: 'Cable + rope',
    primary: ['Abs'],
    secondary: [],
    setup: [
      'Kneel under a high pulley with the rope beside your ears.',
      'Hips stay back over the heels for the whole set.',
      'Hands fixed in place — they never pull the weight.',
    ],
    execution: [
      'Round the spine down, driving the elbows toward the thighs.',
      'Squeeze the abs hard at the bottom.',
      'Return slowly until the abs are stretched.',
    ],
    mistakes: [
      'Hinging at the hips instead of crunching the spine.',
      'Pulling with the arms.',
      'Letting the hips drift forward as you crunch.',
    ],
    tip: 'Your hips should not move at all. Only your ribs travel toward your pelvis.',
  },
];

// ------------------------------------------------------------------ lookup

const normalize = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Words people add that never change which movement they mean.
const MODIFIERS = [
  'assisted', 'machine', 'cable', 'dumbbell', 'db', 'barbell', 'bb',
  'smith', 'seated', 'standing', 'wide', 'close',
  'grip', 'neutral', 'single', 'arm', 'alternating', 'weighted', 'bodyweight',
];

const stripModifiers = (key) =>
  key
    .split(' ')
    .filter((w) => !MODIFIERS.includes(w))
    .join(' ');

const INDEX = new Map();
EXERCISE_GUIDES.forEach((guide) => {
  [guide.name, ...guide.aliases].forEach((label) => {
    const key = normalize(label);
    if (key && !INDEX.has(key)) INDEX.set(key, guide);
  });
});

// A second index on the stripped form, so "Machine chest press" lands on the
// right guide without needing an alias of its own. A stripped name that two
// guides could claim — "row" is both a cable row and a barbell row — is
// dropped rather than guessed at.
const LOOSE_INDEX = new Map();
EXERCISE_GUIDES.forEach((guide) => {
  [guide.name, ...guide.aliases].forEach((label) => {
    const key = stripModifiers(normalize(label));
    if (!key) return;
    const held = LOOSE_INDEX.get(key);
    if (held === undefined) LOOSE_INDEX.set(key, guide);
    else if (held && held.slug !== guide.slug) LOOSE_INDEX.set(key, null);
  });
});

// Singular/plural is the other thing that differs run to run.
const depluralize = (key) =>
  key
    .split(' ')
    .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
    .join(' ');

export function findExerciseGuide(name) {
  const key = normalize(name);
  if (!key) return null;
  return (
    INDEX.get(key) ||
    INDEX.get(depluralize(key)) ||
    LOOSE_INDEX.get(stripModifiers(key)) ||
    LOOSE_INDEX.get(depluralize(stripModifiers(key))) ||
    null
  );
}

export const hasExerciseGuide = (name) => findExerciseGuide(name) !== null;

// Every movement the app knows about, for the "add exercise" suggestions.
export const GUIDE_EXERCISE_NAMES = EXERCISE_GUIDES.map((g) => g.name);

export const GUIDES_BY_SLUG = EXERCISE_GUIDES.reduce((acc, g) => {
  acc[g.slug] = g;
  return acc;
}, {});
