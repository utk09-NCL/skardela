import type { ColourBinaryPuzzle } from "./colour-binary/puzzle";
import type { GuzzlePuzzle } from "./guzzle/puzzle";
import type { NumpuzPuzzle } from "./numpuz/puzzle";

// This file is the list of all puzzle types and their puzzle files.
// To add a puzzle type, add its puzzle type to "PuzzleMap" and add one entry to "puzzleTypes".
// TypeScript then shows an error in each place that needs more work:
// the board in "boards.ts", the text in "src/text/en.ts" and the data check in "tools/puzzles.test.ts".
// This file has no React code, so the data checks in "tools/" can use it too.

// Each puzzle type name, with the type of one puzzle of that type.
export type PuzzleMap = {
  "colour-binary": ColourBinaryPuzzle;
  guzzle: GuzzlePuzzle;
  numpuz: NumpuzPuzzle;
};

export type PuzzleType = keyof PuzzleMap;

// This loads all puzzles of the type. The file loads only when the app needs it.
type PuzzleTypeEntry<Puzzle> = { loadPuzzles: () => Promise<readonly Puzzle[]> };

export const puzzleTypes: { [Type in PuzzleType]: PuzzleTypeEntry<PuzzleMap[Type]> } = {
  "colour-binary": {
    loadPuzzles: async () =>
      (await import("../../../puzzles/colour-binary.json")).default as ColourBinaryPuzzle[],
  },
  guzzle: {
    loadPuzzles: async () =>
      (await import("../../../puzzles/guzzle.json")).default as GuzzlePuzzle[],
  },
  numpuz: {
    loadPuzzles: async (): Promise<readonly NumpuzPuzzle[]> => [],
  },
};

// This guard keeps the app safe when a string is not a known puzzle type, for example in a URL.
export function isPuzzleType(type: string): type is PuzzleType {
  return Object.hasOwn(puzzleTypes, type);
}
