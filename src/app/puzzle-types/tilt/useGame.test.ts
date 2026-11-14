import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import example from "./examples/tilt-0000.json";
import type { Move } from "./machine";
import { slideTime } from "./motion";
import type { TiltPuzzle } from "./puzzle";
import { useGame } from "./useGame";

// The test replaces the move log, so it can check each move that the hook gives to the log.
const { onMove } = vi.hoisted(() => ({ onMove: vi.fn<(move: Move) => void>() }));
vi.mock(import("./log"), () => ({ createMoveLog: () => onMove }));

// The example is the rules.md example. The fewest tilts are 5: down, left, up, down, right.
const puzzle = example as TiltPuzzle;

// jsdom has no "matchMedia". This stub gives the setting "reduce motion" to the hook in "motion.ts".
function stubReduceMotion(isOn: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: isOn && query === "(prefers-reduced-motion: reduce)",
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// In these tests, all calls in one "act" use the same render, as fast keys can do.
// Each tilt must still apply to the latest state.
describe("tilt game hook with many tilts in one React batch", () => {
  it("applies each tilt to the latest state when reduce motion is on", () => {
    stubReduceMotion(true);
    const { result } = renderHook(() => useGame(puzzle));
    expect(result.current.slide).toBe(0);
    act(() => {
      for (const direction of ["down", "left", "up", "down", "right"] as const) {
        result.current.tilt(direction);
      }
    });
    expect(result.current.tilts).toBe(5);
    expect(result.current.isSolved).toBe(true);
    expect(result.current.score).toBe(0);
  });

  it("ignores a tilt during the slide when reduce motion is off", () => {
    stubReduceMotion(false);
    const now = vi.spyOn(performance, "now").mockReturnValue(5000);
    const { result } = renderHook(() => useGame(puzzle));
    expect(result.current.slide).toBe(slideTime);
    act(() => {
      result.current.tilt("down");
      result.current.tilt("left");
    });
    expect(result.current.tilts).toBe(1);

    // After the slide, the next tilt moves the balls.
    now.mockReturnValue(5000 + slideTime);
    act(() => {
      result.current.tilt("left");
    });
    expect(result.current.tilts).toBe(2);
  });
});

describe("tilt game hook clock", () => {
  // The clock of the computer can go back, for example after a time sync. The slide time must not change.
  it("accepts a tilt after the slide when the clock of the computer goes back", () => {
    stubReduceMotion(false);
    const clock = vi.spyOn(performance, "now").mockReturnValue(5000);
    const wallClock = vi.spyOn(Date, "now").mockReturnValue(5000);
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.tilt("down");
    });
    expect(result.current.tilts).toBe(1);

    wallClock.mockReturnValue(5000 - 60_000);
    clock.mockReturnValue(5000 + slideTime);
    act(() => {
      result.current.tilt("left");
    });
    expect(result.current.tilts).toBe(2);
  });
});

describe("tilt game hook moves and score", () => {
  it("logs each move once and in order, and does not log a tilt that moves no ball", () => {
    stubReduceMotion(true);
    onMove.mockClear();
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.tilt("up");
      result.current.tilt("up");
      result.current.tilt("down");
    });
    expect(result.current.blocked).toBeNull();
    expect(onMove.mock.calls.map(([move]) => [move.direction, move.tilts])).toEqual([
      ["up", 1],
      ["down", 2],
    ]);
  });

  it("shows the fewest tilts of the search, and the extra tilts after the solve", () => {
    stubReduceMotion(true);
    const { result } = renderHook(() => useGame(puzzle));
    expect(result.current.fewest).toBe(5);
    act(() => {
      for (const direction of ["up", "down", "left", "up", "down", "right"] as const) {
        result.current.tilt(direction);
      }
    });
    expect(result.current.isSolved).toBe(true);
    expect(result.current.tilts).toBe(6);
    expect(result.current.score).toBe(1);
  });
});
