import {
  levelRules,
  toSquares,
  toWater,
  type Direction,
  type LaserData,
  type LaticsPuzzle,
  type Square,
} from "./puzzle";
import { hitsAllMonsters, laserSquares, traceBeam, type Beam } from "./beam";
import { canChange, nextSquare, turnLaser } from "./rules-check";

// The state machine of a Latics game. It is pure: no React, no logs and no other side effects.
// "transition" is the only way to change a game. It gets a state and an event, and it gives the next state.
// When the event is not possible in the state, it gives the same state object back.
// The UI uses "useReducer" with "transition", so each event applies to the latest state.

// The rules of the game. They do not change during a game.
export type GameConfig = {
  // "true": the beam shows at all times. "false": the player fires the laser to see the beam.
  readonly liveBeam: boolean;
  // The player can turn the laser.
  readonly canAim: boolean;
  // The number of mirrors in the tray at the start.
  readonly tray: number;
  // "true" for each square in water. The water does not change.
  readonly water: readonly boolean[];
};

// "playing": the player can change the board. Without a live beam, the player can also fire.
// "missed": only without a live beam. The last shot did not hit all monsters, and its beam shows.
//   The board did not change after the shot, thus the player cannot fire again. A change goes back to "playing".
// "solved": the beam hits all monsters. This phase is final: no event changes the game.
export type Phase = "playing" | "missed" | "solved";

// A move is an event that changed the game. The board logs each move.
export type Move =
  | {
      readonly type: "change";
      readonly index: number;
      readonly from: Square | Direction;
      readonly to: Square | Direction;
    }
  // "hits": the number of monsters that the shot hits.
  | { readonly type: "fire"; readonly hits: number; readonly misses: number };

export type GameState = {
  readonly config: GameConfig;
  readonly squares: readonly Square[];
  // The indexes of the squares with a mirror from the tray, from small to large.
  readonly fromTray: readonly number[];
  // One laser for each "L" on the board, in reading order. On hard, the player can turn them.
  readonly lasers: readonly LaserData[];
  readonly misses: number;
  readonly phase: Phase;
  // All moves, in order. A new move goes at the end, and no move changes after that.
  readonly moves: readonly Move[];
};

// "select": the player selects a square. "fire": the player fires the laser.
export type GameEvent =
  | { readonly type: "select"; readonly index: number }
  | { readonly type: "fire" };

// The state does not keep the beam. The beam comes from the board, thus it always matches the board.
// In the phase "missed", the board did not change after the shot, thus this beam is the beam of the shot.
function beamOf(config: GameConfig, board: Pick<GameState, "squares" | "lasers">): Beam {
  return traceBeam({ squares: board.squares, water: config.water, lasers: board.lasers });
}

function hitsAll(config: GameConfig, board: Pick<GameState, "squares" | "lasers">): boolean {
  return hitsAllMonsters(beamOf(config, board), board.squares);
}

export function initialState(puzzle: LaticsPuzzle): GameState {
  const { liveBeam, canAim } = levelRules[puzzle.difficulty];
  const squares = toSquares(puzzle.board);
  const config = { liveBeam, canAim, tray: puzzle.tray, water: toWater(puzzle) };
  // The data checks do not allow a puzzle that is solved at the start. The phase is correct for one too.
  const isHit = liveBeam && hitsAll(config, { squares, lasers: puzzle.lasers });
  return {
    config,
    squares,
    fromTray: [],
    lasers: puzzle.lasers,
    misses: 0,
    phase: isHit ? "solved" : "playing",
    moves: [],
  };
}

// The transition table: the events that each phase accepts. This table is the only place with this rule.
// The selectors and "transition" both read it. TypeScript makes sure that each phase has a value for each event.
//
//   playing --select--> playing, or solved when the live beam hits the monster after the change
//   playing --fire----> missed, or solved when the shot hits the monster
//   missed  --select--> playing (the change hides the beam of the shot)
//   solved: final. It accepts no event.
const accepts: Record<Phase, Record<GameEvent["type"], boolean>> = {
  playing: { select: true, fire: true },
  missed: { select: true, fire: false },
  solved: { select: false, fire: false },
};

