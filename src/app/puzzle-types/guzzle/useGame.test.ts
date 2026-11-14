import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import example from "./examples/guzzle-0000.json";
import type { Move } from "./machine";
import type { GuzzlePuzzle } from "./puzzle";
import { useGame } from "./useGame";

// The test replaces the move log, so it can check each move that the hook gives to the log.
const { onMove } = vi.hoisted(() => ({ onMove: vi.fn<(move: Move) => void>() }));
vi.mock(import("./log"), () => ({ createMoveLog: () => onMove }));

// The example from rules.md: CAT across, BAG down, RAN and MAP on the diagonals.
const puzzle = example as GuzzlePuzzle;

// In these tests, all calls in one "act" use the same render, as fast clicks or fast typing can do.
// Each event must still apply to the latest state.
describe("guzzle game hook with many events in one React batch", () => {
  it("puts each letter in the square that is selected at the time of the letter", () => {
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.chooseMode("noBank");
    });
    // R is correct in row 1, column 1. The selection follows the diagonal over the fixed center
    // to row 3, column 3, where N is correct. Then it goes to the next word: row 3, column 1.
    act(() => {
      result.current.putLetter("R");
      result.current.putLetter("N");
    });
    expect([result.current.guesses[0], result.current.guesses[8]]).toEqual([
      { letter: "R", mark: "correct" },
      { letter: "N", mark: "correct" },
    ]);
    expect(result.current).toMatchObject({ selected: 6, score: 0 });
  });

  it("logs each move once and in order", () => {
    onMove.mockClear();
    const { result } = renderHook(() => useGame(puzzle));
    act(() => {
      result.current.chooseMode("bank");
      result.current.putLetter("T");
      result.current.putLetter("T");
    });
    expect(onMove.mock.calls.map(([move]) => move)).toEqual([
      { type: "mode", mode: "bank" },
      { type: "letter", index: 0, guess: { letter: "T", mark: "absent" }, mistakes: 1 },
    ]);
  });
});
