import {
  boardSize,
  levelRules,
  sizeRules,
  type OrbitalPuzzle,
  type Planet,
  type Point,
} from "./puzzle";

// The pure rules of Orbital: read a board, fly a launch, and aim with a drag. No React and no side effects.
// All points are in units, with y up. See "Point" in "puzzle.ts".

// The angle and the power of one launch.
// "angle" is a whole number of degrees from 0 to 359. 0° points right, 90° points up, 180° left and 270° down.
// "power" is a whole number from 1 to 10.
export type Aim = { readonly angle: number; readonly power: number };

// The values of the sliders at the start. See "## Edge cases": "At the start, the angle is 0° and the power is 5."
export const startAim: Aim = { angle: 0, power: 5 };

// The smallest and the largest angle and power. See "## Rules" and "## Edge cases".
export const maxAngle = 359;
export const minPower = 1;
export const maxPower = 10;

// The numbers of the flight. See "### Flight" in "## Edge cases".
// At the launch, the speed is "speedPerPower" × power units per second.
export const speedPerPower = 6;
// The pull of a planet changes the velocity by "gravity" × pull ÷ d² units per second, in each second.
export const gravity = 400;
// The flight has steps of 1 ÷ "stepsPerSecond" s.
export const stepsPerSecond = 60;
// The maximum number of steps: 4 s.
export const maxSteps = 240;

// The numbers of the drag. See "### Sliders and drag" in "## Edge cases".
// A drag starts only when the pointer goes down this number of units or less from the launch point.
export const dragStartDistance = 7;
// A drag of this length in units gives 1 power.
export const dragUnitsPerPower = 4;

// The board as the game uses it. It does not change during a game.
export type Board = {
  readonly launch: Point;
  readonly ring: Point;
  // The radius of the ring of the level, from "levelRules" in "puzzle.ts".
  readonly ringRadius: number;
  // The planets in the order of the puzzle data.
  readonly planets: readonly Planet[];
};

// Why a flight stopped. See "## Rules": "The flight stops when the probe reaches the ring, hits a planet,
// goes off the board or flies for the maximum time."
// "ring": the probe reached the ring. "planet": the probe hit "planet", an item of "planets" of the board.
// "edge": the probe went off the board. "time": the probe flew for 4 s and stopped.
export type FlightEnd =
  | { readonly type: "ring" }
  | { readonly type: "planet"; readonly planet: Planet }
  | { readonly type: "edge" }
  | { readonly type: "time" };

// One launch from start to end.
export type Flight = {
  readonly aim: Aim;
  // The launch point, then the position of the probe after each step.
  // Thus the number of steps is "path.length - 1", from 1 to "maxSteps". The last point is where the flight stopped.
  readonly path: readonly Point[];
  readonly end: FlightEnd;
  // "Closest to the ring": the smallest distance from a point of "path" to the edge of the ring, rounded up
  // to a whole unit. It is 1 or more for a miss. It is 0 (not -0) for a flight that reaches the ring.
  readonly closest: number;
};

// The board of a puzzle: its launch point, its ring, the ring radius of its level and its planets.
// Use it only for a puzzle with no problems from "findPuzzleProblems", or for a puzzle that a test makes.
export function readBoard(puzzle: OrbitalPuzzle): Board {
  return {
    launch: puzzle.launch,
    ring: puzzle.ring,
    ringRadius: levelRules[puzzle.difficulty].ringRadius,
    planets: puzzle.planets,
  };
}

// "true" when the aim obeys the rules: the angle is a whole number from 0 to "maxAngle",
// and the power is a whole number from "minPower" to "maxPower".
export function isAim(aim: Aim): boolean {
  const { angle, power } = aim;
  return (
    Number.isInteger(angle) &&
    angle >= 0 &&
    angle <= maxAngle &&
    Number.isInteger(power) &&
    power >= minPower &&
    power <= maxPower
  );
}

