import { getLogger } from "../../../shared/logger";
import { useLifecycleLog } from "../../../shared/useLifecycleLog";
import { usePlayTracking } from "../../../shared/playSession";
import type { Move } from "./machine";
import type { TiltPuzzle } from "./puzzle";

// The logs of the Tilt board. They are in their own file, so the board file stays small.

export type Log = ReturnType<typeof getLogger>;

export function getTiltLog(): Log {
  return getLogger("game.tilt");
}

export type Meta = {
  puzzleId: string;
  puzzleType: TiltPuzzle["type"];
  difficulty: TiltPuzzle["difficulty"];
};

// The log for each move. "useGame" calls it once for each move, in order.
// A tilt that moves no ball is not a move, thus it has no log.
export function createMoveLog(log: Log, meta: Meta): (move: Move) => void {
  return (move) => {
    log.debug("Board tilted", {
      ...meta,
      direction: move.direction,
      moved: move.balls.map((ball) => ball.colour),
      fallsIn: move.balls.filter((ball) => ball.fallsIn).map((ball) => ball.colour),
      tilts: move.tilts,
    });
  };
}

// The start and the solve of a puzzle, with the details for Tilt. See "src/shared/useLifecycleLog.ts".
// The play session gives the timer and saves the solve. See "src/shared/playSession.ts".
// The extra tilts are the mistakes of Tilt: the tilts minus the fewest tilts. See "## Score" in "rules.md".
export function useTiltLifecycle(log: Log, meta: Meta, isSolved: boolean, extraTilts: number) {
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: meta,
    solved: { ...meta, extraTilts },
  });
  usePlayTracking(meta, { isSolved, mistakes: extraTilts });
}
