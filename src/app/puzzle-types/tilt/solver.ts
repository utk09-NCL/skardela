import { levelRules, type TiltPuzzle } from "./puzzle";
import {
  allInHoles,
  directions,
  readBoard,
  tiltBoard,
  type Ball,
  type Direction,
  type Layout,
} from "./rules-check";

// The search of Tilt. It finds the fewest tilts that get all coloured balls into their holes.
// The game uses it for "Fewest" on the board. The data check and the generator use it too.

// A number for the position of all balls, so the search can find a position that it saw before.
// Each ball gives one digit in the base "2 × squares": the index of its square, plus "squares" when it is in its hole.
// The balls are always in the same order, thus two equal positions give the same number.
function keyOf(balls: readonly Ball[], squares: number): number {
  let key = 0;
  for (const ball of balls) key = key * 2 * squares + (ball.isInHole ? squares : 0) + ball.index;
  return key;
}

// The step before a position in the search: the position before it and the tilt from there.
type Step = { readonly from: number; readonly direction: Direction };

// The tilts from the start to the position "key", from the steps that the search keeps.
function pathTo(steps: ReadonlyMap<number, Step | null>, key: number): Direction[] {
  const path: Direction[] = [];
  for (
    let step = steps.get(key);
    step !== undefined && step !== null;
    step = steps.get(step.from)
  ) {
    path.push(step.direction);
  }
  return path.toReversed();
}

// The tilts of one best solution, in order. A best solution has the fewest tilts.
// Each tilt in the list moves one or more balls (see "tiltBoard" in "rules-check.ts").
// The result is an empty list when each coloured ball is already in its hole.
// The result is "null" when no order of tilts gets all coloured balls into their holes.
// When more than one best solution exists, it gives one of them.
export function solve(layout: Layout, balls: readonly Ball[]): Direction[] | null {
  if (allInHoles(balls)) return [];
  const squares = layout.size * layout.size;
  const start = keyOf(balls, squares);
  const steps = new Map<number, Step | null>([[start, null]]);
  // A breadth-first search: it looks at all positions after 1 tilt, then after 2 tilts, and so on.
  // Thus the first solved position that it finds has the fewest tilts.
  const queue: { readonly key: number; readonly balls: readonly Ball[] }[] = [
    { key: start, balls },
  ];
  for (let head = 0; head < queue.length; head += 1) {
    const current = queue[head];
    if (current === undefined) break;
    for (const direction of directions) {
      const result = tiltBoard(layout, current.balls, direction);
      // A tilt that moves no ball does not count. See "## Edge cases" in "rules.md".
      if (result.moves.length === 0) continue;
      const key = keyOf(result.balls, squares);
      if (steps.has(key)) continue;
      steps.set(key, { from: current.key, direction });
      if (allInHoles(result.balls)) return pathTo(steps, key);
      queue.push({ key, balls: result.balls });
    }
  }
  return null;
}

// The fewest tilts from the start of the puzzle: the length of the result of "solve".
// The result is "null" when the puzzle has no solution.
// It uses only "board". It does not check the size or the balls of the level.
// See "## Edge cases": "The board shows the fewest tilts from the start. A search in the browser finds it."
export function fewestTilts(puzzle: TiltPuzzle): number | null {
  const { layout, balls } = readBoard(puzzle.board);
  return solve(layout, balls)?.length ?? null;
}

// The data checks that need a search. It gives one text for each problem,
// and an empty list for a puzzle with no problems. It finds these problems from "## Puzzle data" in "rules.md":
// - The puzzle has no solution, or its fewest tilts are not in the range of its level ("levelRules").
// - Hard: the puzzle has a solution without the grey ball.
// Use it only for a puzzle with no problems from "findPuzzleProblems".
export function findSolutionProblems(puzzle: TiltPuzzle): string[] {
  const problems: string[] = [];
  const level = levelRules[puzzle.difficulty];
  const { layout, balls } = readBoard(puzzle.board);
  const solution = solve(layout, balls);
  if (solution === null) {
    problems.push(
      "The puzzle has no solution. No order of tilts gets all coloured balls into their holes.",
    );
  } else if (solution.length < level.fewest.min || solution.length > level.fewest.max) {
    problems.push(
      `The fewest tilts must be from ${level.fewest.min} to ${level.fewest.max} for the level "${puzzle.difficulty}". This puzzle needs ${solution.length}.`,
    );
  }
  // Hard: the grey ball must be necessary. Without it, the puzzle must have no solution.
  const withoutGrey = balls.filter((ball) => ball.colour !== "grey");
  if (level.hasGrey && withoutGrey.length < balls.length && solve(layout, withoutGrey) !== null) {
    problems.push("Without the grey ball, the puzzle must have no solution. It has a solution.");
  }
  return problems;
}
