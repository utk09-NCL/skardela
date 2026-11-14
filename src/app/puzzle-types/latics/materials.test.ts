import { describe, expect, it } from "vitest";
import example from "./examples/latics-0000.json";
import { findPuzzleProblems, toSquares, type LaserData, type LaticsPuzzle } from "./puzzle";
import { hitsAllMonsters, pathParts, traceBeam, type Beam, type BeamPart } from "./beam";

// The first part of a beam. A beam from one laser always has a first part.
function firstPart(beam: Beam): BeamPart {
  const [part] = beam.parts;
  if (part === undefined) throw new Error("The beam has no part.");
  return part;
}

// A board from rows, with water rows ("~" is water) and the lasers in reading order.
function boardOf(rows: readonly string[], water: readonly string[], lasers: readonly LaserData[]) {
  return { squares: toSquares(rows), water: [...water.join("")].map((c) => c === "~"), lasers };
}

const white = (direction: LaserData["direction"]): LaserData => ({ direction, colour: "white" });
const steps = (beam: Beam, part = 0) => beam.parts[part]?.steps.map(({ index }) => index);
const noWater = (size: number) => Array.from({ length: size }, () => ".".repeat(size));

// The water example from the redesign: without the water, the diagonal beam goes past the monster.
// The water is at rows 2 to 4, columns 3 to 5. The beam goes into the corner of the water and turns up.
// When it leaves the water at the top, it turns back to up and right, and hits the monster at row 1, column 4.
const waterRows = ["...M..", "#.....", ".....#", "......", "....#.", "L....."];
const water = ["......", "..~~~.", "..~~~.", "..~~~.", "......", "......"];

describe("latics water", () => {
  it("does not change the beam without the water", () => {
    const beam = traceBeam(boardOf(waterRows, noWater(6), [white("NE")]));
    expect(beam.parts[0]?.end).toBe("edge");
  });

  it("turns a diagonal beam straight in the water, and back when it leaves", () => {
    const board = boardOf(waterRows, water, [white("NE")]);
    const beam = traceBeam(board);
    expect(beam.parts[0]?.steps).toEqual([
      { index: 25, enter: "NE", exit: "NE" },
      { index: 20, enter: "NE", exit: "N" },
      { index: 14, enter: "N", exit: "N" },
      { index: 8, enter: "N", exit: "NE" },
      { index: 3, enter: "NE", exit: null },
    ]);
    expect(beam.hits).toEqual([3]);
    expect(pathParts(firstPart(beam), board)).toEqual([
      { kind: "move", direction: "NE", squares: 2 },
      { kind: "turn", index: 20, direction: "N", cause: "waterIn" },
      { kind: "move", direction: "N", squares: 2 },
      { kind: "turn", index: 8, direction: "NE", cause: "waterOut" },
      { kind: "move", direction: "NE", squares: 1 },
    ]);
  });

  it("turns a diagonal beam across when it goes in through a side edge", () => {
    // From row 4, column 1 the beam goes up and right into the left edge of the water at row 2, column 3.
    const rows = ["......", "......", "......", "L.....", "......", "......"];
    const beam = traceBeam(boardOf(rows, water, [white("NE")]));
    expect(beam.parts[0]?.steps).toEqual([
      { index: 13, enter: "NE", exit: "NE" },
      { index: 8, enter: "NE", exit: "E" },
      { index: 9, enter: "E", exit: "E" },
      { index: 10, enter: "E", exit: "NE" },
      { index: 5, enter: "NE", exit: "NE" },
    ]);
  });

  it("does not change a straight beam", () => {
    const rows = ["......", "......", "......", "......", "......", "..L..."];
    const beam = traceBeam(boardOf(rows, water, [white("N")]));
    expect(steps(beam)).toEqual([26, 20, 14, 8, 2]);
    expect(firstPart(beam).steps.map(({ enter, exit }) => `${enter} to ${exit}`)).toEqual(
      Array.from({ length: 5 }, () => "N to N"),
    );
  });
});

describe("latics critical angle", () => {
  it("reflects a diagonal beam in the water back in at the edge of the water", () => {
    // The critical angle example from the redesign: the laser is in the water, at row 5, column 1.
    // The beam cannot get out at the top of the water, so it reflects down and hits the monster in the water.
    const rows = ["#....", ".....", ".....", "....M", "L...."];
    const board = boardOf(rows, [".....", ".....", "~~~~~", "~~~~~", "~~~~~"], [white("NE")]);
    const beam = traceBeam(board);
    expect(steps(beam)).toEqual([16, 12, 13, 19]);
    expect(beam.hits).toEqual([19]);
    expect(pathParts(firstPart(beam), board)).toEqual([
      { kind: "move", direction: "NE", squares: 2 },
      { kind: "turn", index: 12, direction: "SE", cause: "edge" },
      { kind: "move", direction: "SE", squares: 2 },
    ]);
  });
});

