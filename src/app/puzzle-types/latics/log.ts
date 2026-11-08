import { getLogger, type Log } from "../../../shared/logger";
import { useLifecycleLog } from "../../../shared/useLifecycleLog";
import { usePlayTracking, type PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The logs of the Latics board. They are in their own file, so the board file stays small.

export function getLaticsLog(): Log {
  return getLogger("game.latics");
}

// The log for each move. "useGame" calls it once for each move, in order.
export function createMoveLog(log: Log, meta: PlayMeta): (move: Move) => void {
  return (move) => {
    if (move.type === "change") {
      log.debug("Piece changed", { ...meta, index: move.index, from: move.from, to: move.to });
    } else {
      log.info("Laser fired", { ...meta, hits: move.hits, misses: move.misses });
    }
  };
}

// The start and the solve of a puzzle, with the details for Latics. See "src/shared/useLifecycleLog.ts".
// The play session gives the timer and saves the solve. See "src/shared/state/playSession.ts".
// The misses are the mistakes of Latics.
export function useLaticsLifecycle(log: Log, meta: PlayMeta, isSolved: boolean, misses: number) {
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: meta,
    solved: { ...meta, misses },
  });
  usePlayTracking(meta, { isSolved, mistakes: misses });
}
