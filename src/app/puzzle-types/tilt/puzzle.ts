import type { Difficulty } from "../../../shared/difficulty";
import type { PuzzleBase } from "../../../shared/puzzle";

// The colours of the coloured balls, in a fixed order. On a board, each colour has one ball and one hole.
export const colours = ["red", "blue", "yellow"] as const;
export type Colour = (typeof colours)[number];

// The colour of a ball. The grey ball is only on hard. It has no hole, and it only blocks the other balls.
export type BallColour = Colour | "grey";

// The order of the balls in a list of balls: red, blue, yellow, then grey.
// A list of balls has only the balls of the board, for example only red on easy.
export const ballColours: readonly BallColour[] = [...colours, "grey"];

// One character for each square of the puzzle data. See "## Puzzle data" in "rules.md".
// ".": empty. "#": wall. "R", "B", "Y": the red, blue and yellow balls. "G": the grey ball.
// "r", "b", "y": the red, blue and yellow holes.
export const squares = [".", "#", "R", "B", "Y", "G", "r", "b", "y"] as const;
export type Square = (typeof squares)[number];

// The character of the ball of each colour, and the character of the hole of each colour.
export const ballSquares: Readonly<Record<BallColour, Square>> = {
  red: "R",
  blue: "B",
  yellow: "Y",
  grey: "G",
};
export const holeSquares: Readonly<Record<Colour, Square>> = { red: "r", blue: "b", yellow: "y" };

// "true" when the character is in the table of "## Puzzle data".
export function isSquare(character: string): character is Square {
  return (squares as readonly string[]).includes(character);
}

// The ball colour of a character, or "undefined" when the character is not a ball.
export function ballOfSquare(character: string): BallColour | undefined {
  return ballColours.find((colour) => ballSquares[colour] === character);
}

// The hole colour of a character, or "undefined" when the character is not a hole.
export function holeOfSquare(character: string): Colour | undefined {
  return colours.find((colour) => holeSquares[colour] === character);
}

// The characters of one row. A row is a string, and each character is one square.
// "Array.from" keeps a character outside the basic plane as one item, so the data check counts it as one square.
export function cellsOf(row: string): string[] {
  return Array.from(row);
}

export type TiltPuzzle = PuzzleBase & {
  readonly type: "tilt";
  // Each row has one character for each square. See "Square".
  // The first string is the top row (row 1 in "rules.md"). The first character of a row is column 1.
  readonly board: readonly string[];
};

// The smallest and the largest number. Both numbers are in the range.
export type Range = { readonly min: number; readonly max: number };

export type LevelRules = {
  // The number of squares in one row and in one column.
  readonly size: number;
  // The colours of the coloured balls on a board of this level. Each colour has one ball and one hole.
  readonly colours: readonly Colour[];
  // "true": the board has exactly one grey ball. "false": the board has no grey ball.
  readonly hasGrey: boolean;
  // The fewest tilts that the best solution of a puzzle of this level can need.
  readonly fewest: Range;
  // The number of walls that the generator puts on a board of this level. The data check does not use it.
  readonly walls: Range;
};

// The table in "## Board" and the walls in "## Puzzles" of "rules.md".
export const levelRules: Record<Difficulty, LevelRules> = {
  easy: {
    size: 5,
    colours: ["red"],
    hasGrey: false,
    fewest: { min: 5, max: 8 },
    walls: { min: 3, max: 6 },
  },
  medium: {
    size: 6,
    colours: ["red", "blue"],
    hasGrey: false,
    fewest: { min: 5, max: 10 },
    walls: { min: 4, max: 8 },
  },
  hard: {
    size: 7,
    colours: ["red", "blue", "yellow"],
    hasGrey: true,
    fewest: { min: 6, max: 12 },
    walls: { min: 6, max: 10 },
  },
};

