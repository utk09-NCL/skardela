import { describe, expect, it } from "vitest";
import { positionOf, squareAfterArrow, toSquares } from "./grid";

describe("toSquares", () => {
  it("gives the squares of the rows, row by row", () => {
    expect(toSquares(["RB", ".R"])).toEqual(["R", "B", ".", "R"]);
    expect(toSquares([])).toEqual([]);
  });
});

describe("positionOf", () => {
  it("gives the row and the column of a square, from 0", () => {
    expect(positionOf(0, 4)).toEqual({ row: 0, column: 0 });
    expect(positionOf(6, 4)).toEqual({ row: 1, column: 2 });
    expect(positionOf(15, 4)).toEqual({ row: 3, column: 3 });
  });
});

// A 3 by 3 board with gaps at index 1 and 2 (row 1, columns 2 and 3) and at index 4 (the middle).
const isGap = (index: number) => [1, 2, 4].includes(index);

describe("squareAfterArrow", () => {
  it("moves one square with each arrow key, and stays at the edge of the board", () => {
    // Square 5 is row 2, column 2 of a 4 by 4 board.
    expect(squareAfterArrow(5, "ArrowUp", 4)).toBe(1);
    expect(squareAfterArrow(5, "ArrowDown", 4)).toBe(9);
    expect(squareAfterArrow(5, "ArrowLeft", 4)).toBe(4);
    expect(squareAfterArrow(5, "ArrowRight", 4)).toBe(6);
    expect(squareAfterArrow(3, "ArrowRight", 4)).toBe(3);
    expect(squareAfterArrow(0, "ArrowUp", 4)).toBe(0);
    expect(squareAfterArrow(12, "ArrowDown", 4)).toBe(12);
    expect(squareAfterArrow(4, "ArrowLeft", 4)).toBe(4);
  });

  it("gives undefined for a key that is not an arrow key", () => {
    expect(squareAfterArrow(5, "Enter", 4)).toBeUndefined();
  });

  // A board with gaps, as the Guzzle board: an arrow key goes past each gap to the next square in its direction.
  it("goes past the gaps, and stays when only gaps are left in the direction", () => {
    expect(squareAfterArrow(0, "ArrowRight", 3, isGap)).toBe(0);
    expect(squareAfterArrow(3, "ArrowRight", 3, isGap)).toBe(5);
    expect(squareAfterArrow(7, "ArrowUp", 3, isGap)).toBe(7);
    expect(squareAfterArrow(8, "ArrowUp", 3, isGap)).toBe(5);
  });
});
