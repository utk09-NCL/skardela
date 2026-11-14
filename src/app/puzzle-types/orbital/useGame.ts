import { useReducer } from "react";
import { useReducedMotion } from "../../../shared/useReducedMotion";
import { usePuzzleTracking } from "../../../shared/usePuzzleTracking";
import { createMoveLog } from "./log";
import { applyInput, canLaunch, initialState, isSolved, probePosition, scoreOf } from "./machine";
import type { OrbitalPuzzle } from "./puzzle";
import type { Aim } from "./rules-check";

export type Game = ReturnType<typeof useGame>;

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each event applies to the latest state, also with fast clicks.
// The move log gets each flight at its end. See "## Motion": "The status and the misses change at the end of the flight."
export function useGame(puzzle: OrbitalPuzzle) {
  const [state, dispatch] = useReducer(applyInput, puzzle, initialState);
  // With "reduce motion", the full path shows at once, with no flight. See "## Motion" in "rules.md".
  const instant = useReducedMotion();
  usePuzzleTracking(puzzle, {
    isSolved: isSolved(state),
    score: scoreOf(state),
    moves: state.flights,
    logMove: createMoveLog,
  });

  return {
    board: state.board,
    aim: state.aim,
    flying: state.flying,
    flights: state.flights,
    lastFlight: state.flights.at(-1) ?? null,
    score: scoreOf(state),
    probe: probePosition(state),
    isSolved: isSolved(state),
    canLaunch: canLaunch(state),
    // "true" when a flight shows at once, with no animation.
    instant,
    // The machine ignores an event that is not possible, so the UI can send each event.
    setAim: (aim: Aim) => {
      dispatch({ type: "aim", aim });
    },
    launch: () => {
      dispatch({ type: "launch", instant });
    },
    // The release of a drag sets the aim and launches. See "## Controls" in "rules.md".
    release: (aim: Aim) => {
      dispatch({ type: "aim", aim });
      dispatch({ type: "launch", instant });
    },
    // The end of the flight animation.
    land: () => {
      dispatch({ type: "land" });
    },
  };
}
