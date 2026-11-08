import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import example from "./examples/orbital-0000.json";
import { initialState } from "./machine";
import type { OrbitalPuzzle } from "./puzzle";
import type { Flight } from "./rules-check";
import { play, useGame } from "./useGame";

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

describe("orbital play reducer", () => {
  it("lands the flight at once when the flight shows at once", () => {
    const state = play(initialState(puzzle), { type: "launch", instant: true });
    expect(state.flying).toBeNull();
    expect(state.flights).toHaveLength(1);
  });

  it("keeps the flight in the air until the end of the animation", () => {
    const flying = play(initialState(puzzle), { type: "launch", instant: false });
    expect(flying.flying?.end).toEqual({ type: "edge" });
    expect(flying.flights).toHaveLength(0);
    // A launch during the flight does not land the flight in the air, also when the flight would show at once.
    expect(play(flying, { type: "launch", instant: true })).toBe(flying);
    const landed = play(flying, { type: "land" });
    expect(landed.flying).toBeNull();
    expect(landed.flights).toEqual([flying.flying]);
  });
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
    expect(result.current.misses).toBe(0);
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
    expect(result.current.misses).toBe(0);
    act(() => {
      result.current.land();
    });
    expect(result.current.flying).toBeNull();
    expect(result.current.misses).toBe(1);
    expect(result.current.aim).toEqual({ angle: 0, power: 5 });
  });
});

describe("orbital game hook moves", () => {
  it("logs each flight once and in order, at the end of the flight", () => {
    stubReduceMotion(true);
    const onMove = vi.fn<(flight: Flight) => void>();
    const { result } = renderHook(() => useGame(puzzle, onMove));
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
    expect(result.current.misses).toBe(2);
  });
});
