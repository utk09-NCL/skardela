import { describe, expect, it } from "vitest";
import {
  defaultSavedData,
  maxResults,
  mergeProgress,
  readSavedData,
  type SavedData,
  type SolveResult,
} from "./saved-data";

const result: SolveResult = {
  puzzleId: "guzzle-0001",
  type: "guzzle",
  difficulty: "easy",
  seconds: 42,
  day: "2026-10-24",
};

describe("readSavedData", () => {
  it.each([undefined, null, 42, "dark", []])("gives the default data for the value %j", (value) => {
    expect(readSavedData(value)).toEqual(defaultSavedData);
  });

  it("keeps each correct field, and gives the default value for each field that is not correct", () => {
    expect(
      readSavedData({
        theme: "purple",
        cookieBanner: true,
        solved: ["guzzle-0001", 2],
        results: [result],
        lastOpened: { puzzleId: "latics-0003", type: "latics", difficulty: "hard" },
        seenRules: "guzzle",
        other: 1,
      }),
    ).toEqual({
      theme: "system",
      cookieBanner: true,
      solved: ["guzzle-0001"],
      results: [result],
      lastOpened: { puzzleId: "latics-0003", type: "latics", difficulty: "hard" },
      seenRules: [],
    });
  });
});

describe("readSavedData of the newer fields", () => {
  it("keeps the seen rules, and a solve with a count of mistakes", () => {
    const withMistakes = { ...result, mistakes: 3 };
    expect(readSavedData({ seenRules: ["latics"], results: [withMistakes] })).toMatchObject({
      seenRules: ["latics"],
      results: [withMistakes],
    });
  });

  it("keeps each correct solve and drops each broken solve", () => {
    const broken = [
      { ...result, seconds: -1 },
      { ...result, seconds: "42" },
      { ...result, difficulty: "expert" },
      { ...result, day: "24 October" },
      { ...result, puzzleId: undefined },
      { ...result, mistakes: -1 },
      { ...result, mistakes: 1.5 },
      { ...result, mistakes: "2" },
      "guzzle-0001",
    ];
    expect(readSavedData({ results: [...broken, result] }).results).toEqual([result]);
  });

  // One broken item does not remove the other items of the list.
  it("keeps each text of the solved puzzles and of the seen rules, and drops each broken item", () => {
    expect(
      readSavedData({ solved: [null, "tilt-0002", 7], seenRules: ["latics", {}, "tilt"] }),
    ).toMatchObject({ solved: ["tilt-0002"], seenRules: ["latics", "tilt"] });
  });

  it(`keeps only the last ${maxResults} solves`, () => {
    const many = Array.from({ length: maxResults + 5 }, (_, index) => ({
      ...result,
      seconds: index,
    }));
    const { results } = readSavedData({ results: many });
    expect(results).toHaveLength(maxResults);
    expect(results[0]?.seconds).toBe(5);
  });
});

describe("mergeProgress", () => {
  const current: SavedData = {
    ...defaultSavedData,
    theme: "dark",
    solved: ["guzzle-0001"],
    results: [result],
  };

  it("adds only new solves, in date order, and keeps the settings of this browser", () => {
    const older = { ...result, puzzleId: "latics-0002", type: "latics", day: "2026-10-01" };
    const imported: SavedData = {
      ...defaultSavedData,
      theme: "light",
      cookieBanner: true,
      solved: ["guzzle-0001", "latics-0002"],
      results: [result, older, older],
    };
    const { data, added } = mergeProgress(current, imported);
    expect(added).toBe(1);
    expect(data.results).toEqual([older, result]);
    expect(data.solved).toEqual(["guzzle-0001", "latics-0002"]);
    expect(data).toMatchObject({ theme: "dark", cookieBanner: false });
  });

  it("adds nothing from a file with the same solves", () => {
    expect(mergeProgress(current, current).added).toBe(0);
  });
});
