import { getLogger, type Log } from "../../../shared/logger";
import { useLifecycleLog } from "../../../shared/useLifecycleLog";
import { usePlayTracking, type PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The logs of the Numpuz board. They are in their own file, so the board file stays small.

export function getNumpuzLog(): Log {
  return getLogger("game.numpuz");
}

// The log for each move. "useGame" calls it once for each move, in order.
export function createMoveLog(log: Log, meta: PlayMeta): (move: Move) => void {
  return (move) => {
    if (move.type === "fill") {
      log.debug("Blank changed", { ...meta, index: move.index, from: move.from, to: move.to });
    } else {
      log.info("Check pressed", { ...meta, result: move.result, mistakes: move.mistakes });
    }
  };
}

// The start and the solve of a puzzle, with the details for Numpuz. See "src/shared/useLifecycleLog.ts".
// The play session gives the timer and saves the solve. See "src/shared/state/playSession.ts".
// The checks with a wrong answer are the mistakes of Numpuz.
export function useNumpuzLifecycle(log: Log, meta: PlayMeta, isSolved: boolean, mistakes: number) {
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: meta,
    solved: { ...meta, mistakes },
  });
  usePlayTracking(meta, { isSolved, mistakes });
}
