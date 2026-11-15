import type { ColourBinaryPuzzle } from "./colour-binary/puzzle";
import type { GuzzlePuzzle } from "./guzzle/puzzle";
import type { LaticsPuzzle } from "./latics/puzzle";
import { decipherPuzzles } from "../../shared/cipher";
import type { NumpuzPuzzle } from "./numpuz/puzzle";
import type { OrbitalPuzzle } from "./orbital/puzzle";
import type { TiltPuzzle } from "./tilt/puzzle";

// This file is the list of all puzzle types and their puzzle files.
// To add a puzzle type, add its puzzle type to "PuzzleMap" and add one entry to "puzzleTypes".
// TypeScript then shows an error in each place that needs more work:
// the board in "boards.ts", the text in "src/text/en/index.ts" and the data check in "tools/puzzles.test.ts".
// This file has no React code, so the data checks in "tools/" can use it too.

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

// This loads all puzzles of the type. The file loads only when the app needs it.
// The answers in the file are ciphered by the Vite plugin in "vite.config.ts". "decipherPuzzles" decodes them.
// A puzzle type without an "answer" field, such as Latics, does not need "decipherPuzzles".
// "added" is the date when the puzzle type came to the site, as a day key. It is the date of the first commit
// of its puzzle file. The home page shows it, and marks a puzzle type of the last two weeks as new.
type PuzzleTypeEntry<Puzzle> = { added: string; loadPuzzles: () => Promise<readonly Puzzle[]> };

export const puzzleTypes: { [Type in PuzzleType]: PuzzleTypeEntry<PuzzleMap[Type]> } = {
  "colour-binary": {
    added: "2026-10-11",
    loadPuzzles: async () =>
      decipherPuzzles<ColourBinaryPuzzle>(
        (await import("../../../puzzles/colour-binary.json")).default,
      ),
  },
  guzzle: {
    added: "2026-10-11",
    loadPuzzles: async () =>
      decipherPuzzles<GuzzlePuzzle>((await import("../../../puzzles/guzzle.json")).default),
  },
  latics: {
    added: "2026-10-24",
    loadPuzzles: async () =>
      (await import("../../../puzzles/latics.json")).default as LaticsPuzzle[],
  },
  numpuz: {
    added: "2026-10-27",
    loadPuzzles: async () =>
      decipherPuzzles<NumpuzPuzzle>((await import("../../../puzzles/numpuz.json")).default),
  },
  // An Orbital puzzle has no "answer": the game checks each launch with the rules. Thus it does not need "decipherPuzzles".
  orbital: {
    added: "2026-11-08",
    loadPuzzles: async () =>
      (await import("../../../puzzles/orbital.json")).default as OrbitalPuzzle[],
  },
  // A Tilt puzzle has no "answer": the game checks each tilt with the rules. Thus it does not need "decipherPuzzles".
  tilt: {
    added: "2026-11-07",
    loadPuzzles: async () => (await import("../../../puzzles/tilt.json")).default as TiltPuzzle[],
  },
};

// This guard keeps the app safe when a string is not a known puzzle type, for example in a URL.
export function isPuzzleType(type: string): type is PuzzleType {
  return Object.hasOwn(puzzleTypes, type);
}
