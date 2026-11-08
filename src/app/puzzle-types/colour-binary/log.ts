import { getLogger, type Log } from "../../../shared/logger";
import { useLifecycleLog } from "../../../shared/useLifecycleLog";
import { usePlayTracking, type PlayMeta } from "../../../shared/state/playSession";
import type { Move } from "./machine";

// The logs of the Colour Binary board. They are in their own file, so the board file stays small.

export function getColourBinaryLog(): Log {
  return getLogger("game.colour-binary");
}

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

// The start and the solve of a puzzle, with the details for Colour Binary. See "src/shared/useLifecycleLog.ts".
// The play session gives the timer and saves the solve. See "src/shared/state/playSession.ts".
// The hints are the mistakes of Colour Binary.
export function useColourBinaryLifecycle(
  log: Log,
  meta: PlayMeta,
  size: number,
  game: { isSolved: boolean; hints: number },
) {
  const { isSolved, hints } = game;
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: { ...meta, size },
    solved: { ...meta, size, hints },
  });
  usePlayTracking(meta, { isSolved, mistakes: hints });
}
