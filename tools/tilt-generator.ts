// The generator of new Tilt puzzles. It makes random boards from a seed and keeps only the boards that pass
// all data checks: "findPuzzleProblems" in "puzzle.ts" and "findSolutionProblems" in "solver.ts".
// It is pure: it does not read or write files. "generate-tilt.gen.ts" adds its puzzles to "puzzles/tilt.json".
import {
  ballSquares,
  findPuzzleProblems,
  holeSquares,
  levelRules,
  type Square,
  type TiltPuzzle,
} from "../src/app/puzzle-types/tilt/puzzle";
import { findSolutionProblems } from "../src/app/puzzle-types/tilt/solver";
import type { Difficulty } from "../src/shared/difficulty";
import { makeRandom, pickOne } from "../src/shared/random";
import {
  generatePuzzles,
  jsonWithRows,
  type GenerateOptions,
  type LevelPlanItem,
} from "./generator-script";

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

// One random board for a seed. The same seed always gives the same board. The ID is a placeholder.
// It has the walls of "## Puzzles" in "rules.md", and the balls and the holes of the level.
export function candidate(seed: number, level: Difficulty): TiltPuzzle {
  const rules = levelRules[level];
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
  return {
    id: "tilt-0000",
    type: "tilt",
    difficulty: level,
    author: "skardela",
    license: "CC-BY-4.0",
    board: rowsOf(rules.size, cells),
  };
}

// A good puzzle passes all data checks. The search checks run only when the board has no other problem,
// because the search needs a valid board.
export function isGoodPuzzle(puzzle: TiltPuzzle): boolean {
  return findPuzzleProblems(puzzle).length === 0 && findSolutionProblems(puzzle).length === 0;
}

// ---------- The plan ----------

// A key of a board, so two puzzles with the same board are the same puzzle.
export function boardKey(puzzle: Pick<TiltPuzzle, "board">): string {
  return puzzle.board.join("/");
}

// This makes the puzzles of the plan. See "generatePuzzles" in "generator-script.ts".
export function generate(plan: readonly LevelPlanItem[], options: GenerateOptions) {
  return generatePuzzles(plan, options, {
    candidate: (seed, item) => candidate(seed, item.level),
    isGoodPuzzle,
    boardKey,
  });
}

// The text of the puzzle file, with each board on one line, as in the example.
export function puzzleFileText(puzzles: readonly TiltPuzzle[]): string {
  return jsonWithRows(puzzles, ["board"]);
}
