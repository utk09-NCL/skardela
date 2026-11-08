// This adds new Latics puzzles to "puzzles/latics.json". It is not a test: run it only when you want new puzzles.
//
//   LATICS_PLAN="water:easy:3,prism:hard:2" npm run generate:latics
//
// LATICS_PLAN: the puzzles to make, as material:level:count. The materials are water, critical, prism and filter.
// LATICS_SEED: the first seed (optional, 1 by default). The same plan and seed always give the same puzzles.
//   Use a different seed to get different puzzles.
// LATICS_TRIES: the number of boards to try for each plan item (optional, 50000 by default).
// The new puzzles get the next free IDs. Then run "npm run fix && npm run check", and play some of them.
import { expect, it } from "vitest";
import { addPuzzles } from "./generator-script";
import { boardKey, generate, parsePlan, puzzleFileText } from "./latics-generator";

it("adds new Latics puzzles to puzzles/latics.json", { timeout: 3_600_000 }, () => {
  const { message, missing } = addPuzzles({
    type: "latics",
    planExample: "water:easy:3",
    parsePlan,
    generate,
    boardKey,
    puzzleFileText,
    itemText: (item) => `${item.material}:${item.level}:${item.count}`,
  });
  process.stdout.write(message);
  // The puzzles that the generator found are in the file. For a missing item, try LATICS_SEED or LATICS_TRIES.
  expect(missing).toBe("");
});
