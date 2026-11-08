import { describe, expect, it } from "vitest";
import { toSquares } from "../src/app/puzzle-types/colour-binary/puzzle";
import { obeysRules } from "../src/app/puzzle-types/colour-binary/rules-check";
import { findAnswers } from "../src/app/puzzle-types/colour-binary/solver";
import { makeRandom } from "../src/shared/random";
import {
  boardKey,
  generate,
  generateBoard,
  isGoodPuzzle,
  puzzleFileText,
} from "./colour-binary-generator";
import { parseLevelPlan } from "./generator-script";

// The generator makes new puzzles only when a person runs it. These checks make sure that it still works.

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
  const plan = parseLevelPlan("easy:1,medium:1");
  const options = { seed: 1, maxTries: 10, known: [] };

  it("makes puzzles that pass all data checks, and the same puzzles again for the same seed", () => {
    const { found, missing } = generate(plan, options);
    expect(missing).toEqual([]);
    expect(found.map((puzzle) => puzzle.difficulty)).toEqual(["easy", "medium"]);
    expect(found.every((puzzle) => isGoodPuzzle(puzzle))).toBe(true);
    expect(generate(plan, options).found).toEqual(found);
  });

  it("does not make a board that the puzzle file already has", () => {
    const { found } = generate(plan, options);
    const again = generate(plan, { ...options, known: found.map((puzzle) => boardKey(puzzle)) });
    expect(again.found.map((puzzle) => boardKey(puzzle))).not.toEqual(
      found.map((puzzle) => boardKey(puzzle)),
    );
  });

  it("writes the rows of the start and the answer on one line, as in the puzzle file", () => {
    const { found } = generate(parseLevelPlan("easy:1"), options);
    expect(puzzleFileText(found)).toMatch(/"start": \["[RB.]{4}"(, "[RB.]{4}"){3}\]/u);
    expect(puzzleFileText(found)).toMatch(/"answer": \["[RB]{4}"(, "[RB]{4}"){3}\]/u);
  });
});
