import { describe, expect, it } from "vitest";
import { firstGoodPuzzle } from "./generate";
import { seedOf } from "./random";

// A simple generator: the puzzle is its seed, and only a seed that 7 divides is a good puzzle.
const candidate = (seed: number) => seed;
const isGood = (puzzle: number) => puzzle % 7 === 0;

describe("firstGoodPuzzle", () => {
  it("gives the first good puzzle from the seed of the ID", () => {
    const first = seedOf("tilt-easy-1049");
    const puzzle = firstGoodPuzzle("tilt-easy-1049", 7, candidate, isGood);
    expect(isGood(puzzle)).toBe(true);
    expect(puzzle).toBeGreaterThanOrEqual(first);
    expect(puzzle).toBeLessThan(first + 7);
  });

  it("gives the same puzzle for the same ID, and a different puzzle for a different ID", () => {
    const puzzle = firstGoodPuzzle("tilt-easy-1049", 7, candidate, isGood);
    expect(firstGoodPuzzle("tilt-easy-1049", 7, candidate, isGood)).toBe(puzzle);
    expect(firstGoodPuzzle("tilt-easy-1050", 7, candidate, isGood)).not.toBe(puzzle);
  });

  it("stops with an error when the tries have no good puzzle", () => {
    expect(() => firstGoodPuzzle("tilt-easy-1049", 50, candidate, () => false)).toThrow(
      /No good puzzle for "tilt-easy-1049" in 50 tries/u,
    );
  });
});
