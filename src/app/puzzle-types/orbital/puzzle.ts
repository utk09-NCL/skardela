import type { Difficulty } from "../../../shared/difficulty";
import type { PuzzleBase } from "../../../shared/puzzle";

// A point on the board, in units. See "## Edge cases" in "rules.md":
// x is 0 at the left edge and 100 at the right edge. y is 0 at the bottom edge and 100 at the top edge.
// Thus y goes up, as in the angle rule: 90° points up.
export type Point = { readonly x: number; readonly y: number };

// The three planet sizes. See "## Board": "A planet is small, medium or big."
export const planetSizes = ["small", "medium", "big"] as const;
export type PlanetSize = (typeof planetSizes)[number];

// One planet: the centre of its circle and its size.
export type Planet = Point & { readonly size: PlanetSize };

export type OrbitalPuzzle = PuzzleBase & {
  readonly type: "orbital";
  // The launch point. Each launch starts here.
  readonly launch: Point;
  // The centre of the ring. The level gives its radius (see "levelRules").
  readonly ring: Point;
  // One item for each planet.
  readonly planets: readonly Planet[];
};

// The board is a square of 100 × 100 units. Each x and y of the puzzle data is a whole number from 0 to this number.
export const boardSize = 100;

// The radius in units and the pull of each planet size. See the table in "## Edge cases".
// The pull grows with the area of the planet. A big planet pulls more than a medium planet,
// and a medium planet pulls more than a small planet.
export const sizeRules: Readonly<
  Record<PlanetSize, { readonly radius: number; readonly pull: number }>
> = {
  small: { radius: 4, pull: 1 },
  medium: { radius: 6, pull: 2.25 },
  big: { radius: 8, pull: 4 },
};

export type LevelRules = {
  // The number of planets on a board of this level.
  readonly planets: number;
  // The radius of the ring in units.
  readonly ringRadius: number;
  // "true": the data check needs a planet that touches the straight line from the launch point
  // to the centre of the ring.
  readonly needsPlanetOnLine: boolean;
  // The smallest number of good launches that the data check accepts. See "goodLaunches" in "solver.ts".
  readonly minGoodLaunches: number;
};

// The table in "## Board", the ring radius in "## Edge cases" and the minimum good launches in "## Puzzle data".
export const levelRules: Readonly<Record<Difficulty, LevelRules>> = {
  easy: { planets: 1, ringRadius: 6, needsPlanetOnLine: false, minGoodLaunches: 20 },
  medium: { planets: 2, ringRadius: 5, needsPlanetOnLine: true, minGoodLaunches: 10 },
  hard: { planets: 3, ringRadius: 4, needsPlanetOnLine: true, minGoodLaunches: 5 },
};

// The space between the items that the data check needs. See "## Puzzle data".
// The distance from the launch point to the centre of the ring is this number of units or more.
export const minRingDistance = 50;
// The edge of a planet is this number of units or more from the launch point.
export const minLaunchGap = 8;
// The edge of a planet is this number of units or more from the edge of the ring and from the edge of each other planet.
export const minPlanetGap = 4;

// The data check of a puzzle, with no flight. It gives one text for each rule below that the puzzle breaks,
// and an empty list for a puzzle with no problems. Thus each rule gives one text or no text.
// It finds these problems from "## Puzzle data" in "rules.md":
// - An "x" or a "y" is not a whole number from 0 to 100, or a "size" is not "small", "medium" or "big".
// - The number of planets is not the number of its level ("levelRules").
// - The ring or a planet is not fully on the board. The ring has the radius of its level.
// - The distance from the launch point to the centre of the ring is less than "minRingDistance".
// - The edge of a planet is less than "minLaunchGap" from the launch point.
// - The edge of a planet is less than "minPlanetGap" from the edge of the ring or from the edge of a different planet.
// - Medium and hard ("needsPlanetOnLine"): no planet touches the straight line from the launch point to the centre
//   of the ring. The line starts at the launch point and stops at the centre of the ring.
//   A planet touches the line when the distance from its centre to the line is its radius or less.
// The checks that need a flight are in "findSolutionProblems" in "solver.ts".
export function findPuzzleProblems(puzzle: OrbitalPuzzle): string[] {
  const level = levelRules[puzzle.difficulty] as LevelRules | undefined;
  if (level === undefined) {
    return [`"difficulty" must be one of: ${Object.keys(levelRules).join(", ")}.`];
  }
  const ring = { ...puzzle.ring, radius: level.ringRadius };
  const circles = planetCircles(puzzle.planets);
  const checks: readonly [boolean, string][] = [
    [
      hasDataProblem(puzzle),
      `Each "x" and "y" must be a whole number from 0 to ${boardSize}. Each "size" must be "small", "medium" or "big".`,
    ],
    [
      puzzle.planets.length !== level.planets,
      `The level "${puzzle.difficulty}" must have ${level.planets} ${level.planets === 1 ? "planet" : "planets"}. The puzzle has ${puzzle.planets.length}.`,
    ],
    [
      [ring, ...circles].some((circle) => !isOnBoard(circle)),
      "The ring and each planet must be fully on the board.",
    ],
    [
      squaredDistance(puzzle.launch, puzzle.ring) < minRingDistance ** 2,
      `The centre of the ring must be ${minRingDistance} units or more from the launch point.`,
    ],
    [
      circles.some((planet) => isCloser(planet, { ...puzzle.launch, radius: 0 }, minLaunchGap)),
      `The edge of each planet must be ${minLaunchGap} units or more from the launch point.`,
    ],
    [
      isCrowded(circles, ring),
      `The edge of each planet must be ${minPlanetGap} units or more from the edge of the ring and from the edge of each other planet.`,
    ],
    [
      level.needsPlanetOnLine &&
        !circles.some((planet) => touchesLine(planet, puzzle.launch, puzzle.ring)),
      `On the level "${puzzle.difficulty}", a planet must touch the straight line from the launch point to the centre of the ring.`,
    ],
  ];
  return checks.filter(([isProblem]) => isProblem).map(([, problem]) => problem);
}

