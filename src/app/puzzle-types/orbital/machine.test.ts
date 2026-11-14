/* oxlint-disable max-lines, max-lines-per-function -- one file holds all machine tests. */
import { describe, expect, it } from "vitest";
import { deepFreeze } from "../../../test/deep-freeze";
import example from "./examples/orbital-0000.json";
import {
  applyInput,
  canAim,
  canLand,
  canLaunch,
  initialState,
  isSolved,
  phaseOf,
  probePosition,
  scoreOf,
  transition,
  type GameEvent,
  type GameState,
} from "./machine";
import type { OrbitalPuzzle } from "./puzzle";
import { startAim, type Aim } from "./rules-check";

// The example is the rules.md example. Its launches are: 0° (miss), 82° (miss), 95° (miss), 92° (solve).
const easy = example as OrbitalPuzzle;

// Rules.md data check board 5: the launch at 0° and power 5 reaches the ring.
const startSolves: OrbitalPuzzle = {
  ...easy,
  difficulty: "medium",
  launch: { x: 12, y: 23 },
  ring: { x: 89, y: 30 },
  planets: [
    { x: 72, y: 72, size: "medium" },
    { x: 70, y: 32, size: "small" },
  ],
};

// A board with no planet. A launch at 0° and power 1 flies for 4 s and stops with "time".
const timeOut: OrbitalPuzzle = {
  ...easy,
  launch: { x: 10, y: 10 },
  ring: { x: 90, y: 50 },
  planets: [],
};

const aim = (angle: number, power = 5): GameEvent => ({ type: "aim", aim: { angle, power } });
const launch: GameEvent = { type: "launch" };
const land: GameEvent = { type: "land" };

// This helper applies the events one after the other, as "useReducer" does.
function play(state: GameState, events: readonly GameEvent[]): GameState {
  return events.reduce((current, event) => transition(current, event), state);
}

// This helper sets the aim, launches and lands the flight.
function shoot(state: GameState, angle: number, power = 5): GameState {
  return play(state, [aim(angle, power), launch, land]);
}

// The state after the four launches of the example.
function solvedState(): GameState {
  return [0, 82, 95, 92].reduce((state, angle) => shoot(state, angle), initialState(easy));
}

describe("orbital machine start", () => {
  // Rule: "At the start, the board shows the probe at the launch point ... and 'Misses: 0.'"
  it("starts with the start aim, no flight, no miss and the probe at the launch point", () => {
    const state = initialState(easy);
    expect(state.aim).toEqual(startAim);
    expect(state.flying).toBeNull();
    expect(state.flights).toEqual([]);
    expect(scoreOf(state)).toBe(0);
    expect(phaseOf(state)).toBe("aiming");
    expect(isSolved(state)).toBe(false);
    expect(probePosition(state)).toEqual({ x: 30, y: 10 });
  });

  // Rule: "At the start, the angle is 0° and the power is 5."
  it("starts with 0° and power 5", () => {
    expect(initialState(easy).aim).toEqual({ angle: 0, power: 5 });
  });

  it("allows aim and launch and refuses land at the start", () => {
    const state = initialState(easy);
    expect(canAim(state, { angle: 10, power: 5 })).toBe(true);
    expect(canLaunch(state)).toBe(true);
    expect(canLand(state)).toBe(false);
  });
});

describe("orbital machine aim", () => {
  // Rule: "Set the angle and the power, then launch."
  it("sets the angle and the power", () => {
    const state = transition(initialState(easy), aim(82, 7));
    expect(state.aim).toEqual({ angle: 82, power: 7 });
    expect(state.flying).toBeNull();
    expect(state.flights).toEqual([]);
  });

  it("allows the smallest and the largest aim", () => {
    const state = initialState(easy);
    expect(canAim(state, { angle: 0, power: 1 })).toBe(true);
    expect(canAim(state, { angle: 359, power: 10 })).toBe(true);
  });

  // Rule: "The angle slider ... does not wrap" and the angle is from 0° to 359°.
  it("refuses an angle outside 0 to 359", () => {
    const state = initialState(easy);
    expect(canAim(state, { angle: 360, power: 5 })).toBe(false);
    expect(canAim(state, { angle: -1, power: 5 })).toBe(false);
    expect(transition(state, aim(360))).toBe(state);
  });

  // Rule: "The power slider goes from 1 to 10 in steps of 1."
  it("refuses a power outside 1 to 10 or not whole", () => {
    const state = initialState(easy);
    expect(canAim(state, { angle: 0, power: 0 })).toBe(false);
    expect(canAim(state, { angle: 0, power: 11 })).toBe(false);
    expect(canAim(state, { angle: 0, power: 5.5 })).toBe(false);
    expect(transition(state, aim(0, 11))).toBe(state);
  });

  it("refuses an angle that is not a whole number", () => {
    const state = initialState(easy);
    expect(canAim(state, { angle: 1.5, power: 5 })).toBe(false);
  });

  // Rule: "Each other event gives the same state object back" (an aim equal to the aim of the state changes nothing).
  it("gives the same state object for the same aim", () => {
    const state = initialState(easy);
    expect(canAim(state, startAim)).toBe(false);
    expect(transition(state, { type: "aim", aim: { ...startAim } })).toBe(state);
  });
});

