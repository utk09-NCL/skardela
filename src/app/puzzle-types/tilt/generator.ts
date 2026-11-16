// The generator of Tilt puzzles. It makes random boards from a seed and keeps the first board that passes
// all data checks: "findPuzzleProblems" in "puzzle.ts" and "findSolutionProblems" in "solver.ts".
// It is pure: no React, no DOM and no side effects. The worker runs it. See "src/app/generator.ts".
import { firstGoodPuzzle } from "../../../shared/generate";
import type { PuzzleBase } from "../../../shared/puzzle";
import { makeRandom, pickOne } from "../../../shared/random";
import {
  ballSquares,
  findPuzzleProblems,
  holeSquares,
  levelRules,
  type Square,
  type TiltPuzzle,
} from "./puzzle";
import { findSolutionProblems } from "./solver";

// ---------- A random board ----------

// A whole number from "low" to "high". Both numbers are possible.
function between(random: () => number, low: number, high: number): number {
  return low + Math.floor(random() * (high - low + 1));
}

// A piece on a random empty square. The board always has an empty square, because the largest number of pieces
// (10 walls, 4 balls and 3 holes on hard) is less than the number of squares.
function place(cells: Square[], square: Square, random: () => number) {
  const free = [...cells.keys()].filter((index) => cells[index] === ".");
  const index = pickOne(free, random);
  if (index !== undefined) cells[index] = square;
}

function rowsOf(size: number, cells: readonly Square[]): string[] {
  return Array.from({ length: size }, (_, row) =>
    cells.slice(row * size, row * size + size).join(""),
  );
}

// One random board for a seed. The same seed always gives the same board.
// It has the walls of "## Puzzles" in "rules.md", and the balls and the holes of the level.
export function candidate(seed: number, base: PuzzleBase): TiltPuzzle {
  const rules = levelRules[base.difficulty];
  const random = makeRandom(seed);
  const cells: Square[] = Array.from({ length: rules.size * rules.size }, () => ".");
  for (let count = between(random, rules.walls.min, rules.walls.max); count > 0; count -= 1) {
    place(cells, "#", random);
  }
  for (const colour of rules.colours) {
    place(cells, ballSquares[colour], random);
    place(cells, holeSquares[colour], random);
  }
  if (rules.hasGrey) place(cells, ballSquares.grey, random);
  return { ...base, type: "tilt", board: rowsOf(rules.size, cells) };
}

// A good puzzle passes all data checks. The search checks run only when the board has no other problem,
// because the search needs a valid board.
export function isGoodPuzzle(puzzle: TiltPuzzle): boolean {
  return findPuzzleProblems(puzzle).length === 0 && findSolutionProblems(puzzle).length === 0;
}

// About 1 easy board in 25 is good, and more on the other levels. Thus the search always ends long before this limit.
const maxTries = 10_000;

// The puzzle of an ID: the first good board from the seed of the ID.
export function generate(base: PuzzleBase): TiltPuzzle {
  return firstGoodPuzzle(base.id, maxTries, (seed) => candidate(seed, base), isGoodPuzzle);
}
