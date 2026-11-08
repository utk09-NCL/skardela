import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generatePuzzles,
  jsonWithRows,
  parseLevelPlan,
  readNumber,
  withNextIds,
} from "./generator-script";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("generator plan of levels", () => {
  it("reads a plan of level and count", () => {
    expect(parseLevelPlan(" easy:3, hard:1 ")).toEqual([
      { level: "easy", count: 3 },
      { level: "hard", count: 1 },
    ]);
    expect(parseLevelPlan("")).toEqual([]);
  });

  it("refuses a plan item that it cannot make", () => {
    expect(() => parseLevelPlan("expert:1")).toThrow(/is not a plan item/u);
    expect(() => parseLevelPlan("easy:0")).toThrow(/is not a plan item/u);
    expect(() => parseLevelPlan("easy")).toThrow(/is not a plan item/u);
  });
});

describe("generator search", () => {
  // A simple maker: the puzzle is its seed, and only an even seed is a good puzzle.
  const maker = {
    candidate: (seed: number) => seed,
    isGoodPuzzle: (puzzle: number) => puzzle % 2 === 0,
    boardKey: String,
  };

  it("keeps the good puzzles that the file does not have, and tells the missing count", () => {
    const options = { seed: 1, maxTries: 6, known: ["2"] };
    expect(generatePuzzles([{ count: 3 }], options, maker)).toEqual({
      found: [4, 6],
      missing: [{ count: 1 }],
    });
  });
});

describe("generator script", () => {
  it("reads a whole number from the environment, or the default value", () => {
    expect(readNumber("SKARDELA_TEST_SEED", 1)).toBe(1);
    vi.stubEnv("SKARDELA_TEST_SEED", "42");
    expect(readNumber("SKARDELA_TEST_SEED", 1)).toBe(42);
  });

  it.each(["abc", "0", "-3", "1.5", ""])("stops with a clear message for the value %j", (value) => {
    vi.stubEnv("SKARDELA_TEST_SEED", value);
    expect(() => readNumber("SKARDELA_TEST_SEED", 1)).toThrow(/must be a whole number from 1/u);
  });

  it("gives the found puzzles the next free IDs", () => {
    const puzzles = [{ id: "tilt-0001" }, { id: "tilt-0031" }];
    const found = [{ id: "tilt-0000" }, { id: "tilt-0000" }];
    expect(withNextIds("tilt", puzzles, found)).toEqual([{ id: "tilt-0032" }, { id: "tilt-0033" }]);
    expect(withNextIds("colour-binary", [], [{ id: "x" }])).toEqual([{ id: "colour-binary-0001" }]);
  });

  it("writes the rows of the given fields on one line", () => {
    const text = jsonWithRows([{ id: "a", start: ["R.", ".B"], other: [1, 2] }], ["start"]);
    expect(text).toContain('"start": ["R.", ".B"]');
    expect(text).toContain('"other": [\n      1,');
    expect(text.endsWith("]\n")).toBe(true);
  });
});
