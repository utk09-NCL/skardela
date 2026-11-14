import { useReducer } from "react";
import { usePuzzleTracking } from "../../../shared/usePuzzleTracking";
import { createMoveLog } from "./log";
import { applyInput, isSolved, scoreOf, startPlay } from "./machine";
import { useSlideTime } from "./motion";
import type { TiltPuzzle } from "./puzzle";
import type { Direction } from "./rules-check";

export type Game = ReturnType<typeof useGame>;

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each tilt applies to the latest state, also with fast keys.
export function useGame(puzzle: TiltPuzzle) {
  const [state, dispatch] = useReducer(applyInput, puzzle, startPlay);
  const slide = useSlideTime();
  const { game } = state;
  usePuzzleTracking(puzzle, {
    isSolved: isSolved(game),
    score: scoreOf(game),
    moves: game.moves,
    logMove: createMoveLog,
  });

  return {
    size: game.layout.size,
    layout: game.layout,
    balls: game.balls,
    tilts: game.tilts,
    fewest: game.fewest,
    score: scoreOf(game),
    lastMove: game.moves.at(-1) ?? null,
    blocked: state.blocked,
    isSolved: isSolved(game),
    // The time of the slide, in milliseconds. It is 0 when "reduce motion" is on.
    slide,
    // The reducer ignores a tilt that is not possible, so the UI can send each tilt.
    tilt: (direction: Direction) => {
      // "performance.now()" never goes back. The clock of the computer can go back, for example after a time sync.
      dispatch({ direction, at: performance.now(), slide });
    },
  };
}
