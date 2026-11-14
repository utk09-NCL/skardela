import { useReducer } from "react";
import { usePuzzleTracking } from "../../../shared/usePuzzleTracking";
import { createMoveLog } from "./log";
import {
  canAskHint,
  canSet,
  canTap,
  canUndo,
  initialState,
  isGiven,
  isSolved,
  lastChanged,
  scoreOf,
  transition,
} from "./machine";
import type { ColourBinaryPuzzle, Square } from "./puzzle";

export type Game = ReturnType<typeof useGame>;

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each event applies to the latest state, also with fast taps.
// The machine ignores an event that is not possible, so the UI can send each event.
export function useGame(puzzle: ColourBinaryPuzzle) {
  const [state, dispatch] = useReducer(transition, puzzle, initialState);
  usePuzzleTracking(puzzle, {
    isSolved: isSolved(state),
    score: scoreOf(state),
    details: { size: Math.sqrt(state.squares.length) },
    moves: state.moves,
    logMove: createMoveLog,
  });

  return {
    squares: state.squares,
    hint: state.hint,
    size: Math.sqrt(state.squares.length),
    score: scoreOf(state),
    lastChanged: lastChanged(state),
    isSolved: isSolved(state),
    canAskHint: canAskHint(state),
    canUndo: canUndo(state),
    canTap: (index: number) => canTap(state, index),
    canSet: (index: number, square: Square) => canSet(state, index, square),
    isGiven: (index: number) => isGiven(state, index),
    tap: (index: number) => {
      dispatch({ type: "tap", index });
    },
    // A key sets the colour of a square: R red, B blue, Space empty.
    set: (index: number, square: Square) => {
      dispatch({ type: "set", index, square });
    },
    undo: () => {
      dispatch({ type: "undo" });
    },
    askHint: () => {
      dispatch({ type: "askHint" });
    },
  };
}
