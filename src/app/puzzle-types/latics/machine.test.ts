import { describe, expect, it } from "vitest";
import { deepFreeze } from "../../../test/deep-freeze";
import puzzleFile from "../../../../puzzles/latics.json";
import { makeRandom } from "../../../shared/random";
import example from "./examples/latics-0000.json";
import {
  canFire,
  canSelect,
  initialState,
  isSolved,
  scoreOf,
  transition,
  trayLeft,
  visibleBeam,
  type GameEvent,
  type GameState,
  type Phase,
} from "./machine";
import { directions, isMirror, mirrors, type LaticsPuzzle } from "./puzzle";
import { boardOf, solve, type Solution } from "./solver";
import { hitsAllMonsters, laserSquares, monsterSquares, traceBeam } from "./beam";
import { trayMirror } from "./rules-check";

const easy = example as LaticsPuzzle;

// The medium board from the board tests: a tray mirror at row 1, column 7 sends the beam down to the monster.
const medium: LaticsPuzzle = {
  ...easy,
  id: "latics-0100",
  difficulty: "medium",
  board: ["L......", ".......", ".......", ".......", ".......", ".......", "......M"],
  tray: 1,
};

const puzzles = [easy, ...(puzzleFile as LaticsPuzzle[])];

// This helper applies the events one after the other, as "useReducer" does.
function play(state: GameState, events: readonly GameEvent[]): GameState {
  return events.reduce((current, event) => transition(current, event), state);
}

function selects(index: number, count: number): GameEvent[] {
  return Array.from({ length: count }, () => ({ type: "select", index }) as const);
}

describe("latics machine with a live beam", () => {
  it("starts in the phase playing, with no moves and no misses", () => {
    const state = initialState(easy);
    expect(state).toMatchObject({ phase: "playing", misses: 0, moves: [], fromTray: [] });
    expect(visibleBeam(state)?.parts[0]?.end).toBe("edge");
    expect(canFire(state)).toBe(false);
  });

  it("solves the rules.md example and then ignores each event", () => {
    // Row 1, column 4 is index 3. Row 5, column 4 is index 23. See rules.md.
    const solved = play(initialState(easy), [...selects(3, 1), ...selects(23, 3)]);
    expect(solved.phase).toBe("solved");
    expect(isSolved(solved)).toBe(true);
    expect(scoreOf(solved)).toBe(0);
    expect(solved.moves).toHaveLength(4);
    expect(visibleBeam(solved)?.parts[0]?.end).toBe("monster");
    expect(transition(solved, { type: "select", index: 3 })).toBe(solved);
    expect(transition(solved, { type: "fire" })).toBe(solved);
  });

  it("ignores a fire event, because the beam shows at all times", () => {
    const state = initialState(easy);
    expect(transition(state, { type: "fire" })).toBe(state);
  });

  it("ignores a select on a square that the player cannot change", () => {
    const state = initialState(easy);
    // A wall, an empty square without a tray, the laser without aim, and indexes that are not squares.
    for (const index of [11, 6, 0, -1, 25, 1.5, Number.NaN]) {
      expect(transition(state, { type: "select", index })).toBe(state);
    }
  });
});

