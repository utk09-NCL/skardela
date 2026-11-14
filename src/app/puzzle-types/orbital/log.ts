import type { Log } from "../../../shared/logger";
import type { PlayMeta } from "../../../shared/state/playSession";
import type { Flight } from "./rules-check";

// The move log of the Orbital board. The start and the solve are in "src/shared/usePuzzleTracking.ts".

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
