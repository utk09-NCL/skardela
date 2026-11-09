import type { TFunction } from "i18next";
import { symbols } from "../text/symbols";
import type { SolveResult } from "./state/saved-data";

// The share text of a result. It is plain text, thus it works in each app, and it needs no server.
// The text of each line is in "src/text/en/app.ts". This file puts the lines together, gives the square marks
// and sends the text.

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

// The lines of a share text. An empty line is removed. Apps that show the text keep the line breaks.
function shareLines(lines: readonly string[]): string {
  return lines.filter((line) => line !== "").join("\n");
}

// The first line of a share text: the site name, and the date when the puzzles are the puzzles of today.
// "day" is the day key of today's puzzles. It is undefined for a puzzle that is not one of today's puzzles.
function shareTitle(t: TFunction, day: string | undefined): string {
  if (day === undefined) return t(($) => $.share.title);
  return t(($) => $.share.titleWithDate, { date: day });
}

// The share text of one puzzle, for example "Guzzle #0024, Medium" and "Solved in 2:14 with 1 mistake".
// "marks" is one square symbol for each level. "score" is the score in words, for example "1 mistake".
export function puzzleShareText(
  t: TFunction,
  result: {
    day: string | undefined;
    typeName: string;
    number: string;
    level: string;
    marks: string;
    time: string;
    score: string | undefined;
  },
): string {
  const { typeName, number, level, time, score } = result;
  return shareLines([
    shareTitle(t, result.day),
    t(($) => $.share.puzzle, { typeName, number, level }),
    result.marks,
    score === undefined
      ? t(($) => $.share.solvedIn, { time })
      : t(($) => $.share.solvedInWith, { time, score }),
    t(($) => $.share.site),
  ]);
}

// Today's results of one puzzle type, for example "Easy 1:42 · Medium 2:14". Each "time" is a solved level.
export function todayShareText(
  t: TFunction,
  result: {
    day: string;
    typeName: string;
    marks: string;
    times: readonly { level: string; time: string }[];
  },
): string {
  return shareLines([
    shareTitle(t, result.day),
    result.typeName,
    result.marks,
    result.times.map(({ level, time }) => t(($) => $.share.levelTime, { level, time })).join(" · "),
    t(($) => $.share.site),
  ]);
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
