import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getLogger, type Log } from "./logger";
import type { PlayMeta } from "./state/playSession";
import { usePlaySession } from "./state/playSession";
import { useAppStore } from "./state/store";
import { usePuzzleTracking } from "./usePuzzleTracking";

const puzzle = { id: "tilt-0001", type: "tilt", difficulty: "easy" } as const;
const meta = { puzzleId: "tilt-0001", puzzleType: "tilt", difficulty: "easy" };

// A move log as in "log.ts" of a puzzle type: one "Moved" entry for each move.
const logMove = (log: Log, details: PlayMeta) => (move: string) => {
  log.info("Moved", { ...details, move });
};

type Props = { isSolved: boolean; isStarted?: boolean; score: number; moves: readonly string[] };

function renderTracking(props: Props) {
  return renderHook(
    ({ moves, ...game }: Props) => {
      usePuzzleTracking(puzzle, { ...game, details: { size: 5 }, moves, logMove });
    },
    { initialProps: props },
  );
}

describe("usePuzzleTracking", () => {
  it("logs the start, each move and the solve with the log of the puzzle type", () => {
    const info = vi.spyOn(getLogger("game.tilt"), "info");
    const { rerender } = renderTracking({ isSolved: false, score: 0, moves: [] });
    rerender({ isSolved: false, score: 0, moves: ["up"] });
    rerender({ isSolved: true, score: 2, moves: ["up", "down"] });
    expect(info.mock.calls).toEqual([
      ["Puzzle started", { ...meta, size: 5 }],
      ["Moved", { ...meta, move: "up" }],
      // The move that solves the puzzle is in the log before the solve.
      ["Moved", { ...meta, move: "down" }],
      ["Puzzle solved", { ...meta, size: 5, score: 2 }],
    ]);
  });

  it("starts the timer and saves the solve with the score as the mistakes", () => {
    const { rerender } = renderTracking({ isSolved: false, score: 0, moves: [] });
    expect(usePlaySession.getState()).toMatchObject({ puzzleId: "tilt-0001" });
    expect(usePlaySession.getState().startedAt).not.toBeNull();
    rerender({ isSolved: true, score: 3, moves: ["up"] });
    expect(useAppStore.getState().results).toMatchObject([{ puzzleId: "tilt-0001", mistakes: 3 }]);
  });

  it("does not start the timer before the game starts", () => {
    renderTracking({ isSolved: false, isStarted: false, score: 0, moves: [] });
    expect(usePlaySession.getState()).toMatchObject({ puzzleId: "tilt-0001", startedAt: null });
  });
});
