// The generator of new Latics puzzles. It makes random boards with a material (water, critical angle, prism or filter)
// and keeps only the boards that pass all data checks and the quality checks below.
// It is pure: it does not read or write files. "generate-latics.gen.ts" adds its puzzles to "puzzles/latics.json".
import { pathParts, traceBeam } from "../src/app/puzzle-types/latics/beam";
import {
  directions,
  findPuzzleProblems,
  levelRules,
  mirrors,
  type BeamColour,
  type LaserData,
  type LaticsPuzzle,
  type Square,
} from "../src/app/puzzle-types/latics/puzzle";
import { boardOf, findSolutionProblems, solve } from "../src/app/puzzle-types/latics/solver";
import { levels, type Difficulty } from "../src/shared/difficulty";
import { makeRandom } from "../src/shared/random";
import { generatePuzzles, type GenerateOptions } from "./generator-script";

// "critical": the critical angle. Its puzzles are only on "hard", because only the player on "hard" can turn
// a laser in the water. They have two lasers: one in the water that reflects at the edge to a monster in the water,
// and one out of the water that uses the tray. A beam in the water cannot use a tray mirror.
export const materials = ["water", "critical", "prism", "filter"] as const;
export type Material = (typeof materials)[number];

// One line of the plan: the number of puzzles to make for one material and one level.
export type PlanItem = {
  readonly material: Material;
  readonly level: Difficulty;
  readonly count: number;
};

// The plan as text, for example "water:easy:3,prism:hard:2".
export function parsePlan(text: string): PlanItem[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map((item) => {
      const [material = "", level = "", count = ""] = item.split(":");
      const isMaterial = (materials as readonly string[]).includes(material);
      const isLevel = (levels as readonly string[]).includes(level);
      if (!isMaterial || !isLevel || !/^[1-9]\d*$/u.test(count)) {
        throw new Error(
          `"${item}" is not a plan item. Use material:level:count, for example water:easy:3. ` +
            `The materials are ${materials.join(", ")}. The levels are ${levels.join(", ")}.`,
        );
      }
      if (material === "critical" && level !== "hard") {
        throw new Error(`"${item}": critical angle puzzles are only on hard.`);
      }
      return { material: material as Material, level: level as Difficulty, count: Number(count) };
    });
}

// ---------- A random board ----------

type Where = "dry" | "wet" | "any";

// A board that the generator builds piece by piece.
type Builder = {
  readonly size: number;
  readonly squares: Square[];
  readonly water: boolean[];
  // Each laser with its square, in the order of the code. The data needs them in reading order.
  readonly lasers: { readonly index: number; readonly laser: LaserData }[];
  readonly random: () => number;
};

function pick<Item>(builder: Builder, list: readonly Item[]): Item {
  return list[Math.floor(builder.random() * list.length)] as Item;
}

function between(builder: Builder, low: number, high: number): number {
  return low + Math.floor(builder.random() * (high - low + 1));
}

// A rectangle of water with 2 or more rows and columns.
function addWater(builder: Builder) {
  const { size } = builder;
  const rows = between(builder, 2, Math.min(4, size - 2));
  const columns = between(builder, 2, Math.min(5, size - 2));
  const top = between(builder, 0, size - rows);
  const left = between(builder, 0, size - columns);
  for (let row = top; row < top + rows; row += 1) {
    for (let column = left; column < left + columns; column += 1) {
      builder.water[row * size + column] = true;
    }
  }
}

// A piece on a random empty square: out of the water ("dry"), in the water ("wet"), or on each square ("any").
// It gives the square, or "null" when no square is free.
function place(builder: Builder, square: Square, where: Where = "dry"): number | null {
  const free = [...builder.squares.keys()].filter((index) => {
    const isWet = builder.water[index] === true;
    const isPlace = where === "any" || (where === "wet" ? isWet : !isWet);
    return builder.squares[index] === "." && isPlace;
  });
  if (free.length === 0) return null;
  const index = pick(builder, free);
  builder.squares[index] = square;
  return index;
}

// A laser with a random direction.
function addLaser(builder: Builder, colour: BeamColour, where: Where = "dry") {
  const index = place(builder, "L", where);
  const direction = pick(builder, directions);
  if (index !== null) builder.lasers.push({ index, laser: { direction, colour } });
}

