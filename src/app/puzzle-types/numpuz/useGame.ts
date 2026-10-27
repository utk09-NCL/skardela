import { useReducer } from "react";
import { useMoveLog } from "../../../shared/useMoveLog";
import { canCheck, canUseKeys, initialState, isSolved, transition, type Move } from "./machine";
import type { NumpuzPuzzle } from "./puzzle";
import type { Operator } from "./rules-check";

export type Game = ReturnType<typeof useGame>;

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each event applies to the latest state, also with fast clicks.
export function useGame(puzzle: NumpuzPuzzle, onMove?: (move: Move) => void) {
  const [state, dispatch] = useReducer(transition, puzzle, initialState);
  useMoveLog(state.moves, onMove);

  return {
    numbers: state.numbers,
    target: state.target,
    guess: state.guess,
    selected: state.selected,
    checked: state.checked,
    mistakes: state.mistakes,
    isSolved: isSolved(state),
    canUseKeys: canUseKeys(state),
    canCheck: canCheck(state),
    // The machine ignores an event that is not possible, so the UI can send each event.
    select: (index: number) => {
      dispatch({ type: "select", index });
    },
    // Without "index", the operator goes in the selected blank. The operator keys use this.
    // A key typed on a blank gives the index of that blank.
    fill: (operator: Operator, index?: number) => {
      dispatch({ type: "fill", index: index ?? null, operator });
    },
    check: () => {
      dispatch({ type: "check" });
    },
  };
}
