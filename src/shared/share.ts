import { symbols } from "../text/symbols";
import type { SolveResult } from "./state/saved-data";

// The share text of a result. It is plain text, thus it works in each app, and it needs no server.
// The text of each line is in "src/text/en/app.ts". This file gives the square marks and sends the text.

// "clean": solved with no mistakes. "mistakes": solved with one or more mistakes. "unsolved": not solved.
// An older solve has no count of mistakes. It is "clean", because no mistakes are known.
export type LevelMark = keyof typeof symbols.share;

export function levelMark(result?: SolveResult): LevelMark {
  if (result === undefined) return "unsolved";
  return (result.mistakes ?? 0) > 0 ? "mistakes" : "clean";
}

// One square symbol for each level, in level order. "undefined" is a level that is not solved.
export function marksText(results: readonly (SolveResult | undefined)[]): string {
  return results.map((result) => symbols.share[levelMark(result)]).join("");
}

// "copied": the text is on the clipboard. "shared": the share menu of the device sent the text.
// "cancelled": the player closed the share menu. "failed": the browser did not let the page copy the text.
export type ShareOutcome = "copied" | "shared" | "cancelled" | "failed";

// A phone or a tablet has a share menu, and a touch screen. On a computer, a copy is easier.
export function prefersShareMenu(): boolean {
  if (typeof navigator === "undefined" || !("share" in navigator)) return false;
  return typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
}

// This sends the text with the share menu of the device, or copies it to the clipboard.
// When the share menu fails for a reason that is not a cancel, the text is copied.
export async function sendText(text: string): Promise<ShareOutcome> {
  if (prefersShareMenu()) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    // The clipboard is not available, for example on a page without HTTPS.
    return "failed";
  }
}
