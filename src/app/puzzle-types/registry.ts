import type { Difficulty } from "../../shared/difficulty";
import { puzzleIdOf, type PuzzleBase } from "../../shared/puzzle";
import type { ColourBinaryPuzzle } from "./colour-binary/puzzle";
import type { GuzzlePuzzle } from "./guzzle/puzzle";
import type { LaticsPuzzle } from "./latics/puzzle";
import type { NumpuzPuzzle } from "./numpuz/puzzle";
import type { OrbitalPuzzle } from "./orbital/puzzle";
import type { TiltPuzzle } from "./tilt/puzzle";

// This file is the list of all puzzle types and their generators.
// To add a puzzle type, add its puzzle type to "PuzzleMap" and add one entry to "puzzleTypes".
// TypeScript then shows an error in each place that needs more work:
// the board in "boards.ts", the text in "src/text/en/index.ts" and the data check in "tools/puzzles.test.ts".
// This file has no React code, so the worker and the data checks in "tools/" can use it too.

// Each puzzle type name, with the type of one puzzle of that type.
export type PuzzleMap = {
  "colour-binary": ColourBinaryPuzzle;
  guzzle: GuzzlePuzzle;
  latics: LaticsPuzzle;
  numpuz: NumpuzPuzzle;
  orbital: OrbitalPuzzle;
  tilt: TiltPuzzle;
};

export type PuzzleType = keyof PuzzleMap;

// "added" is the date when the puzzle type came to the site, as a day key. It is the date of the first commit
// of the puzzle type. The home page shows it, and marks a puzzle type of the last two weeks as new.
// "author" is the credit for all puzzles of the type: the person who made the puzzle type.
// "generator" loads "generator.ts" of the type. Its "generate" makes the puzzle of an ID. "base" has the ID,
// the level and the credit of the puzzle, and "number" is the number in the ID.
// The file loads only in the worker, when a player opens a puzzle of the type. See "src/app/generator.ts".
type PuzzleTypeEntry<Puzzle> = {
  added: string;
  author: string;
  generator: () => Promise<{ generate: (base: PuzzleBase, number: number) => Puzzle }>;
};

export const puzzleTypes: { [Type in PuzzleType]: PuzzleTypeEntry<PuzzleMap[Type]> } = {
  "colour-binary": {
    added: "2026-10-11",
    author: "skardela",
    generator: () => import("./colour-binary/generator"),
  },
  guzzle: {
    added: "2026-10-11",
    author: "skardela",
    generator: () => import("./guzzle/generator"),
  },
  latics: {
    added: "2026-10-24",
    author: "skardela",
    generator: () => import("./latics/generator"),
  },
  numpuz: {
    added: "2026-10-27",
    author: "Wisdom Usiwoma",
    generator: () => import("./numpuz/generator"),
  },
  orbital: {
    added: "2026-11-08",
    author: "skardela",
    generator: () => import("./orbital/generator"),
  },
  tilt: { added: "2026-11-07", author: "skardela", generator: () => import("./tilt/generator") },
};

// This guard keeps the app safe when a string is not a known puzzle type, for example in a URL.
export function isPuzzleType(type: string): type is PuzzleType {
  return Object.hasOwn(puzzleTypes, type);
}

// The puzzle of a type, a level and a number. The same values always give the same puzzle, in each browser.
// A generator can take some time, thus the app calls this function only in the worker.
export async function makePuzzle<Type extends PuzzleType>(
  type: Type,
  level: Difficulty,
  number: number,
): Promise<PuzzleMap[Type]> {
  const { author, generator } = puzzleTypes[type];
  const { generate } = await generator();
  const id = puzzleIdOf(type, level, number);
  return generate({ id, difficulty: level, author, license: "CC-BY-4.0" }, number);
}
