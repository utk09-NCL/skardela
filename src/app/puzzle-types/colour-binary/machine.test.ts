import { describe, expect, it } from "vitest";
import { deepFreeze } from "../../../test/deep-freeze";
import { makeRandom } from "../../../shared/random";
import { puzzleTypes } from "../registry";
import example from "./examples/colour-binary-0000.json";
import { findHint } from "./hint";
import {
  canAskHint,
  canSet,
  canTap,
  canUndo,
  scoreOf,
  initialState,
  lastChanged,
  phaseOf,
  transition,
  type GameEvent,
  type GameState,
  type Phase,
} from "./machine";
import { toSquares, type ColourBinaryPuzzle } from "./puzzle";
import { nextSquare, obeysRules } from "./rules-check";

// The puzzle file has ciphered answers, thus the tests load it as the app does.
const puzzles: readonly ColourBinaryPuzzle[] = [
  example as ColourBinaryPuzzle,
  ...(await puzzleTypes["colour-binary"].loadPuzzles()),
];
const start = initialState(example);
const fixed = start.start.findIndex((square) => square !== ".");
const open = start.start.indexOf(".");

// This helper applies the events one after the other, as "useReducer" does.
function play(state: GameState, events: readonly GameEvent[]): GameState {
  return events.reduce((current, event) => transition(current, event), state);
}

// The taps that change each open square to the colour of the answer. One tap gives red, two taps give blue.
function tapsTo(puzzle: ColourBinaryPuzzle): GameEvent[] {
  return toSquares(puzzle.answer).flatMap((colour, index) =>
    toSquares(puzzle.start)[index] === "."
      ? Array.from({ length: colour === "R" ? 1 : 2 }, () => ({ type: "tap", index }) as const)
      : [],
  );
}

describe("colour binary machine", () => {
  it("changes an open square from empty to red to blue to empty", () => {
    const colours = [1, 2, 3].map(
      (taps) =>
        play(
          start,
          Array.from({ length: taps }, () => ({ type: "tap", index: open }) as const),
        ).squares[open],
    );
    expect(colours).toEqual(["R", "B", "."]);
  });

  it("ignores a tap on a fixed square and on an index that is not a square", () => {
    for (const index of [fixed, -1, start.squares.length, 0.5, Number.NaN]) {
      expect(transition(start, { type: "tap", index })).toBe(start);
    }
  });

  it("shows a hint, and hides it after a tap", () => {
    const hinted = transition(start, { type: "askHint" });
    expect(hinted.hint).toEqual({ status: "shown", hint: findHint(start.squares) });
    expect(hinted.moves).toEqual([{ type: "hint", hint: findHint(start.squares) }]);
    expect(transition(hinted, { type: "tap", index: open }).hint).toEqual({ status: "hidden" });
  });
});

describe("colour binary machine keys, undo and hints", () => {
  it("sets a colour with a key, and ignores a key that gives the same colour", () => {
    const red = transition(start, { type: "set", index: open, square: "R" });
    expect(red.squares[open]).toBe("R");
    expect(red.moves).toEqual([{ type: "set", index: open, from: ".", to: "R" }]);
    expect(transition(red, { type: "set", index: open, square: "R" })).toBe(red);
    expect(transition(start, { type: "set", index: fixed, square: "R" })).toBe(start);
  });

  it("removes the last change with undo, one change at a time", () => {
    const changed = play(start, [
      { type: "tap", index: open },
      { type: "set", index: open, square: "B" },
    ]);
    const once = transition(changed, { type: "undo" });
    expect(once.squares[open]).toBe("R");
    expect(once.moves.at(-1)).toEqual({ type: "undo", index: open, from: "B", to: "R" });
    const twice = transition(once, { type: "undo" });
    expect(twice.squares).toEqual(start.squares);
    expect(canUndo(twice)).toBe(false);
    expect(transition(twice, { type: "undo" })).toBe(twice);
  });

  // rules.md: "While a hint shows, Hint does nothing. Your next change hides the hint, and then Hint works again."
  it("ignores Hint while a hint shows, and accepts it again after a change", () => {
    const hinted = transition(start, { type: "askHint" });
    expect(canAskHint(hinted)).toBe(false);
    expect(transition(hinted, { type: "askHint" })).toBe(hinted);
    expect(scoreOf(hinted)).toBe(1);
    const changed = transition(hinted, { type: "tap", index: open });
    expect(canAskHint(changed)).toBe(true);
    expect(scoreOf(transition(changed, { type: "askHint" }))).toBe(2);
  });

  it("counts only the hints that the player got, and gives the square of the last change", () => {
    expect(scoreOf(play(start, [{ type: "askHint" }, { type: "askHint" }]))).toBe(1);
    // An empty board has no hint. A request without a hint does not count.
    const empty = initialState({ start: ["....", "....", "....", "...."] });
    expect(scoreOf(transition(empty, { type: "askHint" }))).toBe(0);
    expect(lastChanged(start)).toBeNull();
    expect(lastChanged(play(start, [{ type: "tap", index: open }, { type: "askHint" }]))).toBe(
      open,
    );
  });
});

