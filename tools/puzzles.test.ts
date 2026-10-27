// This file checks each puzzle type, thus it imports from each type folder. The import count grows with each type.
/* oxlint-disable import/max-dependencies */
import { describe, expect, it } from "vitest";
import colourBinaryExample from "../src/app/puzzle-types/colour-binary/examples/colour-binary-0000.json";
import { findPuzzleProblems as findColourBinaryProblems } from "../src/app/puzzle-types/colour-binary/puzzle";
import { obeysRules } from "../src/app/puzzle-types/colour-binary/rules-check";
import { countSolutions } from "../src/app/puzzle-types/colour-binary/solver";
import { toSquares } from "../src/app/puzzle-types/colour-binary/puzzle";
import guzzleExample from "../src/app/puzzle-types/guzzle/examples/guzzle-0000.json";
import { findPuzzleProblems as findGuzzleProblems } from "../src/app/puzzle-types/guzzle/puzzle";
import laticsExample from "../src/app/puzzle-types/latics/examples/latics-0000.json";
import { findPuzzleProblems as findLaticsProblems } from "../src/app/puzzle-types/latics/puzzle";
import { findSolutionProblems as findLaticsSolutionProblems } from "../src/app/puzzle-types/latics/solver";
import { puzzleTypes, type PuzzleMap, type PuzzleType } from "../src/app/puzzle-types/registry";
import { levels } from "../src/shared/difficulty";
import numpuzExample from "../src/app/puzzle-types/numpuz/examples/numpuz-0000.json";
import { findPuzzleProblems as findNumpuzProblems } from "../src/app/puzzle-types/numpuz/puzzle";

// These checks run on each puzzle file in CI.
// They stop broken puzzle data before it gets to a player.

type AnyPuzzle = PuzzleMap[PuzzleType];

// Each puzzle type gives its example from rules.md and its own data check.
// When you add a puzzle type to the registry, TypeScript tells you to add it here too.
const checks: {
  [Type in PuzzleType]: { example: unknown; findProblems: (puzzle: PuzzleMap[Type]) => string[] };
} = {
  "colour-binary": {
    example: colourBinaryExample,
    // A colour-binary puzzle must also have exactly one answer, and the answer must obey the rules.
    findProblems: (puzzle) => [
      ...findColourBinaryProblems(puzzle),
      ...(obeysRules(toSquares(puzzle.answer)) ? [] : ['"answer" does not obey the rules.']),
      ...(countSolutions(toSquares(puzzle.start)) === 1
        ? []
        : ['"start" must have exactly one answer.']),
    ],
  },
  guzzle: { example: guzzleExample, findProblems: findGuzzleProblems },
  latics: {
    example: laticsExample,
    // A latics puzzle must also have a solution that needs each mirror in the tray.
    // The solver needs valid data, thus it runs only when the data has no problems.
    findProblems: (puzzle) => {
      const problems = findLaticsProblems(puzzle);
      return problems.length > 0 ? problems : findLaticsSolutionProblems(puzzle);
    },
  },
  numpuz: { example: numpuzExample, findProblems: findNumpuzProblems },
};

// This check finds problems that are the same for all puzzle types.
function findCommonProblems(puzzle: AnyPuzzle, type: PuzzleType): string[] {
  const problems: string[] = [];
  if (puzzle.type !== type) problems.push(`"type" must be "${type}".`);
  if (!new RegExp(`^${type}-\\d{4}$`, "u").test(puzzle.id)) {
    problems.push(`"id" must be "${type}-" and 4 digits.`);
  }
  if (!levels.includes(puzzle.difficulty)) {
    problems.push(`"difficulty" must be one of: ${levels.join(", ")}.`);
  }
  if (puzzle.author.trim() === "") problems.push('"author" must not be empty.');
  if ((puzzle.license as string) !== "CC-BY-4.0") problems.push('"license" must be "CC-BY-4.0".');
  return problems;
}

describe.each(Object.keys(puzzleTypes) as PuzzleType[])("%s puzzle file", (type) => {
  // The example is the same as the puzzles in the file, so it gets the same checks.
  const findProblems = checks[type].findProblems as (puzzle: AnyPuzzle) => string[];
  const load = async () => [...(await puzzleTypes[type].loadPuzzles())] as AnyPuzzle[];

  it("has no broken puzzles", async () => {
    for (const puzzle of [checks[type].example as AnyPuzzle, ...(await load())]) {
      const problems = [...findCommonProblems(puzzle, type), ...findProblems(puzzle)];
      expect({ id: puzzle.id, problems }).toEqual({ id: puzzle.id, problems: [] });
    }
  });

  it("has a different ID for each puzzle", async () => {
    const ids = (await load()).map((puzzle) => puzzle.id);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  });

  // A copy of a puzzle with a different ID gives the player the same puzzle two times.
  it("has different content for each puzzle", async () => {
    const contents = (await load()).map((puzzle) => JSON.stringify({ ...puzzle, id: undefined }));
    expect(contents.filter((content, index) => contents.indexOf(content) !== index)).toEqual([]);
  });

  it("has at least one puzzle for each level", async () => {
    const puzzles = await load();
    const missing = levels.filter(
      (level) => !puzzles.some((puzzle) => puzzle.difficulty === level),
    );
    expect(missing).toEqual([]);
  });
});
