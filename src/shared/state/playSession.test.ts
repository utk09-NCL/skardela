import { renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import {
  openSession,
  solveSession,
  startSession,
  usePlaySession,
  usePlayTracking,
  type PlayMeta,
} from "./playSession";
import { useAppStore } from "./store";

const meta: PlayMeta = {
  puzzleId: "colour-binary-0001",
  puzzleType: "colour-binary",
  difficulty: "easy",
};
// 24 October 2026, 10:00 local time.
const start = new Date(2026, 9, 24, 10, 0, 0).getTime();

describe("play session", () => {
  it("opens a session without a start, and marks the puzzle as the last opened puzzle", () => {
    openSession(meta);
    expect(usePlaySession.getState()).toEqual({
      puzzleId: meta.puzzleId,
      startedAt: null,
      solvedAt: null,
    });
    expect(useAppStore.getState().lastOpened).toEqual({
      puzzleId: meta.puzzleId,
      type: "colour-binary",
      difficulty: "easy",
    });
  });

  it("starts one time, and saves the solve one time, with the time and the local date", () => {
    openSession(meta);
    startSession(meta.puzzleId, start);
    startSession(meta.puzzleId, start + 5000);
    solveSession(meta, start + 134_400);
    solveSession(meta, start + 200_000);
    expect(usePlaySession.getState()).toMatchObject({
      startedAt: start,
      solvedAt: start + 134_400,
    });
    expect(useAppStore.getState().results).toEqual([
      {
        puzzleId: meta.puzzleId,
        type: "colour-binary",
        difficulty: "easy",
        seconds: 134,
        day: "2026-10-24",
      },
    ]);
  });

  it("does not save a solve for a game that did not start, or for a different puzzle", () => {
    openSession(meta);
    solveSession(meta, start);
    openSession({ ...meta, puzzleId: "guzzle-0001" });
    startSession("guzzle-0001", start);
    solveSession(meta, start + 1000);
    expect(useAppStore.getState().results).toEqual([]);
  });
});

describe("usePlayTracking", () => {
  it("starts the timer when the game starts, and saves the solve one time, also in strict mode", () => {
    const { rerender } = renderHook(
      ({ isStarted, isSolved }: { isStarted: boolean; isSolved: boolean }) => {
        usePlayTracking(meta, { isSolved, isStarted, mistakes: 2 });
      },
      { initialProps: { isStarted: false, isSolved: false }, wrapper: StrictMode },
    );
    expect(usePlaySession.getState()).toMatchObject({ puzzleId: meta.puzzleId, startedAt: null });
    rerender({ isStarted: true, isSolved: false });
    expect(usePlaySession.getState().startedAt).not.toBeNull();
    rerender({ isStarted: true, isSolved: true });
    rerender({ isStarted: true, isSolved: true });
    expect(useAppStore.getState().results).toHaveLength(1);
    // The solve keeps the mistakes of the board.
    expect(useAppStore.getState().results[0]?.mistakes).toBe(2);
  });
});
