/* oxlint-disable max-lines, max-lines-per-function -- one file holds all rule tests of this module. */
import { describe, expect, it } from "vitest";
import example from "./examples/orbital-0000.json";
import type { OrbitalPuzzle, PlanetSize } from "./puzzle";
import { findPuzzleProblems } from "./puzzle";
import {
  aimOfDrag,
  canStartDrag,
  fly,
  isAim,
  readBoard,
  startAim,
  straightAngle,
  type Board,
} from "./rules-check";

// The example is the rules.md example. It is an easy puzzle with one big planet.
const easy = example as OrbitalPuzzle;

// A medium puzzle: the launch point and the ring are on x 30. Planet A is on the line.
const medium: OrbitalPuzzle = {
  ...easy,
  difficulty: "medium",
  launch: { x: 30, y: 10 },
  ring: { x: 30, y: 80 },
  planets: [
    { x: 30, y: 45, size: "small" },
    { x: 60, y: 45, size: "small" },
  ],
};

// A hard puzzle: three small planets, all far from the line x 30.
const hard: OrbitalPuzzle = {
  ...easy,
  difficulty: "hard",
  launch: { x: 30, y: 10 },
  ring: { x: 30, y: 80 },
  planets: [
    { x: 30, y: 45, size: "small" },
    { x: 60, y: 30, size: "small" },
    { x: 60, y: 60, size: "small" },
  ],
};

// A board with no planet. Thus no pull changes the flight.
const empty: Board = {
  launch: { x: 10, y: 10 },
  ring: { x: 90, y: 50 },
  ringRadius: 6,
  planets: [],
};

// A board with the launch point at the centre and the ring at (x, y).
const at = (x: number, y: number): Board => ({
  launch: { x: 50, y: 50 },
  ring: { x, y },
  ringRadius: 6,
  planets: [],
});

