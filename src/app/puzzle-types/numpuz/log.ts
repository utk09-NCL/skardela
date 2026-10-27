import { getLogger } from "../../../shared/logger";
import { useLifecycleLog } from "../../../shared/useLifecycleLog";
import { usePlayTracking } from "../../../shared/playSession";
import type { Move } from "./machine";
import type { NumpuzPuzzle } from "./puzzle";

// The logs of the Numpuz board. They are in their own file, so the board file stays small.

export type Log = ReturnType<typeof getLogger>;

export function getNumpuzLog(): Log {
  return getLogger("game.numpuz");
}

export type Meta = {
  puzzleId: string;
  puzzleType: NumpuzPuzzle["type"];
  difficulty: NumpuzPuzzle["difficulty"];
};

// The log for each move. "useGame" calls it once for each move, in order.
export function createMoveLog(log: Log, meta: Meta): (move: Move) => void {
  return (move) => {
    if (move.type === "fill") {
      log.debug("Blank changed", { ...meta, index: move.index, from: move.from, to: move.to });
    } else {
      log.info("Check pressed", { ...meta, result: move.result, mistakes: move.mistakes });
    }
  };
}

// The start and the solve of a puzzle, with the details for Numpuz. See "src/shared/useLifecycleLog.ts".
// The play session gives the timer and saves the solve. See "src/shared/playSession.ts".
// The checks with a wrong answer are the mistakes of Numpuz.
export function useNumpuzLifecycle(log: Log, meta: Meta, isSolved: boolean, mistakes: number) {
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: meta,
    solved: { ...meta, mistakes },
  });
  usePlayTracking(meta, { isSolved, mistakes });
}
