// The generator of Numpuz puzzles. It makes random equations from a seed and keeps the first equation
// that obeys "## Puzzles" in "rules.md".
// It is pure: no React, no DOM and no side effects. The worker runs it. See "src/app/generator.ts".
import type { Difficulty } from "../../../shared/difficulty";
import { firstGoodPuzzle } from "../../../shared/generate";
import { puzzleIdOf, type PuzzleBase } from "../../../shared/puzzle";
import { makeRandom, pickOne } from "../../../shared/random";
import { firstDay, isScheduled } from "../../daily";
import { counts, type NumpuzPuzzle } from "./puzzle";
import { evaluate, operators } from "./rules-check";

// The largest number and the largest target of "## Puzzles" in "rules.md".
export const maxNumber = 9;
export const maxTarget = 99;

// A daily puzzle does not have the numbers and the target of a daily puzzle of the last "gap" days.
// Easy has only about 3,700 different puzzles. Without this rule, a puzzle comes back after some weeks.
export const gap = 365;

// The board data of a puzzle.
export type Equation = Pick<NumpuzPuzzle, "numbers" | "target" | "answer">;

// One random equation for a seed. The same seed always gives the same equation.
// The target is the result of the equation, thus the equation has one correct answer or more.
function candidate(seed: number, level: Difficulty): Equation {
  const random = makeRandom(seed);
  const numbers = Array.from({ length: counts[level] }, () => 1 + Math.floor(random() * maxNumber));
  const answer = numbers.slice(1).map(() => pickOne(operators, random) ?? "+");
  return { numbers, target: evaluate(numbers, answer) ?? 0, answer };
}

// In a good equation, the target is a whole number from 1 to "maxTarget", and the operators are not all the same.
export function isGoodEquation({ target, answer }: Equation): boolean {
  return Number.isInteger(target) && target >= 1 && target <= maxTarget && new Set(answer).size > 1;
}

// What the player sees of an equation: the numbers and the target.
function shownOf({ numbers, target }: Equation): string {
  return `${numbers.join(" ")} = ${target}`;
}

// About 1 equation in 4 is good. Thus the search always ends long before this limit.
const maxTries = 10_000;

// The first good equation from the seed of an ID that "isFree" accepts.
function firstEquation(
  id: string,
  level: Difficulty,
  isFree: (equation: Equation) => boolean,
): Equation {
  return firstGoodPuzzle(
    id,
    maxTries,
    (seed) => candidate(seed, level),
    (equation) => isGoodEquation(equation) && isFree(equation),
  );
}

// The equation of each day from "firstDay" to "lastDay", for one level. Each day takes the first good equation
// that the last "gap" days did not show. Each browser runs the same schedule, thus each browser gets the same equations.
export function dailyEquations(level: Difficulty, lastDay: number): Equation[] {
  // The last day that showed each equation.
  const lastUse = new Map<string, number>();
  const days: Equation[] = [];
  for (let day = firstDay; day <= lastDay; day += 1) {
    const equation = firstEquation(
      puzzleIdOf("numpuz", level, day),
      level,
      (found) => day - (lastUse.get(shownOf(found)) ?? -Infinity) >= gap,
    );
    lastUse.set(shownOf(equation), day);
    days.push(equation);
  }
  return days;
}

// The puzzle of an ID. A daily puzzle from "firstDay" gets the equation of its day in the schedule.
// Each other number gets the first good equation from the seed of its ID, with no gap.
export function generate(base: PuzzleBase, number: number): NumpuzPuzzle {
  const level = base.difficulty;
  const scheduled = isScheduled(number) ? dailyEquations(level, number).at(-1) : undefined;
  return {
    ...base,
    type: "numpuz",
    ...(scheduled ?? firstEquation(base.id, level, () => true)),
  };
}
