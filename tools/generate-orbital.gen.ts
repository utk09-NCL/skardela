// This adds new Orbital puzzles to "puzzles/orbital.json". It is not a test: run it only when you want new puzzles.
//
//   ORBITAL_PLAN="easy:30,medium:30,hard:30" npm run generate:orbital
//
// ORBITAL_PLAN: the puzzles to make, as level:count. The levels are easy, medium and hard.
// ORBITAL_SEED: the first seed (optional, 1 by default). The same plan and seed always give the same puzzles.
//   Use a different seed to get different puzzles.
// ORBITAL_TRIES: the number of boards to try for each plan item (optional, 50000 by default).
// The new puzzles get the next free IDs. Then run "npm run fix && npm run check", and play some of them.
import { expect, it } from "vitest";
import { addPuzzles, parseLevelPlan } from "./generator-script";
import { boardKey, generate, puzzleFileText } from "./orbital-generator";

it("adds new Orbital puzzles to puzzles/orbital.json", { timeout: 3_600_000 }, () => {
  const { message, missing } = addPuzzles({
    type: "orbital",
    planExample: "easy:3",
    parsePlan: parseLevelPlan,
    generate,
    boardKey,
    puzzleFileText,
    itemText: (item) => `${item.level}:${item.count}`,
  });
  process.stdout.write(message);
  // The puzzles that the generator found are in the file. For a missing item, try ORBITAL_SEED or ORBITAL_TRIES.
  expect(missing).toBe("");
});