describe("orbital machine launch", () => {
  // Rule: "The status and the misses change at the end of the flight."
  it("starts a flight and keeps the aim, the flights and the misses", () => {
    const aimed = transition(initialState(easy), aim(82));
    const state = transition(aimed, launch);
    expect(state.flying).not.toBeNull();
    expect(state.flying?.aim).toEqual({ angle: 82, power: 5 });
    expect(state.aim).toEqual({ angle: 82, power: 5 });
    expect(state.flights).toEqual([]);
    expect(scoreOf(state)).toBe(0);
    expect(phaseOf(state)).toBe("flying");
  });

  // Rule: "Each launch starts from the launch point."
  it("shows the probe at the launch point during the flight", () => {
    const state = transition(initialState(easy), launch);
    expect(probePosition(state)).toEqual({ x: 30, y: 10 });
    expect(state.flying?.path[0]).toEqual({ x: 30, y: 10 });
  });

  // Rule: "During the flight, the game ignores the sliders, the drag and the Launch button."
  it("ignores aim and launch during the flight", () => {
    const state = transition(initialState(easy), launch);
    expect(canAim(state, { angle: 10, power: 5 })).toBe(false);
    expect(canLaunch(state)).toBe(false);
    expect(transition(state, aim(10))).toBe(state);
    expect(transition(state, launch)).toBe(state);
  });
});

describe("orbital machine land", () => {
  // Rule: "A launch that does not reach the ring is a miss."
  it("adds the flight and one miss, and goes back to aiming", () => {
    const state = shoot(initialState(easy), 0);
    expect(state.flying).toBeNull();
    expect(state.flights).toHaveLength(1);
    expect(state.flights[0]?.end.type).toBe("edge");
    expect(state.flights[0]?.closest).toBe(69);
    expect(scoreOf(state)).toBe(1);
    expect(phaseOf(state)).toBe("aiming");
    expect(isSolved(state)).toBe(false);
  });

  // Rule: "After a miss, the probe goes back to the launch point."
  it("shows the probe at the launch point after a miss", () => {
    expect(probePosition(shoot(initialState(easy), 0))).toEqual({ x: 30, y: 10 });
  });

  // Rule: "After a launch, the sliders keep their values."
  it("keeps the aim after the flight", () => {
    const state = shoot(initialState(easy), 82, 5);
    expect(state.aim).toEqual({ angle: 82, power: 5 });
  });

  // Rule: "After a launch, its path stays on the board ... The board shows the paths of all earlier launches."
  it("keeps all flights in order", () => {
    const state = [0, 82, 95].reduce((current, angle) => shoot(current, angle), initialState(easy));
    expect(state.flights.map((flight) => flight.aim.angle)).toEqual([0, 82, 95]);
  });

  it("refuses land when no flight occurs", () => {
    const state = initialState(easy);
    expect(canLand(state)).toBe(false);
    expect(transition(state, land)).toBe(state);
  });

  it("allows land during the flight", () => {
    expect(canLand(transition(initialState(easy), launch))).toBe(true);
  });

  // Rule: "The flight stops when ... flies for the maximum time." and "A launch that does not reach the ring is a miss."
  it("counts a flight that stops with time as a miss", () => {
    const state = shoot(initialState(timeOut), 0, 1);
    expect(state.flights[0]?.end.type).toBe("time");
    expect(scoreOf(state)).toBe(1);
  });

  // Rule: "The flight stops when ... hits a planet" and a launch that does not reach the ring is a miss.
  it("counts a flight that hits a planet as a miss", () => {
    const state = shoot(initialState(easy), 82);
    expect(state.flights[0]?.end.type).toBe("planet");
    expect(scoreOf(state)).toBe(1);
  });

  // Rule: "A launch with the same angle and power as an earlier launch has the same path. If it misses, it is a miss again."
  it("counts a repeated aim as a miss again with the same path", () => {
    const state = [0, 0].reduce((current, angle) => shoot(current, angle), initialState(easy));
    expect(scoreOf(state)).toBe(2);
    expect(state.flights[1]?.path).toEqual(state.flights[0]?.path);
  });

  // Rule: "The status and the misses change at the end of the flight."
  it("changes the misses only at the end of the flight", () => {
    const flying = transition(shoot(initialState(easy), 0), launch);
    expect(scoreOf(flying)).toBe(1);
    expect(scoreOf(transition(flying, land))).toBe(2);
  });
});

