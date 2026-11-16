import {
  directions,
  isFilter,
  isMirror,
  levelRules,
  mirrors,
  toSquares,
  toWater,
  type BeamColour,
  type Direction,
  type LaserData,
  type LaticsPuzzle,
  type Square,
} from "./puzzle";
import {
  hitsAllMonsters,
  laserSquares,
  monsterSquares,
  stateKey,
  traceBeam,
  type BoardLayout,
} from "./beam";
import { effectOf } from "./rules-check";
import { crossing } from "./water";

export type Solution = {
  readonly squares: readonly Square[];
  readonly lasers: readonly LaserData[];
};

type Options = {
  // The number of mirrors in the tray.
  readonly tray: number;
  // "true": the solver can also turn the lasers.
  readonly canAim: boolean;
};

// A part of the beam that the search must still follow. See "traceBeam" in "beam.ts".
type Front = {
  readonly index: number;
  readonly direction: Direction;
  readonly colour: BeamColour;
  readonly memory: Direction | null;
};

// The state of one search. "squares" has the pieces of the board that the search tries now.
// "fixed": the squares that a path visited, thus their pieces do not change on this board.
// "seen": the states that the search followed on this board. "hits": the number of hits on each monster.
type Search = {
  readonly squares: Square[];
  readonly water: readonly boolean[];
  readonly monsters: readonly number[];
  readonly fixed: Set<number>;
  readonly seen: Set<string>;
  readonly hits: Map<number, number>;
  trayLeft: number;
};

type Move = ReturnType<typeof crossing>;

// Each list of directions for the lasers. Without aim, only the start directions.
function aims(lasers: readonly LaserData[], canAim: boolean): LaserData[][] {
  if (!canAim) return [[...lasers]];
  let lists: LaserData[][] = [[]];
  for (const { colour } of lasers) {
    const longer: LaserData[][] = [];
    for (const list of lists) {
      for (const direction of directions) longer.push([...list, { direction, colour }]);
    }
    lists = longer;
  }
  return lists;
}

// The pieces that the search tries in a square at the first visit.
function choices(search: Search, index: number, square: Square): readonly Square[] {
  if (isMirror(square)) return mirrors;
  const canPlace = square === "." && search.trayLeft > 0 && search.water[index] !== true;
  return canPlace ? [".", ...mirrors] : [square];
}

// This returns "true" when the beams hit each monster. Then "search.squares" has the solution.
function followAll(search: Search, fronts: readonly Front[]): boolean {
  const [front, ...rest] = fronts;
  if (front === undefined)
    return search.monsters.every((index) => (search.hits.get(index) ?? 0) > 0);
  return follow(search, front, rest);
}

// This follows one front to the next square. At a square with choices, it tries each choice.
function follow(search: Search, front: Front, rest: readonly Front[]): boolean {
  const key = stateKey(front);
  if (search.seen.has(key)) return followAll(search, rest);
  search.seen.add(key);
  const move = crossing(search, front.index, front.direction, front.memory);
  const isFound =
    move.next === null ? followAll(search, rest) : tryChoices(search, front, move, move.next, rest);
  if (!isFound) search.seen.delete(key);
  return isFound;
}

function tryChoices(
  search: Search,
  front: Front,
  move: Move,
  next: number,
  rest: readonly Front[],
): boolean {
  const { squares, fixed } = search;
  const original = squares[next] ?? "#";
  const isFirstVisit = !fixed.has(next);
  fixed.add(next);
  for (const choice of isFirstVisit ? choices(search, next, original) : [original]) {
    const cost = original === "." && choice !== "." ? 1 : 0;
    squares[next] = choice;
    search.trayLeft -= cost;
    const isFound = afterEffect(search, front, move, next, rest);
    search.trayLeft += cost;
    if (isFound) return true;
  }
  squares[next] = original;
  if (isFirstVisit) fixed.delete(next);
  return false;
}

// What the piece in the next square does: a stop, a hit, or one or more rays that go on.
function afterEffect(
  search: Search,
  front: Front,
  move: Move,
  next: number,
  rest: readonly Front[],
): boolean {
  const effect = effectOf(search.squares[next] ?? "#", move.arrive, front.colour);
  if ("stop" in effect) {
    if (effect.stop !== "monster") return followAll(search, rest);
    const { hits } = search;
    hits.set(next, (hits.get(next) ?? 0) + 1);
    const isFound = followAll(search, rest);
    hits.set(next, (hits.get(next) ?? 1) - 1);
    return isFound;
  }
  const rays = effect.rays.map((ray) => ({
    index: next,
    direction: !effect.isNewPart && move.turnTo !== null ? move.turnTo : ray.direction,
    colour: ray.colour,
    memory: effect.isNewPart ? null : move.memory,
  }));
  return followAll(search, [...rays, ...rest]);
}

