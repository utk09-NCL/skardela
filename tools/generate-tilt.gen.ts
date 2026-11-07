// This adds new Tilt puzzles to "puzzles/tilt.json". It is not a test: run it only when you want new puzzles.
//
//   TILT_PLAN="easy:30,medium:30,hard:30" npm run generate:tilt
//
// TILT_PLAN: the puzzles to make, as level:count. The levels are easy, medium and hard.
// TILT_SEED: the first seed (optional, 1 by default). The same plan and seed always give the same puzzles.
//   Use a different seed to get different puzzles.
// TILT_TRIES: the number of boards to try for each plan item (optional, 50000 by default).
// The new puzzles get the next free IDs. Then run "npm run fix && npm run check", and play some of them.
import { readFileSync, writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import type { TiltPuzzle } from "../src/app/puzzle-types/tilt/puzzle";
import { boardKey, generate, parsePlan, puzzleFileText } from "./tilt-generator";

const file = new URL("../puzzles/tilt.json", import.meta.url);

// The number in a Tilt ID, for example 31 for "tilt-0031".
const numberOf = (id: string) => Number(id.slice("tilt-".length));
const idOf = (number: number) => `tilt-${String(number).padStart(4, "0")}`;

// This makes the puzzles of the plan and adds them to the file. It gives a message with the new IDs, and the plan
// items without enough puzzles as text, for example "hard:1". The text is empty when the plan is complete.
function addPuzzles(): { message: string; missing: string } {
  const plan = parsePlan(process.env.TILT_PLAN ?? "");
  if (plan.length === 0) {
    throw new Error('Give a plan, for example: TILT_PLAN="easy:3" npm run generate:tilt');
  }
  const puzzles = JSON.parse(readFileSync(file, "utf8")) as TiltPuzzle[];
  const { found, missing } = generate(plan, {
    seed: Number(process.env.TILT_SEED ?? "1"),
    maxTries: Number(process.env.TILT_TRIES ?? "50000"),
    known: puzzles.map((puzzle) => boardKey(puzzle)),
  });
  const next = Math.max(0, ...puzzles.map((puzzle) => numberOf(puzzle.id))) + 1;
  const added: TiltPuzzle[] = [];
  for (const [position, puzzle] of found.entries()) {
    added.push({ ...puzzle, id: idOf(next + position) });
  }
  writeFileSync(file, puzzleFileText([...puzzles, ...added]));
  const ids = added.map((puzzle) => puzzle.id).join(", ");
  return {
    message: `Added ${added.length} ${added.length === 1 ? "puzzle" : "puzzles"}: ${ids}.\n`,
    missing: missing.map((item) => `${item.level}:${item.count}`).join(","),
  };
}

it("adds new Tilt puzzles to puzzles/tilt.json", { timeout: 3_600_000 }, () => {
  const { message, missing } = addPuzzles();
  process.stdout.write(message);
  // The puzzles that the generator found are in the file. For a missing item, try TILT_SEED or TILT_TRIES.
  expect(missing).toBe("");
});
