import type { Difficulty } from "../../../shared/difficulty";
import { toSquares as sharedToSquares } from "../../../shared/grid";
import type { PuzzleBase } from "../../../shared/puzzle";

export type Square = "R" | "B" | ".";

export type ColourBinaryPuzzle = PuzzleBase & {
  readonly type: "colour-binary";
  readonly start: readonly string[];
  readonly answer: readonly string[];
};

// The board size is set by level so the same logic works for easy, medium and hard boards.
export const sizes: Record<Difficulty, number> = { easy: 4, medium: 6, hard: 8 };

// The squares of the rows, row by row, so the solver can work with one index for each square.
export const toSquares: (rows: readonly string[]) => Square[] = sharedToSquares;

// The solver expects a flat array, but the puzzle data is stored as row strings.
// This helper turns the flat state back into rows for UI use.
export function toRows(squares: readonly Square[]): string[] {
  const size = Math.sqrt(squares.length);
  return Array.from({ length: size }, (_, row) =>
    squares.slice(row * size, row * size + size).join(""),
  );
}

// This check catches broken puzzle data before the app renders or solves the board.
export function findPuzzleProblems(puzzle: ColourBinaryPuzzle): string[] {
  const problems: string[] = [];
  const size = sizes[puzzle.difficulty];

  for (const field of ["start", "answer"] as const) {
    const rows = puzzle[field];
    if (rows.length !== size || rows.some((row) => row.length !== size)) {
      problems.push(
        `"${field}" must have ${size} rows of ${size} squares for the level "${puzzle.difficulty}".`,
      );
    }
  }

  // The answer has only red and blue squares. The start can also have empty squares.
  if (puzzle.answer.some((row) => !/^[RB]*$/u.test(row))) {
    problems.push('"answer" must have only "R" and "B".');
  }
  if (puzzle.start.some((row) => !/^[RB.]*$/u.test(row))) {
    problems.push('"start" must have only "R", "B" and ".".');
  }

  const answer = toSquares(puzzle.answer);
  if (toSquares(puzzle.start).some((square, index) => square !== "." && square !== answer[index])) {
    problems.push('"start" has a colour that is not the same as in "answer".');
  }

  return problems;
}
