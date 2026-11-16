import { describe, expect, it } from "vitest";
import { levels } from "../../../shared/difficulty";
import { baseOf } from "../../../test/puzzle-base";
import { firstDay } from "../../daily";
import { makePuzzle } from "../registry";
import {
  dailyEquations,
  gap,
  generate,
  isGoodEquation,
  maxNumber,
  maxTarget,
  type Equation,
} from "./generator";
import { counts, findPuzzleProblems } from "./puzzle";

// The rules of "## Puzzles" in "rules.md" that a puzzle breaks.
function brokenRules({ numbers, target, answer }: Equation) {
  return [
    ...(numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= maxNumber) ? [] : ["numbers"]),
    ...(Number.isInteger(target) && target >= 1 && target <= maxTarget ? [] : ["target"]),
    ...(new Set(answer).size > 1 ? [] : ["operators"]),
  ];
}

// The equations that the player sees again before the end of the gap, in the days of a schedule.
function earlyEquations(days: readonly Equation[]): string[] {
  const lastUse = new Map<string, number>();
  return days.flatMap(({ numbers, target }, day) => {
    const shown = `${numbers.join(" ")} = ${target}`;
    const isEarly = day - (lastUse.get(shown) ?? -Infinity) < gap;
    lastUse.set(shown, day);
    return isEarly ? [`${shown} on day ${day}`] : [];
  });
}

describe("numpuz generator equations", () => {
  it("accepts only a whole target from 1 to 99, and operators that are not all the same", () => {
    expect(isGoodEquation({ numbers: [6, 3, 2], target: 7, answer: ["+", "-"] })).toBe(true);
    expect(isGoodEquation({ numbers: [7, 2, 1], target: 4.5, answer: ["÷", "+"] })).toBe(false);
    expect(isGoodEquation({ numbers: [1, 2, 3], target: 0, answer: ["+", "-"] })).toBe(false);
    expect(isGoodEquation({ numbers: [9, 9, 2], target: 162, answer: ["×", "+"] })).toBe(false);
    expect(isGoodEquation({ numbers: [1, 2, 3], target: 6, answer: ["+", "+"] })).toBe(false);
  });
});

describe("numpuz generator puzzles", () => {
  it("makes a puzzle that obeys the rules and passes the data check, with the fields of its ID", () => {
    for (const level of levels) {
      for (const number of [7, firstDay + 3, 123_456]) {
        const base = baseOf("numpuz", level, number);
        const puzzle = generate(base, number);
        expect(puzzle).toMatchObject({ ...base, type: "numpuz" });
        expect(puzzle.numbers).toHaveLength(counts[level]);
        expect([...findPuzzleProblems(puzzle), ...brokenRules(puzzle)]).toEqual([]);
      }
    }
  });

  it("makes the same puzzle again for the same ID", () => {
    expect(generate(baseOf("numpuz", "hard", 7), 7)).toEqual(
      generate(baseOf("numpuz", "hard", 7), 7),
    );
  });

  // The six puzzles of the first puzzle file. The rules of the generator come from them.
  it.each([
    [[2, 3, 4], 14, ["+", "×"]],
    [[8, 2, 3, 4], 16, ["÷", "×", "+"]],
    [[6, 2, 3, 4, 5], 10, ["÷", "+", "×", "-"]],
    [[8, 6, 3], 6, ["-", "÷"]],
    [[7, 5, 3, 8], 26, ["-", "+", "×"]],
    [[6, 7, 4, 2, 3], 17, ["+", "×", "÷", "-"]],
  ] as const)("accepts the first puzzle %j = %i", (numbers, target, answer) => {
    expect(brokenRules({ numbers, target, answer })).toEqual([]);
    expect(isGoodEquation({ numbers, target, answer })).toBe(true);
  });

  // The puzzle of a day must not change, because each player of that day gets the same puzzle.
  // A change to the generator or to the rules that changes these puzzles changes the puzzles of each day.
  it.each([
    ["easy", { numbers: [4, 8, 1], target: 12, answer: ["+", "×"] }],
    ["medium", { numbers: [3, 8, 1, 9], target: 5, answer: ["-", "+", "+"] }],
    ["hard", { numbers: [9, 9, 2, 4, 3], target: 6, answer: ["÷", "÷", "×", "×"] }],
  ] as const)("makes the fixed %s puzzle of day 1049", async (level, equation) => {
    expect(await makePuzzle("numpuz", level, 1049)).toMatchObject(equation);
  });
});

describe("numpuz daily schedule", () => {
  // Easy has only about 3,700 different puzzles, thus random equations alone repeat after some weeks.
  it.each(levels)("shows no %s puzzle again inside the gap, in 3 years", (level) => {
    expect(earlyEquations(dailyEquations(level, firstDay + 1095))).toEqual([]);
  });

  it("gives the puzzle of a day the equation of that day in the schedule", () => {
    const day = firstDay + 40;
    expect(generate(baseOf("numpuz", "easy", day), day)).toMatchObject({
      ...dailyEquations("easy", day).at(-1),
    });
  });
});
