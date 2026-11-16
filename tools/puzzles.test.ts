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
import {
  makePuzzle,
  puzzleTypes,
  type PuzzleMap,
  type PuzzleType,
} from "../src/app/puzzle-types/registry";
import { firstDay } from "../src/app/daily";
import { levels, type Difficulty } from "../src/shared/difficulty";
import { puzzleIdOf } from "../src/shared/puzzle";
import numpuzExample from "../src/app/puzzle-types/numpuz/examples/numpuz-0000.json";
import { findPuzzleProblems as findNumpuzProblems } from "../src/app/puzzle-types/numpuz/puzzle";
import orbitalExample from "../src/app/puzzle-types/orbital/examples/orbital-0000.json";
import { findPuzzleProblems as findOrbitalProblems } from "../src/app/puzzle-types/orbital/puzzle";
import { findSolutionProblems as findOrbitalSolutionProblems } from "../src/app/puzzle-types/orbital/solver";
import tiltExample from "../src/app/puzzle-types/tilt/examples/tilt-0000.json";
import { findPuzzleProblems as findTiltProblems } from "../src/app/puzzle-types/tilt/puzzle";
import { findSolutionProblems as findTiltSolutionProblems } from "../src/app/puzzle-types/tilt/solver";

// These checks run in CI. They make the daily puzzles of each puzzle type with its generator,
// and they stop a broken generator before a broken puzzle gets to a player.

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
  orbital: {
    example: orbitalExample,
    // An orbital puzzle must also have enough good launches, and the straight launch and the start launch must miss.
    // The flights need valid data, thus they run only when the data has no problems.
    findProblems: (puzzle) => {
      const problems = findOrbitalProblems(puzzle);
      return problems.length > 0 ? problems : findOrbitalSolutionProblems(puzzle);
    },
  },
  tilt: {
    example: tiltExample,
    // A tilt puzzle must also have a solution with the fewest tilts of its level. On hard, it must need the grey ball.
    // The search needs valid data, thus it runs only when the data has no problems.
    findProblems: (puzzle) => {
      const problems = findTiltProblems(puzzle);
      return problems.length > 0 ? problems : findTiltSolutionProblems(puzzle);
    },
  },
};

// The first days of the daily schedules. The days are fixed, thus the test gives the same result each day.
const days = Array.from({ length: 90 }, (_, index) => firstDay + index);

// This check finds problems that are the same for all puzzle types.
function findCommonProblems(puzzle: AnyPuzzle, type: PuzzleType): string[] {
  const problems: string[] = [];
  if (puzzle.type !== type) problems.push(`"type" must be "${type}".`);
  if (!levels.includes(puzzle.difficulty)) {
    problems.push(`"difficulty" must be one of: ${levels.join(", ")}.`);
  }
  if (puzzle.author.trim() === "") problems.push('"author" must not be empty.');
  if ((puzzle.license as string) !== "CC-BY-4.0") problems.push('"license" must be "CC-BY-4.0".');
  return problems;
}

// What the player sees of a puzzle at the start: the puzzle without its ID and its answer.
// Two puzzles with the same text are the same puzzle for the player.
function shownOf(puzzle: AnyPuzzle): string {
  return JSON.stringify({ ...puzzle, id: undefined, answer: undefined });
}

// The IDs of the puzzles that show the same as an earlier puzzle of the list.
function shownAgain(puzzles: readonly AnyPuzzle[]): string[] {
  const seen = new Set<string>();
  return puzzles.flatMap((puzzle) => {
    const isAgain = seen.has(shownOf(puzzle));
    seen.add(shownOf(puzzle));
    return isAgain ? [puzzle.id] : [];
  });
}

// The problems of the puzzle of one day: the fields of its ID, and the data check of its type.
function findDayProblems(puzzle: AnyPuzzle, type: PuzzleType, level: Difficulty, day: number) {
  const findProblems = checks[type].findProblems as (puzzle: AnyPuzzle) => string[];
  const fields: [boolean, string][] = [
    [puzzle.id === puzzleIdOf(type, level, day), '"id" is not the ID of the day.'],
    [puzzle.difficulty === level, '"difficulty" is not the level of the ID.'],
    [puzzle.author === puzzleTypes[type].author, '"author" is not the author of the type.'],
  ];
  return [
    ...fields.filter(([isCorrect]) => !isCorrect).map(([, problem]) => problem),
    ...findCommonProblems(puzzle, type),
    ...findProblems(puzzle),
  ];
}

describe.each(Object.keys(puzzleTypes) as PuzzleType[])("%s puzzles", (type) => {
  // The example of "rules.md" gets the same checks as the puzzles of the generator.
  it("has an example with no problems", () => {
    const example = checks[type].example as AnyPuzzle;
    const findProblems = checks[type].findProblems as (puzzle: AnyPuzzle) => string[];
    expect([...findCommonProblems(example, type), ...findProblems(example)]).toEqual([]);
  });

  // The data check of some types searches or flies each puzzle, for example 3,600 launches for each Orbital puzzle.
  // Thus 90 days of one level can take more time than the default limit of 5 s.
  describe.each(levels)("of the level %s", (level) => {
    it("makes 90 days of puzzles with no problems", { timeout: 120_000 }, async () => {
      const puzzles: AnyPuzzle[] = await Promise.all(
        days.map((day) => makePuzzle(type, level, day)),
      );
      const problems = puzzles.map((puzzle, index) => ({
        id: puzzle.id,
        problems: findDayProblems(puzzle, type, level, firstDay + index),
      }));
      expect(problems.filter((item) => item.problems.length > 0)).toEqual([]);
    });

    it("makes a different puzzle for each of 90 days", { timeout: 120_000 }, async () => {
      const puzzles: AnyPuzzle[] = await Promise.all(
        days.map((day) => makePuzzle(type, level, day)),
      );
      expect(shownAgain(puzzles)).toEqual([]);
    });
  });
});
