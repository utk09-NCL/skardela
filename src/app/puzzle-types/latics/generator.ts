// The generator of Latics puzzles. It keeps the first board of "candidate.ts" that passes all data checks
// and the quality checks below.
// It is pure: no React, no DOM and no side effects. The worker runs it. See "src/app/generator.ts".
import type { Difficulty } from "../../../shared/difficulty";
import { firstGoodPuzzle } from "../../../shared/generate";
import type { PuzzleBase } from "../../../shared/puzzle";
import { pathParts, traceBeam } from "./beam";
import { candidate, materialsOf, type Material } from "./candidate";
import { findPuzzleProblems, levelRules, type LaticsPuzzle } from "./puzzle";
import { boardOf, findSolutionProblems, solve } from "./solver";

// The number of the puzzle selects one material of the level, thus the material changes each day.
export function materialOf(level: Difficulty, number: number): Material {
  const forLevel = materialsOf(level);
  return forLevel[number % forLevel.length] ?? "water";
}

// The number of changes from the start to the solution (squares and lasers), and "true" when the beam
// of the solution reflects at the edge of the water.
function solutionSummary(puzzle: LaticsPuzzle): { changes: number; reflects: boolean } | null {
  const board = boardOf(puzzle);
  const solution = solve(board, {
    tray: puzzle.tray,
    canAim: levelRules[puzzle.difficulty].canAim,
  });
  if (solution === null) return null;
  const squares = board.squares.filter((square, index) => square !== solution.squares[index]);
  const turned = solution.lasers.filter(
    (laser, number) => laser.direction !== board.lasers[number]?.direction,
  );
  const beam = traceBeam({ ...board, squares: solution.squares, lasers: solution.lasers });
  const reflects = beam.parts.some((part) =>
    pathParts(part, board).some((item) => item.kind === "turn" && item.cause === "edge"),
  );
  return { changes: squares.length + turned.length, reflects };
}

// A good puzzle passes all data checks, needs 2 changes (3 on hard), and a critical angle puzzle reflects.
// The checks of the solution come first, because they take less time than the data checks of the solver.
export function isGoodPuzzle(puzzle: LaticsPuzzle, material: Material): boolean {
  if (findPuzzleProblems(puzzle).length > 0) return false;
  const summary = solutionSummary(puzzle);
  const fewestChanges = puzzle.difficulty === "hard" ? 3 : 2;
  return (
    summary !== null &&
    summary.changes >= fewestChanges &&
    (material !== "critical" || summary.reflects) &&
    findSolutionProblems(puzzle).length === 0
  );
}

// On hard, about 1 board in 500 is good for water, and more for the other materials.
// Thus the search always ends long before this limit.
const maxTries = 50_000;

// The puzzle of an ID: the first good board from the seed of the ID, with the material of its number.
export function generate(base: PuzzleBase, number: number): LaticsPuzzle {
  const material = materialOf(base.difficulty, number);
  return firstGoodPuzzle(
    base.id,
    maxTries,
    (seed) => candidate(seed, base, material),
    (puzzle) => isGoodPuzzle(puzzle, material),
  );
}
