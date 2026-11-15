import { describe, expect, it } from "vitest";
import { homeLoader, loadPuzzle, puzzleNumber } from "./puzzles";
import { puzzleTypes } from "./puzzle-types/registry";

describe("loadPuzzle", () => {
  it("gives the puzzle and the IDs of the other puzzles of the same type and level", async () => {
    const all = await puzzleTypes["colour-binary"].loadPuzzles();
    const easy = all.filter((puzzle) => puzzle.difficulty === "easy").map((puzzle) => puzzle.id);
    expect(await loadPuzzle("colour-binary-0001")).toMatchObject({
      type: "colour-binary",
      puzzle: { id: "colour-binary-0001" },
      others: easy.filter((id) => id !== "colour-binary-0001"),
    });
  });

  it.each(["guzzle-9999", "unknown-0001", "guzzle", ""])("gives null for the ID %j", async (id) => {
    expect(await loadPuzzle(id)).toBeNull();
  });
});

describe("homeLoader", () => {
  // Each author shows one time. All Numpuz puzzles have the same author.
  it("gives the authors of today's puzzles one time each, and the date when the type came", async () => {
    const numpuz = (await homeLoader()).find((card) => card.type === "numpuz");
    expect(numpuz?.authors).toEqual(["Wisdom Usiwoma"]);
    expect(numpuz?.added).toBe(puzzleTypes.numpuz.added);
  });
});

describe("puzzleNumber", () => {
  it.each([
    ["colour-binary-0007", "0007"],
    ["tilt-0031", "0031"],
  ])("gives the number of %s", (id, number) => {
    expect(puzzleNumber(id)).toBe(number);
  });
});
