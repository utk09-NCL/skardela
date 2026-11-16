// The generator of Colour Binary puzzles. It makes a random answer from a seed, then empties squares
// while the start keeps exactly one answer. It keeps the first puzzle that passes all data checks.
// It is pure: no React, no DOM and no side effects. The worker runs it. See "src/app/generator.ts".
import type { Difficulty } from "../../../shared/difficulty";
import { firstGoodPuzzle } from "../../../shared/generate";
import type { PuzzleBase } from "../../../shared/puzzle";
import { makeRandom } from "../../../shared/random";
import {
  findPuzzleProblems,
  sizes,
  toRows,
  toSquares,
  type ColourBinaryPuzzle,
  type Square,
} from "./puzzle";
import { obeysRules } from "./rules-check";
import { countSolutions, findAnswers } from "./solver";

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

// One random puzzle for a seed. The same seed always gives the same puzzle.
function candidate(seed: number, base: PuzzleBase): ColourBinaryPuzzle {
  return { ...base, type: "colour-binary", ...generateBoard(base.difficulty, makeRandom(seed)) };
}

// A good puzzle passes the same checks as the data check in "tools/puzzles.test.ts".
export function isGoodPuzzle(puzzle: ColourBinaryPuzzle): boolean {
  return (
    findPuzzleProblems(puzzle).length === 0 &&
    obeysRules(toSquares(puzzle.answer)) &&
    countSolutions(toSquares(puzzle.start)) === 1
  );
}

// "generateBoard" keeps exactly one answer, thus the first board is good. The limit only stops a search
// that a later change of the rules makes endless.
const maxTries = 100;

// The puzzle of an ID: the first good puzzle from the seed of the ID.
export function generate(base: PuzzleBase): ColourBinaryPuzzle {
  return firstGoodPuzzle(base.id, maxTries, (seed) => candidate(seed, base), isGoodPuzzle);
}
