import { useReducer } from "react";
import { useMoveLog } from "../../../shared/useMoveLog";
import {
  canLaunch,
  initialState,
  isSolved,
  missesOf,
  probePosition,
  transition,
  type GameState,
} from "./machine";
import { useInstantFlight } from "./motion";
import type { OrbitalPuzzle } from "./puzzle";
import type { Aim, Flight } from "./rules-check";

export type Game = ReturnType<typeof useGame>;

// An event from the UI. It is a "GameEvent" of the machine, but a launch also tells if the flight shows at once.
export type PlayEvent =
  | { readonly type: "aim"; readonly aim: Aim }
  | { readonly type: "launch"; readonly instant: boolean }
  | { readonly type: "land" };

// The reducer of the board. The machine applies the rules. This function adds one UI part:
// when "reduce motion" is on, the full path shows at once ("## Motion"), thus the flight lands in the same event.
// A launch that the machine ignores does not land the flight in the air.
export function play(state: GameState, event: PlayEvent): GameState {
  if (event.type !== "launch") return transition(state, event);
  const launched = transition(state, { type: "launch" });
  return event.instant && launched !== state ? transition(launched, { type: "land" }) : launched;
}

// This hook connects the state machine in "machine.ts" to React. It has no game rules of its own.
// All changes go through one reducer, thus each event applies to the latest state, also with fast clicks.
// "onMove" gets each flight at its end. See "## Motion": "The status and the misses change at the end of the flight."
export function useGame(puzzle: OrbitalPuzzle, onMove?: (flight: Flight) => void) {
  const [state, dispatch] = useReducer(play, puzzle, initialState);
  const instant = useInstantFlight();
  useMoveLog(state.flights, onMove);

  return {
    board: state.board,
    aim: state.aim,
    flying: state.flying,
    flights: state.flights,
    lastFlight: state.flights.at(-1) ?? null,
    misses: missesOf(state),
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
