import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import example from "./examples/orbital-0000.json";
import type { OrbitalPuzzle } from "./puzzle";
import type { Flight } from "./rules-check";
import { useGame } from "./useGame";

// The test replaces the move log, so it can check each move that the hook gives to the log.
const { onMove } = vi.hoisted(() => ({ onMove: vi.fn<(flight: Flight) => void>() }));
vi.mock(import("./log"), () => ({ createMoveLog: () => onMove }));

// The example is the rules.md example. 0° and power 5 go off the board. 92° and power 5 reach the ring.
const puzzle = example as OrbitalPuzzle;

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

// In these tests, all calls in one "act" use the same render, as fast clicks can do.
// Each event must still apply to the latest state.
describe("orbital game hook with many events in one React batch", () => {
  it("launches with the aim of the latest state", () => {
    const { result } = renderHook(() => useGame(puzzle));
    expect(result.current.instant).toBe(true);
    act(() => {
      result.current.setAim({ angle: 90, power: 5 });
      result.current.setAim({ angle: 92, power: 5 });
      result.current.launch();
      result.current.launch();
    });
    expect(result.current.isSolved).toBe(true);
    expect(result.current.flights).toHaveLength(1);
    expect(result.current.score).toBe(0);
  });

  it("sets the aim and launches at the release of a drag", () => {
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.release({ angle: 56, power: 2 });
    });
    expect(result.current.aim).toEqual({ angle: 56, power: 2 });
    expect(result.current.lastFlight?.aim).toEqual({ angle: 56, power: 2 });
  });

  it("ignores a launch during the flight when reduce motion is off", () => {
    stubReduceMotion(false);
    const { result } = renderHook(() => useGame(puzzle));
    expect(result.current.instant).toBe(false);
    act(() => {
      result.current.launch();
      result.current.setAim({ angle: 92, power: 5 });
      result.current.launch();
    });
    expect(result.current.flying?.aim).toEqual({ angle: 0, power: 5 });
    expect(result.current.canLaunch).toBe(false);
    expect(result.current.score).toBe(0);
    act(() => {
      result.current.land();
    });
    expect(result.current.flying).toBeNull();
    expect(result.current.score).toBe(1);
    expect(result.current.aim).toEqual({ angle: 0, power: 5 });
  });
});

describe("orbital game hook moves", () => {
  it("logs each flight once and in order, at the end of the flight", () => {
    stubReduceMotion(true);
    onMove.mockClear();
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.launch();
      result.current.launch();
      result.current.setAim({ angle: 92, power: 5 });
      result.current.launch();
    });
    expect(onMove.mock.calls.map(([flight]) => [flight.aim.angle, flight.end.type])).toEqual([
      [0, "edge"],
      [0, "edge"],
      [92, "ring"],
    ]);
    expect(result.current.score).toBe(2);
  });
});
