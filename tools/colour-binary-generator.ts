// The generator of new Colour Binary puzzles. It makes a random answer from a seed, then empties squares
// while the start keeps exactly one answer. It keeps only the puzzles that pass all data checks.
// It is pure: it does not read or write files. "generate-colour-binary.gen.ts" adds its puzzles to
// "puzzles/colour-binary.json".
import {
  findPuzzleProblems,
  sizes,
  toRows,
  toSquares,
  type ColourBinaryPuzzle,
  type Square,
} from "../src/app/puzzle-types/colour-binary/puzzle";
import { obeysRules } from "../src/app/puzzle-types/colour-binary/rules-check";
import { countSolutions, findAnswers } from "../src/app/puzzle-types/colour-binary/solver";
import type { Difficulty } from "../src/shared/difficulty";
import { makeRandom } from "../src/shared/random";
import {
  generatePuzzles,
  jsonWithRows,
  type GenerateOptions,
  type LevelPlanItem,
} from "./generator-script";

// ---------- A random board ----------

export type Board = { start: string[]; answer: string[] };

// The part of the answer that the start keeps for each level.
// This keeps the puzzle fair but still gives the solver a real challenge.
const keptPart: Record<Difficulty, number> = { easy: 0.5, medium: 0.45, hard: 0.4 };

// The board generator makes one valid answer and then empties some squares.
// The puzzle must keep exactly one answer, thus each removal that makes more than one answer goes back.
export function generateBoard(difficulty: Difficulty, random: () => number): Board {
  const size = sizes[difficulty];
  const empty = Array.from({ length: size * size }, (): Square => ".");

  const [answer] = findAnswers(empty, 1, () => (random() < 0.5 ? ["R", "B"] : ["B", "R"]));
  if (!answer) throw new Error(`No ${size} by ${size} board obeys the rules.`);

  const start = [...answer];
  const kept = Math.ceil(keptPart[difficulty] * start.length);
  const order = start
    .map((_, index) => ({ index, key: random() }))
    .toSorted((a, b) => a.key - b.key);
  for (const { index } of order) {
    if (start.filter((square) => square !== ".").length <= kept) break;
    const colour = start[index] ?? ".";
    start[index] = ".";
    if (countSolutions(start) !== 1) start[index] = colour;
  }

  return { start: toRows(start), answer: toRows(answer) };
}

// One random puzzle for a seed. The same seed always gives the same puzzle. The ID is a placeholder.
export function candidate(seed: number, level: Difficulty): ColourBinaryPuzzle {
  const { start, answer } = generateBoard(level, makeRandom(seed));
  return {
    id: "colour-binary-0000",
    type: "colour-binary",
    difficulty: level,
    author: "skardela",
    license: "CC-BY-4.0",
    start,
    answer,
  };
}

// A good puzzle passes the same checks as the puzzle file in "tools/puzzles.test.ts".
export function isGoodPuzzle(puzzle: ColourBinaryPuzzle): boolean {
  return (
    findPuzzleProblems(puzzle).length === 0 &&
    obeysRules(toSquares(puzzle.answer)) &&
    countSolutions(toSquares(puzzle.start)) === 1
  );
}

// ---------- The plan ----------

// A key of a board, so two puzzles with the same start are the same puzzle.
export function boardKey(puzzle: Pick<ColourBinaryPuzzle, "start">): string {
  return puzzle.start.join("/");
}

// This makes the puzzles of the plan. See "generatePuzzles" in "generator-script.ts".
export function generate(plan: readonly LevelPlanItem[], options: GenerateOptions) {
  return generatePuzzles(plan, options, {
    candidate: (seed, item) => candidate(seed, item.level),
    isGoodPuzzle,
    boardKey,
  });
}

// The text of the puzzle file, with the rows of "start" and "answer" on one line, as in the file.
export function puzzleFileText(puzzles: readonly ColourBinaryPuzzle[]): string {
  return jsonWithRows(puzzles, ["start", "answer"]);
}