describe("latics machine with a fire button", () => {
  it("goes from playing to missed with a shot that does not hit", () => {
    const missed = transition(initialState(medium), { type: "fire" });
    expect(missed).toMatchObject({ phase: "missed", misses: 1 });
    expect(missed.moves).toEqual([{ type: "fire", hits: 0, misses: 1 }]);
    expect(visibleBeam(missed)?.parts[0]?.end).toBe("edge");
  });

  it("does not fire again in the phase missed", () => {
    const missed = transition(initialState(medium), { type: "fire" });
    expect(canFire(missed)).toBe(false);
    expect(transition(missed, { type: "fire" })).toBe(missed);
  });

  it("goes back to playing and hides the beam after a change", () => {
    const missed = transition(initialState(medium), { type: "fire" });
    const changed = transition(missed, { type: "select", index: 6 });
    expect(changed).toMatchObject({ phase: "playing", misses: 1, fromTray: [6] });
    expect(visibleBeam(changed)).toBeNull();
  });

  it("goes to solved with a shot that hits, and adds no miss", () => {
    // One select puts the tray mirror, and two turns send the beam down.
    const solved = play(initialState(medium), [...selects(6, 3), { type: "fire" }]);
    expect(solved).toMatchObject({ phase: "solved", misses: 0 });
    expect(solved.moves.at(-1)).toEqual({ type: "fire", hits: 1, misses: 0 });
  });

  it("puts a tray mirror back after four turns, and keeps the tray list in order", () => {
    const twoMirrors = { ...medium, tray: 2 };
    const placed = play(initialState(twoMirrors), [...selects(5, 1), ...selects(2, 1)]);
    expect(placed.fromTray).toEqual([2, 5]);
    expect(trayLeft(placed)).toBe(0);
    // The tray is empty, thus a different empty square cannot get a mirror.
    expect(canSelect(placed, 3)).toBe(false);
    const back = play(placed, selects(5, 4));
    expect(back.fromTray).toEqual([2]);
    expect(back.squares[5]).toBe(".");
  });

  it("does not put a tray mirror on water", () => {
    // Row 1, columns 3 to 5 are water. Row 1, column 2 is not.
    const wet = { ...medium, water: ["..~~~..", ...Array.from({ length: 6 }, () => ".......")] };
    const state = initialState(wet);
    expect(canSelect(state, 3)).toBe(false);
    expect(transition(state, { type: "select", index: 3 })).toBe(state);
    expect(canSelect(state, 1)).toBe(true);
  });
});

// The rules that each state must obey, for a game that started at "first".
// Each problem is a short text, so a failed test shows which rule broke.
function brokenInvariants(first: GameState, state: GameState): string[] {
  const problems: string[] = [];
  const { config, fromTray } = state;
  if (fromTray.some((index, position) => position > 0 && index <= (fromTray[position - 1] ?? -1))) {
    problems.push("the tray list is not in order");
  }
  if (trayLeft(state) < 0) problems.push("the tray has fewer than 0 mirrors");
  for (const [index, before] of first.squares.entries()) {
    const after = state.squares[index] ?? ".";
    const isTray = fromTray.includes(index);
    const isAllowed =
      (isTray && before === "." && isMirror(after)) ||
      (!isTray && (isMirror(before) ? isMirror(after) : after === before));
    if (!isAllowed) problems.push(`square ${index} changed from ${before} to ${after}`);
  }
  const isTurned = state.lasers.some(
    (laser, number) => laser.direction !== first.lasers[number]?.direction,
  );
  if (!config.canAim && isTurned) problems.push("a laser turned");
  const beam = traceBeam({ squares: state.squares, water: config.water, lasers: state.lasers });
  const isHit = hitsAllMonsters(beam, state.squares);
  if (state.phase === "solved" && !isHit) problems.push("solved without a hit");
  if (state.phase !== "solved" && config.liveBeam && isHit)
    problems.push("a live hit is not solved");
  if (state.phase === "missed" && (config.liveBeam || isHit)) problems.push("a wrong missed phase");
  const monsters = monsterSquares(state.squares).length;
  const missedShots = state.moves.filter((move) => move.type === "fire" && move.hits < monsters);
  if (state.misses !== missedShots.length) problems.push("the misses do not match the shots");
  const isBeamHidden = !config.liveBeam && state.phase === "playing";
  if ((visibleBeam(state) === null) !== isBeamHidden)
    problems.push("the beam shows at the wrong time");
  return problems;
}

// The rules for one event: the selectors agree with the machine, an accepted event adds exactly one move
// and keeps the earlier moves, and the phase "solved" never changes.
function brokenStep(before: GameState, event: GameEvent, after: GameState): string[] {
  const problems: string[] = [];
  const isAccepted = after !== before;
  const isAllowed = event.type === "fire" ? canFire(before) : canSelect(before, event.index);
  if (isAccepted !== isAllowed)
    problems.push(`${JSON.stringify(event)}: the selector does not agree`);
  const isHistoryKept =
    after.moves.length === before.moves.length + (isAccepted ? 1 : 0) &&
    before.moves.every((move, position) => after.moves[position] === move);
  if (!isHistoryKept) problems.push(`${JSON.stringify(event)}: the moves are wrong`);
  if (before.phase === "solved" && isAccepted) problems.push("an event changed a solved game");
  return problems;
}