// The data check of the board, with no search. It gives one text for each problem,
// and an empty list for a puzzle with no problems. It finds these problems from "## Puzzle data" in "rules.md":
// - "board" does not have the size of its level (see "levelRules"), or its rows have different lengths.
// - "board" has a character that is not in "squares".
// - The colours of the balls are not the colours of its level.
// - A colour does not have exactly one ball and exactly one hole.
// - The grey ball is not on hard, or hard does not have exactly one grey ball.
// The checks that need a search are in "findSolutionProblems" in "solver.ts".
export function findPuzzleProblems(puzzle: TiltPuzzle): string[] {
  const level = levelRules[puzzle.difficulty] as LevelRules | undefined;
  if (level === undefined) {
    return [`"difficulty" must be one of: ${Object.keys(levelRules).join(", ")}.`];
  }
  if (!Array.isArray(puzzle.board) || puzzle.board.some((row) => typeof row !== "string")) {
    return ['"board" must be a list of rows. Each row is a string.'];
  }
  const rows = puzzle.board.map((row) => cellsOf(row));
  return [
    ...findSizeProblems(rows, puzzle.difficulty),
    ...findCharacterProblems(rows.flat()),
    ...findBallProblems(rows.flat(), puzzle.difficulty),
  ];
}

// The size of the board and the length of each row.
function findSizeProblems(rows: readonly (readonly string[])[], difficulty: Difficulty): string[] {
  const { size } = levelRules[difficulty];
  const problems: string[] = [];
  if (rows.length !== size) {
    problems.push(`"board" must have ${size} rows for the level "${difficulty}".`);
  }
  if (new Set(rows.map((row) => row.length)).size > 1) {
    problems.push('All rows of "board" must have the same length.');
  }
  if (rows.some((row) => row.length !== size)) {
    problems.push(`Each row of "board" must have ${size} squares for the level "${difficulty}".`);
  }
  return problems;
}

// Each character must be in the table of "## Puzzle data".
function findCharacterProblems(cells: readonly string[]): string[] {
  const unknown = [...new Set(cells.filter((cell) => !isSquare(cell)))];
  if (unknown.length === 0) return [];
  return [
    `"board" can only have these characters: ${squares.join(" ")}. It also has: ${unknown.join(" ")}.`,
  ];
}

// The balls and the holes of the level: the colours, one ball and one hole for each colour, and the grey ball.
function findBallProblems(cells: readonly string[], difficulty: Difficulty): string[] {
  const level = levelRules[difficulty];
  const count = (square: Square) => cells.filter((cell) => cell === square).length;
  const problems: string[] = [];

  // The colours of the coloured balls must be the colours of the level, in any order.
  const found = colours.filter((colour) => count(ballSquares[colour]) > 0);
  const isSameColours =
    found.length === level.colours.length &&
    level.colours.every((colour) => found.includes(colour));
  if (!isSameColours) {
    problems.push(
      `The coloured balls must be ${level.colours.join(", ")} for the level "${difficulty}". The board has: ${found.length === 0 ? "none" : found.join(", ")}.`,
    );
  }

  // Each colour on the board, or in the level, must have exactly one ball and exactly one hole.
  for (const colour of colours) {
    const balls = count(ballSquares[colour]);
    const holes = count(holeSquares[colour]);
    const isUsed = level.colours.includes(colour) || balls > 0 || holes > 0;
    if (isUsed && (balls !== 1 || holes !== 1)) {
      problems.push(
        `The colour ${colour} must have exactly one ball "${ballSquares[colour]}" and exactly one hole "${holeSquares[colour]}". The board has ${balls} and ${holes}.`,
      );
    }
  }

  // The grey ball is only on hard, and hard has exactly one grey ball.
  const greys = count(ballSquares.grey);
  if (!level.hasGrey && greys > 0) {
    problems.push(`The level "${difficulty}" must not have a grey ball "G".`);
  }
  if (level.hasGrey && greys !== 1) {
    problems.push(
      `The level "${difficulty}" must have exactly one grey ball "G". The board has ${greys}.`,
    );
  }
  return problems;
}