describe("orbital data check", () => {
  // Rule: "The puzzle has no problems" (no text) for a good puzzle.
  it("gives no problem for the example", () => {
    expect(findPuzzleProblems(easy)).toEqual([]);
  });

  it("gives no problem for a good medium and a good hard puzzle", () => {
    expect(findPuzzleProblems(medium)).toEqual([]);
    expect(findPuzzleProblems(hard)).toEqual([]);
  });

  // Rule: "A data check board ... passes the checks that need no flight."
  it("gives no problem for the five data check boards of rules.md", () => {
    const boards: OrbitalPuzzle[] = [
      {
        ...easy,
        difficulty: "medium",
        launch: { x: 92, y: 67 },
        ring: { x: 22, y: 21 },
        planets: [
          { x: 30, y: 68, size: "small" },
          { x: 44, y: 37, size: "small" },
        ],
      },
      {
        ...easy,
        difficulty: "hard",
        launch: { x: 69, y: 11 },
        ring: { x: 69, y: 81 },
        planets: [
          { x: 69, y: 61, size: "medium" },
          { x: 54, y: 63, size: "small" },
          { x: 36, y: 60, size: "medium" },
        ],
      },
      {
        ...easy,
        difficulty: "hard",
        launch: { x: 9, y: 23 },
        ring: { x: 83, y: 76 },
        planets: [
          { x: 30, y: 55, size: "medium" },
          { x: 47, y: 48, size: "medium" },
          { x: 61, y: 47, size: "small" },
        ],
      },
      {
        ...easy,
        launch: { x: 65, y: 82 },
        ring: { x: 64, y: 14 },
        planets: [{ x: 28, y: 41, size: "small" }],
      },
      {
        ...easy,
        difficulty: "medium",
        launch: { x: 12, y: 23 },
        ring: { x: 89, y: 30 },
        planets: [
          { x: 72, y: 72, size: "medium" },
          { x: 70, y: 32, size: "small" },
        ],
      },
    ];
    for (const board of boards) expect(findPuzzleProblems(board)).toEqual([]);
  });

  // Rule: "An x or a y is not a whole number from 0 to 100."
  it("refuses a coordinate that is not a whole number", () => {
    expect(findPuzzleProblems({ ...easy, ring: { x: 40.5, y: 85 } })).toHaveLength(1);
  });

  it("refuses a coordinate below 0 or above 100", () => {
    expect(findPuzzleProblems({ ...easy, launch: { x: -1, y: 10 } })).toHaveLength(1);
    expect(findPuzzleProblems({ ...easy, launch: { x: 101, y: 10 } })).toHaveLength(1);
  });

  // Rule: "A size is not small, medium or big."
  it("refuses a size that is not small, medium or big", () => {
    const bad = { ...easy, planets: [{ x: 40, y: 50, size: "huge" as PlanetSize }] };
    expect(findPuzzleProblems(bad).length).toBeGreaterThan(0);
  });

  // Rule: "The number of planets is not the number of its level."
  it("refuses a wrong number of planets on each level", () => {
    const extra = { x: 70, y: 30, size: "small" as const };
    expect(findPuzzleProblems({ ...easy, planets: [...easy.planets, extra] })).toHaveLength(1);
    expect(findPuzzleProblems({ ...easy, planets: [] })).toHaveLength(1);
    expect(findPuzzleProblems({ ...medium, planets: medium.planets.slice(0, 1) })).toHaveLength(1);
    expect(findPuzzleProblems({ ...hard, planets: hard.planets.slice(0, 2) })).toHaveLength(1);
  });

  // Rule: "The ring or a planet is not fully on the board."
  it("refuses a ring that is not fully on the board", () => {
    expect(findPuzzleProblems({ ...easy, ring: { x: 3, y: 85 } })).toHaveLength(1);
  });

  it("refuses a planet that is not fully on the board", () => {
    expect(findPuzzleProblems({ ...easy, planets: [{ x: 3, y: 50, size: "big" }] })).toHaveLength(
      1,
    );
  });

  // Rule: "A circle that touches the edge of the board is fully on the board."
  it("accepts a ring that touches the edge of the board", () => {
    expect(findPuzzleProblems({ ...easy, ring: { x: 6, y: 85 } })).toEqual([]);
    expect(findPuzzleProblems({ ...easy, ring: { x: 40, y: 94 } })).toEqual([]);
  });

  // Rule: "Only a circle that goes past the edge is refused."
  it("refuses a ring that goes 1 unit past the edge of the board", () => {
    expect(findPuzzleProblems({ ...easy, ring: { x: 5, y: 85 } })).toHaveLength(1);
    expect(findPuzzleProblems({ ...easy, ring: { x: 40, y: 95 } })).toHaveLength(1);
  });

  // Rule: "a big planet (radius 8) at x 8 is fully on the board. At x 7, it is not."
  it("accepts a big planet at x 8 and refuses it at x 7", () => {
    const at8 = { ...easy, planets: [{ x: 8, y: 50, size: "big" }] };
    const at7 = { ...easy, planets: [{ x: 7, y: 50, size: "big" }] };
    expect(findPuzzleProblems(at8 as OrbitalPuzzle)).toEqual([]);
    expect(findPuzzleProblems(at7 as OrbitalPuzzle)).toHaveLength(1);
  });

  // Rule: "The distance from the launch point to the centre of the ring is less than 50 units."
  it("refuses a ring less than 50 units from the launch point", () => {
    const near = { ...easy, ring: { x: 30, y: 59 }, planets: [{ x: 70, y: 30, size: "small" }] };
    expect(findPuzzleProblems(near as OrbitalPuzzle)).toHaveLength(1);
  });

  it("accepts a ring exactly 50 units from the launch point", () => {
    const exact = { ...easy, ring: { x: 30, y: 60 }, planets: [{ x: 70, y: 30, size: "small" }] };
    expect(findPuzzleProblems(exact as OrbitalPuzzle)).toEqual([]);
  });

  // Rule: "The edge of a planet is less than 8 units from the launch point."
  it("refuses a planet edge less than 8 units from the launch point", () => {
    const near = { ...easy, planets: [{ x: 41, y: 10, size: "small" }] };
    expect(findPuzzleProblems(near as OrbitalPuzzle)).toHaveLength(1);
  });

  it("accepts a planet edge exactly 8 units from the launch point", () => {
    const exact = { ...easy, planets: [{ x: 42, y: 10, size: "small" }] };
    expect(findPuzzleProblems(exact as OrbitalPuzzle)).toEqual([]);
  });

  // Rule: "The edge of a planet is less than 4 units from the edge of the ring."
  it("refuses a planet edge less than 4 units from the edge of the ring", () => {
    const near = { ...easy, planets: [{ x: 40, y: 72, size: "small" }] };
    expect(findPuzzleProblems(near as OrbitalPuzzle)).toHaveLength(1);
  });

  it("accepts a planet edge exactly 4 units from the edge of the ring", () => {
    const exact = { ...easy, planets: [{ x: 40, y: 71, size: "small" }] };
    expect(findPuzzleProblems(exact as OrbitalPuzzle)).toEqual([]);
  });

  // Rule: "The edge of a planet is less than 4 units from the edge of a different planet."
  it("refuses two planet edges less than 4 units apart", () => {
    const near = {
      ...medium,
      planets: [
        { x: 30, y: 45, size: "small" },
        { x: 40, y: 45, size: "small" },
      ],
    };
    expect(findPuzzleProblems(near as OrbitalPuzzle)).toHaveLength(1);
  });

  it("accepts two planet edges exactly 4 units apart", () => {
    const exact = {
      ...medium,
      planets: [
        { x: 30, y: 45, size: "small" },
        { x: 42, y: 45, size: "small" },
      ],
    };
    expect(findPuzzleProblems(exact as OrbitalPuzzle)).toEqual([]);
  });

  // Rule: "Medium and hard: no planet touches the straight line from the launch point to the centre of the ring."
  it("refuses a medium puzzle with no planet on the line", () => {
    const off = {
      ...medium,
      planets: [
        { x: 50, y: 45, size: "small" },
        { x: 50, y: 65, size: "small" },
      ],
    };
    expect(findPuzzleProblems(off as OrbitalPuzzle)).toHaveLength(1);
  });

  it("refuses a hard puzzle with no planet on the line", () => {
    const off = {
      ...hard,
      planets: [
        { x: 60, y: 30, size: "small" },
        { x: 60, y: 50, size: "small" },
        { x: 60, y: 70, size: "small" },
      ],
    };
    expect(findPuzzleProblems(off as OrbitalPuzzle)).toHaveLength(1);
  });

  // Rule: "A planet touches the line when the distance from its centre to the line is its radius or less."
  it("accepts a planet whose distance to the line is exactly its radius", () => {
    const touch = {
      ...medium,
      planets: [
        { x: 34, y: 45, size: "small" },
        { x: 60, y: 45, size: "small" },
      ],
    };
    expect(findPuzzleProblems(touch as OrbitalPuzzle)).toEqual([]);
  });

  it("refuses a planet whose distance to the line is more than its radius", () => {
    const miss = {
      ...medium,
      planets: [
        { x: 35, y: 45, size: "small" },
        { x: 60, y: 45, size: "small" },
      ],
    };
    expect(findPuzzleProblems(miss as OrbitalPuzzle)).toHaveLength(1);
  });

  // Rule: "The line starts at the launch point and stops at the centre of the ring."
  it("does not count a planet beyond the centre of the ring as on the line", () => {
    const beyond = {
      ...medium,
      planets: [
        { x: 30, y: 95, size: "small" },
        { x: 60, y: 45, size: "small" },
      ],
    };
    expect(findPuzzleProblems(beyond as OrbitalPuzzle)).toHaveLength(1);
  });

  // Rule: "Easy" has no line rule (only medium and hard need a planet on the line).
  it("accepts an easy puzzle with no planet on the line", () => {
    const off = { ...easy, planets: [{ x: 70, y: 30, size: "small" }] };
    expect(findPuzzleProblems(off as OrbitalPuzzle)).toEqual([]);
  });
});

