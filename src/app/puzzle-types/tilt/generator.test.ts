import { describe, expect, it } from "vitest";
import { levels } from "../../../shared/difficulty";
import { baseOf } from "../../../test/puzzle-base";
import { makePuzzle } from "../registry";
import { candidate, generate } from "./generator";
import { findPuzzleProblems, levelRules } from "./puzzle";
import { findSolutionProblems } from "./solver";

describe("tilt generator boards", () => {
  it("puts the walls of the level on a random board", () => {
    for (const level of levels) {
      const { walls, size } = levelRules[level];
      for (let seed = 1; seed <= 20; seed += 1) {
        const puzzle = candidate(seed, baseOf("tilt", level));
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
  it("makes a puzzle that passes all data checks, with the fields of its ID", () => {
    for (const level of levels) {
      const base = baseOf("tilt", level, 7);
      const puzzle = generate(base);
      expect(puzzle).toMatchObject({ ...base, type: "tilt" });
      expect([...findPuzzleProblems(puzzle), ...findSolutionProblems(puzzle)]).toEqual([]);
    }
  });

  it("makes the same puzzle again for the same ID, and a different puzzle for the next day", () => {
    const puzzle = generate(baseOf("tilt", "medium", 7));
    expect(generate(baseOf("tilt", "medium", 7))).toEqual(puzzle);
    expect(generate(baseOf("tilt", "medium", 8)).board).not.toEqual(puzzle.board);
  });

  // The board of a day must not change, because each player of that day gets the same puzzle.
  // A change to the generator or to the rules that changes these boards changes the puzzles of each day.
  it.each([
    ["easy", [".....", ".....", "R....", "#....", "#..r#"]],
    ["medium", ["..R..#", "...r.b", "#.....", "...B..", ".##...", "...#.."]],
    ["hard", [".....#.", ".G..#.Y", ".B.#..#", "..b....", "....#..", "...R..r", "...y#.#"]],
  ] as const)("makes the fixed %s board of day 1049", async (level, board) => {
    expect((await makePuzzle("tilt", level, 1049)).board).toEqual(board);
  });
});
