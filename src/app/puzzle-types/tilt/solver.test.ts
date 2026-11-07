import { describe, expect, it } from "vitest";
import example from "./examples/tilt-0000.json";
import { findPuzzleProblems, type TiltPuzzle } from "./puzzle";
import { initialState, isSolved, transition } from "./machine";
import { allInHoles, readBoard, tiltBoard, type Direction } from "./rules-check";
import { findSolutionProblems, fewestTilts, solve } from "./solver";

// The example is the rules.md example. The level is medium. The fewest tilts are 5.
const medium = example as TiltPuzzle;

// This helper makes a puzzle from a board and a level.
function puzzleOf(difficulty: TiltPuzzle["difficulty"], board: readonly string[]): TiltPuzzle {
  return { ...medium, difficulty, board };
}

// This helper gets the solution of a board. It throws when the board has no solution.
function solutionOf(rows: readonly string[]): Direction[] {
  const { layout, balls } = readBoard(rows);
  const tilts = solve(layout, balls);
  if (tilts === null) throw new Error("No solution");
  return tilts;
}

// This helper plays the tilts on a board. It checks that each tilt moves one or more balls.
// It gives "true" when all coloured balls are in their holes at the end.
function solves(rows: readonly string[], tilts: readonly Direction[]): boolean {
  const { layout, balls: start } = readBoard(rows);
  let balls = start;
  for (const direction of tilts) {
    const result = tiltBoard(layout, balls, direction);
    expect(result.moves.length).toBeGreaterThan(0);
    balls = result.balls;
  }
  return allInHoles(balls);
}

describe("tilt solve", () => {
  // Rule: "The fewest tilts are 5: down, left, up, down, right." (Example)
  it("finds a solution of 5 tilts for the example, and the tilts solve it", () => {
    const tilts = solutionOf(medium.board);
    expect(tilts).toHaveLength(5);
    expect(solves(medium.board, tilts)).toBe(true);
  });

  // Rule: "Each order of tilts that gets all coloured balls into their holes is correct."
  it("finds the one tilt that solves a small board", () => {
    const { layout, balls } = readBoard(["R.r", "...", "..."]);
    expect(solve(layout, balls)).toEqual(["right"]);
  });

  // Rule: "Use the fewest tilts."
  it("finds a solution of 2 tilts when 1 tilt is not enough", () => {
    const rows = ["R..", "...", "..r"];
    const tilts = solutionOf(rows);
    expect(tilts).toHaveLength(2);
    expect(solves(rows, tilts)).toBe(true);
  });

  // Contract: "The result is an empty list when each coloured ball is already in its hole."
  it("gives an empty list when each coloured ball is in its hole", () => {
    const { layout, balls } = readBoard(["R.r", "...", "..."]);
    expect(balls).toHaveLength(1);
    expect(solve(layout, [{ colour: "red", index: 2, isInHole: true }])).toEqual([]);
  });

  // Contract: "The result is null when no order of tilts gets all coloured balls into their holes."
  it("gives null when the red ball cannot leave its corner", () => {
    const { layout, balls } = readBoard(["R#...", "#....", ".....", ".....", "....r"]);
    expect(solve(layout, balls)).toBeNull();
  });

  // Rule: "A coloured ball with no hole on the board never falls in" (contract).
  it("gives null when a coloured ball has no hole", () => {
    const { layout, balls } = readBoard(["R..", "...", "..."]);
    expect(solve(layout, balls)).toBeNull();
  });
});

describe("tilt solve grey ball", () => {
  // Rule: "The grey ball ... only blocks the other balls." The solve ignores the grey ball.
  it("solves a board with a grey ball", () => {
    const rows = ["R.r", "...", "G.."];
    const { layout, balls } = readBoard(rows);
    expect(solve(layout, balls)).toEqual(["right"]);
  });
});

