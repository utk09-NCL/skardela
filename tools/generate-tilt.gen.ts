// This adds new Tilt puzzles to "puzzles/tilt.json". It is not a test: run it only when you want new puzzles.
//
//   TILT_PLAN="easy:30,medium:30,hard:30" npm run generate:tilt
//
// TILT_PLAN: the puzzles to make, as level:count. The levels are easy, medium and hard.
// TILT_SEED: the first seed (optional, 1 by default). The same plan and seed always give the same puzzles.
//   Use a different seed to get different puzzles.
// TILT_TRIES: the number of boards to try for each plan item (optional, 50000 by default).
// The new puzzles get the next free IDs. Then run "npm run fix && npm run check", and play some of them.
import { expect, it } from "vitest";
import { addPuzzles, parseLevelPlan } from "./generator-script";
import { boardKey, generate, puzzleFileText } from "./tilt-generator";

it("adds new Tilt puzzles to puzzles/tilt.json", { timeout: 3_600_000 }, () => {
  const { message, missing } = addPuzzles({
    type: "tilt",
    planExample: "easy:3",
    parsePlan: parseLevelPlan,
    generate,
    boardKey,
    puzzleFileText,
    itemText: (item) => `${item.level}:${item.count}`,
  });
  process.stdout.write(message);
  // The puzzles that the generator found are in the file. For a missing item, try TILT_SEED or TILT_TRIES.
  expect(missing).toBe("");
});
