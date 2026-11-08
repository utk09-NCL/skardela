// The generator of new Orbital puzzles. It makes random boards from a seed and keeps only the boards that pass
// all data checks: "findPuzzleProblems" in "puzzle.ts" and "findSolutionProblems" in "solver.ts".
// It is pure: it does not read or write files. "generate-orbital.gen.ts" adds its puzzles to "puzzles/orbital.json".
import {
  boardSize,
  findPuzzleProblems,
  levelRules,
  planetSizes,
  sizeRules,
  type OrbitalPuzzle,
  type Planet,
  type Point,
} from "../src/app/puzzle-types/orbital/puzzle";
import { findSolutionProblems } from "../src/app/puzzle-types/orbital/solver";
import type { Difficulty } from "../src/shared/difficulty";
import { makeRandom, pickOne } from "../src/shared/random";
import { generatePuzzles, type GenerateOptions, type LevelPlanItem } from "./generator-script";

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
  const length = Math.hypot(ring.x - launch.x, ring.y - launch.y);
  // The offset is at a right angle to the line. It is never more than the radius of the planet.
  const offset = between(random, -radius, radius);
  const x = launch.x + (ring.x - launch.x) * along - ((ring.y - launch.y) / length) * offset;
  const y = launch.y + (ring.y - launch.y) * along + ((ring.x - launch.x) / length) * offset;
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

// One random board for a seed. The same seed always gives the same board. The ID is a placeholder.
// See "## Puzzles" in "rules.md": the launch point is near a random edge, and the ring is near the opposite edge.
// The first planet is near the straight line to the ring. The other planets are at random places.
export function candidate(seed: number, level: Difficulty): OrbitalPuzzle {
  const rules = levelRules[level];
  const random = makeRandom(seed);
  const edge = pickOne(edges, random) ?? "bottom";
  const launch = nearEdge(edge, between(random, 10, 90), between(random, 4, 14));
  const ringDepth = between(random, rules.ringRadius, rules.ringRadius + 12);
  const ring = nearEdge(opposite[edge], between(random, 10, 90), ringDepth);
  const planets = [planetNearLine(random, launch, ring)];
  while (planets.length < rules.planets) planets.push(randomPlanet(random));
  return {
    id: "orbital-0000",
    type: "orbital",
    difficulty: level,
    author: "skardela",
    license: "CC-BY-4.0",
    launch,
    ring,
    planets,
  };
}

// A good puzzle passes all data checks. The flight checks run only when the board has no other problem,
// because the search needs a valid board.
export function isGoodPuzzle(puzzle: OrbitalPuzzle): boolean {
  return findPuzzleProblems(puzzle).length === 0 && findSolutionProblems(puzzle).length === 0;
}

// ---------- The plan ----------

// A key of a board, so two puzzles with the same board are the same puzzle.
export function boardKey(puzzle: Pick<OrbitalPuzzle, "launch" | "ring" | "planets">): string {
  return JSON.stringify([puzzle.launch, puzzle.ring, puzzle.planets]);
}

// This makes the puzzles of the plan. See "generatePuzzles" in "generator-script.ts".
export function generate(plan: readonly LevelPlanItem[], options: GenerateOptions) {
  return generatePuzzles(plan, options, {
    candidate: (seed, item) => candidate(seed, item.level),
    isGoodPuzzle,
    boardKey,
  });
}

// The text of the puzzle file, with each point and each planet on one line, as in the example.
// A point has no "}" in it, thus each point ends at the first "}". Run "npm run fix" after a change.
export function puzzleFileText(puzzles: readonly OrbitalPuzzle[]): string {
  const text = JSON.stringify(puzzles, null, 2);
  return `${text.replaceAll(/\{\n\s*("x"[^}]*?)\n\s*\}/gu, (_, fields: string) => `{ ${fields.split(/,\n\s*/u).join(", ")} }`)}\n`;
}
