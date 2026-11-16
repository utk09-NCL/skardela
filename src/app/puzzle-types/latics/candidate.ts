// One random Latics board for a seed. The generator builds each board from a solution: it puts the mirrors,
// the material and the monsters on the path of the beam. Then it turns the mirrors to wrong angles and takes
// the tray mirrors back to the tray. Thus each board has a solution, and "generator.ts" needs no search
// to find that a random board has none.
// It is pure: no React, no DOM and no side effects.
import type { Difficulty } from "../../../shared/difficulty";
import type { PuzzleBase } from "../../../shared/puzzle";
import { makeRandom } from "../../../shared/random";
import { hitsAllMonsters, pathParts, traceBeam } from "./beam";
import {
  addLaser,
  addMirrors,
  addMonster,
  addOnPath,
  addWater,
  between,
  isDry,
  layoutOf,
  pick,
  place,
  type Builder,
} from "./builder";
import { directions, levelRules, mirrors, type Filter, type LaticsPuzzle } from "./puzzle";
import { isDiagonal } from "./rules-check";

// "critical": the critical angle. Its puzzles are only on "hard", because only the player on "hard" can turn
// a laser in the water. They have two lasers: one in the water that reflects at the edge to a monster in the water,
// and one out of the water that uses the tray. A beam in the water cannot use a tray mirror.
const materials = ["water", "critical", "prism", "filter"] as const;
export type Material = (typeof materials)[number];

// The materials of a level.
export function materialsOf(level: Difficulty): Material[] {
  return materials.filter((material) => material !== "critical" || level === "hard");
}

// ---------- The materials ----------

const diagonals = directions.filter((direction) => isDiagonal(direction));
const colourOf = { r: "red", b: "blue" } as const;
const monsterOf = { red: "R", blue: "B" } as const;

type Counts = { readonly board: number; readonly tray: number };

// The pieces of each material, with a solution. Each function gives "false" when a piece has no place.

// Water: a diagonal beam goes through the water to the monster. The water moves the beam to the side.
function addWaterPuzzle(builder: Builder, count: Counts): boolean {
  addWater(builder);
  const laser = addLaser(builder, "white", "dry", diagonals);
  return addMonster(builder, addMirrors(builder, laser, count), "M") !== null;
}

// The critical angle: a diagonal beam of a laser in the water reflects at the edge of the water to a monster.
// A second laser out of the water uses the mirrors.
function addCriticalPuzzle(builder: Builder, count: Counts): boolean {
  addWater(builder);
  const inWater = addLaser(builder, "white", "wet", diagonals);
  const first = addMonster(builder, inWater, "M");
  const laser = addLaser(builder, "white", "dry");
  return first !== null && addMonster(builder, addMirrors(builder, laser, count), "M") !== null;
}

// A prism: it splits the white beam. The red monster is on the red beam, and the blue monster on the blue beam.
// Each mirror is before the prism, or on the red beam or the blue beam after it.
function addPrismPuzzle(builder: Builder, count: Counts): boolean {
  const laser = addLaser(builder, "white", "dry");
  const before = between(builder, 0, Math.min(1, count.board));
  const red = between(builder, 0, count.board - before);
  const trayRed = between(builder, 0, count.tray);
  const prism = addOnPath(
    builder,
    addMirrors(builder, laser, { board: before, tray: 0 }),
    () => "^",
    isDry(builder),
  );
  const lastRed = addMirrors(builder, prism, { board: red, tray: trayRed }, "red");
  const lastBlue = addMirrors(
    builder,
    prism,
    { board: count.board - before - red, tray: count.tray - trayRed },
    "blue",
  );
  return addMonster(builder, lastRed, "R") !== null && addMonster(builder, lastBlue, "B") !== null;
}

// A filter: it gives the white beam its colour, for a monster of that colour.
// On medium and hard, a second laser has the other colour. Thus only the filter gives the colour of the first monster.
function addFilterPuzzle(builder: Builder, count: Counts): boolean {
  const filter: Filter = pick(builder, ["r", "b"] as const);
  const hasSecond = builder.level !== "easy";
  // The second laser gets a part of the mirrors.
  const second = {
    board: hasSecond ? between(builder, 0, count.board) : 0,
    tray: hasSecond ? between(builder, 0, count.tray) : 0,
  };
  const before = between(builder, 0, Math.min(1, count.board - second.board));
  const laser = addLaser(builder, "white", "dry");
  const filterAt = addOnPath(
    builder,
    addMirrors(builder, laser, { board: before, tray: 0 }),
    () => filter,
    isDry(builder),
  );
  const last = addMirrors(builder, filterAt, {
    board: count.board - second.board - before,
    tray: count.tray - second.tray,
  });
  if (addMonster(builder, last, monsterOf[colourOf[filter]]) === null) return false;
  if (!hasSecond) return true;
  const other = filter === "r" ? "blue" : "red";
  const otherLaser = addLaser(builder, other, "dry");
  place(builder, pick(builder, ["r", "b"] as const), "dry");
  const monster = pick(builder, ["M", monsterOf[other]] as const);
  return addMonster(builder, addMirrors(builder, otherLaser, second), monster) !== null;
}

