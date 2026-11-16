import { describe, expect, it } from "vitest";
import { levels } from "../../../shared/difficulty";
import { baseOf } from "../../../test/puzzle-base";
import { makePuzzle } from "../registry";
import { candidate, generate } from "./generator";
import { boardSize, findPuzzleProblems, levelRules, type Point } from "./puzzle";
import { findSolutionProblems } from "./solver";

// The distance from a point to the nearest edge of the board.
function edgeDistance(point: Point): number {
  return Math.min(point.x, point.y, boardSize - point.x, boardSize - point.y);
}

// The boards of day 1049. See the last test.
const day1049 = [
  [
    "easy",
    {
      launch: { x: 86, y: 86 },
      ring: { x: 11, y: 10 },
      planets: [{ x: 53, y: 57, size: "small" }],
    },
  ],
  [
    "medium",
    {
      launch: { x: 13, y: 85 },
      ring: { x: 87, y: 71 },
      planets: [
        { x: 37, y: 79, size: "small" },
        { x: 96, y: 56, size: "small" },
      ],
    },
  ],
  [
    "hard",
    {
      launch: { x: 14, y: 79 },
      ring: { x: 89, y: 50 },
      planets: [
        { x: 45, y: 67, size: "medium" },
        { x: 61, y: 33, size: "big" },
        { x: 21, y: 67, size: "small" },
      ],
    },
  ],
] as const;

describe("orbital generator boards", () => {
  it("puts the launch point and the ring near opposite edges, and the planets of the level", () => {
    for (const level of levels) {
      for (let seed = 1; seed <= 20; seed += 1) {
        const { launch, ring, planets } = candidate(seed, baseOf("orbital", level));
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
  it("makes a puzzle that passes all data checks, with the fields of its ID", () => {
    for (const level of levels) {
      const base = baseOf("orbital", level, 7);
      const puzzle = generate(base);
      expect(puzzle).toMatchObject({ ...base, type: "orbital" });
      expect([...findPuzzleProblems(puzzle), ...findSolutionProblems(puzzle)]).toEqual([]);
    }
  });

  it("makes the same puzzle again for the same ID, and a different puzzle for the next day", () => {
    const puzzle = generate(baseOf("orbital", "medium", 7));
    expect(generate(baseOf("orbital", "medium", 7))).toEqual(puzzle);
    expect(generate(baseOf("orbital", "medium", 8)).planets).not.toEqual(puzzle.planets);
  });

  // The board of a day must not change, because each player of that day gets the same puzzle.
  // A change to the generator or to the rules that changes these boards changes the puzzles of each day.
  it.each(day1049)("makes the fixed %s board of day 1049", async (level, board) => {
    expect(await makePuzzle("orbital", level, 1049)).toMatchObject(board);
  });
});
