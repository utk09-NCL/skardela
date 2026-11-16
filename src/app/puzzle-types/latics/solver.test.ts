import { describe, expect, it } from "vitest";
import { makeRandom } from "../../../shared/random";
import example from "./examples/latics-0000.json";
import {
  beamColours,
  directions,
  isMirror,
  mirrors,
  toSquares,
  type LaserData,
  type LaticsPuzzle,
  type Square,
} from "./puzzle";
import { boardOf, fewestTrayMirrors, findSolutionProblems, solve, type Solution } from "./solver";
import { hitsAllMonsters, traceBeam, type BoardLayout } from "./beam";

const puzzle = example as LaticsPuzzle;
const start = toSquares(puzzle.board);
const east: LaserData[] = [{ direction: "E", colour: "white" }];

type TestBoard = BoardLayout & { readonly maxTray: number; readonly canAim: boolean };

// A board without water, with one white laser that points right.
function plain(rows: readonly string[]): BoardLayout {
  const squares = toSquares(rows);
  return { squares, water: squares.map(() => false), lasers: east };
}

// Each way to select "count" items from the list, in the order of the list.
function* combinations<Item>(list: readonly Item[], count: number): Generator<Item[]> {
  if (count === 0) {
    yield [];
    return;
  }
  for (const [index, item] of list.entries()) {
    for (const rest of combinations(list.slice(index + 1), count - 1)) yield [item, ...rest];
  }
}

// Each list of "count" items of the list.
function* lists<Item>(list: readonly Item[], count: number): Generator<Item[]> {
  if (count === 0) {
    yield [];
    return;
  }
  for (const item of list) {
    for (const rest of lists(list, count - 1)) yield [item, ...rest];
  }
}

// Each list of directions for the lasers. Without aim, only the start directions.
function aimsOf({ lasers, canAim }: TestBoard): LaserData[][] {
  if (!canAim) return [[...lasers]];
  return [...lists(directions, lasers.length)].map((list) =>
    list.map((direction, number) => ({ ...(lasers[number] as LaserData), direction })),
  );
}

// A reference solver for the tests. It tries each possible board: each angle of each board mirror,
// each set of tray mirrors on the empty squares out of the water at each angle, and each direction of each laser.
// It is slow, but it is simple, so it is easy to trust.
function bruteForceFewest(board: TestBoard): number | null {
  const { squares, water, maxTray } = board;
  const boardMirrors = [...squares.keys()].filter((index) => isMirror(squares[index] ?? "."));
  const empty = [...squares.keys()].filter((index) => squares[index] === "." && !water[index]);
  for (let tray = 0; tray <= maxTray; tray += 1) {
    for (const placed of combinations(empty, tray)) {
      const changeable = [...boardMirrors, ...placed];
      for (const angle of lists(mirrors, changeable.length)) {
        const changed = squares.map((square, index) => angle[changeable.indexOf(index)] ?? square);
        const isHit = aimsOf(board).some((lasers) =>
          hitsAllMonsters(traceBeam({ squares: changed, water, lasers }), changed),
        );
        if (isHit) return tray;
      }
    }
  }
  return null;
}

