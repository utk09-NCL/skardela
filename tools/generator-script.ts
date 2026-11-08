// The parts that each puzzle generator shares: the plan of levels, the search for good puzzles,
// and the script that adds the new puzzles to the puzzle file.
// Each "<type>-generator.ts" gives the parts of its puzzle type. Each "generate-<type>.gen.ts" runs "addPuzzles".
import { readFileSync, writeFileSync } from "node:fs";
import { levels, type Difficulty } from "../src/shared/difficulty";

// ---------- The plan ----------

// One line of a plan of levels: the number of puzzles to make for one level.
export type LevelPlanItem = {
  readonly level: Difficulty;
  readonly count: number;
};

// A plan of levels as text, for example "easy:30,medium:30,hard:30".
export function parseLevelPlan(text: string): LevelPlanItem[] {
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

// ---------- The search ----------

export type GenerateOptions = {
  // The first seed. The same seed and plan always give the same puzzles.
  readonly seed: number;
  // The number of random boards to try for each plan item before the generator stops.
  readonly maxTries: number;
  // The boards that the puzzle file already has. The generator does not make them again.
  readonly known: readonly string[];
};

// The parts of one puzzle type that the search needs.
export type PuzzleMaker<Item, Puzzle> = {
  // One random puzzle for a seed and a plan item. The same seed always gives the same puzzle.
  readonly candidate: (seed: number, item: Item) => Puzzle;
  // "true" when the puzzle passes all checks of its type.
  readonly isGoodPuzzle: (puzzle: Puzzle, item: Item) => boolean;
  // A key of a board, so two puzzles with the same board are the same puzzle.
  readonly boardKey: (puzzle: Puzzle) => string;
};

// This makes the puzzles of the plan. "missing" has each plan item without enough puzzles after "maxTries".
export function generatePuzzles<Item extends { readonly count: number }, Puzzle>(
  plan: readonly Item[],
  options: GenerateOptions,
  maker: PuzzleMaker<Item, Puzzle>,
): { found: Puzzle[]; missing: Item[] } {
  const known = new Set(options.known);
  const found: Puzzle[] = [];
  const missing: Item[] = [];
  for (const [position, item] of plan.entries()) {
    let kept = 0;
    // Each plan item has its own range of seeds, so one item does not change the puzzles of the others.
    const first = options.seed + position * 1_000_000;
    for (let seed = first; seed < first + options.maxTries && kept < item.count; seed += 1) {
      const puzzle = maker.candidate(seed, item);
      const key = maker.boardKey(puzzle);
      if (known.has(key) || !maker.isGoodPuzzle(puzzle, item)) continue;
      known.add(key);
      found.push(puzzle);
      kept += 1;
    }
    if (kept < item.count) missing.push({ ...item, count: item.count - kept });
  }
  return { found, missing };
}

// ---------- The puzzle file ----------

// A whole number from 1, from an environment variable. The default value is for a variable that is not set.
// Text that is not such a number stops the script with a clear message, before the search starts.
export function readNumber(name: string, fallback: number): number {
  const text = process.env[name];
  const value = text === undefined ? fallback : Number(text);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a whole number from 1. It is "${text}".`);
  }
  return value;
}

// The found puzzles with the next free IDs of the type, for example "tilt-0031" and "tilt-0032".
export function withNextIds<Puzzle extends { readonly id: string }>(
  type: string,
  puzzles: readonly Puzzle[],
  found: readonly Puzzle[],
): Puzzle[] {
  const last = Math.max(0, ...puzzles.map((puzzle) => Number(puzzle.id.slice(type.length + 1))));
  return found.map((puzzle, index) => ({
    ...puzzle,
    id: `${type}-${String(last + index + 1).padStart(4, "0")}`,
  }));
}

// JSON with two spaces, and the rows of each field in "fields" on one line, as in the puzzle files.
// A row has no "]", thus the list of rows ends at the first "]". Run "npm run fix" after a change.
export function jsonWithRows(puzzles: readonly unknown[], fields: readonly string[]): string {
  const text = JSON.stringify(puzzles, null, 2);
  const lists = new RegExp(`"(${fields.join("|")})": \\[([^\\]]*)\\]`, "gu");
  return `${text.replaceAll(
    lists,
    (_, field: string, rows: string) => `"${field}": [${rows.trim().split(/,\s*/u).join(", ")}]`,
  )}\n`;
}

// The parts of one puzzle type that the script needs.
export type PuzzleGenerator<Item, Puzzle> = {
  // The puzzle type, for example "colour-binary". It gives the file, the IDs and the names of the variables.
  readonly type: string;
  // An example of a plan for the message when the plan is empty, for example "easy:3".
  readonly planExample: string;
  readonly parsePlan: (text: string) => Item[];
  readonly generate: (
    plan: readonly Item[],
    options: GenerateOptions,
  ) => { found: Puzzle[]; missing: Item[] };
  readonly boardKey: (puzzle: Puzzle) => string;
  readonly puzzleFileText: (puzzles: readonly Puzzle[]) => string;
  // A plan item as text, for example "hard:1".
  readonly itemText: (item: Item) => string;
};

// This makes the puzzles of the plan and adds them to "puzzles/<type>.json". The environment gives the plan,
// the first seed and the number of tries, for example "TILT_PLAN", "TILT_SEED" and "TILT_TRIES".
// It gives a message with the new IDs, and the plan items without enough puzzles as text, for example "hard:1".
// The text is empty when the plan is complete.
export function addPuzzles<Item, Puzzle extends { readonly id: string }>(
  generator: PuzzleGenerator<Item, Puzzle>,
): { message: string; missing: string } {
  const { type } = generator;
  const prefix = type.toUpperCase().replaceAll("-", "_");
  const plan = generator.parsePlan(process.env[`${prefix}_PLAN`] ?? "");
  if (plan.length === 0) {
    throw new Error(
      `Give a plan, for example: ${prefix}_PLAN="${generator.planExample}" npm run generate:${type}`,
    );
  }
  const file = new URL(`../puzzles/${type}.json`, import.meta.url);
  const puzzles = JSON.parse(readFileSync(file, "utf8")) as Puzzle[];
  const { found, missing } = generator.generate(plan, {
    seed: readNumber(`${prefix}_SEED`, 1),
    maxTries: readNumber(`${prefix}_TRIES`, 50_000),
    known: puzzles.map((puzzle) => generator.boardKey(puzzle)),
  });
  const added = withNextIds(type, puzzles, found);
  writeFileSync(file, generator.puzzleFileText([...puzzles, ...added]));
  const ids = added.map((puzzle) => puzzle.id).join(", ");
  return {
    message: `Added ${added.length} ${added.length === 1 ? "puzzle" : "puzzles"}: ${ids}.\n`,
    missing: missing.map((item) => generator.itemText(item)).join(","),
  };
}
