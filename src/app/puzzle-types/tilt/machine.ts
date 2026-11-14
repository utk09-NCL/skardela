import type { TiltPuzzle } from "./puzzle";
import {
  allInHoles,
  directions,
  readBoard,
  tiltBoard,
  type Ball,
  type BallMove,
  type Direction,
  type Layout,
  type TiltResult,
} from "./rules-check";
import { solve } from "./solver";

// The state machine of a Tilt game. It is pure: no React, no logs and no other side effects.
// "transition" is the only way to change a game. It gets a state and an event, and it gives the next state.
// When the event is not possible in the state, it gives the same state object back.
// The UI uses "useReducer" with "transition", so each event applies to the latest state.
// The slide animation is not in the machine. The UI ignores a tilt during the slide (see "## Motion").
// Restart is not in the machine. The page starts the puzzle again with a new "initialState".

// A move is a tilt that changed the game. The board logs each move,
// and the screen reader text tells what each ball did.
export type Move = {
  readonly type: "tilt";
  readonly direction: Direction;
  // What each ball did, as "moves" of "TiltResult" in "rules-check.ts". It has one or more items.
  readonly balls: readonly BallMove[];
  // The tilts after this move.
  readonly tilts: number;
};

export type GameState = {
  // The parts of the board that do not change.
  readonly layout: Layout;
  // The balls now, in the order of "ballColours" in "puzzle.ts".
  readonly balls: readonly Ball[];
  // The tilts that moved one or more balls. A tilt that moves no ball does not count.
  readonly tilts: number;
  // The fewest tilts from the start, from the search ("fewestTilts" in "solver.ts").
  // It is "null" when the search finds no solution. The data check does not allow such a puzzle.
  readonly fewest: number | null;
  // All moves, in order. A new move goes at the end, and no move changes after that.
  readonly moves: readonly Move[];
};

// "tilt": the player tilts the board with an arrow key, an arrow button or a swipe.
export type GameEvent = { readonly type: "tilt"; readonly direction: Direction };

// The state at the start: the walls, the balls and the holes of "board", 0 tilts, no moves,
// and the fewest tilts from the search. It uses only "board". It does not check the size or the balls of the level,
// thus a test can use a small board.
export function initialState(puzzle: TiltPuzzle): GameState {
  const { layout, balls } = readBoard(puzzle.board);
  // The search runs one time, at the start. "Fewest" on the board does not change after that.
  const solution = solve(layout, balls);
  return { layout, balls, tilts: 0, fewest: solution?.length ?? null, moves: [] };
}

// "true" when each coloured ball is in its hole. The solve is final: no event changes the game after it.
// See "## Rules": "The puzzle is solved when all coloured balls are in their holes."
export function isSolved(state: GameState): boolean {
  return allInHoles(state.balls);
}

// The result of a tilt in "direction", or "null" when the tilt does not change the game:
// the puzzle is solved, the direction is not one of the four tilts, or no ball can move.
// "canTilt" and "transition" both use it, thus they always agree.
function tiltResult(state: GameState, direction: Direction): TiltResult | null {
  if (isSolved(state) || !directions.includes(direction)) return null;
  const result = tiltBoard(state.layout, state.balls, direction);
  return result.moves.length === 0 ? null : result;
}

// "true" when a "tilt" event in "direction" changes the game: the puzzle is not solved,
// and the tilt moves one or more balls. The UI uses it to say "No ball can move left."
// See "## Edge cases": "A tilt that moves no ball does not change the board and does not count."
export function canTilt(state: GameState, direction: Direction): boolean {
  return tiltResult(state, direction) !== null;
}

// The score: the number to keep low. For Tilt, it is the tilts minus the fewest tilts. 0 is a perfect solve.
// See "## Score". Before the solve, the result is 0 when the tilts are fewer than the fewest tilts.
// The result is 0 when "fewest" is "null".
export function scoreOf(state: GameState): number {
  if (state.fewest === null) return 0;
  return Math.max(0, state.tilts - state.fewest);
}

// The only way to change a game. A tilt that "canTilt" allows moves the balls (see "tiltBoard"),
// adds 1 to "tilts" and adds one move. Each other event gives the same state object back,
// so React does not render again.
export function transition(state: GameState, event: GameEvent): GameState {
  if (event.type !== "tilt") return state;
  const result = tiltResult(state, event.direction);
  if (result === null) return state;
  const tilts = state.tilts + 1;
  return {
    ...state,
    balls: result.balls,
    tilts,
    moves: [
      ...state.moves,
      { type: "tilt", direction: event.direction, balls: result.moves, tilts },
    ],
  };
}

// The state of the board: the game of the machine, and two parts that only the UI needs.
export type Play = {
  readonly game: GameState;
  // The direction of the last tilt when that tilt moved no ball. The status then says "No ball can move left."
  // It is "null" at the start and after a tilt that moved one or more balls.
  readonly blocked: Direction | null;
  // The moment when the slide of the last tilt ends, in milliseconds. See "## Motion" in "rules.md".
  readonly slideEnd: number;
};

// A tilt from the UI. "at" is the moment of the tilt and "slide" is the time of the slide, in milliseconds.
// The input has the moment, thus "applyInput" stays pure.
export type TiltInput = {
  readonly direction: Direction;
  readonly at: number;
  readonly slide: number;
};

export function startPlay(puzzle: TiltPuzzle): Play {
  return { game: initialState(puzzle), blocked: null, slideEnd: 0 };
}

// The reducer of the board. "transition" applies the rules of a tilt. This function adds the slide and the status:
// - "The game ignores a tilt during the slide." A tilt before "slideEnd" gives the same object back.
// - A tilt that moves no ball keeps its direction in "blocked", for the status text. After the solve,
//   "the game ignores all tilts", thus the state does not change.
export function applyInput(current: Play, input: TiltInput): Play {
  if (input.at < current.slideEnd) return current;
  const game = transition(current.game, { type: "tilt", direction: input.direction });
  if (game !== current.game) return { game, blocked: null, slideEnd: input.at + input.slide };
  if (isSolved(current.game) || current.blocked === input.direction) return current;
  return { ...current, blocked: input.direction };
}