describe("orbital readBoard", () => {
  // Rule: "The ring ... radius is 6 units on easy, 5 units on medium and 4 units on hard."
  it("reads the board with the ring radius of the level", () => {
    const board = readBoard(easy);
    expect(board.launch).toEqual({ x: 30, y: 10 });
    expect(board.ring).toEqual({ x: 40, y: 85 });
    expect(board.planets).toEqual([{ x: 40, y: 50, size: "big" }]);
    expect(board.ringRadius).toBe(6);
    expect(readBoard(medium).ringRadius).toBe(5);
    expect(readBoard(hard).ringRadius).toBe(4);
  });
});

describe("orbital isAim", () => {
  // Rule: "The angle is a whole number of degrees from 0° to 359°." and "The power is a whole number from 1 to 10."
  it("accepts the smallest and the largest values", () => {
    expect(isAim({ angle: 0, power: 1 })).toBe(true);
    expect(isAim({ angle: 359, power: 10 })).toBe(true);
    expect(isAim(startAim)).toBe(true);
  });

  it("refuses an angle outside 0 to 359", () => {
    expect(isAim({ angle: 360, power: 5 })).toBe(false);
    expect(isAim({ angle: -1, power: 5 })).toBe(false);
  });

  it("refuses a power outside 1 to 10", () => {
    expect(isAim({ angle: 0, power: 0 })).toBe(false);
    expect(isAim({ angle: 0, power: 11 })).toBe(false);
  });

  it("refuses a value that is not a whole number", () => {
    expect(isAim({ angle: 1.5, power: 5 })).toBe(false);
    expect(isAim({ angle: 1, power: 5.5 })).toBe(false);
  });

  // Rule: "At the start, the angle is 0° and the power is 5."
  it("has the start aim 0° and power 5", () => {
    expect(startAim).toEqual({ angle: 0, power: 5 });
  });
});