// "true" when the board has light of the colour of each monster with a colour: a laser of that colour,
// or a white laser with a prism or with a filter of that colour. The player cannot move these pieces.
// Without this light, no beam can hit the monster, thus the board has no solution. This needs no search.
function hasLightForEachMonster({ squares, lasers }: BoardLayout): boolean {
  const hasWhite = lasers.some(({ colour }) => colour === "white");
  const hasLight = (colour: "red" | "blue", filter: Square) =>
    lasers.some((laser) => laser.colour === colour) ||
    (hasWhite && (squares.includes("^") || squares.includes(filter)));
  return (
    (!squares.includes("R") || hasLight("red", "r")) &&
    (!squares.includes("B") || hasLight("blue", "b"))
  );
}

// This function finds a solution that uses "options.tray" tray mirrors or fewer. It returns "null" only when
// no such solution exists. Thus the result does not depend on the order of the search.
//
// It is a depth-first search along the parts of the beam, one part after the other. Only the squares on a path
// matter: a piece that is not on a path does not change the beam.
// At the first visit to a mirror, the search tries each angle. At the first visit to an empty square out of the water,
// it tries no mirror, and a tray mirror at each angle. The search also tries a mirror along the beam, because a beam
// can come back to the square later from a different direction.
// After the first visit, a square keeps its piece, so the earlier parts of the paths do not change.
// A state that the search already followed on this board gives the same path again, thus the search stops there.
// Each solution has its own paths, and the search tries each choice on each path. Thus the search is complete.
// The tests compare it with a search that tries each possible board.
export function solve(board: BoardLayout, options: Options): Solution | null {
  if (!hasLightForEachMonster(board)) return null;
  const squares = [...board.squares];
  const search: Search = {
    squares,
    water: board.water,
    monsters: monsterSquares(squares),
    fixed: new Set(),
    seen: new Set(),
    hits: new Map(),
    trayLeft: options.tray,
  };
  const from = laserSquares(squares);
  for (const lasers of aims(board.lasers, options.canAim)) {
    const fronts = lasers.flatMap(({ direction, colour }, number) => {
      const index = from[number];
      return index === undefined ? [] : [{ index, direction, colour, memory: null }];
    });
    if (followAll(search, fronts)) return { squares: [...squares], lasers };
  }
  return null;
}

// The smallest number of tray mirrors in a solution, or "null" when no solution has "maxTray" mirrors or fewer.
// "solve" with "tray: k" finds a solution with k mirrors or fewer when one exists.
// Thus the first k with a solution is the smallest number. The result does not depend on the order of the search.
export function fewestTrayMirrors(
  board: BoardLayout,
  options: { readonly maxTray: number; readonly canAim: boolean },
): number | null {
  for (let tray = 0; tray <= options.maxTray; tray += 1) {
    if (solve(board, { tray, canAim: options.canAim }) !== null) return tray;
  }
  return null;
}

// The board of a puzzle, for the beam and the solver.
export function boardOf(puzzle: LaticsPuzzle): BoardLayout {
  return { squares: toSquares(puzzle.board), water: toWater(puzzle), lasers: puzzle.lasers };
}

// The materials of a puzzle, and the same board without each material.
// A puzzle with a material must need it: without it, the puzzle must have no solution.
function withoutMaterials(board: BoardLayout): { name: string; board: BoardLayout }[] {
  const { squares, water } = board;
  const without = (remove: (square: Square) => boolean) =>
    squares.map((square) => (remove(square) ? "." : square));
  const list: { name: string; board: BoardLayout }[] = [];
  if (water.includes(true))
    list.push({ name: "water", board: { ...board, water: water.map(() => false) } });
  if (squares.includes("^"))
    list.push({ name: "prism", board: { ...board, squares: without((square) => square === "^") } });
  if (squares.some((square) => isFilter(square)))
    list.push({ name: "filter", board: { ...board, squares: without(isFilter) } });
  return list;
}

// The checks for a good puzzle. The data checks in "tools/" use them.
// They need valid data, thus run them only when "findPuzzleProblems" finds no problems.
// A good puzzle needs all its tray mirrors: the smallest number of tray mirrors in a solution is "tray".
// It also needs each of its materials: water, prisms and filters.
export function findSolutionProblems(puzzle: LaticsPuzzle): string[] {
  const { canAim } = levelRules[puzzle.difficulty];
  const board = boardOf(puzzle);
  const problems: string[] = [];
  if (hitsAllMonsters(traceBeam(board), board.squares)) {
    problems.push("The beam must not hit all monsters at the start.");
  }
  const fewest = fewestTrayMirrors(board, { maxTray: puzzle.tray, canAim });
  if (fewest === null) {
    problems.push("The puzzle must have a solution.");
  } else if (fewest < puzzle.tray) {
    problems.push(
      `"tray" is ${puzzle.tray}, but a solution needs only ${fewest} of the tray mirrors.`,
    );
  }
  for (const material of withoutMaterials(board)) {
    if (solve(material.board, { tray: puzzle.tray, canAim }) !== null) {
      problems.push(`The puzzle must need its ${material.name}: it has a solution without it.`);
    }
  }
  return problems;
}
