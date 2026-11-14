import { levels, type Difficulty } from "../../../shared/difficulty";
import { toSquares as sharedToSquares } from "../../../shared/grid";
import type { PuzzleBase } from "../../../shared/puzzle";

// The beam goes in 8 directions, in steps of 45°.
// The list goes counterclockwise from "E" (right), thus the angle of a direction is its index × 45°.
export const directions = ["E", "NE", "N", "NW", "W", "SW", "S", "SE"] as const;
export type Direction = (typeof directions)[number];

// A mirror has 4 angles, in steps of 45°. The angle of a mirror is its index × 45°, also counterclockwise.
// Each character looks like the mirror on the board. In JSON, "\" is written as "\\".
export const mirrors = ["-", "/", "|", "\\"] as const;
export type Mirror = (typeof mirrors)[number];

// The colours of a beam. White light has red light and blue light in it. See "rules-check.ts".
export const beamColours = ["white", "red", "blue"] as const;
export type BeamColour = (typeof beamColours)[number];

// The monsters: "M" is hit by a beam of each colour, "R" only by a red beam and "B" only by a blue beam.
export const monsters = ["M", "R", "B"] as const;
export type Monster = (typeof monsters)[number];

// The filters: "r" lets only red light through and "b" lets only blue light through.
export const filters = ["r", "b"] as const;
export type Filter = (typeof filters)[number];

// One character for each square of the board: "." empty, "#" wall, "L" laser, a monster, "^" prism, a filter,
// or a mirror. To add a new piece, add its character here. TypeScript then shows each place that needs a rule for it.
export const squares = [".", "#", "L", ...monsters, "^", ...filters, ...mirrors] as const;
export type Square = (typeof squares)[number];

// One laser: the direction at the start and the colour of its beam.
export type LaserData = { readonly direction: Direction; readonly colour: BeamColour };

export type LaticsPuzzle = PuzzleBase & {
  readonly type: "latics";
  // Each row has one character for each square. See "Square".
  readonly board: readonly string[];
  // One laser for each "L" on the board, in reading order: row by row, and from left to right in a row.
  readonly lasers: readonly LaserData[];
  // The number of mirrors that the player can put on empty squares.
  readonly tray: number;
  // The water: rows with "~" for a square in water and "." for a square out of the water. A puzzle can have no water.
  readonly water?: readonly string[];
};

export type LevelRules = {
  // The number of squares in one row and in one column.
  readonly size: number;
  // "true": the beam shows at all times. "false": the player plans the path and then fires the laser.
  readonly liveBeam: boolean;
  // The player can turn the lasers.
  readonly canAim: boolean;
  // The smallest and the largest number of mirrors in the tray.
  readonly tray: { readonly min: number; readonly max: number };
};

// Each level adds one new skill: easy has a live beam, medium adds the tray, hard adds the aim.
export const levelRules: Record<Difficulty, LevelRules> = {
  easy: { size: 5, liveBeam: true, canAim: false, tray: { min: 0, max: 0 } },
  medium: { size: 7, liveBeam: false, canAim: false, tray: { min: 1, max: 2 } },
  hard: { size: 9, liveBeam: false, canAim: true, tray: { min: 1, max: 2 } },
};

const isOneOf = <Item extends string>(list: readonly Item[], value: string): value is Item =>
  (list as readonly string[]).includes(value);

export function isMirror(square: Square): square is Mirror {
  return isOneOf(mirrors, square);
}

export function isMonster(square: Square): square is Monster {
  return isOneOf(monsters, square);
}

export function isFilter(square: Square): square is Filter {
  return isOneOf(filters, square);
}

// The squares of the rows, row by row, so each square has one index.
export const toSquares: (rows: readonly string[]) => Square[] = sharedToSquares;

// "true" for each square in water. A puzzle without water gives "false" for each square.
export function toWater(puzzle: Pick<LaticsPuzzle, "board" | "water">): boolean[] {
  const size = puzzle.board.length;
  const rows = puzzle.water ?? [];
  return Array.from({ length: size * size }, (_, index) => {
    const row = rows[Math.floor(index / size)] ?? "";
    return row[index % size] === "~";
  });
}

