import { describe, expect, it } from "vitest";
import {
  boardSize,
  findPuzzleProblems,
  levelRules,
  type Point,
} from "../src/app/puzzle-types/orbital/puzzle";
import { findSolutionProblems } from "../src/app/puzzle-types/orbital/solver";
import { parseLevelPlan } from "./generator-script";
import { boardKey, candidate, generate, puzzleFileText } from "./orbital-generator";

// The generator makes new puzzles only when a person runs it. These checks make sure that it still works.

// The distance from a point to the nearest edge of the board.
function edgeDistance(point: Point): number {
  return Math.min(point.x, point.y, boardSize - point.x, boardSize - point.y);
}

describe("orbital generator boards", () => {
  it("puts the launch point and the ring near opposite edges, and the planets of the level", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      for (let seed = 1; seed <= 20; seed += 1) {
        const { launch, ring, planets } = candidate(seed, level);
        expect(planets).toHaveLength(levelRules[level].planets);
        // The launch point and the ring are near an edge. The ring is near the opposite edge,
        // thus it is far from the launch point.
        expect(edgeDistance(launch)).toBeLessThanOrEqual(14);
        expect(edgeDistance(ring)).toBeLessThanOrEqual(levelRules[level].ringRadius + 12);
        expect(Math.hypot(ring.x - launch.x, ring.y - launch.y)).toBeGreaterThanOrEqual(60);
      }
    }
  });
});

describe("orbital generator puzzles", () => {
  const plan = parseLevelPlan("easy:1,medium:1,hard:1");
  const options = { seed: 1, maxTries: 500, known: [] };

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

  it("writes each point and each planet on one line, as in the example", () => {
    const { found } = generate(parseLevelPlan("easy:1"), options);
    const text = puzzleFileText(found);
    expect(text).toMatch(/"launch": \{ "x": \d+, "y": \d+ \},\n/u);
    expect(text).toMatch(/\{ "x": \d+, "y": \d+, "size": "(small|medium|big)" \}\n/u);
    expect(JSON.parse(text)).toEqual(found);
  });
});
