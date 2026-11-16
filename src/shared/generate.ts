import { seedOf } from "./random";

// The search for the puzzle of an ID. "candidate" makes one random puzzle for a seed, and "isGood" checks it.
// A candidate is "null" when the random choices of its seed give no puzzle.
// The ID gives the first seed. The search tries that seed and the seeds after it, and gives the first good puzzle.
// Thus the same ID gives the same puzzle in each browser.
// The limit is a count of tries, not a time. The time is different on each device,
// thus a time limit would give different puzzles on different devices.
export function firstGoodPuzzle<Puzzle>(
  id: string,
  maxTries: number,
  candidate: (seed: number) => Puzzle | null,
  isGood: (puzzle: Puzzle) => boolean,
): Puzzle {
  const first = seedOf(id);
  for (let seed = first; seed < first + maxTries; seed += 1) {
    const puzzle = candidate(seed);
    if (puzzle !== null && isGood(puzzle)) return puzzle;
  }
  throw new Error(`No good puzzle for "${id}" in ${maxTries} tries.`);
}