// A small random board on 4 × 4 squares: one or two lasers, one or two monsters, some walls and mirrors,
// and sometimes a prism, a filter and a rectangle of water. Most lasers and monsters are white.
// The board is small, so the reference solver can try each possible board fast.
function randomBoard(seed: number): TestBoard {
  const random = makeRandom(seed);
  const pick = <Item>(list: readonly Item[]) => list[Math.floor(random() * list.length)] as Item;
  const chance = (value: number) => random() < value;
  const squares: Square[] = Array.from({ length: 16 }, () => ".");
  // The water: a rectangle of 1 or 2 rows and 1 or 2 columns, on half of the boards.
  const water = squares.map(() => false);
  if (chance(0.5)) {
    const [top, left, rows, columns] = [
      pick([0, 1, 2]),
      pick([0, 1, 2]),
      pick([1, 2]),
      pick([1, 2]),
    ];
    for (let row = top; row < top + rows; row += 1) {
      for (let column = left; column < left + columns; column += 1) water[row * 4 + column] = true;
    }
  }
  const place = (square: Square, isWet = false) => {
    const free = [...squares.keys()].filter(
      (index) => squares[index] === "." && (isWet || !water[index]),
    );
    if (free.length > 0) squares[pick(free)] = square;
  };
  const laserCount = chance(0.25) ? 2 : 1;
  Array.from({ length: laserCount }).forEach(() => place("L", true));
  Array.from({ length: chance(0.3) ? 2 : 1 }).forEach(() =>
    place(pick(["M", "M", "R", "B"]), true),
  );
  Array.from({ length: Math.floor(random() * 3) }).forEach(() => place("#"));
  Array.from({ length: Math.floor(random() * 3) }).forEach(() => place(pick(mirrors)));
  if (chance(0.3)) place("^");
  if (chance(0.3)) place(pick(["r", "b"]));
  const lasers = squares
    .filter((square) => square === "L")
    .map(() => ({
      direction: pick(directions),
      colour: chance(0.7) ? "white" : pick(beamColours),
    }));
  return {
    squares,
    water,
    lasers,
    maxTray: Math.floor(random() * 3),
    canAim: laserCount === 1 && chance(0.3),
  };
}

// The rules that a solution breaks: it must hit each monster, keep the pieces that do not change, keep a mirror
// on each board mirror square, put no tray mirror on water, use not more tray mirrors than the tray has,
// and turn the lasers only when the player can aim.
function brokenRules(board: TestBoard, solution: Solution | null): string[] {
  if (solution === null) return [];
  const problems: string[] = [];
  const beam = traceBeam({ ...board, squares: solution.squares, lasers: solution.lasers });
  if (!hitsAllMonsters(beam, solution.squares)) problems.push("not all monsters are hit");
  const placed = [...board.squares.keys()].filter(
    (index) => board.squares[index] === "." && solution.squares[index] !== ".",
  );
  if (placed.length > board.maxTray) problems.push("too many tray mirrors");
  if (placed.some((index) => board.water[index])) problems.push("a tray mirror in water");
  for (const [index, square] of board.squares.entries()) {
    const after = solution.squares[index] ?? ".";
    const isAllowed =
      isMirror(square) || square === "." ? square === after || isMirror(after) : square === after;
    if (!isAllowed) problems.push(`square ${index} changed from ${square} to ${after}`);
  }
  const isTurned = solution.lasers.some(
    (laser, number) => laser.direction !== board.lasers[number]?.direction,
  );
  if (!board.canAim && isTurned) problems.push("a laser turned");
  if (solution.lasers.some((laser, number) => laser.colour !== board.lasers[number]?.colour)) {
    problems.push("a laser changed its colour");
  }
  return problems;
}

const boards = Array.from({ length: 300 }, (_, seed) => randomBoard(seed + 1));

describe("latics solver", () => {
  it("solves the rules.md example by turning the two mirrors", () => {
    expect(solve(boardOf(puzzle), { tray: 0, canAim: false })).toEqual({
      lasers: east,
      squares: start.with(3, "\\").with(23, "\\"),
    });
  });

  it("finds no solution when a wall blocks the only path", () => {
    // A wall in front of the monster blocks the beam from the second mirror.
    const blocked = plain(["L..-.", ".....", ".#...", ".....", "..|#M"]);
    expect(solve(blocked, { tray: 0, canAim: false })).toBeNull();
  });

  it("puts a mirror from the tray where the path needs it", () => {
    // The beam goes right along row 1. Only a tray mirror at row 1, column 5 can send it down to the monster.
    const board = plain(["L....", ".....", ".....", ".....", "....M"]);
    expect(solve(board, { tray: 0, canAim: false })).toBeNull();
    expect(solve(board, { tray: 1, canAim: false })).toEqual({
      lasers: east,
      squares: board.squares.with(4, "\\"),
    });
  });
});

