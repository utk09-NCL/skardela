import { describe, expect, it } from "vitest";
import { findPuzzleProblems, levelRules } from "../src/app/puzzle-types/tilt/puzzle";
import { findSolutionProblems } from "../src/app/puzzle-types/tilt/solver";
import { parseLevelPlan } from "./generator-script";
import { boardKey, candidate, generate, puzzleFileText } from "./tilt-generator";

// The generator makes new puzzles only when a person runs it. These checks make sure that it still works.

describe("tilt generator boards", () => {
  it("puts the walls of the level on a random board", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const { walls, size } = levelRules[level];
      for (let seed = 1; seed <= 20; seed += 1) {
        const puzzle = candidate(seed, level);
        const count = puzzle.board.join("").split("#").length - 1;
        expect(puzzle.board).toHaveLength(size);
        expect(count).toBeGreaterThanOrEqual(walls.min);
        expect(count).toBeLessThanOrEqual(walls.max);
        // A random board has only the balls and the holes of its level, thus only the search checks can fail.
        expect(findPuzzleProblems(puzzle)).toEqual([]);
      }
    }
  });
});

describe("tilt generator puzzles", () => {
  const plan = parseLevelPlan("easy:1,medium:1,hard:1");
  const options = { seed: 1, maxTries: 5_000, known: [] };

  it("makes puzzles that pass all data checks, and the same puzzles again for the same seed", () => {
    const { found, missing } = generate(plan, options);
    expect(missing).toEqual([]);
    expect(found.map((puzzle) => puzzle.difficulty)).toEqual(["easy", "medium", "hard"]);
    const problems = found.flatMap((puzzle) => [
      ...findPuzzleProblems(puzzle),
      ...findSolutionProblems(puzzle),
    ]);
    expect(problems).toEqual([]);
    expect(generate(plan, options).found).toEqual(found);
  });

  it("does not make a board that the puzzle file already has", () => {
    const { found } = generate(plan, options);
    const again = generate(plan, { ...options, known: found.map((puzzle) => boardKey(puzzle)) });
    expect(again.found.map((puzzle) => boardKey(puzzle))).not.toEqual(
      found.map((puzzle) => boardKey(puzzle)),
    );
  });

  it("writes each board on one line, as in the example", () => {
    const { found } = generate(parseLevelPlan("easy:1"), options);
    expect(puzzleFileText(found)).toMatch(
      /"board": \["[.#RrBbYyG]{5}"(, "[.#RrBbYyG]{5}"){4}\]\n/u,
    );
  });
});
