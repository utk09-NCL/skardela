/* oxlint-disable max-lines-per-function -- one describe holds the tests of one function. */
import { describe, expect, it } from "vitest";
import example from "./examples/orbital-0000.json";
import { initialState, isSolved, transition } from "./machine";
import type { OrbitalPuzzle } from "./puzzle";
import { fly, readBoard, type Aim } from "./rules-check";
import { findSolutionProblems, goodLaunches } from "./solver";

// The example is the rules.md example. It has 33 good launches.
const easy = example as OrbitalPuzzle;

// The data check boards of "### Data check boards" in rules.md. The numbers come from a script of the rules.
const board1: OrbitalPuzzle = {
  ...easy,
  difficulty: "medium",
  launch: { x: 92, y: 67 },
  ring: { x: 22, y: 21 },
  planets: [
    { x: 30, y: 68, size: "small" },
    { x: 44, y: 37, size: "small" },
  ],
};
const board2: OrbitalPuzzle = {
  ...easy,
  difficulty: "hard",
  launch: { x: 69, y: 11 },
  ring: { x: 69, y: 81 },
  planets: [
    { x: 69, y: 61, size: "medium" },
    { x: 54, y: 63, size: "small" },
    { x: 36, y: 60, size: "medium" },
  ],
};
const board3: OrbitalPuzzle = {
  ...easy,
  difficulty: "hard",
  launch: { x: 9, y: 23 },
  ring: { x: 83, y: 76 },
  planets: [
    { x: 30, y: 55, size: "medium" },
    { x: 47, y: 48, size: "medium" },
    { x: 61, y: 47, size: "small" },
  ],
};
const board4: OrbitalPuzzle = {
  ...easy,
  launch: { x: 65, y: 82 },
  ring: { x: 64, y: 14 },
  planets: [{ x: 28, y: 41, size: "small" }],
};
const board5: OrbitalPuzzle = {
  ...easy,
  difficulty: "medium",
  launch: { x: 12, y: 23 },
  ring: { x: 89, y: 30 },
  planets: [
    { x: 72, y: 72, size: "medium" },
    { x: 70, y: 32, size: "small" },
  ],
};

describe("orbital goodLaunches", () => {
  // Rule: "A good launch is an angle and a power that reach the ring." The example has 33.
  it("finds 33 good launches for the example", () => {
    expect(goodLaunches(readBoard(easy))).toHaveLength(33);
  });

  // Rule: "Medium. 15 good launches, for example 207° and power 4."
  it("finds 15 good launches for data check board 1", () => {
    const launches = goodLaunches(readBoard(board1));
    expect(launches).toHaveLength(15);
    expect(launches).toContainEqual({ angle: 207, power: 4 });
  });

  // Rule: "Hard. 6 good launches: 76° and 77° and 78° with power 3, 79° and 80° with power 4, and 81° with power 5."
  it("finds the 6 good launches of data check board 2, in order", () => {
    expect(goodLaunches(readBoard(board2))).toEqual([
      { angle: 76, power: 3 },
      { angle: 77, power: 3 },
      { angle: 78, power: 3 },
      { angle: 79, power: 4 },
      { angle: 80, power: 4 },
      { angle: 81, power: 5 },
    ]);
  });

  // Rule: "Hard. Only 1 good launch: 40° and power 4."
  it("finds the 1 good launch of data check board 3", () => {
    expect(goodLaunches(readBoard(board3))).toEqual([{ angle: 40, power: 4 }]);
  });

  // Rule: "Easy. 80 good launches."
  it("finds 80 good launches for data check board 4", () => {
    expect(goodLaunches(readBoard(board4))).toHaveLength(80);
  });

  // Rule: "Medium. 36 good launches."
  it("finds 36 good launches for data check board 5", () => {
    expect(goodLaunches(readBoard(board5))).toHaveLength(36);
  });

  // Contract: "The order is from the smallest angle to the largest angle, and for one angle from the smallest power to the largest."
  it("orders the launches by angle and then by power", () => {
    const launches = goodLaunches(readBoard(easy));
    const sorted = launches.toSorted((a, b) => a.angle * 100 + a.power - (b.angle * 100 + b.power));
    expect(launches).toEqual(sorted);
  });

  // Rule: "The angle is a whole number ... 0° to 359° ... The power is a whole number from 1 to 10."
  it("gives only aims that obey the rules, with no repeat", () => {
    const launches = goodLaunches(readBoard(easy));
    for (const { angle, power } of launches) {
      expect(Number.isInteger(angle)).toBe(true);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(359);
      expect(Number.isInteger(power)).toBe(true);
      expect(power).toBeGreaterThanOrEqual(1);
      expect(power).toBeLessThanOrEqual(10);
    }
    const keys = new Set(launches.map(({ angle, power }) => `${angle}/${power}`));
    expect(keys.size).toBe(launches.length);
  });

  // Rule: "A good launch is an angle and a power that reach the ring."
  it("gives launches that reach the ring with fly", () => {
    const board = readBoard(easy);
    for (const aim of goodLaunches(board)) expect(fly(board, aim).end.type).toBe("ring");
  });

  // Rule: Example step 4: 92° and power 5 reaches the ring.
  it("includes the example solution 92° and power 5", () => {
    expect(goodLaunches(readBoard(easy))).toContainEqual({ angle: 92, power: 5 });
  });

  // Contract: "The first item is one best solution."
  it("solves the puzzle with the first launch, played with transition", () => {
    const launches = goodLaunches(readBoard(easy));
    expect(launches.length).toBeGreaterThan(0);
    let state = initialState(easy);
    state = transition(state, { type: "aim", aim: launches.slice(0, 1)[0] as Aim });
    state = transition(state, { type: "launch" });
    state = transition(state, { type: "land" });
    expect(isSolved(state)).toBe(true);
  });
});

describe("orbital findSolutionProblems", () => {
  // Rule: "The data check finds no problem" for the example.
  it("gives no problem for the example", () => {
    expect(findSolutionProblems(easy)).toEqual([]);
  });

  it("gives no problem for data check boards 1 and 2", () => {
    expect(findSolutionProblems(board1)).toEqual([]);
    expect(findSolutionProblems(board2)).toEqual([]);
  });

  // Rule: "The puzzle has too few good launches." Hard needs 5 or more.
  it("refuses a puzzle with too few good launches (data check board 3)", () => {
    expect(findSolutionProblems(board3)).toHaveLength(1);
  });

  // Rule: "A launch at the angle straight to the centre of the ring reaches the ring at a power from 1 to 10."
  it("refuses a puzzle where the straight launch reaches the ring (data check board 4)", () => {
    expect(findSolutionProblems(board4)).toHaveLength(1);
  });

  // Rule: "The launch at 0° and power 5 reaches the ring."
  it("refuses a puzzle where the start launch reaches the ring (data check board 5)", () => {
    expect(findSolutionProblems(board5)).toHaveLength(1);
  });
});
