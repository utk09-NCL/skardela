import { useEffect, useEffectEvent, useRef } from "react";
import type { Log } from "./logger";

type Payload = Readonly<Record<string, unknown>>;

export type Lifecycle = {
  readonly puzzleId: string;
  readonly isSolved: boolean;
  // The details of the "Puzzle started" entry and of the "Puzzle solved" entry.
  readonly started: Payload;
  readonly solved: Payload;
};

// Each board logs the start of a puzzle and the solve, each one time for each puzzle.
// A board makes new objects for each render. Thus the effects do not depend on "log" or on the details.
// Each effect gets only the values that it reacts to: the puzzle ID, and the solved state.
// The effect events read the latest "log" and details, but a change of them does not run an effect.
// The refs keep the puzzle that is already logged. React strict mode runs each effect two times in development,
// but it keeps the refs, thus the second run does not log again.
export function useLifecycleLog(log: Log, lifecycle: Lifecycle) {
  const startLogged = useRef<string | null>(null);
  const solvedLogged = useRef<string | null>(null);
  const logStart = useEffectEvent((puzzleId: string) => {
    if (startLogged.current === puzzleId) return;
    startLogged.current = puzzleId;
    log.info("Puzzle started", lifecycle.started);
  });
  const logSolved = useEffectEvent((puzzleId: string, isSolved: boolean) => {
    if (!isSolved || solvedLogged.current === puzzleId) return;
    solvedLogged.current = puzzleId;
    log.info("Puzzle solved", lifecycle.solved);
  });

  const { puzzleId, isSolved } = lifecycle;
  useEffect(() => {
    logStart(puzzleId);
  }, [puzzleId]);

  useEffect(() => {
    logSolved(puzzleId, isSolved);
  }, [puzzleId, isSolved]);
}
