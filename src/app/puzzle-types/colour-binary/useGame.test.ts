import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import example from "./examples/colour-binary-0000.json";
import type { Move } from "./machine";
import { toSquares, type ColourBinaryPuzzle } from "./puzzle";
import { useGame } from "./useGame";

// The test replaces the move log, so it can check each move that the hook gives to the log.
const { onMove } = vi.hoisted(() => ({ onMove: vi.fn<(move: Move) => void>() }));
vi.mock(import("./log"), () => ({ createMoveLog: () => onMove }));

const puzzle = example as ColourBinaryPuzzle;
const start = toSquares(example.start);
const open = start.indexOf(".");

// In these tests, all calls in one "act" use the same render, as fast taps can do.
// Each event must still apply to the latest state.
describe("colour binary game hook with many events in one React batch", () => {
  it("applies each tap", () => {
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.tap(open);
      result.current.tap(open);
    });
    expect(result.current.squares[open]).toBe("B");
  });

  it("logs each move once and in order", () => {
    onMove.mockClear();
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.tap(open);
      result.current.askHint();
    });
    expect(onMove.mock.calls.map(([move]) => move.type)).toEqual(["tap", "hint"]);
  });
});
