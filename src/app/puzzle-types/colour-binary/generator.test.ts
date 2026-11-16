import { describe, expect, it } from "vitest";
import { makeRandom } from "../../../shared/random";
import { baseOf } from "../../../test/puzzle-base";
import { makePuzzle } from "../registry";
import { generate, generateBoard, isGoodPuzzle } from "./generator";
import { toSquares } from "./puzzle";
import { obeysRules } from "./rules-check";
import { findAnswers } from "./solver";

describe("colour-binary generator boards", () => {
  it.each(["easy", "medium"] as const)("makes a %s board with exactly one answer", (level) => {
    const board = generateBoard(level, makeRandom(7));
    const start = toSquares(board.start);
    const answer = toSquares(board.answer);

    expect(obeysRules(answer)).toBe(true);
    // The start has exactly one answer, and it is the answer of the board.
    expect(findAnswers(start, 2)).toEqual([answer]);
  });

  it("makes the same board for the same seed", () => {
    expect(generateBoard("easy", makeRandom(3))).toEqual(generateBoard("easy", makeRandom(3)));
  });
});

describe("colour-binary generator puzzles", () => {
  it("makes a puzzle that passes all data checks, with the fields of its ID", () => {
    for (const level of ["easy", "medium"] as const) {
      const base = baseOf("colour-binary", level, 7);
      const puzzle = generate(base);
      expect(puzzle).toMatchObject({ ...base, type: "colour-binary" });
      expect(isGoodPuzzle(puzzle)).toBe(true);
    }
  });

  it("makes the same puzzle again for the same ID, and a different puzzle for the next day", () => {
    const puzzle = generate(baseOf("colour-binary", "medium", 7));
    expect(generate(baseOf("colour-binary", "medium", 7))).toEqual(puzzle);
    expect(generate(baseOf("colour-binary", "medium", 8)).start).not.toEqual(puzzle.start);
  });

  // The board of a day must not change, because each player of that day gets the same puzzle.
  // A change to the generator or to the rules that changes these boards changes the puzzles of each day.
  it.each([
    ["easy", ["..RB", "..BB", "B..R", "R..R"]],
    ["medium", [".BRRB.", "......", "BRR.BR", "B.B.RR", "R.....", "B..BR."]],
    [
      "hard",
      [
        "RR..BRBB",
        ".R....B.",
        ".B..RB..",
        ".RBRBRRB",
        "..R...BB",
        "R...B...",
        ".R......",
        ".....RB.",
      ],
    ],
  ] as const)("makes the fixed %s start of day 1049", async (level, start) => {
    expect((await makePuzzle("colour-binary", level, 1049)).start).toEqual(start);
  });
});