// A circle on the board: a centre and a radius in units.
type Circle = Point & { readonly radius: number };

// The circle of each planet. A planet with a size that is not in "sizeRules" has no radius,
// thus the checks of the space between the items use only the other planets.
// "hasDataProblem" gives the problem of its size.
function planetCircles(planets: readonly Planet[]): Circle[] {
  return planets
    .filter((planet) => isPlanetSize(planet.size))
    .map((planet) => ({ x: planet.x, y: planet.y, radius: sizeRules[planet.size].radius }));
}

// "true" when the edge of a planet is less than "minPlanetGap" from the edge of the ring
// or from the edge of a different planet.
function isCrowded(planets: readonly Circle[], ring: Circle): boolean {
  return planets.some(
    (planet, index) =>
      isCloser(planet, ring, minPlanetGap) ||
      planets.slice(index + 1).some((other) => isCloser(planet, other, minPlanetGap)),
  );
}

function isPlanetSize(size: unknown): boolean {
  return (planetSizes as readonly unknown[]).includes(size);
}

// "true" when the value is a whole number from 0 to "boardSize".
function isCoordinate(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= boardSize;
}

// "true" when an "x" or a "y" is not a whole number from 0 to 100, or a "size" is not a planet size.
function hasDataProblem(puzzle: OrbitalPuzzle): boolean {
  const points = [puzzle.launch, puzzle.ring, ...puzzle.planets];
  return (
    points.some((point) => !isCoordinate(point.x) || !isCoordinate(point.y)) ||
    puzzle.planets.some((planet) => !isPlanetSize(planet.size))
  );
}

// "true" when the full circle is on the board. A circle can touch the edge of the board.
function isOnBoard(circle: Circle): boolean {
  return (
    circle.x - circle.radius >= 0 &&
    circle.x + circle.radius <= boardSize &&
    circle.y - circle.radius >= 0 &&
    circle.y + circle.radius <= boardSize
  );
}

// The checks below compare squared distances. With whole numbers, a squared distance is exact,
// thus a distance that is exactly on a limit gives the correct result.
function squaredDistance(from: Point, to: Point): number {
  return (to.x - from.x) ** 2 + (to.y - from.y) ** 2;
}

// "true" when the edges of the two circles are less than "gap" units apart.
// A circle with the radius 0 is a point, for example the launch point.
function isCloser(first: Circle, second: Circle, gap: number): boolean {
  return squaredDistance(first, second) < (first.radius + second.radius + gap) ** 2;
}

// "true" when the planet touches the straight line from "start" to "end": the distance from the centre of the planet
// to the nearest point of the line is its radius or less. The line stops at "start" and at "end".
function touchesLine(planet: Circle, start: Point, end: Point): boolean {
  const lineX = end.x - start.x;
  const lineY = end.y - start.y;
  const toX = planet.x - start.x;
  const toY = planet.y - start.y;
  const squaredLength = lineX * lineX + lineY * lineY;
  const along = toX * lineX + toY * lineY;
  const radius = planet.radius ** 2;
  // The nearest point of the line is "start" or "end", or a point between them.
  if (squaredLength === 0 || along <= 0) return squaredDistance(planet, start) <= radius;
  if (along >= squaredLength) return squaredDistance(planet, end) <= radius;
  // The squared distance to the line is "cross² ÷ squaredLength". This form has no division.
  const cross = toX * lineY - toY * lineX;
  return cross * cross <= radius * squaredLength;
}