describe("orbital fly", () => {
  const board = readBoard(easy);

  // Rule: example step 1: "After 141 steps (2.35 s), it is at x 100.02, y 12.19, off the board."
  it("flies the example launch at 0° and power 5 off the right edge", () => {
    const flight = fly(board, { angle: 0, power: 5 });
    expect(flight.path).toHaveLength(142);
    expect(flight.end).toEqual({ type: "edge" });
    const last = flight.path.at(-1);
    expect(last?.x).toBeCloseTo(100.02, 1);
    expect(last?.y).toBeCloseTo(12.19, 1);
    expect(flight.closest).toBe(69);
    expect(flight.aim).toEqual({ angle: 0, power: 5 });
  });

  // Rule: "The path is the launch point and the position of the probe after each step."
  it("starts the path at the launch point", () => {
    const flight = fly(board, { angle: 0, power: 5 });
    expect(flight.path[0]).toEqual({ x: 30, y: 10 });
  });

  // Rule: example step 2: "After 66 steps (1.10 s), the probe hits the big planet."
  it("hits the big planet at 82° and power 5", () => {
    const flight = fly(board, { angle: 82, power: 5 });
    expect(flight.path).toHaveLength(67);
    expect(flight.end).toEqual({ type: "planet", planet: board.planets[0] });
    expect(flight.closest).toBe(36);
  });

  // Rule: example step 3: "After 176 steps (2.93 s), the probe goes off the top edge at x 35.16, y 100.46."
  it("goes off the top edge at 95° and power 5 and passes near the ring", () => {
    const flight = fly(board, { angle: 95, power: 5 });
    expect(flight.path).toHaveLength(177);
    expect(flight.end).toEqual({ type: "edge" });
    const last = flight.path.at(-1);
    expect(last?.x).toBeCloseTo(35.16, 1);
    expect(last?.y).toBeCloseTo(100.46, 1);
    expect(flight.closest).toBe(2);
  });

  // Rule: example step 4: "After 135 steps (2.25 s), the probe is at x 36.77, y 80.29 ... in the ring."
  it("reaches the ring at 92° and power 5 with a closest of 0", () => {
    const flight = fly(board, { angle: 92, power: 5 });
    expect(flight.path).toHaveLength(136);
    expect(flight.end).toEqual({ type: "ring" });
    const last = flight.path.at(-1);
    expect(last?.x).toBeCloseTo(36.77, 1);
    expect(last?.y).toBeCloseTo(80.29, 1);
    expect(flight.closest).toBe(0);
  });

  // Rule: "A launch with the same angle and power as an earlier launch has the same path."
  it("gives the same flight for the same board and aim", () => {
    const aim = { angle: 95, power: 5 };
    expect(fly(board, aim)).toEqual(fly(board, aim));
  });

  // Rule: "After step 240, the flight stops. The probe flew for 4 s."
  it("stops with time after 240 steps when nothing stops the probe", () => {
    const flight = fly(empty, { angle: 0, power: 1 });
    expect(flight.end).toEqual({ type: "time" });
    expect(flight.path).toHaveLength(241);
    const last = flight.path.at(-1);
    expect(last?.x).toBeCloseTo(34, 1);
    expect(last?.y).toBeCloseTo(10, 1);
  });

  // Rule: "'Closest to the ring' ... is rounded up to a whole unit. Thus a miss always has a 'closest' of 1 unit or more."
  it("rounds the closest value up to a whole unit", () => {
    const flight = fly(empty, { angle: 0, power: 1 });
    // The last point (34, 10) is 68.8 units from the ring centre, thus 62.8 from the edge.
    expect(flight.closest).toBe(63);
  });

  // Rule: "The speed of the probe is 6 × power units per second, in the direction of the angle."
  it("moves 6 × power units per second with no planet", () => {
    const flight = fly(empty, { angle: 90, power: 2 });
    // 4 s at 12 units per second, straight up from (10, 10).
    expect(flight.path.at(-1)?.x).toBeCloseTo(10, 1);
    expect(flight.path.at(-1)?.y).toBeCloseTo(58, 1);
  });

  // Rule: "x or y is less than 0 or more than 100: the probe goes off the board."
  it("goes off the board at the left edge", () => {
    const flight = fly(empty, { angle: 180, power: 10 });
    expect(flight.end).toEqual({ type: "edge" });
    expect(flight.path.at(-1)?.x).toBeLessThan(0);
    expect(flight.path.at(-1)?.y).toBeCloseTo(10, 1);
  });

  // Rule: "The distance to the centre of the ring is the radius of the ring or less: the probe reaches the ring."
  it("reaches the ring on a straight flight with no planet", () => {
    const direct: Board = { ...empty, ring: { x: 60, y: 10 } };
    const flight = fly(direct, { angle: 0, power: 5 });
    expect(flight.end).toEqual({ type: "ring" });
    expect(flight.closest).toBe(0);
  });
});