describe("latics prism", () => {
  // The prism example from the redesign: the blue monster is at row 1, column 1, and the red monster at
  // row 1, column 5. The prism is at row 3, column 3, and the laser at row 5, column 3.
  const rows = ["B...R", ".....", "..^..", "....#", "..L.."];

  it("splits a white beam into a red beam to the right and a blue beam to the left", () => {
    const board = boardOf(rows, noWater(5), [white("N")]);
    const beam = traceBeam(board);
    expect(beam.parts.map(({ colour, end }) => ({ colour, end }))).toEqual([
      { colour: "white", end: "split" },
      { colour: "red", end: "monster" },
      { colour: "blue", end: "monster" },
    ]);
    expect(beam.parts.map(({ from, direction }) => ({ from, direction }))).toEqual([
      { from: 22, direction: "N" },
      { from: 12, direction: "NE" },
      { from: 12, direction: "NW" },
    ]);
    expect(beam.hits).toEqual([0, 4]);
    expect(hitsAllMonsters(beam, board.squares)).toBe(true);
  });

  it("only turns a red beam, and does not split it", () => {
    const board = boardOf(rows, noWater(5), [{ direction: "N", colour: "red" }]);
    const beam = traceBeam(board);
    expect(beam.parts).toHaveLength(1);
    expect(beam.hits).toEqual([4]);
    expect(hitsAllMonsters(beam, board.squares)).toBe(false);
  });
});

describe("latics filter and coloured monsters", () => {
  it("lets the beam of its colour through, and stops a beam of the other colour", () => {
    // The filter example from the redesign: a blue laser at row 2 and a red laser at row 4.
    // Both beams go into a red filter. Only the red beam goes through, to the red monster.
    const rows = [".....", "L.r.B", ".....", "L.r.R", "....."];
    const lasers: LaserData[] = [
      { direction: "E", colour: "blue" },
      { direction: "E", colour: "red" },
    ];
    const beam = traceBeam(boardOf(rows, noWater(5), lasers));
    expect(beam.parts.map(({ colour, end }) => ({ colour, end }))).toEqual([
      { colour: "blue", end: "filter" },
      { colour: "red", end: "monster" },
    ]);
    expect(beam.hits).toEqual([19]);
  });

  it("gives a white beam the colour of the filter", () => {
    const beam = traceBeam(
      boardOf([".....", "L.r.R", ".....", ".....", "....."], noWater(5), [white("E")]),
    );
    expect(beam.parts.map(({ colour, end }) => ({ colour, end }))).toEqual([
      { colour: "white", end: "colour" },
      { colour: "red", end: "monster" },
    ]);
  });

  it("does not let a white beam hit a monster with a colour", () => {
    const beam = traceBeam(
      boardOf(["L...R", ".....", ".....", ".....", "....."], noWater(5), [white("E")]),
    );
    expect(beam.parts[0]?.end).toBe("otherMonster");
    expect(beam.hits).toEqual([]);
  });
});

describe("latics water data", () => {
  const puzzle = example as LaticsPuzzle;
  const withWater = (rows: readonly string[]) => findPuzzleProblems({ ...puzzle, water: rows });

  it("accepts a rectangle of water on empty squares", () => {
    expect(withWater([".....", "..~~.", "..~~.", ".....", "....."])).toEqual([]);
  });

  it("finds water that is not a rectangle, or that touches an other area at a corner", () => {
    const problem = 'Each area of "water" must be a rectangle that does not touch an other area.';
    expect(withWater([".....", "..~~.", "..~..", ".....", "....."])).toEqual([problem]);
    expect(withWater([".....", ".~...", "..~..", ".....", "....."])).toEqual([problem]);
  });

  it("finds a wall in the water, and water rows of the wrong size or with other characters", () => {
    expect(withWater([".....", ".....", ".~...", ".....", "....."])).toEqual([
      'A square in "water" can only have ".", "L", "M", "R" or "B" on "board".',
    ]);
    expect(withWater(["....."])).toEqual(['"water" must have 5 rows of 5 squares, as "board".']);
    expect(withWater([".....", "..x..", ".....", ".....", "....."])).toEqual([
      '"water" must have only "~" and ".".',
    ]);
  });
});

describe("latics beam into a laser", () => {
  // rules.md: "The beam also stops when it goes off the board or back into a laser."
  it("stops each beam at a different laser", () => {
    const board = boardOf(["L...L", ".....", ".....", ".....", "....."], noWater(5), [
      white("E"),
      white("W"),
    ]);
    const beam = traceBeam(board);
    expect(beam.parts.map((part) => part.end)).toEqual(["laser", "laser"]);
    // The beam of the first laser stops at the second laser, and the beam of the second laser at the first.
    expect([steps(beam, 0)?.at(-1), steps(beam, 1)?.at(-1)]).toEqual([4, 0]);
  });
});
