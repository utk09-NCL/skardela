import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import example from "./examples/numpuz-0000.json";
import type { Move } from "./machine";
import type { NumpuzPuzzle } from "./puzzle";
import { useGame } from "./useGame";

// The test replaces the move log, so it can check each move that the hook gives to the log.
const { onMove } = vi.hoisted(() => ({ onMove: vi.fn<(move: Move) => void>() }));
vi.mock(import("./log"), () => ({ createMoveLog: () => onMove }));

// The example is the rules.md example: 6 _ 3 _ 2, target 7. The answer is 6 + 3 − 2.
const puzzle = example as NumpuzPuzzle;

// In these tests, all calls in one "act" use the same render, as fast clicks can do.
// Each event must still apply to the latest state.
describe("numpuz game hook with many events in one React batch", () => {
  it("puts each operator key in the blank that is selected at that time", () => {
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.select(0);
      result.current.fill("+");
      result.current.fill("-");
    });
    expect(result.current.guess).toEqual(["+", "-"]);
  });

  it("counts one mistake for two checks of the same wrong guess", () => {
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.fill("+", 0);
      result.current.fill("×", 1);
      result.current.check();
      result.current.check();
    });
    expect(result.current.score).toBe(1);
    expect(result.current.canCheck).toBe(false);
  });

  it("logs each move once and in order", () => {
    onMove.mockClear();
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.fill("+", 0);
      result.current.fill("-", 1);
      result.current.check();
      result.current.check();
    });
    expect(result.current.isSolved).toBe(true);
    expect(onMove.mock.calls.map(([move]) => move)).toEqual([
      { type: "fill", index: 0, from: null, to: "+" },
      { type: "fill", index: 1, from: null, to: "-" },
      { type: "check", result: "correct", mistakes: 0 },
    ]);
  });
});
