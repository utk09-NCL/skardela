// The generator of Orbital puzzles. It makes random boards from a seed and keeps the first board that passes
// all data checks: "findPuzzleProblems" in "puzzle.ts" and "findSolutionProblems" in "solver.ts".
// It is pure: no React, no DOM and no side effects. The worker runs it. See "src/app/generator.ts".
// It uses only maths that gives the same result in each browser. See "trig.ts".
import { firstGoodPuzzle } from "../../../shared/generate";
import type { PuzzleBase } from "../../../shared/puzzle";
import { makeRandom, pickOne } from "../../../shared/random";
import {
  boardSize,
  findPuzzleProblems,
  levelRules,
  planetSizes,
  sizeRules,
  type OrbitalPuzzle,
  type Planet,
  type Point,
} from "./puzzle";
import { findSolutionProblems } from "./solver";

// ---------- A random board ----------

// The four edges of the board, and the opposite edge of each one.
const edges = ["bottom", "top", "left", "right"] as const;
type Edge = (typeof edges)[number];
const opposite: Readonly<Record<Edge, Edge>> = {
  bottom: "top",
  top: "bottom",
  left: "right",
  right: "left",
};

// A whole number from "low" to "high". Both numbers are possible.
function between(random: () => number, low: number, high: number): number {
  return low + Math.floor(random() * (high - low + 1));
}

// A point "depth" units from the edge, and "along" units along the edge.
function nearEdge(edge: Edge, along: number, depth: number): Point {
  switch (edge) {
    case "bottom":
      return { x: along, y: depth };
    case "top":
      return { x: along, y: boardSize - depth };
    case "left":
      return { x: depth, y: along };
    case "right":
      return { x: boardSize - depth, y: along };
  }
}

// A whole number that stays in the range from "low" to "high".
function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, Math.round(value)));
}

// A planet near the straight line from the launch point to the centre of the ring, between them.
// Thus it is in the way of the straight launch. On medium and hard, a planet must touch this line.
function planetNearLine(random: () => number, launch: Point, ring: Point): Planet {
  const size = pickOne(planetSizes, random) ?? "big";
  const { radius } = sizeRules[size];
  const along = between(random, 30, 70) / 100;
  const dx = ring.x - launch.x;
  const dy = ring.y - launch.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  // The offset is at a right angle to the line. It is never more than the radius of the planet.
  const offset = between(random, -radius, radius);
  const x = launch.x + dx * along - (dy / length) * offset;
  const y = launch.y + dy * along + (dx / length) * offset;
  return {
    x: clamp(x, radius, boardSize - radius),
    y: clamp(y, radius, boardSize - radius),
    size,
  };
}

// A planet at a random place, fully on the board.
function randomPlanet(random: () => number): Planet {
  const size = pickOne(planetSizes, random) ?? "big";
  const { radius } = sizeRules[size];
  return {
    x: between(random, radius, boardSize - radius),
    y: between(random, radius, boardSize - radius),
    size,
  };
}

// One random board for a seed. The same seed always gives the same board.
// See "## Puzzles" in "rules.md": the launch point is near a random edge, and the ring is near the opposite edge.
// The first planet is near the straight line to the ring. The other planets are at random places.
export function candidate(seed: number, base: PuzzleBase): OrbitalPuzzle {
  const rules = levelRules[base.difficulty];
  const random = makeRandom(seed);
  const edge = pickOne(edges, random) ?? "bottom";
  const launch = nearEdge(edge, between(random, 10, 90), between(random, 4, 14));
  const ringDepth = between(random, rules.ringRadius, rules.ringRadius + 12);
  const ring = nearEdge(opposite[edge], between(random, 10, 90), ringDepth);
  const planets = [planetNearLine(random, launch, ring)];
  while (planets.length < rules.planets) planets.push(randomPlanet(random));
  return { ...base, type: "orbital", launch, ring, planets };
}

// A good puzzle passes all data checks. The flight checks run only when the board has no other problem,
// because the search needs a valid board.
export function isGoodPuzzle(puzzle: OrbitalPuzzle): boolean {
  return findPuzzleProblems(puzzle).length === 0 && findSolutionProblems(puzzle).length === 0;
}

// About 1 board in 2 is good. Thus the search always ends long before this limit.
const maxTries = 1000;

// The puzzle of an ID: the first good board from the seed of the ID.
export function generate(base: PuzzleBase): OrbitalPuzzle {
  return firstGoodPuzzle(base.id, maxTries, (seed) => candidate(seed, base), isGoodPuzzle);
}
