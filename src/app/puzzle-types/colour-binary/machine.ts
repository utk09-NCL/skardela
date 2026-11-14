import { findHint, type Hint } from "./hint";
import { toSquares, type ColourBinaryPuzzle, type Square } from "./puzzle";
import { nextSquare, obeysRules } from "./rules-check";

// The state machine of a Colour Binary game. It is pure: no React, no logs and no other side effects.
// "transition" is the only way to change a game. It gets a state and an event, and it gives the next state.
// When the event is not possible in the state, it gives the same state object back.
// The UI uses "useReducer" with "transition", so each event applies to the latest state.

// "hidden": no hint shows. "shown": a hint shows. "none": the player asked for a hint, but there is no hint.
export type HintState =
  | { readonly status: "hidden" }
  | { readonly status: "shown"; readonly hint: Hint }
  | { readonly status: "none" };

// One change of one square: the square, its colour before, and its colour after.
export type Change = { readonly index: number; readonly from: Square; readonly to: Square };

// A move is an event that changed the game. The board logs each move.
// "tap": a tap changed a square to the next colour. "set": a key (R, B or Space) set the colour of a square.
// "undo": Undo removed the last change. Its "from" is the colour before the undo.
export type Move =
  | ({ readonly type: "tap" } & Change)
  | ({ readonly type: "set" } & Change)
  | ({ readonly type: "undo" } & Change)
  | { readonly type: "hint"; readonly hint: Hint | null };

export type GameState = {
  // The squares at the start. A square with a colour at the start is given.
  readonly start: readonly Square[];
  readonly squares: readonly Square[];
  readonly hint: HintState;
  // The changes that Undo can remove, the newest last. Undo removes the last one.
  readonly changes: readonly Change[];
  // All moves, in order. A new move goes at the end, and no move changes after that.
  readonly moves: readonly Move[];
};

// "tap": the player taps a square. "set": the player presses R, B or Space on a square.
// "undo": the player selects Undo. "askHint": the player selects the Hint button.
export type GameEvent =
  | { readonly type: "tap"; readonly index: number }
  | { readonly type: "set"; readonly index: number; readonly square: Square }
  | { readonly type: "undo" }
  | { readonly type: "askHint" };

// "playing": the board does not obey all rules yet. "solved": the board obeys all rules.
// The phase comes from the squares, thus it always matches the board.
export type Phase = "playing" | "solved";

export function initialState(puzzle: Pick<ColourBinaryPuzzle, "start">): GameState {
  const start = toSquares(puzzle.start);
  return { start, squares: start, hint: { status: "hidden" }, changes: [], moves: [] };
}

export function phaseOf(state: GameState): Phase {
  return obeysRules(state.squares) ? "solved" : "playing";
}

// The board obeys all rules. The solve is final: no event changes the game after it.
export function isSolved(state: GameState): boolean {
  return phaseOf(state) === "solved";
}

// The transition table: the events that each phase accepts. This table is the only place with this rule.
// The selectors and "transition" both read it. TypeScript makes sure that each phase has a value for each event.
//
//   playing --tap-----> playing, or solved when the board obeys all rules (the tap hides the hint)
//   playing --set-----> the same as tap, but the square gets the colour of the key
//   playing --undo----> playing, or solved, with the last change removed (the undo hides the hint)
//   playing --askHint--> playing (the hint shows, or the text tells that there is no hint). Only when no hint shows.
//   solved: final. It accepts no event.
const accepts: Record<Phase, Record<GameEvent["type"], boolean>> = {
  playing: { tap: true, set: true, undo: true, askHint: true },
  solved: { tap: false, set: false, undo: false, askHint: false },
};

// The selectors below give the information that the UI shows. "transition" uses the same selectors,
// thus the UI and the machine always agree. The tests check this for each square in many states.

// A square with a colour at the start is given. It does not change.
export function isGiven(state: GameState, index: number): boolean {
  return state.start[index] !== ".";
}

export function canTap(state: GameState, index: number): boolean {
  return (
    accepts[phaseOf(state)].tap &&
    Number.isInteger(index) &&
    state.squares[index] !== undefined &&
    !isGiven(state, index)
  );
}

// A key can set a square that the player can tap, to a different colour.
export function canSet(state: GameState, index: number, square: Square): boolean {
  return (
    accepts[phaseOf(state)].set &&
    canTap(state, index) &&
    Object.hasOwn(nextSquare, square) &&
    state.squares[index] !== square
  );
}

export function canUndo(state: GameState): boolean {
  return accepts[phaseOf(state)].undo && state.changes.length > 0;
}

// rules.md: "While a hint shows, Hint does nothing. Your next change hides the hint, and then Hint works again."
// The same hint two times does not count two times.
export function canAskHint(state: GameState): boolean {
  return accepts[phaseOf(state)].askHint && state.hint.status === "hidden";
}

// The score: the number to keep low. For Colour Binary, it is the hints that the player got.
// A request without a hint does not count.
export function scoreOf(state: GameState): number {
  return state.moves.filter((move) => move.type === "hint" && move.hint !== null).length;
}

// The square of the last change, also of an undo. Null before the first change.
export function lastChanged(state: GameState): number | null {
  return state.moves.findLast((move) => move.type !== "hint")?.index ?? null;
}

// A tap or a key changes the colour of the square. The hint does not match the new board, thus it hides.
function change(state: GameState, type: "tap" | "set", index: number, to: Square): GameState {
  const from = state.squares[index] as Square;
  return {
    ...state,
    squares: state.squares.with(index, to),
    hint: { status: "hidden" },
    changes: [...state.changes, { index, from, to }],
    moves: [...state.moves, { type, index, from, to }],
  };
}

// Undo puts the colour before the last change back. The hint does not match the new board, thus it hides.
function undo(state: GameState): GameState {
  const last = state.changes.at(-1) as Change;
  return {
    ...state,
    squares: state.squares.with(last.index, last.from),
    hint: { status: "hidden" },
    changes: state.changes.slice(0, -1),
    moves: [...state.moves, { type: "undo", index: last.index, from: last.to, to: last.from }],
  };
}

function askHint(state: GameState): GameState {
  const hint = findHint(state.squares) ?? null;
  return {
    ...state,
    hint: hint === null ? { status: "none" } : { status: "shown", hint },
    moves: [...state.moves, { type: "hint", hint }],
  };
}

// The only way to change a game. An event that is not possible gives the same state object back,
// so React does not render again.
export function transition(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "tap": {
      const { index } = event;
      return canTap(state, index)
        ? change(state, "tap", index, nextSquare[state.squares[index] as Square])
        : state;
    }
    case "set":
      return canSet(state, event.index, event.square)
        ? change(state, "set", event.index, event.square)
        : state;
    case "undo":
      return canUndo(state) ? undo(state) : state;
    case "askHint":
      return canAskHint(state) ? askHint(state) : state;
  }
}
