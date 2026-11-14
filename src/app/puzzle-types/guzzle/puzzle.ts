import type { Difficulty } from "../../../shared/difficulty";
import { toSquares } from "../../../shared/grid";
import type { PuzzleBase } from "../../../shared/puzzle";

// The squares of the rows, row by row, so each square has one index. A square is one letter or ".".
export { toSquares };

// The four words cross at the center square.
// "diagonalDown" starts at the top left. "diagonalUp" starts at the bottom left.
export type Line = "across" | "down" | "diagonalDown" | "diagonalUp";

export type GuzzlePuzzle = PuzzleBase & {
  readonly type: "guzzle";
  // Each row has one letter for each square. A "." is a square that is not on a word.
  readonly answer: readonly string[];
  // One short clue for each word. With the clues, a player can find the words without the bank.
  readonly clues: Readonly<Record<Line, string>>;
};

export const lineNames: readonly Line[] = ["across", "down", "diagonalDown", "diagonalUp"];

// The word length is set by level. The length is odd, so each board has one center square.
export const sizes: Record<Difficulty, number> = { easy: 3, medium: 5, hard: 7 };

// This helper finds the word that goes through a square.
// The center square is on all four words, thus it gets no single word.
// A square that is not on a word gets no word.
export function lineOf(index: number, size: number): Line | undefined {
  const row = Math.floor(index / size);
  const column = index % size;
  const middle = (size - 1) / 2;
  if (row === middle && column === middle) return undefined;
  if (row === middle) return "across";
  if (column === middle) return "down";
  if (row === column) return "diagonalDown";
  if (row + column === size - 1) return "diagonalUp";
  return undefined;
}

// This helper gives the square indexes of a word, in reading order.
// All words read from left to right. The down word reads from top to bottom.
export function lineIndexes(line: Line, size: number): number[] {
  const steps = Array.from({ length: size }, (_, step) => step);
  const middle = (size - 1) / 2;
  switch (line) {
    case "across":
      return steps.map((column) => middle * size + column);
    case "down":
      return steps.map((row) => row * size + middle);
    case "diagonalDown":
      return steps.map((step) => step * size + step);
    case "diagonalUp":
      return steps.map((step) => (size - 1 - step) * size + step);
  }
}

// This helper finds the word that starts at a square. The board shows an arrow on that square.
export function lineStartingAt(index: number, size: number): Line | undefined {
  return lineNames.find((line) => lineIndexes(line, size)[0] === index);
}

// This helper reads the four words from the answer rows.
export function wordsOf(answer: readonly string[]): Record<Line, string> {
  const squares = toSquares(answer);
  const size = answer.length;
  const read = (line: Line) =>
    lineIndexes(line, size)
      .map((index) => squares[index] ?? "")
      .join("");
  return {
    across: read("across"),
    down: read("down"),
    diagonalDown: read("diagonalDown"),
    diagonalUp: read("diagonalUp"),
  };
}

// This check catches broken puzzle data before the app renders the board.
export function findPuzzleProblems(puzzle: GuzzlePuzzle): string[] {
  const problems: string[] = [];
  const size = sizes[puzzle.difficulty];
  const rows = puzzle.answer;

  if (rows.length !== size || rows.some((row) => row.length !== size)) {
    problems.push(
      `"answer" must have ${size} rows of ${size} squares for the level "${puzzle.difficulty}".`,
    );
    return problems;
  }

  for (const [index, square] of toSquares(rows).entries()) {
    const row = Math.floor(index / size);
    const column = index % size;
    const isCenter = index === (size * size - 1) / 2;
    const isOnWord = isCenter || lineOf(index, size) !== undefined;
    if (isOnWord && !/^[A-Z]$/u.test(square)) {
      problems.push(`Row ${row + 1}, column ${column + 1} must have a letter from A to Z.`);
    }
    if (!isOnWord && square !== ".") {
      problems.push(`Row ${row + 1}, column ${column + 1} is not on a word. It must be ".".`);
    }
  }

  // Each word needs a clue. A clue must not show its own word.
  // The data comes from a JSON file, thus a clue can be missing.
  const clues = puzzle.clues as Partial<Record<Line, unknown>> | undefined;
  const words = wordsOf(rows);
  for (const line of lineNames) {
    const value = clues?.[line];
    const clue = typeof value === "string" ? value.trim() : "";
    if (clue === "") problems.push(`"clues.${line}" must not be empty.`);
    if (clue.toUpperCase().includes(words[line])) {
      problems.push(`"clues.${line}" must not have the word "${words[line]}".`);
    }
  }

  return problems;
}
