import { describe, expect, it } from "vitest";
import example from "./examples/numpuz-0000.json";
import {
  canCheck,
  canUseKeys,
  initialState,
  isSolved,
  transition,
  type GameEvent,
  type GameState,
} from "./machine";
import type { NumpuzPuzzle } from "./puzzle";
import type { Operator } from "./rules-check";

// The example is the rules.md example: 6 _ 3 _ 2, target 7. The answer is 6 + 3 − 2.
const easy = example as NumpuzPuzzle;

// A hard puzzle with four blanks: 6 + 7 × 4 ÷ 2 − 3 = 17.
const hard: NumpuzPuzzle = {
  ...easy,
  id: "numpuz-0200",
  difficulty: "hard",
  numbers: [6, 7, 4, 2, 3],
  target: 17,
  answer: ["+", "×", "÷", "-"],
};

// This helper applies the events one after the other, as "useReducer" does.
function play(state: GameState, events: readonly GameEvent[]): GameState {
  return events.reduce((current, event) => transition(current, event), state);
}

function fill(operator: Operator, index: number | null = null): GameEvent {
  return { type: "fill", index, operator };
}

const select = (index: number): GameEvent => ({ type: "select", index });
const check: GameEvent = { type: "check" };

// This helper freezes the state and each object in it. Then a change in place throws an error.
function deepFreeze<Value>(value: Value): Value {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

describe("numpuz machine start", () => {
  it("starts with empty blanks, no selection and no mistakes", () => {
    const state = initialState(easy);
    expect(state.guess).toEqual([null, null]);
    expect(state.selected).toBeNull();
    expect(state.mistakes).toBe(0);
    expect(canUseKeys(state)).toBe(false);
    expect(canCheck(state)).toBe(true);
  });

  it("ignores an operator key before the player selects a blank", () => {
    const state = initialState(easy);
    expect(transition(state, fill("+"))).toBe(state);
  });

  it("ignores a select of a blank that does not exist", () => {
    const state = initialState(easy);
    expect(transition(state, select(2))).toBe(state);
    expect(transition(state, select(-1))).toBe(state);
    expect(transition(state, select(0.5))).toBe(state);
  });
});

describe("numpuz machine fill", () => {
  it("selects the next empty blank after a fill", () => {
    const state = play(initialState(hard), [select(0), fill("+")]);
    expect(state.guess).toEqual(["+", null, null, null]);
    expect(state.selected).toBe(1);
  });

  it("looks again from the first blank after the last blank", () => {
    const state = play(initialState(hard), [select(2), fill("÷"), fill("-")]);
    expect(state.guess).toEqual([null, null, "÷", "-"]);
    expect(state.selected).toBe(0);
  });

  it("keeps the selection when each blank has an operator", () => {
    const state = play(initialState(easy), [select(0), fill("+"), fill("-"), select(0), fill("×")]);
    expect(state.guess).toEqual(["×", "-"]);
    expect(state.selected).toBe(0);
  });

  it("puts a typed operator in its blank, also when a different blank is selected", () => {
    const state = play(initialState(hard), [select(0), fill("×", 1)]);
    expect(state.guess).toEqual([null, "×", null, null]);
    expect(state.selected).toBe(2);
  });

  it("ignores the same operator again in a blank", () => {
    const state = play(initialState(easy), [select(0), fill("+"), select(0)]);
    expect(transition(state, fill("+"))).toBe(state);
  });

  it("logs each fill as a move", () => {
    const state = play(initialState(easy), [select(0), fill("+"), select(0), fill("-")]);
    expect(state.moves).toEqual([
      { type: "fill", index: 0, from: null, to: "+" },
      { type: "fill", index: 0, from: "+", to: "-" },
    ]);
  });
});

describe("numpuz machine check", () => {
  it("does not count a mistake for a check with an empty blank", () => {
    const state = play(initialState(easy), [check]);
    expect(state.checked).toBe("incomplete");
    expect(state.mistakes).toBe(0);
  });

  it("counts one mistake for a wrong check, and allows no second check of the same guess", () => {
    const state = play(initialState(easy), [select(0), fill("+"), fill("×"), check]);
    expect(state.checked).toBe("wrong");
    expect(state.mistakes).toBe(1);
    expect(canCheck(state)).toBe(false);
    expect(transition(state, check)).toBe(state);
  });

  it("removes the result of the last check when the guess changes", () => {
    const state = play(initialState(easy), [select(0), fill("+"), fill("×"), check, fill("-", 1)]);
    expect(state.checked).toBeNull();
    expect(canCheck(state)).toBe(true);
  });

  it("solves the puzzle with a correct check, and then ignores each event", () => {
    const state = play(initialState(easy), [
      select(0),
      fill("+"),
      fill("×"),
      check,
      fill("-", 1),
      check,
    ]);
    expect(isSolved(state)).toBe(true);
    expect(state.mistakes).toBe(1);
    expect(state.selected).toBeNull();
    expect(canUseKeys(state)).toBe(false);
    for (const event of [select(0), fill("×", 0), check]) {
      expect(transition(state, event)).toBe(state);
    }
    expect(state.moves.at(-1)).toEqual({ type: "check", result: "correct", mistakes: 1 });
  });

  it("accepts a different answer that reaches the target", () => {
    // The saved answer is 2 + 2 + 2 = 6, but 2 × 2 + 2 = 6 is correct too.
    const twos: NumpuzPuzzle = { ...easy, numbers: [2, 2, 2], target: 6, answer: ["+", "+"] };
    const state = play(initialState(twos), [select(0), fill("×"), fill("+"), check]);
    expect(isSolved(state)).toBe(true);
  });
});

describe("numpuz machine purity", () => {
  it("never changes a state in place", () => {
    const events = [select(0), fill("+"), fill("×"), check, fill("-", 1), check];
    let state = deepFreeze(initialState(easy));
    for (const event of events) {
      state = deepFreeze(transition(state, event));
    }
    expect(isSolved(state)).toBe(true);
  });
});
