import { describe, expect, it } from "vitest";
import example from "./examples/colour-binary-0000.json";
import { toRows, toSquares } from "./puzzle";
import { brokenRuleAt, count, isPossible, lines, nextSquare, obeysRules } from "./rules-check";

// The example board from rules.md.
const answer = toSquares(example.answer);

describe("colour-binary rules check", () => {
  it("reads all rows and then all columns", () => {
    expect(lines(answer)).toEqual([...example.answer, "RBRB", "BRRB", "BRBR", "RBBR"]);
  });

  it("counts the squares of one colour in a line", () => {
    expect(count("RBRR", "R")).toBe(3);
    expect(count("....", "B")).toBe(0);
  });

  it("finds a line that cannot obey the rules", () => {
    expect(isPossible("RB..")).toBe(true);
    expect(isPossible("RRR.")).toBe(false);
    expect(isPossible("R.RR")).toBe(false);
  });

  // rules.md: "No three squares of the same colour can be next to each other in a row or a column."
  // On 4 by 4, three squares of one colour are also more than half. Thus these lines have 6 squares.
  it("finds three squares of one colour next to each other in a line that is half red", () => {
    expect(isPossible("BBBRRR")).toBe(false);
    expect(isPossible("BRBRRB")).toBe(true);
  });

  it("refuses a full board with three squares of one colour next to each other", () => {
    // Each row and each column is half red. Each row has three red squares next to each other.
    const board = toSquares(["BBBRRR", "RRRBBB", "BBBRRR", "RRRBBB", "BBBRRR", "RRRBBB"]);
    expect(obeysRules(board)).toBe(false);
  });

  it("accepts only a full board that obeys the rules", () => {
    expect(obeysRules(answer)).toBe(true);
    expect(obeysRules(toSquares(example.start))).toBe(false);
    expect(obeysRules(answer.with(0, "B"))).toBe(false);
  });

  it("changes a square from empty to red, to blue, and back to empty", () => {
    expect([nextSquare["."], nextSquare.R, nextSquare.B]).toEqual(["R", "B", "."]);
  });

  it("turns squares back into rows", () => {
    expect(toRows(answer)).toEqual(example.answer);
  });
});

describe("colour-binary broken rule of a square", () => {
  it("gives no rule for an empty square or a square that obeys the rules", () => {
    const board = toSquares(["RB..", "....", "....", "...."]);
    expect(brokenRuleAt(board, 2)).toBeUndefined();
    expect(brokenRuleAt(board, 0)).toBeUndefined();
  });

  it("tells a line with more than half of its squares in one colour, first in the row", () => {
    expect(brokenRuleAt(toSquares(["R.RR", "....", "....", "...."]), 3)).toEqual({
      reason: "half",
      line: "row",
      number: 1,
      colour: "R",
    });
    expect(brokenRuleAt(toSquares(["...B", "...B", "....", "...B"]), 7)).toEqual({
      reason: "half",
      line: "column",
      number: 4,
      colour: "B",
    });
  });

  it("tells three squares of one colour next to each other", () => {
    const board = toSquares(["BBB...", "......", "......", "......", "......", "......"]);
    expect(brokenRuleAt(board, 1)).toEqual({
      reason: "three",
      line: "row",
      number: 1,
      colour: "B",
    });
  });

  it("tells three squares next to each other only for a square of the three", () => {
    // Row 1 has three red squares at columns 1 to 3. The red square at column 5 is not one of them.
    const board = toSquares(["RRRBR...", ...Array.from({ length: 7 }, () => "........")]);
    expect(brokenRuleAt(board, 4)).toBeUndefined();
    expect(brokenRuleAt(board, 0)).toMatchObject({ reason: "three", line: "row", number: 1 });
    expect(brokenRuleAt(board, 2)).toMatchObject({ reason: "three", line: "row", number: 1 });
  });
});
