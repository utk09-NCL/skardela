import { getLogger, type Log } from "../../../shared/logger";
import { useLifecycleLog } from "../../../shared/useLifecycleLog";
import { usePlayTracking, type PlayMeta } from "../../../shared/state/playSession";
import type { Flight } from "./rules-check";

// The logs of the Orbital board. They are in their own file, so the board file stays small.

export function getOrbitalLog(): Log {
  return getLogger("game.orbital");
}

// The log for each flight at its end. "useGame" calls it once for each flight, in order.
export function createMoveLog(log: Log, meta: PlayMeta): (flight: Flight) => void {
  return (flight) => {
    log.info("Probe launched", {
      ...meta,
      angle: flight.aim.angle,
      power: flight.aim.power,
      end: flight.end.type,
      steps: flight.path.length - 1,
      closest: flight.closest,
    });
  };
}

// The start and the solve of a puzzle, with the details for Orbital. See "src/shared/useLifecycleLog.ts".
// The play session gives the timer and saves the solve. See "src/shared/state/playSession.ts".
// The misses are the mistakes of Orbital.
export function useOrbitalLifecycle(log: Log, meta: PlayMeta, isSolved: boolean, misses: number) {
  useLifecycleLog(log, {
    puzzleId: meta.puzzleId,
    isSolved,
    started: meta,
    solved: { ...meta, misses },
  });
  usePlayTracking(meta, { isSolved, mistakes: misses });
}
