import { useReducer } from "react";
import { usePuzzleTracking } from "../../../shared/usePuzzleTracking";
import { createMoveLog } from "./log";
import {
  canSelect,
  canUseKeys,
  hintsFor,
  initialState,
  isSolved,
  lastLetter,
  scoreOf,
  transition,
  type Mode,
} from "./machine";
import type { GuzzlePuzzle } from "./puzzle";

export type Game = ReturnType<typeof useGame>;

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each event applies to the latest state, also with fast clicks.
// The machine ignores an event that is not possible, so the UI can send each event.
export function useGame(puzzle: GuzzlePuzzle) {
  const [state, dispatch] = useReducer(transition, puzzle, initialState);
  usePuzzleTracking(puzzle, {
    isSolved: isSolved(state),
    // The game starts when the player selects a mode, thus the timer starts then too.
    isStarted: state.mode !== null,
    score: scoreOf(state),
    details: { size: state.config.size },
    moves: state.moves,
    logMove: createMoveLog,
  });

  return {
    mode: state.mode,
    guesses: state.guesses,
    selected: state.selected,
    answer: state.config.answer,
    size: state.config.size,
    score: scoreOf(state),
    lastMove: lastLetter(state),
    hints: hintsFor(state),
    isSolved: isSolved(state),
    canUseKeys: canUseKeys(state),
    canSelect: (index: number) => canSelect(state, index),
    chooseMode: (mode: Mode) => {
      dispatch({ type: "chooseMode", mode });
    },
    select: (index: number) => {
      dispatch({ type: "select", index });
    },
    // A letter key puts its letter in the selected square.
    putLetter: (letter: string) => {
      dispatch({ type: "putLetter", letter });
    },
    // A letter typed on a square goes in that square, also when the square is not the selected one.
    typeLetter: (index: number, letter: string) => {
      dispatch({ type: "typeLetter", index, letter });
    },
  };
}
