import { useReducer } from "react";
import { usePuzzleTracking } from "../../../shared/usePuzzleTracking";
import { createMoveLog } from "./log";
import {
  canFire,
  canSelect,
  initialState,
  isSolved,
  scoreOf,
  transition,
  trayLeft,
  visibleBeam,
} from "./machine";
import type { LaticsPuzzle } from "./puzzle";

export type Game = ReturnType<typeof useGame>;

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each event applies to the latest state, also with fast clicks.
export function useGame(puzzle: LaticsPuzzle) {
  const [state, dispatch] = useReducer(transition, puzzle, initialState);
  usePuzzleTracking(puzzle, {
    isSolved: isSolved(state),
    score: scoreOf(state),
    moves: state.moves,
    logMove: createMoveLog,
  });

  return {
    config: state.config,
    // The size comes from the board data, so the squares always match the rows.
    size: puzzle.board.length,
    squares: state.squares,
    fromTray: state.fromTray,
    lasers: state.lasers,
    score: scoreOf(state),
    isSolved: isSolved(state),
    beam: visibleBeam(state),
    trayLeft: trayLeft(state),
    canFire: canFire(state),
    canSelect: (index: number) => canSelect(state, index),
    // The machine ignores an event that is not possible, so the UI can send each event.
    select: (index: number) => {
      dispatch({ type: "select", index });
    },
    fire: () => {
      dispatch({ type: "fire" });
    },
  };
}
