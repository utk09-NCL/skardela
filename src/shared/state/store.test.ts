import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSavedData, maxResults, savedDataKey, type SolveResult } from "./saved-data";
import { parseStoredText } from "./storage-format";
import { useAppStore, useStorageStatus } from "./store";

const result: SolveResult = {
  puzzleId: "latics-0001",
  type: "latics",
  difficulty: "easy",
  seconds: 30,
  day: "2026-10-24",
};

// The saved data in the storage.
function stored(): unknown {
  return parseStoredText(localStorage.getItem(savedDataKey));
}

function blocked(): never {
  throw new DOMException("Storage is blocked", "SecurityError");
}

function full(): never {
  throw new DOMException("The storage is full", "QuotaExceededError");
}

afterEach(() => {
  vi.restoreAllMocks();
  useStorageStatus.setState({ status: "ok" });
});

describe("app store", () => {
  it("saves each puzzle type of the seen rules one time", () => {
    useAppStore.getState().seeRules("guzzle");
    const before = useAppStore.getState();
    useAppStore.getState().seeRules("guzzle");
    // A type that is already in the list does not change the state.
    expect(useAppStore.getState()).toBe(before);
    expect(stored()).toMatchObject({ seenRules: ["guzzle"] });
  });

  it("saves the data under one key", () => {
    useAppStore.getState().setTheme("dark");
    useAppStore.getState().acknowledgeNotice();
    expect(stored()).toEqual({ ...defaultSavedData, theme: "dark", cookieBanner: true });
  });

  it("saves each solve, and puts each puzzle one time in the list of solved puzzles", () => {
    const { recordSolve } = useAppStore.getState();
    recordSolve(result);
    recordSolve({ ...result, seconds: 20 });
    expect(useAppStore.getState().solved).toEqual(["latics-0001"]);
    expect(useAppStore.getState().results.map((solve) => solve.seconds)).toEqual([30, 20]);
  });

  it(`keeps only the last ${maxResults} solves`, () => {
    useAppStore.setState({ results: Array.from({ length: maxResults }, () => result) });
    useAppStore.getState().recordSolve({ ...result, seconds: 1 });
    expect(useAppStore.getState().results).toHaveLength(maxResults);
    expect(useAppStore.getState().results.at(-1)?.seconds).toBe(1);
  });

  it("removes all saved data and goes back to the default data", () => {
    useAppStore.getState().recordSolve(result);
    useAppStore
      .getState()
      .openPuzzle({ puzzleId: "guzzle-0002", type: "guzzle", difficulty: "hard" });
    useAppStore.getState().clearData();
    expect(localStorage.getItem(savedDataKey)).toBeNull();
    expect(useAppStore.getState()).toMatchObject(defaultSavedData);
  });

  it("keeps the data on this page when the browser blocks storage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    expect(() => {
      useAppStore.getState().acknowledgeNotice();
    }).not.toThrow();
    expect(useAppStore.getState().cookieBanner).toBe(true);
  });
});

describe("app store and other tabs", () => {
  it("reads the saved data again after a change in a different tab", async () => {
    await act(async () => {
      localStorage.setItem(
        savedDataKey,
        JSON.stringify({ theme: "light", solved: ["guzzle-0003"] }),
      );
      window.dispatchEvent(new StorageEvent("storage", { key: savedDataKey, newValue: "{}" }));
      await Promise.resolve();
    });
    expect(useAppStore.getState()).toMatchObject({ theme: "light", solved: ["guzzle-0003"] });
  });

  it("goes back to the default data when a different tab clears the data", () => {
    useAppStore.getState().acknowledgeNotice();
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: savedDataKey, newValue: null }));
    });
    expect(useAppStore.getState().cookieBanner).toBe(false);
  });

  it("ignores a change to a different key", () => {
    useAppStore.getState().setTheme("dark");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "a-different-key", newValue: null }));
    });
    expect(useAppStore.getState().theme).toBe("dark");
  });
});

describe("app store and the storage status", () => {
  it("tells that the storage is full, and goes back to ok after a good write", () => {
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(full);
    useAppStore.getState().setTheme("dark");
    expect(useStorageStatus.getState().status).toBe("full");
    write.mockRestore();
    useAppStore.getState().setTheme("light");
    expect(useStorageStatus.getState().status).toBe("ok");
  });

  it("tells that the browser blocks storage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    useAppStore.getState().acknowledgeNotice();
    expect(useStorageStatus.getState().status).toBe("unavailable");
  });
});

// A different tab can run a newer version of the app with a newer stored format.
// This version cannot read all of that text, thus a write would lose the data of the newer version.
describe("app store and a newer version in a different tab", () => {
  const newer = JSON.stringify({ v: 3, theme: "dark", progress: "a format of version 3" });

  it("does not write over the data of the newer version, and tells it", () => {
    localStorage.setItem(savedDataKey, newer);
    useAppStore.getState().setTheme("light");
    expect(localStorage.getItem(savedDataKey)).toBe(newer);
    expect(useStorageStatus.getState().status).toBe("outdated");
  });

  it("tells it when it reads the data of the newer version", async () => {
    await act(async () => {
      localStorage.setItem(savedDataKey, newer);
      window.dispatchEvent(new StorageEvent("storage", { key: savedDataKey, newValue: newer }));
      await Promise.resolve();
    });
    expect(useStorageStatus.getState().status).toBe("outdated");
  });
});

describe("app store import", () => {
  it("adds the new solves of a file and gives their number", () => {
    useAppStore.getState().recordSolve(result);
    const added = useAppStore.getState().importData({
      ...defaultSavedData,
      solved: ["guzzle-0005"],
      results: [result, { ...result, puzzleId: "guzzle-0005", day: "2026-10-01" }],
    });
    expect(added).toBe(1);
    expect(useAppStore.getState().solved).toEqual(["latics-0001", "guzzle-0005"]);
    expect(useAppStore.getState().results).toHaveLength(2);
  });
});
