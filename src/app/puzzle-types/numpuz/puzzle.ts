import type { Difficulty } from "../../../shared/difficulty";
import type { PuzzleBase } from "../../../shared/puzzle";

type Operator = "+" | "-" | "×" | "÷";
const operators: ReadonlySet<Operator> = new Set(["+", "-", "×", "÷"]);

function evaluate(numbers: readonly number[], answer: readonly Operator[]): number | null {
  if (numbers.length === 0 || answer.length !== numbers.length - 1) return null;

  const terms = [numbers[0]];
  const additions: ("+" | "-")[] = [];

  for (let i = 0; i < answer.length; i += 1) {
    const operator = answer[i];
    const number = numbers[i + 1];

    if (operator === undefined || number === undefined) return null;

    const currentTerm = terms.at(-1);
    if (currentTerm === undefined) return null;

    if (operator === "×") {
      terms[terms.length - 1] = currentTerm * number;
    } else if (operator === "÷") {
      if (number === 0) return null;
      terms[terms.length - 1] = currentTerm / number;
    } else {
      additions.push(operator);
      terms.push(number);
    }
  }

  return terms.reduce<number>((total, term, index) => {
    if (term === undefined) return total;
    if (index === 0) return term;
    return additions[index - 1] === "+" ? total + term : total - term;
  }, 0);
}

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
  if (puzzle.answer.some((op) => !operators.has(op))) {
    problems.push('"answer" must have only "+", "-", "×" and "÷".');
  }

  // The saved answer must really reach the target, or the puzzle can never be solved.
  const result = evaluate(puzzle.numbers, puzzle.answer);
  if (result === null || Math.abs(result - puzzle.target) > 1e-9) {
    problems.push('"answer" does not make the equation equal "target".');
  }

  return problems;
}