// The selectors below give the information that the UI shows. "transition" uses the same selectors,
// thus the UI and the machine always agree. The tests check this for each square in many states.

// The beam hits all monsters. The solve is final: no event changes the game after it.
export function isSolved(state: GameState): boolean {
  return state.phase === "solved";
}

// The score: the number to keep low. For Latics, it is the shots that did not hit all monsters.
export function scoreOf(state: GameState): number {
  return state.misses;
}

export function trayLeft(state: GameState): number {
  return state.config.tray - state.fromTray.length;
}

// The beam to show, or "null" when the player must fire to see it.
export function visibleBeam(state: GameState): Beam | null {
  const isShown = state.config.liveBeam || state.phase !== "playing";
  return isShown ? beamOf(state.config, state) : null;
}

// "true" when a "select" event on the square changes the game.
export function canSelect(state: GameState, index: number): boolean {
  const square = Number.isInteger(index) ? state.squares[index] : undefined;
  return (
    accepts[state.phase].select &&
    square !== undefined &&
    canChange(square, trayLeft(state), state.config.canAim, state.config.water[index] === true)
  );
}

// "true" when a "fire" event changes the game. With a live beam, there is nothing to fire.
export function canFire(state: GameState): boolean {
  return accepts[state.phase].fire && !state.config.liveBeam;
}

// After a change, the phase is "playing". With a live beam, a change that sends the beam to all monsters
// solves the puzzle. A change also hides the beam of the last shot, because that beam does not match the board.
function afterChange(
  state: GameState,
  board: Pick<GameState, "squares" | "fromTray" | "lasers">,
  move: Move,
): GameState {
  const isHit = state.config.liveBeam && hitsAll(state.config, board);
  return {
    ...state,
    ...board,
    phase: isHit ? "solved" : "playing",
    moves: [...state.moves, move],
  };
}

// The squares with a tray mirror after the square at "index" changes from "square" to "next".
function trayAfter(
  fromTray: readonly number[],
  index: number,
  square: Square,
  next: Square,
): readonly number[] {
  // The empty square gets a mirror from the tray.
  if (square === ".") return [...fromTray, index].toSorted((first, second) => first - second);
  // The tray mirror goes back to the tray.
  if (next === ".") return fromTray.filter((item) => item !== index);
  return fromTray;
}

// A select turns a mirror or a laser, or puts a tray mirror on an empty square.
// A tray mirror goes back to the tray after four turns. See "nextSquare".
// "transition" calls it only when "canSelect" is "true".
function select(state: GameState, index: number): GameState {
  const square = state.squares[index] as Square;
  const { squares, fromTray } = state;
  if (square === "L") {
    // The lasers are in reading order, thus the number of the laser is its place in the list of laser squares.
    const number = laserSquares(squares).indexOf(index);
    const laser = state.lasers[number] as LaserData;
    const direction: Direction = turnLaser(laser.direction);
    return afterChange(
      state,
      { squares, fromTray, lasers: state.lasers.with(number, { ...laser, direction }) },
      { type: "change", index, from: laser.direction, to: direction },
    );
  }
  const next = nextSquare(square, fromTray.includes(index), trayLeft(state));
  return afterChange(
    state,
    {
      squares: squares.with(index, next),
      fromTray: trayAfter(fromTray, index, square, next),
      lasers: state.lasers,
    },
    { type: "change", index, from: square, to: next },
  );
}

// A shot shows the beam of all lasers. A shot that does not hit all monsters is a miss.
// "transition" calls it only when "canFire" is "true".
function fire(state: GameState): GameState {
  const beam = beamOf(state.config, state);
  const isHit = hitsAllMonsters(beam, state.squares);
  const misses = isHit ? state.misses : state.misses + 1;
  return {
    ...state,
    misses,
    phase: isHit ? "solved" : "missed",
    moves: [...state.moves, { type: "fire", hits: beam.hits.length, misses }],
  };
}

// The only way to change a game. An event that is not possible gives the same state object back,
// so React does not render again.
export function transition(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "select":
      return canSelect(state, event.index) ? select(state, event.index) : state;
    case "fire":
      return canFire(state) ? fire(state) : state;
  }
}
