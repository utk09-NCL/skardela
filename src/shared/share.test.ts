import { afterEach, describe, expect, it, vi } from "vitest";
import { symbols } from "../text/symbols";
import type { SolveResult } from "./state/saved-data";
import { levelMark, marksText, sendText } from "./share";

const solve: SolveResult = {
  puzzleId: "guzzle-0001",
  type: "guzzle",
  difficulty: "easy",
  seconds: 60,
  day: "2026-10-25",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("share marks", () => {
  it("gives one mark for each level: no mistakes, mistakes, or not solved", () => {
    expect(levelMark({ ...solve, mistakes: 0 })).toBe("clean");
    expect(levelMark({ ...solve, mistakes: 3 })).toBe("mistakes");
    // An older solve has no count of mistakes. No mistakes are known.
    expect(levelMark(solve)).toBe("clean");
    expect(levelMark()).toBe("unsolved");
  });

  it("puts the squares of the levels in order", () => {
    expect(marksText([{ ...solve, mistakes: 1 }, undefined, solve])).toBe(
      `${symbols.share.mistakes}${symbols.share.unsolved}${symbols.share.clean}`,
    );
  });
});

describe("send a share text", () => {
  it("copies the text on a computer", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await sendText("result")).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("result");
  });

  it("tells when the browser does not let the page copy", async () => {
    vi.stubGlobal("navigator", {});
    expect(await sendText("result")).toBe("failed");
  });

  it("uses the share menu on a touch screen, and copies nothing after a cancel", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    const share = vi
      .fn<(data: ShareData) => Promise<void>>()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new DOMException("Cancelled", "AbortError"));
    vi.stubGlobal("navigator", { share, clipboard: { writeText } });
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(pointer: coarse)" }));
    expect(await sendText("result")).toBe("shared");
    expect(share).toHaveBeenCalledWith({ text: "result" });
    expect(await sendText("result")).toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });
});
