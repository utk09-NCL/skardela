import type { Log } from "../../../shared/logger";
import type { PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The move log of the Latics board. The start and the solve are in "src/shared/usePuzzleTracking.ts".

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