describe("tilt fewestTilts", () => {
  // Rule: "The fewest tilts are 5." (Example)
  it("is 5 for the example", () => {
    expect(fewestTilts(medium)).toBe(5);
  });

  // Rule: "The board shows the fewest tilts from the start."
  it("is the length of the solution of a small board", () => {
    expect(fewestTilts(puzzleOf("easy", ["R.r", "...", "..."]))).toBe(1);
    expect(fewestTilts(puzzleOf("easy", ["R..", "...", "..r"]))).toBe(2);
  });

  // Contract: "The result is null when the puzzle has no solution."
  it("is null when the puzzle has no solution", () => {
    expect(fewestTilts(puzzleOf("easy", ["R#...", "#....", ".....", ".....", "....r"]))).toBeNull();
  });
});

describe("tilt findSolutionProblems", () => {
  // Rule: "The fewest tilts are not in the range of its level, or the puzzle has no solution."
  it("accepts the example, with 5 fewest tilts on medium", () => {
    expect(findSolutionProblems(medium)).toEqual([]);
  });

  // Rule: "The fewest tilts are not in the range of its level." Easy needs 5 to 8.
  it("refuses an easy puzzle with fewer tilts than the range", () => {
    const board = ["R.r..", ".....", ".....", ".....", "....."];
    expect(fewestTilts(puzzleOf("easy", board))).toBe(1);
    expect(findSolutionProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });

  // Rule: "The fewest tilts are not in the range of its level, or the puzzle has no solution."
  it("refuses a puzzle with no solution", () => {
    const board = ["R#...", "#....", ".....", ".....", "....r"];
    expect(findSolutionProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });
});

// The boards of "### Data check boards" in rules.md. Each one passes "findPuzzleProblems".
const hardBoard1 = [".#....#", "R....r.", "....b#.", ".......", ".#.#..y", ".......", "B#.Y..G"];
const hardBoard2 = [".#.#..#", "..#.b..", "Y..#B..", ".....r.", "#......", ".R....y", "G.#...."];
const easyBoard3 = ["r##..", ".#...", "...#R", ".....", "#..#."];

describe("tilt data check boards", () => {
  // Rule: "Hard: the puzzle has a solution without the grey ball." Board 1 has none: no problem.
  it("accepts hard board 1: 7 fewest tilts and no solution without the grey ball", () => {
    const puzzle = puzzleOf("hard", hardBoard1);
    expect(findPuzzleProblems(puzzle)).toEqual([]);
    expect(fewestTilts(puzzle)).toBe(7);
    expect(findSolutionProblems(puzzle)).toEqual([]);
  });

  // Rule: "Each order of tilts that gets all coloured balls into their holes is correct."
  it("solves hard board 1 with the tilts of solve", () => {
    const puzzle = puzzleOf("hard", hardBoard1);
    const tilts = solutionOf(hardBoard1);
    expect(tilts).toHaveLength(7);
    const state = tilts.reduce(
      (current, direction) => transition(current, { type: "tilt", direction }),
      initialState(puzzle),
    );
    expect(isSolved(state)).toBe(true);
    expect(state.tilts).toBe(7);
  });

  // Rule: "Hard: the puzzle has a solution without the grey ball." Board 2 has one: one problem.
  it("refuses hard board 2 because it has a solution without the grey ball", () => {
    const puzzle = puzzleOf("hard", hardBoard2);
    expect(findPuzzleProblems(puzzle)).toEqual([]);
    expect(fewestTilts(puzzle)).toBe(6);
    expect(findSolutionProblems(puzzle)).toHaveLength(1);
  });

  // Rule: "The fewest tilts are not in the range of its level, or the puzzle has no solution."
  it("refuses easy board 3 because 9 fewest tilts are more than the maximum 8", () => {
    const puzzle = puzzleOf("easy", easyBoard3);
    expect(findPuzzleProblems(puzzle)).toEqual([]);
    expect(fewestTilts(puzzle)).toBe(9);
    expect(findSolutionProblems(puzzle)).toHaveLength(1);
  });
});