describe("latics solver with the lasers, the water and the prism", () => {
  it("does not put a tray mirror on water", () => {
    const board = { ...plain(["L....", ".....", ".....", ".....", "....M"]) };
    const water = board.squares.map((_, index) => index === 4);
    expect(solve({ ...board, water }, { tray: 1, canAim: false })).toBeNull();
  });

  it("turns the laser when the player can aim", () => {
    const board = plain(["L....", ".....", ".....", ".....", "....M"]);
    expect(solve(board, { tray: 0, canAim: true })).toEqual({
      lasers: [{ direction: "SE", colour: "white" }],
      squares: board.squares,
    });
  });

  // A red monster needs red light: a red laser, or a white laser with a prism or a red filter.
  it("finds no solution for a monster with a colour when the board has no light of that colour", () => {
    const board = plain(["L...R", ".....", ".....", ".....", "....."]);
    expect(solve(board, { tray: 2, canAim: true })).toBeNull();
    const blue: LaserData[] = [{ direction: "E", colour: "blue" }];
    expect(solve({ ...board, lasers: blue }, { tray: 2, canAim: true })).toBeNull();
    const withFilter = plain(["L.b.R", ".....", ".....", ".....", "....."]);
    expect(solve(withFilter, { tray: 2, canAim: true })).toBeNull();
    // With red light, the search finds the solution.
    const red: LaserData[] = [{ direction: "E", colour: "red" }];
    expect(solve({ ...board, lasers: red }, { tray: 0, canAim: false })).not.toBeNull();
    const redFilter = plain(["L.r.R", ".....", ".....", ".....", "....."]);
    expect(solve(redFilter, { tray: 0, canAim: false })).not.toBeNull();
  });

  it("hits each monster with the parts of a split beam", () => {
    // The prism splits the beam: red goes up and right, blue goes up and left.
    // The mirror at row 4, column 3 must turn to send the beam up to the prism.
    const board = plain(["B...R", ".....", "..^..", "..-..", "....."]);
    const fromBelow = { ...board, squares: board.squares.with(22, "L") };
    expect(
      solve(
        { ...fromBelow, lasers: [{ direction: "N", colour: "white" }] },
        { tray: 0, canAim: false },
      ),
    ).toEqual({
      lasers: [{ direction: "N", colour: "white" }],
      squares: fromBelow.squares.with(17, "|"),
    });
  });
});

describe("latics solver is complete and correct", () => {
  // The reference search tries each possible board of 300 boards, thus this test is slow.
  it(
    "finds the same smallest number of tray mirrors as a search of each possible board",
    { timeout: 20_000 },
    () => {
      const fast = boards.map((board) => fewestTrayMirrors(board, board));
      expect(fast).toEqual(boards.map((board) => bruteForceFewest(board)));
      // The random boards must give each result, else the comparison does not prove much.
      expect(new Set(fast)).toEqual(new Set([null, 0, 1, 2]));
    },
  );

  it("gives only solutions that obey the rules of the game", () => {
    const problems = boards.flatMap((board) =>
      brokenRules(board, solve(board, { tray: board.maxTray, canAim: board.canAim })),
    );
    expect(problems).toEqual([]);
  });
});

describe("latics solution checks", () => {
  it("accepts the example", () => {
    expect(findSolutionProblems(puzzle)).toEqual([]);
  });

  it("finds a puzzle that is solved at the start or has no solution", () => {
    const solved = { ...puzzle, board: puzzle.board.with(0, "L..\\.").with(4, "...\\M") };
    expect(findSolutionProblems(solved)).toEqual([
      "The beam must not hit all monsters at the start.",
    ]);
    const blocked = { ...puzzle, board: puzzle.board.with(4, "..|#M") };
    expect(findSolutionProblems(blocked)).toEqual(["The puzzle must have a solution."]);
  });

  it("finds a tray mirror that the solution does not need", () => {
    const extra = { ...puzzle, difficulty: "medium" as const, tray: 1 };
    expect(findSolutionProblems(extra)).toEqual([
      '"tray" is 1, but a solution needs only 0 of the tray mirrors.',
    ]);
  });

  it("finds water, a prism or a filter that the puzzle does not need", () => {
    const water = { ...puzzle, water: [".....", "..~~.", "..~~.", ".....", "....."] };
    expect(findSolutionProblems(water)).toEqual([
      "The puzzle must need its water: it has a solution without it.",
    ]);
    const prism = { ...puzzle, board: puzzle.board.with(2, ".#..^") };
    expect(findSolutionProblems(prism)).toEqual([
      "The puzzle must need its prism: it has a solution without it.",
    ]);
  });
});
