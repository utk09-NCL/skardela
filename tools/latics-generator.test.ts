import { describe, expect, it } from "vitest";
import { findPuzzleProblems } from "../src/app/puzzle-types/latics/puzzle";
import { findSolutionProblems } from "../src/app/puzzle-types/latics/solver";
import { boardKey, generate, parsePlan, puzzleFileText } from "./latics-generator";

// The generator makes new puzzles only when a person runs it. These checks make sure that it still works.

describe("latics generator plan", () => {
  it("reads a plan of material, level and count", () => {
    expect(parsePlan(" water:easy:3, critical:hard:1 ")).toEqual([
      { material: "water", level: "easy", count: 3 },
      { material: "critical", level: "hard", count: 1 },
    ]);
    expect(parsePlan("")).toEqual([]);
  });

  it("refuses a plan item that it cannot make", () => {
    expect(() => parsePlan("glass:easy:1")).toThrow(/is not a plan item/u);
    expect(() => parsePlan("water:easy:0")).toThrow(/is not a plan item/u);
    expect(() => parsePlan("critical:easy:1")).toThrow(/only on hard/u);
  });
});

describe("latics generator puzzles", () => {
  const plan = parsePlan("water:easy:1");
  // Seed 30074 is a good puzzle, and seed 30265 is the next one. Thus the tests do not try 17,253 bad seeds.
  const options = { seed: 30_074, maxTries: 200, known: [] };

  it("makes a puzzle that passes all data checks, and the same puzzle again for the same seed", () => {
    const { found, missing } = generate(plan, options);
    expect(missing).toEqual([]);
    expect(found).toHaveLength(1);
    expect(found[0]?.water).toBeDefined();
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

  it("writes each laser on one line, as in the puzzle file", () => {
    const { found } = generate(plan, options);
    expect(puzzleFileText(found)).toMatch(
      /"lasers": \[\n\s+\{ "direction": "[A-Z]+", "colour": "white" \}\n/u,
    );
  });
});
