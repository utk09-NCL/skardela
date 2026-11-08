import { levelRules, type OrbitalPuzzle } from "./puzzle";
import {
  fly,
  maxAngle,
  maxPower,
  minPower,
  readBoard,
  startAim,
  straightAngle,
  type Aim,
  type Board,
} from "./rules-check";

// The search of Orbital. It flies each of the 3,600 possible launches: 360 angles × 10 powers.
// The data check and the generator use it. The game does not use it, because each launch starts
// from the launch point: the fewest launches are always 1.

// All good launches of the board: each aim that reaches the ring with "fly" in "rules-check.ts".
// The order is from the smallest angle to the largest angle, and for one angle from the smallest power
// to the largest power. Thus the first item is one best solution. The browser checker plays it.
// The result is an empty list when no launch reaches the ring.
export function goodLaunches(board: Board): Aim[] {
  const good: Aim[] = [];
  for (let angle = 0; angle <= maxAngle; angle += 1) {
    for (let power = minPower; power <= maxPower; power += 1) {
      const aim = { angle, power };
      if (fly(board, aim).end.type === "ring") good.push(aim);
    }
  }
  return good;
}

// The data checks that need a flight. It gives one text for each rule below that the puzzle breaks,
// and an empty list for a puzzle with no problems. Thus each rule gives one text or no text.
// It finds these problems from "## Puzzle data" in "rules.md":
// - A launch at "straightAngle" reaches the ring at a power from 1 to 10.
// - The launch at "startAim" (0° and power 5) reaches the ring.
// - The puzzle has fewer good launches ("goodLaunches") than "minGoodLaunches" of its level.
// Use it only for a puzzle with no problems from "findPuzzleProblems".
export function findSolutionProblems(puzzle: OrbitalPuzzle): string[] {
  const board = readBoard(puzzle);
  const level = levelRules[puzzle.difficulty];
  // The good launches have all launches that reach the ring, thus the first two checks need no other flight.
  const good = goodLaunches(board);
  const straight = straightAngle(board);
  const problems: string[] = [];
  if (good.some((aim) => aim.angle === straight)) {
    problems.push(
      `A launch at ${straight}°, straight at the centre of the ring, must not reach the ring at any power.`,
    );
  }
  if (good.some((aim) => aim.angle === startAim.angle && aim.power === startAim.power)) {
    problems.push(
      `The launch at the start values, ${startAim.angle}° and power ${startAim.power}, must not reach the ring.`,
    );
  }
  if (good.length < level.minGoodLaunches) {
    problems.push(
      `The level "${puzzle.difficulty}" needs ${level.minGoodLaunches} or more good launches. The puzzle has ${good.length}.`,
    );
  }
  return problems;
}