// The lasers, the monsters and the pieces of each material.
function addMaterial(builder: Builder, material: Material, level: Difficulty) {
  if (material === "water" || material === "critical") addWater(builder);
  if (material === "water") {
    addLaser(builder, "white");
    place(builder, "M", builder.random() < 0.25 ? "any" : "dry");
  } else if (material === "critical") {
    addLaser(builder, "white", "wet");
    place(builder, "M", "wet");
    addLaser(builder, "white");
    place(builder, "M");
  } else if (material === "prism") {
    addLaser(builder, "white");
    for (const square of ["^", "R", "B"] as const) place(builder, square);
    if (level === "hard" && builder.random() < 0.5) place(builder, "M");
  } else {
    // A white beam needs a filter to get a colour. On medium and hard, a second laser has a colour.
    addLaser(builder, "white");
    place(builder, pick(builder, ["r", "b"] as const));
    place(builder, pick(builder, ["R", "B"] as const));
    if (level !== "easy") {
      addLaser(builder, pick(builder, ["red", "blue"] as const));
      place(builder, pick(builder, ["r", "b"] as const));
      place(builder, pick(builder, ["R", "B", "M"] as const));
    }
  }
}

// The walls and the mirrors of each level, from the fewest to the most.
const clutter: Record<Difficulty, { walls: [number, number]; mirrors: [number, number] }> = {
  easy: { walls: [1, 3], mirrors: [2, 4] },
  medium: { walls: [3, 6], mirrors: [3, 6] },
  hard: { walls: [5, 9], mirrors: [4, 8] },
};

function addWallsAndMirrors(builder: Builder, level: Difficulty) {
  const { walls, mirrors: mirrorCount } = clutter[level];
  for (let count = between(builder, ...walls); count > 0; count -= 1) place(builder, "#");
  for (let count = between(builder, ...mirrorCount); count > 0; count -= 1) {
    place(builder, pick(builder, mirrors));
  }
}

function rowsOf(size: number, cells: readonly string[]): string[] {
  return Array.from({ length: size }, (_, row) =>
    cells.slice(row * size, row * size + size).join(""),
  );
}

// One random puzzle for a seed. The same seed always gives the same puzzle. The ID is a placeholder.
export function candidate(seed: number, level: Difficulty, material: Material): LaticsPuzzle {
  const { size, tray } = levelRules[level];
  const builder: Builder = {
    size,
    squares: Array.from({ length: size * size }, () => "."),
    water: Array.from({ length: size * size }, () => false),
    lasers: [],
    random: makeRandom(seed),
  };
  addMaterial(builder, material, level);
  addWallsAndMirrors(builder, level);
  const hasWater = builder.water.includes(true);
  return {
    id: "latics-0000",
    type: "latics",
    difficulty: level,
    author: "skardela",
    license: "CC-BY-4.0",
    board: rowsOf(size, builder.squares),
    // The data needs the lasers in the reading order of their squares.
    lasers: builder.lasers
      .toSorted((first, second) => first.index - second.index)
      .map(({ laser }) => laser),
    tray: between(builder, tray.min, tray.max),
    ...(hasWater
      ? {
          water: rowsOf(
            size,
            builder.water.map((wet) => (wet ? "~" : ".")),
          ),
        }
      : {}),
  };
}

// ---------- The quality checks ----------

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
export function isGoodPuzzle(puzzle: LaticsPuzzle, material: Material): boolean {
  if (findPuzzleProblems(puzzle).length > 0 || findSolutionProblems(puzzle).length > 0)
    return false;
  const summary = solutionSummary(puzzle);
  if (summary === null) return false;
  const fewestChanges = puzzle.difficulty === "hard" ? 3 : 2;
  return summary.changes >= fewestChanges && (material !== "critical" || summary.reflects);
}

// ---------- The plan ----------

// A key of a board, so two puzzles with the same board and water are the same puzzle.
export function boardKey(puzzle: Pick<LaticsPuzzle, "board" | "water">): string {
  return `${puzzle.board.join("/")}|${(puzzle.water ?? []).join("/")}`;
}

// This makes the puzzles of the plan. See "generatePuzzles" in "generator-script.ts".
export function generate(plan: readonly PlanItem[], options: GenerateOptions) {
  return generatePuzzles(plan, options, {
    candidate: (seed, item) => candidate(seed, item.level, item.material),
    isGoodPuzzle: (puzzle, item) => isGoodPuzzle(puzzle, item.material),
    boardKey,
  });
}

// The text of the puzzle file: JSON with two spaces, and each laser on one line, as in the other puzzles.
// Run "npm run fix" after a change, so the formatter puts the rest in its form.
export function puzzleFileText(puzzles: readonly LaticsPuzzle[]): string {
  const text = JSON.stringify(puzzles, null, 2);
  return `${text.replaceAll(
    /\{\s*"direction": "([A-Z]+)",\s*"colour": "([a-z]+)"\s*\}/gu,
    '{ "direction": "$1", "colour": "$2" }',
  )}\n`;
}
