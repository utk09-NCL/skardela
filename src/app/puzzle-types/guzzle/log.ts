import type { Log } from "../../../shared/logger";
import type { PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The move log of the Guzzle board. The start and the solve are in "src/shared/usePuzzleTracking.ts".

// The log for each move. "useGame" calls it once for each move, in order.
export function createMoveLog(log: Log, meta: PlayMeta): (move: Move) => void {
  return (move) => {
    if (move.type === "mode") {
      log.info("Mode selected", { ...meta, mode: move.mode });
    } else {
      const { index, guess, mistakes } = move;
      log.debug("Letter entered", {
        ...meta,
        index,
        letter: guess.letter,
        result: guess.mark,
        mistakes,
      });
    }
  };
}