describe("orbital machine example", () => {
  // Rule: Example, steps 1 to 4: three misses, then a solve with 3 misses.
  it("plays the example step by step", () => {
    let state = initialState(easy);
    expect(scoreOf(state)).toBe(0);

    // Step 1: 0° and power 5 goes off the board.
    state = shoot(state, 0);
    expect(state.flights.at(-1)?.end.type).toBe("edge");
    expect(scoreOf(state)).toBe(1);

    // Step 2: 82° and power 5 hits the big planet.
    state = shoot(state, 82);
    expect(state.flights.at(-1)?.end).toEqual({ type: "planet", planet: easy.planets[0] });
    expect(state.flights.at(-1)?.closest).toBe(36);
    expect(scoreOf(state)).toBe(2);

    // Step 3: 95° goes off the top edge. A launch during the flight does nothing.
    state = play(state, [aim(95), launch]);
    expect(transition(state, launch)).toBe(state);
    state = transition(state, land);
    expect(state.flights.at(-1)?.end.type).toBe("edge");
    expect(state.flights.at(-1)?.closest).toBe(2);
    expect(scoreOf(state)).toBe(3);

    // Step 4: 92° reaches the ring.
    state = shoot(state, 92);
    expect(state.flights.at(-1)?.end.type).toBe("ring");
    expect(state.flights).toHaveLength(4);
    expect(scoreOf(state)).toBe(3);
    expect(phaseOf(state)).toBe("solved");
    expect(isSolved(state)).toBe(true);
  });
});

describe("orbital machine solve", () => {
  // Rule: "A solve with the first launch has 0 misses."
  it("has 0 misses after a solve with the first launch", () => {
    const state = shoot(initialState(startSolves), 0, 5);
    expect(isSolved(state)).toBe(true);
    expect(scoreOf(state)).toBe(0);
  });

  // Rule: "The puzzle is solved when the probe reaches the ring."
  it("is solved only after land, not during the solving flight", () => {
    const flying = play(initialState(startSolves), [launch]);
    expect(isSolved(flying)).toBe(false);
    expect(phaseOf(flying)).toBe("flying");
    expect(isSolved(transition(flying, land))).toBe(true);
  });

  // Rule: "After the solve, the probe stays at the last position of its path, in the ring."
  it("shows the probe at the last point of the solving path", () => {
    const state = solvedState();
    const position = probePosition(state);
    expect(position.x).toBeCloseTo(36.77, 1);
    expect(position.y).toBeCloseTo(80.29, 1);
    expect(position).toEqual(state.flights.at(-1)?.path.at(-1));
  });

  // Rule: "After the solve, the game ignores all inputs."
  it("ignores aim, launch and land after the solve", () => {
    const state = solvedState();
    expect(canAim(state, { angle: 10, power: 5 })).toBe(false);
    expect(canLaunch(state)).toBe(false);
    expect(canLand(state)).toBe(false);
    expect(transition(state, aim(10))).toBe(state);
    expect(transition(state, launch)).toBe(state);
    expect(transition(state, land)).toBe(state);
  });

  it("keeps the misses after the solve", () => {
    const state = solvedState();
    expect(scoreOf(transition(state, launch))).toBe(3);
  });
});

describe("orbital machine purity", () => {
  // Rule: "transition is pure" (no change in place of the old state).
  it("does not change a frozen state", () => {
    const start = deepFreeze(initialState(easy));
    const aimed: Aim = { angle: 40, power: 6 };
    const flying = transition(transition(start, { type: "aim", aim: aimed }), launch);
    const landed = transition(deepFreeze(flying), land);
    expect(start.flights).toEqual([]);
    expect(landed.flights).toHaveLength(1);
  });
});

describe("orbital input reducer", () => {
  it("lands the flight at once when the flight shows at once", () => {
    const state = applyInput(initialState(easy), { type: "launch", instant: true });
    expect(state.flying).toBeNull();
    expect(state.flights).toHaveLength(1);
  });

  it("keeps the flight in the air until the end of the animation", () => {
    const flying = applyInput(initialState(easy), { type: "launch", instant: false });
    expect(flying.flying?.end).toEqual({ type: "edge" });
    expect(flying.flights).toHaveLength(0);
    // A launch during the flight does not land the flight in the air, also when the flight would show at once.
    expect(applyInput(flying, { type: "launch", instant: true })).toBe(flying);
    const landed = applyInput(flying, { type: "land" });
    expect(landed.flying).toBeNull();
    expect(landed.flights).toEqual([flying.flying]);
  });
});
