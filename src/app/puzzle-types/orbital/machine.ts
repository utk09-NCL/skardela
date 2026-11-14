import type { OrbitalPuzzle, Point } from "./puzzle";
import { fly, isAim, readBoard, startAim, type Aim, type Board, type Flight } from "./rules-check";

// The state machine of an Orbital game. It is pure: no React, no logs and no other side effects.
// "transition" is the only way to change a game. It gets a state and an event, and it gives the next state.
// When the event is not possible in the state, it gives the same state object back.
// The UI uses "useReducer" with "transition", so each event applies to the latest state.
// The flight animation is not in the machine. The UI sends "land" at the end of the animation,
// or at once when "reduce motion" is on or unknown.
// Restart is not in the machine. The page starts the puzzle again with a new "initialState".

export type GameState = {
  // The board. It does not change during a game.
  readonly board: Board;
  // The values of the sliders. A launch uses this aim.
  readonly aim: Aim;
  // The launch in the air, or "null" when no flight occurs.
  readonly flying: Flight | null;
  // All flights that ended, in order. A new flight goes at the end, and no flight changes after that.
  // The board shows their paths, and it logs each one as a move.
  readonly flights: readonly Flight[];
};

// "aiming": the player can change the aim and launch.
// "flying": a flight occurs. The game ignores "aim" and "launch" until "land".
// "solved": the last flight reached the ring. This phase is final: no event changes the game.
export type Phase = "aiming" | "flying" | "solved";

// "aim": the player sets the angle and the power with a slider, or with a drag.
//   A drag release sends "aim" and then "launch".
// "launch": the player launches the probe with the aim of the state.
// "land": the flight animation ended.
export type GameEvent =
  | { readonly type: "aim"; readonly aim: Aim }
  | { readonly type: "launch" }
  | { readonly type: "land" };

// The state at the start: the board of the puzzle ("readBoard"), the aim "startAim", no flight and no flights.
// It does not check the puzzle data, thus a test can use a puzzle that it makes.
export function initialState(puzzle: OrbitalPuzzle): GameState {
  return { board: readBoard(puzzle), aim: startAim, flying: null, flights: [] };
}

// The phase of the game, from the state:
// "solved" when the last item of "flights" reached the ring, "flying" when "flying" is not "null",
// and "aiming" in each other case.
export function phaseOf(state: GameState): Phase {
  if (state.flights.at(-1)?.end.type === "ring") return "solved";
  return state.flying === null ? "aiming" : "flying";
}

// "true" when the phase is "solved". See "## End": "The puzzle is solved when the probe reaches the ring."
export function isSolved(state: GameState): boolean {
  return phaseOf(state) === "solved";
}

// The score: the number to keep low. For Orbital, it is the flights in "flights" that did not reach the ring.
// See "## Score".
// A flight in the air is not a miss yet: "The status and the misses change at the end of the flight."
// A launch with the same aim as an earlier miss is a miss again.
export function scoreOf(state: GameState): number {
  return state.flights.filter((flight) => flight.end.type !== "ring").length;
}

// Where the board shows the probe when no flight occurs. See "## Edge cases":
// "After a miss, the probe goes back to the launch point. After the solve, the probe stays at the last position
// of its path, in the ring." Thus it is the last point of the path of the solving flight after the solve,
// and the launch point in each other case. During a flight, it is the launch point, because the UI shows the flight.
export function probePosition(state: GameState): Point {
  if (!isSolved(state)) return state.board.launch;
  return state.flights.at(-1)?.path.at(-1) ?? state.board.launch;
}

// "true" when an "aim" event with this aim changes the game: the phase is "aiming", "isAim" allows the aim,
// and the aim is different from the aim of the state.
export function canAim(state: GameState, aim: Aim): boolean {
  const isNew = aim.angle !== state.aim.angle || aim.power !== state.aim.power;
  return phaseOf(state) === "aiming" && isAim(aim) && isNew;
}

// "true" when a "launch" event changes the game: the phase is "aiming".
// See "## Motion": "During the flight, the game ignores the sliders, the drag and the Launch button."
// See "## End": "After the solve, the game ignores all inputs."
export function canLaunch(state: GameState): boolean {
  return phaseOf(state) === "aiming";
}

// "true" when a "land" event changes the game: a flight occurs.
export function canLand(state: GameState): boolean {
  return state.flying !== null;
}

// The only way to change a game:
// - "aim": when "canAim" allows it, the aim of the state changes to the aim of the event.
// - "launch": when "canLaunch" allows it, "flying" changes to "fly(board, aim)". The aim does not change.
// - "land": when "canLand" allows it, the flight goes at the end of "flights", and "flying" changes to "null".
//   Thus the misses and the phase change only at the end of the flight.
// Each other event gives the same state object back, so React does not render again.
export function transition(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "aim":
      // A copy of the aim, so a change of the object of the event cannot change the game.
      return canAim(state, event.aim)
        ? { ...state, aim: { angle: event.aim.angle, power: event.aim.power } }
        : state;
    case "launch":
      return canLaunch(state) ? { ...state, flying: fly(state.board, state.aim) } : state;
    case "land":
      return state.flying === null
        ? state
        : { ...state, flying: null, flights: [...state.flights, state.flying] };
    default:
      return state;
  }
}

// An event from the UI. It is a "GameEvent" of the machine, but a launch also tells if the flight shows at once.
export type OrbitalInput =
  | { readonly type: "aim"; readonly aim: Aim }
  | { readonly type: "launch"; readonly instant: boolean }
  | { readonly type: "land" };

// The reducer of the board. "transition" applies the rules. This function adds one part:
// when "reduce motion" is on, the full path shows at once ("## Motion"), thus the flight lands in the same event.
// A launch that the machine ignores does not land the flight in the air.
export function applyInput(state: GameState, event: OrbitalInput): GameState {
  if (event.type !== "launch") return transition(state, event);
  const launched = transition(state, { type: "launch" });
  return event.instant && launched !== state ? transition(launched, { type: "land" }) : launched;
}