// The squares that a piece in water can be. Mirrors, walls, prisms and filters are not in water.
const inWaterPieces: ReadonlySet<Square> = new Set<Square>([".", "L", ...monsters]);

// The water areas: each area is a full rectangle, and two areas do not touch, also not at a corner.
// Then a beam that leaves one area does not go at once into an other area. See "rules-check.ts".
function findWaterProblems(puzzle: LaticsPuzzle, size: number): string[] {
  const rows = puzzle.water;
  if (rows === undefined) return [];
  if (rows.length !== size || rows.some((row) => [...row].length !== size)) {
    return [`"water" must have ${size} rows of ${size} squares, as "board".`];
  }
  if (rows.some((row) => !/^[~.]*$/u.test(row))) return ['"water" must have only "~" and ".".'];
  const problems: string[] = [];
  const water = toWater(puzzle);
  const isWater = (row: number, column: number) =>
    row >= 0 && row < size && column >= 0 && column < size && water[row * size + column] === true;
  const isBroken = water.some((wet, index) => {
    if (!wet) return false;
    const row = Math.floor(index / size);
    const column = index % size;
    // In a rectangle, two squares in water that are next to each other on a diagonal have both squares
    // between them in water too. A square that touches a different area at a corner breaks this rule.
    return [-1, 1].some((up) =>
      [-1, 1].some(
        (side) =>
          isWater(row + up, column + side) &&
          !(isWater(row + up, column) && isWater(row, column + side)),
      ),
    );
  });
  if (isBroken)
    problems.push('Each area of "water" must be a rectangle that does not touch an other area.');
  const pieces = toSquares(puzzle.board);
  if (water.some((wet, index) => wet && !inWaterPieces.has(pieces[index] ?? "."))) {
    problems.push('A square in "water" can only have ".", "L", "M", "R" or "B" on "board".');
  }
  return problems;
}

// The lasers: one for each "L" on the board, with a direction and a colour.
function findLaserProblems(puzzle: LaticsPuzzle, laserCount: number): string[] {
  const problems: string[] = [];
  if (laserCount === 0) problems.push('"board" must have at least one "L".');
  if (puzzle.lasers.length !== laserCount) {
    problems.push(`"lasers" must have one item for each "L" on "board": ${laserCount}.`);
  }
  if (puzzle.lasers.some(({ direction }) => !isOneOf(directions, direction))) {
    problems.push(`The direction of each laser must be one of: ${directions.join(", ")}.`);
  }
  if (puzzle.lasers.some(({ colour }) => !isOneOf(beamColours, colour))) {
    problems.push(`The colour of each laser must be one of: ${beamColours.join(", ")}.`);
  }
  return problems;
}

// This check catches broken puzzle data before the app renders the board.
// The data checks in "tools/" also use the solver, to make sure that each puzzle has a solution.
export function findPuzzleProblems(puzzle: LaticsPuzzle): string[] {
  const problems: string[] = [];
  const rules = levelRules[puzzle.difficulty] as LevelRules | undefined;
  if (rules === undefined) return [`"difficulty" must be one of: ${levels.join(", ")}.`];
  const { size, tray } = rules;

  if (puzzle.board.length !== size || puzzle.board.some((row) => [...row].length !== size)) {
    problems.push(
      `"board" must have ${size} rows of ${size} squares for the level "${puzzle.difficulty}".`,
    );
  }
  const characters = [...puzzle.board.join("")];
  const unknown = characters.filter((character) => !isOneOf(squares, character));
  if (unknown.length > 0) {
    problems.push(
      `"board" has characters that are not pieces: ${[...new Set(unknown)].join(" ")}.`,
    );
  }
  problems.push(
    ...findLaserProblems(puzzle, characters.filter((character) => character === "L").length),
  );
  if (!characters.some((character) => isOneOf(monsters, character))) {
    problems.push('"board" must have at least one monster: "M", "R" or "B".');
  }
  if (!Number.isInteger(puzzle.tray) || puzzle.tray < tray.min || puzzle.tray > tray.max) {
    problems.push(
      `"tray" must be a whole number from ${tray.min} to ${tray.max} for the level "${puzzle.difficulty}".`,
    );
  }
  problems.push(...findWaterProblems(puzzle, size));

  return problems;
}