// The distance between two points, in units.
function distance(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

// A planet as "fly" uses it: the numbers of its size are read one time for each flight, not in each step.
// "pull" is "gravity" × the pull of its size.
type Body = {
  readonly x: number;
  readonly y: number;
  readonly pull: number;
  readonly squaredRadius: number;
  readonly planet: Planet;
};

function bodyOf(planet: Planet): Body {
  const { pull, radius } = sizeRules[planet.size];
  return { x: planet.x, y: planet.y, pull: gravity * pull, squaredRadius: radius * radius, planet };
}

// Why the flight stops at the point x, y, or "null" when it continues. The checks are in the order of the rules:
// the ring first, then each planet in the order of the board, then the edge of the board.
// "toRing" is the squared distance from the point to the centre of the ring.
// The checks compare squared distances with squared radii. The square root is monotonic, thus the result is the same,
// and "fly" needs fewer square roots. Thus the data check of all puzzles stays fast.
function endAt(board: Board, bodies: readonly Body[], x: number, y: number, toRing: number) {
  if (toRing <= board.ringRadius * board.ringRadius) return { type: "ring" } as const;
  for (const body of bodies) {
    const dx = body.x - x;
    const dy = body.y - y;
    if (dx * dx + dy * dy <= body.squaredRadius) {
      return { type: "planet", planet: body.planet } as const;
    }
  }
  const isOnBoard = x >= 0 && x <= boardSize && y >= 0 && y <= boardSize;
  return isOnBoard ? null : ({ type: "edge" } as const);
}

// Flies one launch from the launch point, with the steps of "### Flight" in "## Edge cases":
// - At the launch, the speed is "speedPerPower" × power units per second, in the direction of the angle.
//   Thus the velocity is (speed × cos(angle), speed × sin(angle)), because y goes up.
// - In each step, in this order:
//   1. Each planet changes the velocity by "gravity" × pull ÷ d² × 1/60, to the centre of the planet.
//      d is the distance from the probe to the centre of the planet, before the step.
//   2. The probe moves by its new velocity × 1/60.
//   3. It checks the new position, in this order: the distance to the centre of the ring is "ringRadius" or less
//      ("ring"), the distance to the centre of a planet is its radius or less ("planet"),
//      x or y is less than 0 or more than 100 ("edge").
// - After step "maxSteps", the flight stops with "time".
// It does not check the positions between two steps. The same board and the same aim always give the same flight.
// Use it only for an aim that "isAim" allows.
export function fly(board: Board, aim: Aim): Flight {
  const time = 1 / stepsPerSecond;
  const speed = speedPerPower * aim.power;
  const radians = toRadians(aim.angle);
  const { ring } = board;
  const bodies = board.planets.map((planet) => bodyOf(planet));
  let vx = speed * Math.cos(radians);
  let vy = speed * Math.sin(radians);
  let { x, y } = board.launch;
  const path: Point[] = [board.launch];
  // The smallest squared distance from a point of the path to the centre of the ring. See "closest" in "Flight".
  let nearest = (ring.x - x) ** 2 + (ring.y - y) ** 2;
  let end: FlightEnd | null = null;
  for (let step = 1; step <= maxSteps && end === null; step += 1) {
    // 1. Each planet pulls the probe to its centre. All planets use the position before the step.
    let ax = 0;
    let ay = 0;
    for (const body of bodies) {
      const dx = body.x - x;
      const dy = body.y - y;
      const squared = dx * dx + dy * dy;
      const change = body.pull / squared;
      const length = Math.sqrt(squared);
      ax += (change * dx) / length;
      ay += (change * dy) / length;
    }
    vx += ax * time;
    vy += ay * time;
    // 2. The probe moves by its new velocity.
    x += vx * time;
    y += vy * time;
    path.push({ x, y });
    // 3. The new position can stop the flight.
    const toRingX = ring.x - x;
    const toRingY = ring.y - y;
    const toRing = toRingX * toRingX + toRingY * toRingY;
    if (toRing < nearest) nearest = toRing;
    end = endAt(board, bodies, x, y, toRing);
  }
  if (end === null) end = { type: "time" };
  // A flight that reaches the ring is 0 from the ring. A miss is rounded up. "Math.max" changes a -0 to 0.
  const closest =
    end.type === "ring" ? 0 : Math.max(0, Math.ceil(Math.sqrt(nearest) - board.ringRadius));
  return { aim, path, end, closest };
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// The angle of the line from "from" to "to", rounded to a whole degree. A half rounds up. 360° is 0°.
// "atan2" gives an angle from -180° to 180°. The first "% 360" makes it 0° to 359.9…°.
function angleOf(from: Point, to: Point): number {
  const degrees = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  return Math.round((degrees + 360) % 360) % 360;
}

// The angle of the line from the launch point to the centre of the ring, rounded to a whole degree.
// A half rounds up, as "Math.round" does. 360° is 0°. Thus the result is a whole number from 0 to 359.
// The data check uses it: a launch at this angle must not reach the ring at any power.
export function straightAngle(board: Board): number {
  return angleOf(board.launch, board.ring);
}

// "true" when the pointer is "dragStartDistance" units or less from the launch point.
// See "## Edge cases": "A drag starts only when the pointer goes down 7 units or less from the launch point."
export function canStartDrag(launch: Point, pointer: Point): boolean {
  return distance(launch, pointer) <= dragStartDistance;
}

// The aim of a drag that ends at "pointer". See "### Sliders and drag" in "## Edge cases":
// - The angle is the angle from "pointer" to "launch", rounded to a whole degree. A half rounds up. 360° is 0°.
// - The power is the distance from "launch" to "pointer" ÷ "dragUnitsPerPower", rounded to a whole number.
//   A half rounds up. A power more than "maxPower" is "maxPower".
// The result is "null" when the power is 0, thus for a drag shorter than 2 units. Its release does nothing.
// For example, launch (30, 10) and pointer (26, 4) give { angle: 56, power: 2 }.
export function aimOfDrag(launch: Point, pointer: Point): Aim | null {
  const power = Math.min(maxPower, Math.round(distance(launch, pointer) / dragUnitsPerPower));
  if (power === 0) return null;
  return { angle: angleOf(pointer, launch), power };
}
