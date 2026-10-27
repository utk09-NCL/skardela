import type { Difficulty } from "../../../shared/difficulty";
import type { PuzzleBase } from "../../../shared/puzzle";
// The data check uses the same rule logic as the board, so a valid puzzle is also solvable in play.
import { evaluate, operators, type Operator } from "./rules-check";

export type NumpuzPuzzle = PuzzleBase & {
  readonly type: "numpuz";
  readonly numbers: readonly number[];
  readonly target: number;
  readonly answer: readonly Operator[];
};

// Harder levels have more numbers, so there are more blanks to fill.
export const counts: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5 };

// This check catches broken puzzle data before the app renders the board.
export function findPuzzleProblems(puzzle: NumpuzPuzzle): string[] {
  const problems: string[] = [];
  const count = counts[puzzle.difficulty];

  if (puzzle.numbers.length !== count) {
    problems.push(`"numbers" must have ${count} numbers for the level "${puzzle.difficulty}".`);
  }
  if (puzzle.numbers.some((n) => !Number.isInteger(n) || n < 1)) {
    problems.push('"numbers" must be whole numbers of 1 or more.');
  }
  if (puzzle.answer.length !== puzzle.numbers.length - 1) {
    problems.push('"answer" must have one operator between each pair of numbers.');
  }
  if (puzzle.answer.some((op) => !operators.includes(op))) {
    problems.push('"answer" must have only "+", "-", "×" and "÷".');
  }

  // The saved answer must really reach the target, or the puzzle can never be solved.
  const result = evaluate(puzzle.numbers, puzzle.answer);
  if (result === null || Math.abs(result - puzzle.target) > 1e-9) {
    problems.push('"answer" does not make the equation equal "target".');
  }

  return problems;
}
