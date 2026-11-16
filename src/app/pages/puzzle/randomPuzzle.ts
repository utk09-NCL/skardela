import type { Difficulty } from "../../../shared/difficulty";
import { puzzleIdOf } from "../../../shared/puzzle";
import { randomNumbers } from "../../daily";
import type { PuzzleType } from "../../puzzle-types/registry";

// "Random puzzle" opens the puzzle of a random number in the range of "randomNumbers", of the same type and level.
// The range has 900,000 numbers, thus the player gets a new puzzle almost each time.
// The ID gives the puzzle, thus a link to a random puzzle opens the same puzzle for each person.
export function randomPuzzleId(
  type: PuzzleType,
  level: Difficulty,
  random: () => number = Math.random,
): string {
  const { min, max } = randomNumbers;
  return puzzleIdOf(type, level, min + Math.floor(random() * (max - min + 1)));
}