// A random event. Most selects go to a square that the player can change, so the game moves forward.
// Some events are not possible, or have an index that is not a square, to test that the machine ignores them.
function randomEvent(state: GameState, random: () => number): GameEvent {
  const roll = random();
  if (roll < 0.2) return { type: "fire" };
  const open = [...state.squares.keys()].filter((index) => canSelect(state, index));
  const wild = [-1, state.squares.length, 0.5, Math.floor(random() * state.squares.length)];
  const list = roll < 0.85 && open.length > 0 ? open : wild;
  return { type: "select", index: list[Math.floor(random() * list.length)] ?? -1 };
}

// This plays a random game and gives each broken rule. It also gives each phase that the game reached.
function fuzz(puzzle: LaticsPuzzle, seed: number, steps: number) {
  const random = makeRandom(seed);
  const first = deepFreeze(initialState(puzzle));
  const problems = brokenInvariants(first, first);
  const phases = new Set<Phase>([first.phase]);
  let state = first;
  for (let step = 0; step < steps; step += 1) {
    const event = randomEvent(state, random);
    const next = deepFreeze(transition(state, event));
    problems.push(...brokenStep(state, event, next), ...brokenInvariants(first, next));
    phases.add(next.phase);
    state = next;
  }
  return { problems, phases };
}

describe("latics machine rules for each state", () => {
  it("keeps all rules in random games on each puzzle", () => {
    const games = puzzles.flatMap((puzzle) =>
      [1, 2, 3, 4].map((seed) => fuzz(puzzle, seed * 7919 + puzzle.board.length, 200)),
    );
    expect(games.flatMap((game) => game.problems)).toEqual([]);
    // The random games must reach each phase, else the rules for that phase are not tested.
    expect(new Set(games.flatMap((game) => Array.from(game.phases)))).toEqual(
      new Set(["playing", "missed", "solved"]),
    );
  });

  it("agrees with the selectors for each square in each state", () => {
    const random = makeRandom(42);
    const problems = puzzles.flatMap((puzzle) => {
      let state = initialState(puzzle);
      return Array.from({ length: 40 }, () => {
        const indexes = [-1, ...state.squares.keys(), state.squares.length];
        const found = indexes.flatMap((index) => {
          const event = { type: "select", index } as const;
          return brokenStep(state, event, transition(state, event));
        });
        state = transition(state, randomEvent(state, random));
        return found;
      }).flat();
    });
    expect(problems).toEqual([]);
  });
});

// The number of clockwise turns from one item to an other. The lists go counterclockwise.
function turns<Item>(list: readonly Item[], from: Item, to: Item): number {
  return (list.indexOf(from) - list.indexOf(to) + list.length) % list.length;
}

// The events that change the start of a game into the solution, and then fire on a board with a fire button.
function eventsTo(state: GameState, solution: Solution): GameEvent[] {
  const changes = state.squares.flatMap((square, index) => {
    const target = solution.squares[index] ?? square;
    if (target === square) return [];
    // A tray mirror: the first select puts it at the angle "trayMirror". More selects turn it.
    const count =
      square === "." ? 1 + turns(mirrors, trayMirror, target) : turns(mirrors, square, target);
    return selects(index, count);
  });
  const aim = laserSquares(state.squares).flatMap((index, number) => {
    const from = state.lasers[number]?.direction ?? "E";
    return selects(index, turns(directions, from, solution.lasers[number]?.direction ?? from));
  });
  return [...changes, ...aim, ...(state.config.liveBeam ? [] : [{ type: "fire" } as const])];
}

// This plays the solution of the solver through the machine. A puzzle without a solution stays at the start.
function playSolution(puzzle: LaticsPuzzle) {
  const start = initialState(puzzle);
  const { canAim, tray } = start.config;
  const solution = solve(boardOf(puzzle), { tray, canAim });
  const end = solution === null ? start : play(start, eventsTo(start, solution));
  return { id: puzzle.id, phase: end.phase, misses: end.misses };
}

describe("latics machine and solver together", () => {
  it("solves each puzzle with the moves of the solver and no misses", () => {
    expect(puzzles.map((puzzle) => playSolution(puzzle))).toEqual(
      puzzles.map(({ id }) => ({ id, phase: "solved", misses: 0 })),
    );
  });
});
