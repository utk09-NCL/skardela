import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import example from "./examples/latics-0000.json";
import type { Move } from "./machine";
import type { LaticsPuzzle } from "./puzzle";
import { useGame } from "./useGame";

// The test replaces the move log, so it can check each move that the hook gives to the log.
const { onMove } = vi.hoisted(() => ({ onMove: vi.fn<(move: Move) => void>() }));
vi.mock(import("./log"), () => ({ createMoveLog: () => onMove }));

const easy = example as LaticsPuzzle;

// The medium board from the board tests: the beam goes right along row 1, and the tray has one mirror.
const medium: LaticsPuzzle = {
  ...easy,
  id: "latics-0100",
  difficulty: "medium",
  board: ["L......", ".......", ".......", ".......", ".......", ".......", "......M"],
  tray: 1,
};

// In these tests, all calls in one "act" use the same render, as fast clicks can do.
// Each event must still apply to the latest state.
describe("latics game hook with many events in one React batch", () => {
  it("applies each select", () => {
    const { result } = renderHook(() => useGame(easy));
    act(() => {
      result.current.select(3);
      result.current.select(23);
      result.current.select(23);
    });
    expect(result.current.squares[3]).toBe("\\");
    expect(result.current.squares[23]).toBe("-");
  });

  it("counts one miss for two shots at the same board", () => {
    const { result } = renderHook(() => useGame(medium));
    act(() => {
      result.current.fire();
      result.current.fire();
    });
    expect(result.current.score).toBe(1);
    expect(result.current.canFire).toBe(false);
  });

  it("logs each move once and in order", () => {
    onMove.mockClear();
    const { result } = renderHook(() => useGame(medium));
    act(() => {
      result.current.select(6);
      result.current.select(6);
      result.current.fire();
      result.current.fire();
    });
    expect(onMove.mock.calls.map(([move]) => move)).toEqual([
      { type: "change", index: 6, from: ".", to: "/" },
      { type: "change", index: 6, from: "/", to: "-" },
      { type: "fire", hits: 0, misses: 1 },
    ]);
  });
});