describe("colour binary machine solve", () => {
  it("solves the rules.md example and then ignores each event", () => {
    const solved = play(start, tapsTo(example as ColourBinaryPuzzle));
    expect(phaseOf(solved)).toBe("solved");
    expect(canAskHint(solved)).toBe(false);
    expect(canUndo(solved)).toBe(false);
    expect(transition(solved, { type: "askHint" })).toBe(solved);
    expect(transition(solved, { type: "tap", index: open })).toBe(solved);
    expect(transition(solved, { type: "set", index: open, square: "." })).toBe(solved);
    expect(transition(solved, { type: "undo" })).toBe(solved);
  });
});

// The rules that each state must obey. Each problem is a short text, so a failed test shows which rule broke.
function brokenInvariants(state: GameState): string[] {
  const problems: string[] = [];
  for (const [index, square] of state.start.entries()) {
    if (square !== "." && state.squares[index] !== square)
      problems.push(`fixed square ${index} changed`);
  }
  // A shown hint must be the hint for the current board.
  const { hint } = state;
  const current = JSON.stringify(findHint(state.squares));
  if (hint.status === "shown" && JSON.stringify(hint.hint) !== current) {
    problems.push("the hint does not match the board");
  }
  if (hint.status === "none" && findHint(state.squares) !== undefined)
    problems.push("a hint is available");
  if ((phaseOf(state) === "solved") !== obeysRules(state.squares)) problems.push("a wrong phase");
  for (const move of state.moves) {
    if (move.type === "tap" && nextSquare[move.from] !== move.to) problems.push("a wrong tap move");
  }
  // The changes that Undo can remove, applied to the start, give the board.
  const replayed = state.changes.reduce(
    (squares, { index, to }) => squares.with(index, to),
    state.start,
  );
  if (JSON.stringify(replayed) !== JSON.stringify(state.squares)) {
    problems.push("the changes do not give the board");
  }
  return problems;
}

// True when the selectors tell that the machine accepts the event.
function isAllowedEvent(state: GameState, event: GameEvent): boolean {
  switch (event.type) {
    case "tap":
      return canTap(state, event.index);
    case "set":
      return canSet(state, event.index, event.square);
    case "undo":
      return canUndo(state);
    case "askHint":
      return canAskHint(state);
  }
}

// The rules for one event: the selectors agree with the machine, an accepted event adds exactly one move
// and keeps the earlier moves, and the phase "solved" never changes.
function brokenStep(before: GameState, event: GameEvent, after: GameState): string[] {
  const problems: string[] = [];
  const isAccepted = after !== before;
  const isAllowed = isAllowedEvent(before, event);
  if (isAccepted !== isAllowed)
    problems.push(`${JSON.stringify(event)}: the selector does not agree`);
  const isHistoryKept =
    after.moves.length === before.moves.length + (isAccepted ? 1 : 0) &&
    before.moves.every((move, position) => after.moves[position] === move);
  if (!isHistoryKept) problems.push(`${JSON.stringify(event)}: the moves are wrong`);
  if (phaseOf(before) === "solved" && isAccepted) problems.push("an event changed a solved game");
  return problems;
}

// A random event. Most taps go to a square that is not the colour of the answer, so many games end.
// Some events tap or set a given square or an index that is not a square, or undo with no change,
// to test that the machine ignores them.
function randomEvent(state: GameState, answer: readonly string[], random: () => number): GameEvent {
  const pick = <Item>(list: readonly Item[]) => list[Math.floor(random() * list.length)] as Item;
  const wrong = [...state.squares.keys()].filter((index) => state.squares[index] !== answer[index]);
  const roll = random();
  if (roll < 0.1) return { type: "askHint" };
  if (roll < 0.18) return { type: "undo" };
  if (roll < 0.3) {
    const index = pick([...state.squares.keys(), -1]);
    return { type: "set", index, square: pick(["R", "B", "."] as const) };
  }
  if (roll < 0.75 && wrong.length > 0) return { type: "tap", index: pick(wrong) };
  return { type: "tap", index: pick([...state.squares.keys(), -1, state.squares.length, 0.5]) };
}

function fuzz(puzzle: ColourBinaryPuzzle, seed: number) {
  const random = makeRandom(seed);
  const answer = toSquares(puzzle.answer);
  let state = deepFreeze(initialState(puzzle));
  const problems = brokenInvariants(state);
  const phases = new Set<Phase>([phaseOf(state)]);
  for (let step = 0; step < 200; step += 1) {
    const event = randomEvent(state, answer, random);
    const next = deepFreeze(transition(state, event));
    problems.push(...brokenStep(state, event, next), ...brokenInvariants(next));
    phases.add(phaseOf(next));
    state = next;
  }
  return { problems, phases };
}

describe("colour binary machine rules for each state", () => {
  it("keeps all rules in random games on each puzzle", () => {
    const games = puzzles.flatMap((puzzle, position) =>
      [1, 2].map((seed) => fuzz(puzzle, seed * 7919 + position)),
    );
    expect(games.flatMap((game) => game.problems)).toEqual([]);
    // The random games must reach each phase, else the rules for that phase are not tested.
    expect(new Set(games.flatMap((game) => Array.from(game.phases)))).toEqual(
      new Set(["playing", "solved"]),
    );
  });

  it("solves each puzzle with the taps to its answer", () => {
    const phases = puzzles.map((puzzle) => ({
      id: puzzle.id,
      phase: phaseOf(play(initialState(puzzle), tapsTo(puzzle))),
    }));
    expect(phases).toEqual(puzzles.map(({ id }) => ({ id, phase: "solved" })));
  });
});
