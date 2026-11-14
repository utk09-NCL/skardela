import type { Log } from "../../../shared/logger";
import type { PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The move log of the Tilt board. The start and the solve are in "src/shared/usePuzzleTracking.ts".

// The log for each move. "useGame" calls it once for each move, in order.
// A tilt that moves no ball is not a move, thus it has no log.
export function createMoveLog(log: Log, meta: PlayMeta): (move: Move) => void {
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