const addMaterial: Record<Material, (builder: Builder, count: Counts) => boolean> = {
  water: addWaterPuzzle,
  critical: addCriticalPuzzle,
  prism: addPrismPuzzle,
  filter: addFilterPuzzle,
};

// ---------- The board ----------

// The walls and the mirrors of each level, from the fewest to the most. "onPath": the mirrors of the board
// that the builder puts on the path of the beam. The other mirrors are not on the path.
const clutter: Record<
  Difficulty,
  { walls: [number, number]; mirrors: [number, number]; onPath: [number, number] }
> = {
  easy: { walls: [1, 3], mirrors: [2, 4], onPath: [2, 3] },
  medium: { walls: [3, 6], mirrors: [3, 6], onPath: [1, 3] },
  hard: { walls: [5, 9], mirrors: [4, 8], onPath: [1, 3] },
};

// "true" when the solution uses its material: the beam bends at the water, or reflects at the edge of the water.
function usesWater(builder: Builder, material: Material): boolean {
  if (material !== "water" && material !== "critical") return true;
  const layout = layoutOf(builder);
  const causes = new Set(
    traceBeam(layout).parts.flatMap((part) =>
      pathParts(part, layout).flatMap((item) => (item.kind === "turn" ? [item.cause] : [])),
    ),
  );
  return material === "critical"
    ? causes.has("edge")
    : causes.has("waterIn") || causes.has("waterOut");
}

// The walls and the other mirrors, on squares that are not on the path. Thus they do not change the solution.
function addClutter(builder: Builder) {
  const { walls, mirrors: mirrorCount } = clutter[builder.level];
  const onPath = new Set(
    traceBeam(layoutOf(builder)).parts.flatMap((part) => part.steps.map((step) => step.index)),
  );
  for (let count = between(builder, ...walls); count > 0; count -= 1) {
    place(builder, "#", "dry", onPath);
  }
  const others = between(builder, ...mirrorCount) - builder.boardMirrors.length;
  for (let count = others; count > 0; count -= 1) {
    place(builder, pick(builder, mirrors), "dry", onPath);
  }
}

// A different item of the list.
function otherOf<Item>(builder: Builder, list: readonly Item[], item: unknown): Item {
  return pick(
    builder,
    list.filter((other) => other !== item),
  );
}

function rowsOf(size: number, cells: readonly string[]): string[] {
  return Array.from({ length: size }, (_, row) =>
    cells.slice(row * size, row * size + size).join(""),
  );
}

// The start of the puzzle, from the solution of the builder: each mirror on the path has a wrong angle,
// the tray mirrors are in the tray, and on hard each laser has a wrong direction.
function startOf(builder: Builder): Pick<LaticsPuzzle, "board" | "lasers" | "tray" | "water"> {
  const { size, level } = builder;
  const squares = [...builder.squares];
  for (const index of builder.boardMirrors) {
    squares[index] = otherOf(builder, mirrors, squares[index]);
  }
  for (const index of builder.trayMirrors) squares[index] = ".";
  const { canAim } = levelRules[level];
  const lasers = layoutOf(builder).lasers.map(({ direction, colour }) => ({
    direction: canAim ? otherOf<typeof direction>(builder, directions, direction) : direction,
    colour,
  }));
  const water = rowsOf(
    size,
    builder.water.map((wet) => (wet ? "~" : ".")),
  );
  return {
    board: rowsOf(size, squares),
    lasers,
    tray: builder.trayMirrors.length,
    ...(builder.water.includes(true) ? { water } : {}),
  };
}

// One random puzzle for a seed, or "null" when a piece has no place on the path.
// The same seed always gives the same puzzle.
export function candidate(seed: number, base: PuzzleBase, material: Material): LaticsPuzzle | null {
  const level = base.difficulty;
  const { size, tray } = levelRules[level];
  const builder: Builder = {
    level,
    size,
    squares: Array.from({ length: size * size }, () => "."),
    water: Array.from({ length: size * size }, () => false),
    lasers: [],
    boardMirrors: [],
    trayMirrors: [],
    random: makeRandom(seed),
  };
  const count = {
    board: between(builder, ...clutter[level].onPath),
    tray: between(builder, tray.min, tray.max),
  };
  if (!addMaterial[material](builder, count) || !usesWater(builder, material)) return null;
  addClutter(builder);
  // A later piece can stop the beam of an earlier laser. Then the board of the builder is not a solution.
  const layout = layoutOf(builder);
  if (!hitsAllMonsters(traceBeam(layout), layout.squares)) return null;
  return { ...base, type: "latics", ...startOf(builder) };
}
