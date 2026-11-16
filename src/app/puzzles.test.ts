import { describe, expect, it } from "vitest";
import { dayNumber, localDate } from "./daily";
import { homeLoader, loadPuzzle, puzzleNumber } from "./puzzles";
import { puzzleTypes } from "./puzzle-types/registry";

const today = dayNumber(localDate(new Date()));

describe("loadPuzzle", () => {
  it("gives the type, the level, the author and today's puzzles at once, and the puzzle later", async () => {
    const loaded = loadPuzzle("colour-binary-medium-7");
    expect(loaded).toMatchObject({
      type: "colour-binary",
      id: "colour-binary-medium-7",
      difficulty: "medium",
      author: puzzleTypes["colour-binary"].author,
      today: [
        { id: `colour-binary-easy-${today}`, difficulty: "easy" },
        { id: `colour-binary-medium-${today}`, difficulty: "medium" },
        { id: `colour-binary-hard-${today}`, difficulty: "hard" },
      ],
    });
    expect(await loaded?.puzzle).toMatchObject({
      id: "colour-binary-medium-7",
      type: "colour-binary",
      difficulty: "medium",
    });
  });

  // The local date is different across time zones, thus a link can be of tomorrow.
  it("gives the puzzles of today and of tomorrow, and not of the day after tomorrow", () => {
    expect(loadPuzzle(`tilt-easy-${today}`)).not.toBeNull();
    expect(loadPuzzle(`tilt-easy-${today + 1}`)).not.toBeNull();
    expect(loadPuzzle(`tilt-easy-${today + 2}`)).toBeNull();
  });

  it("gives the same puzzle each time for the number of a random puzzle", async () => {
    const first = await loadPuzzle("tilt-easy-123456")?.puzzle;
    expect(first).toBeDefined();
    expect(await loadPuzzle("tilt-easy-123456")?.puzzle).toEqual(first);
  });

  // "tilt-0029" is an ID from before the daily numbers.
  it.each(["tilt-0029", "guzzle-easy-99999", "unknown-easy-1", "guzzle-easy", "guzzle", ""])(
    "gives null for the ID %j",
    (id) => {
      expect(loadPuzzle(id)).toBeNull();
    },
  );
});

describe("homeLoader", () => {
  it("gives today's puzzle of each level, the author and the date when the type came", () => {
    const numpuz = homeLoader().find((card) => card.type === "numpuz");
    expect(numpuz).toEqual({
      type: "numpuz",
      levels: [
        { id: `numpuz-easy-${today}`, difficulty: "easy" },
        { id: `numpuz-medium-${today}`, difficulty: "medium" },
        { id: `numpuz-hard-${today}`, difficulty: "hard" },
      ],
      author: "Wisdom Usiwoma",
      added: puzzleTypes.numpuz.added,
    });
  });
});

describe("puzzleNumber", () => {
  it.each([
    ["colour-binary-easy-7", "7"],
    ["tilt-hard-1049", "1049"],
  ])("gives the number of %s", (id, number) => {
    expect(puzzleNumber(id)).toBe(number);
  });
});