describe("orbital straightAngle", () => {
  // Rule: "The angle straight to the centre of the ring is the angle of the line from the launch point to the centre of the ring, rounded to a whole degree."
  it("gives 82° for the example", () => {
    expect(straightAngle(readBoard(easy))).toBe(82);
  });

  it("gives the angles of the data check boards", () => {
    const board1: Board = {
      launch: { x: 92, y: 67 },
      ring: { x: 22, y: 21 },
      ringRadius: 5,
      planets: [],
    };
    const board4: Board = {
      launch: { x: 65, y: 82 },
      ring: { x: 64, y: 14 },
      ringRadius: 6,
      planets: [],
    };
    expect(straightAngle(board1)).toBe(213);
    expect(straightAngle(board4)).toBe(269);
  });

  // Rule: "0° points right, 90° points up, 180° points left and 270° points down."
  it("gives the four straight directions", () => {
    expect(straightAngle(at(100, 50))).toBe(0);
    expect(straightAngle(at(50, 100))).toBe(90);
    expect(straightAngle(at(0, 50))).toBe(180);
    expect(straightAngle(at(50, 0))).toBe(270);
  });

  // Rule: "360° is 0°."
  it("gives a whole angle from 0 to 359 for a line just below 0°", () => {
    const board: Board = {
      launch: { x: 0, y: 50 },
      ring: { x: 100, y: 49 },
      ringRadius: 6,
      planets: [],
    };
    // The line is at -0.57°, thus it rounds to -1°, that is 359°.
    expect(straightAngle(board)).toBe(359);
  });
});

