import type { NumpuzPuzzle } from "./puzzle";
import { checkGuess, type CheckResult, type Operator } from "./rules-check";

// The state machine of a Numpuz game. It is pure: no React, no logs and no other side effects.
// "transition" is the only way to change a game. It gets a state and an event, and it gives the next state.
// When the event is not possible in the state, it gives the same state object back.
// The UI uses "useReducer" with "transition", so each event applies to the latest state.

// The operator in each blank. "null" is an empty blank.
export type Guess = readonly (Operator | null)[];

// A move is an event that changed the game. The board logs each move.
export type Move =
  | {
      readonly type: "fill";
      readonly index: number;
      readonly from: Operator | null;
      readonly to: Operator;
    }
  | { readonly type: "check"; readonly result: CheckResult; readonly mistakes: number };

export type GameState = {
  readonly numbers: readonly number[];
  readonly target: number;
  readonly guess: Guess;
  // The index of the selected blank. "null" before the player selects a blank, and after the solve.
  readonly selected: number | null;
  // The result of the last check. It is "null" when the guess changed after the last check,
  // thus an old result never stays on the screen.
  readonly checked: CheckResult | null;
  // The checks with a wrong answer. They are the score of Numpuz.
  readonly mistakes: number;
  // All moves, in order. A new move goes at the end, and no move changes after that.
  readonly moves: readonly Move[];
};

// "select": the player selects a blank. "check": the player checks the equation.
// "fill": the player puts an operator in a blank. "index" is the blank, or "null" for the selected blank.
export type GameEvent =
  | { readonly type: "select"; readonly index: number }
  | { readonly type: "fill"; readonly index: number | null; readonly operator: Operator }
  | { readonly type: "check" };

export function initialState(puzzle: NumpuzPuzzle): GameState {
  return {
    numbers: puzzle.numbers,
    target: puzzle.target,
    guess: Array.from({ length: puzzle.numbers.length - 1 }, () => null),
    selected: null,
    checked: null,
    mistakes: 0,
    moves: [],
  };
}

// The selectors below give the information that the UI shows. "transition" uses the same selectors,
// thus the UI and the machine always agree.

// A correct check solves the puzzle. The solve is final: no event changes the game after it.
export function isSolved(state: GameState): boolean {
  return state.checked === "correct";
}

function isBlank(state: GameState, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < state.guess.length;
}

// "true" when a "select" event on the blank changes the game.
export function canSelect(state: GameState, index: number): boolean {
  return !isSolved(state) && isBlank(state, index) && state.selected !== index;
}

// "true" when a "fill" event changes the blank. The same operator again does not change it.
export function canFill(state: GameState, index: number, operator: Operator): boolean {
  return !isSolved(state) && isBlank(state, index) && state.guess[index] !== operator;
}

// "true" when the operator keys can fill a blank: a blank is selected, and the puzzle is not solved.
export function canUseKeys(state: GameState): boolean {
  return !isSolved(state) && state.selected !== null;
}

// "true" when a "check" event changes the game. A second check of the same guess gives the same result,
// thus the player must change the guess before the next check. So the same wrong guess is only one mistake.
export function canCheck(state: GameState): boolean {
  return !isSolved(state) && state.checked === null;
}

// The next empty blank after the blank at "index". After the last blank, it looks again from the first blank,
// so a blank that the player skipped is not missed. "null" when each blank has an operator.
function nextEmpty(guess: Guess, index: number): number | null {
  const after = guess.findIndex((operator, other) => other > index && operator === null);
  const next = after === -1 ? guess.indexOf(null) : after;
  return next === -1 ? null : next;
}

// A fill puts the operator in the blank. Then the next empty blank is selected.
// The guess changes, thus the result of the last check goes away.
// "transition" calls it only when "canFill" is "true".
function fill(state: GameState, index: number, operator: Operator): GameState {
  const guess = state.guess.with(index, operator);
  return {
    ...state,
    guess,
    selected: nextEmpty(guess, index) ?? index,
    checked: null,
    moves: [
      ...state.moves,
      { type: "fill", index, from: state.guess[index] ?? null, to: operator },
    ],
  };
}

// A check with a wrong answer is one mistake. A check with an empty blank is not a mistake.
// A correct check solves the puzzle, and then no blank is selected.
// "transition" calls it only when "canCheck" is "true".
function check(state: GameState): GameState {
  const result = checkGuess(state.numbers, state.guess, state.target);
  const mistakes = result === "wrong" ? state.mistakes + 1 : state.mistakes;
  return {
    ...state,
    selected: result === "correct" ? null : state.selected,
    checked: result,
    mistakes,
    moves: [...state.moves, { type: "check", result, mistakes }],
  };
}

// The only way to change a game. An event that is not possible gives the same state object back,
// so React does not render again.
export function transition(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "select":
      return canSelect(state, event.index) ? { ...state, selected: event.index } : state;
    case "fill": {
      const index = event.index ?? state.selected;
      if (index === null || !canFill(state, index, event.operator)) return state;
      return fill(state, index, event.operator);
    }
    case "check":
      return canCheck(state) ? check(state) : state;
  }
}
