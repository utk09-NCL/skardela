import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import example from "./examples/tilt-0000.json";
import type { Move } from "./machine";
import { slideTime } from "./motion";
import type { TiltPuzzle } from "./puzzle";
import { play, startPlay, useGame } from "./useGame";

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

describe("tilt play reducer", () => {
  it("ignores a tilt during the slide, and accepts it after the slide", () => {
    const start = startPlay(puzzle);
    const first = play(start, { direction: "down", at: 1000, slide: 180 });
    expect(first.game.tilts).toBe(1);
    expect(first.slideEnd).toBe(1180);
    expect(play(first, { direction: "left", at: 1179, slide: 180 })).toBe(first);
    expect(play(first, { direction: "left", at: 1180, slide: 180 }).game.tilts).toBe(2);
  });

  it("keeps the direction of a tilt that moves no ball, and clears it after the next move", () => {
    const up = play(startPlay(puzzle), { direction: "up", at: 0, slide: 0 });
    const blocked = play(up, { direction: "up", at: 1, slide: 0 });
    expect(blocked.blocked).toBe("up");
    expect(blocked.game).toBe(up.game);
    // The same blocked tilt again does not change the state.
    expect(play(blocked, { direction: "up", at: 2, slide: 0 })).toBe(blocked);
    const down = play(blocked, { direction: "down", at: 3, slide: 0 });
    expect(down.blocked).toBeNull();
    expect(down.game.tilts).toBe(2);
  });

  it("ignores all tilts after the solve", () => {
    let state = startPlay(puzzle);
    for (const [at, direction] of (["down", "left", "up", "down", "right"] as const).entries()) {
      state = play(state, { direction, at, slide: 0 });
    }
    expect(state.game.tilts).toBe(5);
    for (const direction of ["up", "down", "left", "right"] as const) {
      expect(play(state, { direction, at: 10, slide: 0 })).toBe(state);
    }
  });
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
    expect(result.current.extraTilts).toBe(0);
  });

  it("ignores a tilt during the slide when reduce motion is off", () => {
    stubReduceMotion(false);
    const now = vi.spyOn(Date, "now").mockReturnValue(5000);
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

describe("tilt game hook moves and score", () => {
  it("logs each move once and in order, and does not log a tilt that moves no ball", () => {
    stubReduceMotion(true);
    const onMove = vi.fn<(move: Move) => void>();
    const { result } = renderHook(() => useGame(puzzle, onMove));
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
    expect(result.current.extraTilts).toBe(1);
  });
});
