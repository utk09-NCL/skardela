import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { usePlaySession } from "../../../shared/state/playSession";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import type { LoadedPuzzle } from "../../puzzles";
import { puzzleTypes } from "../../puzzle-types/registry";
import { SolvedCard } from "./SolvedCard";

type Level = LoadedPuzzle["puzzle"]["difficulty"];

const words = text.puzzlePage.result;
const [guzzle] = await puzzleTypes.guzzle.loadPuzzles();

// Today's Guzzle puzzles in these tests: #0023 easy, #0024 medium and #0025 hard.
const today = [
  { id: "guzzle-0023", difficulty: "easy" },
  { id: "guzzle-0024", difficulty: "medium" },
  { id: "guzzle-0025", difficulty: "hard" },
] as const;

// The page data of one Guzzle puzzle. The board data is from a real puzzle. The card uses only the ID and the level.
function loadedAs(id: string, difficulty: Level): LoadedPuzzle {
  if (guzzle === undefined) throw new Error("The Guzzle file has no puzzle.");
  return { type: "guzzle", puzzle: { ...guzzle, id, difficulty }, others: [], today };
}

// A saved solve of a Guzzle puzzle. The day does not change the card.
function solve(puzzleId: string, difficulty: Level, seconds: number, mistakes?: number) {
  useAppStore.getState().recordSolve({
    puzzleId,
    type: "guzzle",
    difficulty,
    seconds,
    day: "2026-10-25",
    ...(mistakes === undefined ? {} : { mistakes }),
  });
}

// The card of a puzzle that the player solved on this visit.
function renderSolved(loaded: LoadedPuzzle) {
  usePlaySession.setState({ puzzleId: loaded.puzzle.id, startedAt: 1000, solvedAt: 135_000 });
  render(
    <MemoryRouter>
      <SolvedCard loaded={loaded} />
    </MemoryRouter>,
  );
}

// The value of one number of the card, by its label.
function numberOf(label: string): string {
  return String(screen.getByText(label).nextElementSibling?.textContent);
}

// The share text on the card, with its line breaks. It is under the heading "Share text".
function shownShareText(): string {
  return String(screen.getByText(words.shareHeading).nextElementSibling?.textContent);
}

describe("result card numbers", () => {
  it("does not show before a solve on this visit", () => {
    solve("guzzle-0024", "medium", 134, 1);
    render(
      <MemoryRouter>
        <SolvedCard loaded={loadedAs("guzzle-0024", "medium")} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("region", { name: words.title })).toBeNull();
  });

  it("shows the time, the mistakes and the time against the average", () => {
    solve("guzzle-0001", "medium", 150);
    solve("guzzle-0002", "medium", 180);
    solve("guzzle-0024", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-0024", "medium"));
    const card = screen.getByRole("region", { name: words.title });
    expect(within(card).getByText(words.puzzle("Guzzle", "Medium", "0024"))).toBeInTheDocument();
    expect(numberOf(words.time)).toBe("2:14");
    expect(numberOf(text.guzzle.scoreWord(1))).toBe("1");
    // The average of the other medium solves is 2:45. Thus this solve is 0:31 faster.
    expect(numberOf(words.faster)).toBe("0:31");
  });

  it("shows First for the first solve of a level", () => {
    solve("guzzle-0024", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-0024", "medium"));
    expect(numberOf(words.firstLabel("Medium"))).toBe(words.first);
  });
});

describe("result card share", () => {
  it("shows the share text with today's levels, copies it, and links to the next level", async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    solve("guzzle-0023", "easy", 102, 0);
    solve("guzzle-0024", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-0024", "medium"));
    const shareText = shownShareText();
    expect(shareText.split("\n")[0]).toMatch(/^Skardela · \d{1,2} [A-Z][a-z]+$/u);
    expect(shareText.split("\n").slice(1)).toEqual([
      "Guzzle #0024, Medium",
      `${symbols.share.clean}${symbols.share.mistakes}${symbols.share.unsolved}`,
      "Solved in 2:14 with 1 mistake",
      text.share.site,
    ]);
    fireEvent.click(screen.getByRole("button", { name: words.copy }));
    expect(await screen.findByText(text.share.copiedMessage)).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(shareText);
    expect(screen.getByRole("link", { name: words.nextLabel("Guzzle", "Hard") })).toHaveAttribute(
      "href",
      "/puzzles/guzzle-0025",
    );
  });

  it("shares only its own level for a puzzle that is not one of today's puzzles", () => {
    solve("guzzle-0099", "hard", 75, 0);
    renderSolved(loadedAs("guzzle-0099", "hard"));
    // The text has no date.
    expect(shownShareText().split("\n").slice(0, 3)).toEqual([
      "Skardela",
      "Guzzle #0099, Hard",
      symbols.share.clean,
    ]);
    // The next level is today's first level that the player did not solve.
    expect(screen.getByRole("link", { name: words.nextLabel("Guzzle", "Easy") })).toHaveAttribute(
      "href",
      "/puzzles/guzzle-0023",
    );
  });
});
