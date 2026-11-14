import { getLogger, type Log } from "./logger";
import { usePlayTracking, type PlayMeta } from "./state/playSession";
import { useLifecycleLog } from "./useLifecycleLog";
import { useMoveLog } from "./useMoveLog";

type Puzzle = {
  readonly id: string;
  readonly type: string;
  readonly difficulty: PlayMeta["difficulty"];
};

// The state of the game that each puzzle type gives.
// "score" is the number to keep low, from "scoreOf" in "machine.ts". The solve saves it as "mistakes".
// "isStarted" is false until the game starts, for example until the player selects a mode in Guzzle.
// "details" goes in the "Puzzle started" and "Puzzle solved" logs, for example the size of the board.
// "moves" is the list of moves of the state. "logMove" is "createMoveLog" from "log.ts" of the puzzle type.
export type Tracking<Move> = {
  readonly isSolved: boolean;
  readonly isStarted?: boolean;
  readonly score: number;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly moves: readonly Move[];
  readonly logMove: (log: Log, meta: PlayMeta) => (move: Move) => void;
};

// The "useGame" hook of each puzzle type calls this hook one time. It logs each move, the start and the solve,
// starts the timer and saves the solve. See "useMoveLog.ts", "useLifecycleLog.ts" and "usePlayTracking"
// in "state/playSession.ts".
export function usePuzzleTracking<Move>(puzzle: Puzzle, tracking: Tracking<Move>): void {
  const log = getLogger(`game.${puzzle.type}`);
  const meta = { puzzleId: puzzle.id, puzzleType: puzzle.type, difficulty: puzzle.difficulty };
  const { isSolved, isStarted, score, details, moves, logMove } = tracking;
  // React runs the effects in the order of the hooks. The move log is first, thus the log shows
  // the move that solves the puzzle before "Puzzle solved".
  useMoveLog(moves, logMove(log, meta));
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: { ...meta, ...details },
    solved: { ...meta, ...details, score },
  });
  usePlayTracking(meta, { isSolved, isStarted, mistakes: score });
}
