import type { Log } from "../../../shared/logger";
import type { PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The move log of the Colour Binary board. The start and the solve are in "src/shared/usePuzzleTracking.ts".

// The log for each move. "useGame" calls it once for each move, in order.
// "by" tells if a tap or a key made the change.
export function createMoveLog(log: Log, meta: PlayMeta): (move: Move) => void {
  return (move) => {
    switch (move.type) {
      case "tap":
      case "set":
        log.debug("Square changed", {
          ...meta,
          index: move.index,
          from: move.from,
          to: move.to,
          by: move.type === "tap" ? "tap" : "key",
        });
        break;
      case "undo":
        log.debug("Change undone", { ...meta, index: move.index, from: move.from, to: move.to });
        break;
      case "hint":
        log.info("Hint requested", {
          ...meta,
          foundHint: move.hint !== null,
          hintIndex: move.hint?.index,
          hintColour: move.hint?.colour,
        });
        break;
    }
  };
}
