import type { Difficulty } from "../shared/difficulty";
import { puzzleIdOf, type PuzzleBase } from "../shared/puzzle";

// The fields that each puzzle has, for a test that calls a generator without the registry.
export function baseOf(type: string, difficulty: Difficulty, number = 1): PuzzleBase {
  return {
    id: puzzleIdOf(type, difficulty, number),
    difficulty,
    author: "skardela",
    license: "CC-BY-4.0",
  };
}
