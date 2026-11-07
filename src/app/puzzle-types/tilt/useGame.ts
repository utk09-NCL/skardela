import { useReducer } from "react";
import { useMoveLog } from "../../../shared/useMoveLog";
import {
  extraTilts,
  initialState,
  isSolved,
  transition,
  type GameState,
  type Move,
} from "./machine";
import { useSlideTime } from "./motion";
import type { TiltPuzzle } from "./puzzle";
import type { Direction } from "./rules-check";

export type Game = ReturnType<typeof useGame>;

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
// The input has the moment, thus "play" stays pure.
export type TiltInput = {
  readonly direction: Direction;
  readonly at: number;
  readonly slide: number;
};

export function startPlay(puzzle: TiltPuzzle): Play {
  return { game: initialState(puzzle), blocked: null, slideEnd: 0 };
}

// The reducer of the board. The machine applies the rules. This function adds the two UI parts:
// - "The game ignores a tilt during the slide." A tilt before "slideEnd" gives the same object back.
// - A tilt that moves no ball keeps its direction in "blocked", for the status text. After the solve,
//   "the game ignores all tilts", thus the state does not change.
export function play(current: Play, input: TiltInput): Play {
  if (input.at < current.slideEnd) return current;
  const game = transition(current.game, { type: "tilt", direction: input.direction });
  if (game !== current.game) return { game, blocked: null, slideEnd: input.at + input.slide };
  if (isSolved(current.game) || current.blocked === input.direction) return current;
  return { ...current, blocked: input.direction };
}

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each tilt applies to the latest state, also with fast keys.
export function useGame(puzzle: TiltPuzzle, onMove?: (move: Move) => void) {
  const [state, dispatch] = useReducer(play, puzzle, startPlay);
  const slide = useSlideTime();
  const { game } = state;
  useMoveLog(game.moves, onMove);

  return {
    size: game.layout.size,
    layout: game.layout,
    balls: game.balls,
    tilts: game.tilts,
    fewest: game.fewest,
    extraTilts: extraTilts(game),
    lastMove: game.moves.at(-1) ?? null,
    blocked: state.blocked,
    isSolved: isSolved(game),
    // The time of the slide, in milliseconds. It is 0 when "reduce motion" is on.
    slide,
    // The reducer ignores a tilt that is not possible, so the UI can send each tilt.
    tilt: (direction: Direction) => {
      dispatch({ direction, at: Date.now(), slide });
    },
  };
}
