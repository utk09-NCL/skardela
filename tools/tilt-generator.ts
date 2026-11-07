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
import { levels, type Difficulty } from "../src/shared/difficulty";
import { makeRandom, pickOne } from "../src/shared/random";

// One line of the plan: the number of puzzles to make for one level.
export type PlanItem = {
  readonly level: Difficulty;
  readonly count: number;
};

// The plan as text, for example "easy:30,medium:30,hard:30".
export function parsePlan(text: string): PlanItem[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => {
      const [level = "", count = ""] = item.split(":");
      const isLevel = (levels as readonly string[]).includes(level);
      if (!isLevel || !/^[1-9]\d*$/u.test(count)) {
        throw new Error(
          `"${item}" is not a plan item. Use level:count, for example easy:3. ` +
            `The levels are ${levels.join(", ")}.`,
        );
      }
      return { level: level as Difficulty, count: Number(count) };
    });
}

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

export type GenerateOptions = {
  // The first seed. The same seed and plan always give the same puzzles.
  readonly seed: number;
  // The number of random boards to try for each plan item before the generator stops.
  readonly maxTries: number;
  // The boards that the puzzle file already has. The generator does not make them again.
  readonly known: readonly string[];
};

// This makes the puzzles of the plan. "missing" has each plan item without enough puzzles after "maxTries".
export function generate(plan: readonly PlanItem[], options: GenerateOptions) {
  const known = new Set(options.known);
  const found: TiltPuzzle[] = [];
  const missing: PlanItem[] = [];
  for (const [position, item] of plan.entries()) {
    let kept = 0;
    // Each plan item has its own range of seeds, so one item does not change the puzzles of the others.
    const first = options.seed + position * 1_000_000;
    for (let seed = first; seed < first + options.maxTries && kept < item.count; seed += 1) {
      const puzzle = candidate(seed, item.level);
      if (known.has(boardKey(puzzle)) || !isGoodPuzzle(puzzle)) continue;
      known.add(boardKey(puzzle));
      found.push(puzzle);
      kept += 1;
    }
    if (kept < item.count) missing.push({ ...item, count: item.count - kept });
  }
  return { found, missing };
}

// The text of the puzzle file: JSON with two spaces, and each board on one line, as in the example.
// Run "npm run fix" after a change, so the formatter puts the rest in its form.
export function puzzleFileText(puzzles: readonly TiltPuzzle[]): string {
  const text = JSON.stringify(puzzles, null, 2);
  // A row has no "]", thus the list of rows ends at the first "]". The rows go on one line, with ", " between them.
  return `${text.replaceAll(
    /"board": \[([^\]]*)\]/gu,
    (_, rows: string) => `"board": [${rows.trim().split(/,\s*/u).join(", ")}]`,
  )}\n`;
}
