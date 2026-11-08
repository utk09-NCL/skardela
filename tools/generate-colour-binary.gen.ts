// This adds new Colour Binary puzzles to "puzzles/colour-binary.json". It is not a test: run it only when you
// want new puzzles.
//
//   COLOUR_BINARY_PLAN="easy:10,medium:10,hard:10" npm run generate:colour-binary
//
// COLOUR_BINARY_PLAN: the puzzles to make, as level:count. The levels are easy, medium and hard.
// COLOUR_BINARY_SEED: the first seed (optional, 1 by default). The same plan and seed always give the same
//   puzzles. Use a different seed to get different puzzles.
// COLOUR_BINARY_TRIES: the number of boards to try for each plan item (optional, 50000 by default).
// The new puzzles get the next free IDs. Then run "npm run fix && npm run check", and play some of them.
import { expect, it } from "vitest";
import { boardKey, generate, puzzleFileText } from "./colour-binary-generator";
import { addPuzzles, parseLevelPlan } from "./generator-script";

it("adds new Colour Binary puzzles to puzzles/colour-binary.json", { timeout: 3_600_000 }, () => {
  const { message, missing } = addPuzzles({
    type: "colour-binary",
    planExample: "easy:3",
    parsePlan: parseLevelPlan,
    generate,
    boardKey,
    puzzleFileText,
    itemText: (item) => `${item.level}:${item.count}`,
  });
  process.stdout.write(message);
  // The puzzles that the generator found are in the file. For a missing item, try COLOUR_BINARY_SEED.
  expect(missing).toBe("");
});