describe("orbital drag start", () => {
  const launch = { x: 30, y: 10 };

  // Rule: "A drag starts only when the pointer goes down 7 units or less from the launch point."
  it("starts a drag at the launch point and at 7 units", () => {
    expect(canStartDrag(launch, launch)).toBe(true);
    expect(canStartDrag(launch, { x: 37, y: 10 })).toBe(true);
    expect(canStartDrag(launch, { x: 30, y: 3 })).toBe(true);
  });

  it("does not start a drag more than 7 units away", () => {
    expect(canStartDrag(launch, { x: 37.1, y: 10 })).toBe(false);
    expect(canStartDrag(launch, { x: 60, y: 60 })).toBe(false);
  });
});

describe("orbital aimOfDrag", () => {
  const launch = { x: 30, y: 10 };

  // Rule: "with the launch point at x 30, y 10, a drag to x 26, y 4 has the angle 56° and the power 2."
  it("gives the angle 56° and the power 2 for the example drag", () => {
    expect(aimOfDrag(launch, { x: 26, y: 4 })).toEqual({ angle: 56, power: 2 });
  });

  // Rule: "The angle of a drag is the angle from the pointer to the launch point."
  it("aims away from the pointer in the four straight directions", () => {
    expect(aimOfDrag(launch, { x: 20, y: 10 })).toEqual({ angle: 0, power: 3 });
    expect(aimOfDrag(launch, { x: 30, y: 0 })).toEqual({ angle: 90, power: 3 });
    expect(aimOfDrag(launch, { x: 40, y: 10 })).toEqual({ angle: 180, power: 3 });
    expect(aimOfDrag(launch, { x: 30, y: 20 })).toEqual({ angle: 270, power: 3 });
  });

  // Rule: "360° is 0°."
  it("gives an angle of 359° for a drag just below 0°", () => {
    // The angle is 359.31°, thus it rounds to 359.
    expect(aimOfDrag(launch, { x: 20, y: 10.12 })?.angle).toBe(359);
  });

  it("gives the angle 0° for an angle that rounds to 360°", () => {
    // The angle is 359.6°, thus it rounds to 360°, that is 0°.
    expect(aimOfDrag(launch, { x: 20, y: 10.07 })?.angle).toBeCloseTo(0, 5);
  });

  // Rule: "The power of a drag is its length ÷ 4 units, rounded to a whole number. A half rounds up."
  it("rounds a half of the power up", () => {
    // The length is 6, thus 1.5.
    expect(aimOfDrag(launch, { x: 24, y: 10 })?.power).toBe(2);
    // The length is 10, thus 2.5.
    expect(aimOfDrag(launch, { x: 20, y: 10 })?.power).toBe(3);
  });

  // Rule: "A power more than 10 is 10."
  it("limits the power to 10", () => {
    const far = { x: 50, y: 50 };
    expect(aimOfDrag(far, { x: 0, y: 50 })).toEqual({ angle: 0, power: 10 });
  });

  // Rule: "A drag shorter than 2 units has the power 0. Its release does nothing."
  it("gives null for a drag shorter than 2 units", () => {
    expect(aimOfDrag(launch, launch)).toBeNull();
    expect(aimOfDrag(launch, { x: 31, y: 10 })).toBeNull();
    expect(aimOfDrag(launch, { x: 31.9, y: 10 })).toBeNull();
  });

  it("gives the power 1 for a drag of exactly 2 units", () => {
    expect(aimOfDrag(launch, { x: 32, y: 10 })).toEqual({ angle: 180, power: 1 });
  });
});
