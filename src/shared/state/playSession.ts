import { useEffect, useEffectEvent } from "react";
import { create } from "zustand";
import { dayKey } from "./progress";
import type { PuzzleRef } from "./saved-data";
import { useAppStore } from "./store";

// The game that the player plays now. The board opens it, starts it and ends it.
// The puzzle page reads it for its timer. It is not saved: a reload starts the puzzle and its timer again.
export type PlaySession = {
  readonly puzzleId: string | null;
  // The moments of the start and of the solve, in milliseconds. "startedAt" is null until the game starts,
  // for example until the player selects a mode in Guzzle. "solvedAt" is null until the solve.
  readonly startedAt: number | null;
  readonly solvedAt: number | null;
};

export const emptySession: PlaySession = { puzzleId: null, startedAt: null, solvedAt: null };

export const usePlaySession = create<PlaySession>()(() => emptySession);

// The details of the puzzle that the board gives. The log of each type uses them too.
export type PlayMeta = {
  readonly puzzleId: string;
  readonly puzzleType: string;
  readonly difficulty: PuzzleRef["difficulty"];
};

// The state of the game that the board gives. "mistakes" is the score to keep low, see "SolveResult".
// "isStarted" is false until the game starts. Most boards start at once, so it is true when it is not given.
export type PlayProgress = {
  readonly isSolved: boolean;
  readonly isStarted?: boolean;
  readonly mistakes: number;
};

// The board calls this function when it starts. The timer does not run yet.
// A restart makes a new board, thus a new session.
export function openSession(meta: PlayMeta): void {
  const { puzzleId, puzzleType, difficulty } = meta;
  usePlaySession.setState({ puzzleId, startedAt: null, solvedAt: null });
  useAppStore.getState().openPuzzle({ puzzleId, type: puzzleType, difficulty });
}

// The board calls this function when the game starts. Then the timer runs.
export function startSession(puzzleId: string, now = Date.now()): void {
  const session = usePlaySession.getState();
  if (session.puzzleId !== puzzleId || session.startedAt !== null) return;
  usePlaySession.setState({ startedAt: now });
}

// The board calls this function when the puzzle is solved. It saves the solve one time for each session.
// "mistakes" is saved with the solve when the board gives it.
export function solveSession(
  meta: PlayMeta & { readonly mistakes?: number },
  now = Date.now(),
): void {
  const { puzzleId, startedAt, solvedAt } = usePlaySession.getState();
  if (puzzleId !== meta.puzzleId || startedAt === null || solvedAt !== null) return;
  usePlaySession.setState({ solvedAt: now });
  useAppStore.getState().recordSolve({
    puzzleId: meta.puzzleId,
    type: meta.puzzleType,
    difficulty: meta.difficulty,
    seconds: Math.round((now - startedAt) / 1000),
    day: dayKey(new Date(now)),
    ...(meta.mistakes === undefined ? {} : { mistakes: meta.mistakes }),
  });
}

// The lifecycle hook of each puzzle type calls this hook. It opens the session when the board starts,
// starts the timer when "isStarted" is true, and saves the solve with its mistakes when the board is solved.
// Most boards start at once. Guzzle starts when the player selects a mode.
// In React strict mode, the effects run two times, which is safe: each step changes the session one time.
export function usePlayTracking(meta: PlayMeta, progress: PlayProgress): void {
  const { puzzleId } = meta;
  const { isSolved } = progress;
  // The default is not in the destructuring, because React Compiler cannot compile such a default.
  const isStarted = progress.isStarted ?? true;
  // The effects give the puzzle ID, and the effect events read the latest type, level and mistakes.
  const open = useEffectEvent((id: string) => {
    openSession({ ...meta, puzzleId: id });
  });
  const solve = useEffectEvent((id: string) => {
    solveSession({ ...meta, puzzleId: id, mistakes: progress.mistakes });
  });
  useEffect(() => {
    open(puzzleId);
  }, [puzzleId]);
  useEffect(() => {
    if (isStarted) startSession(puzzleId);
  }, [puzzleId, isStarted]);
  useEffect(() => {
    if (isSolved) solve(puzzleId);
  }, [puzzleId, isSolved]);
}
