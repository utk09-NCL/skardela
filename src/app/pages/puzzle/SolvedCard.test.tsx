/* oxlint-disable import/max-dependencies -- the tests need the router, the stores, the text, the registry and the date helpers. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { usePlaySession } from "../../../shared/state/playSession";
import { addDays, dayKey } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import example from "../../puzzle-types/guzzle/examples/guzzle-0000.json";
import type { GuzzlePuzzle } from "../../puzzle-types/guzzle/puzzle";
import type { LoadedPuzzle } from "../../puzzles";
import { SolvedCard } from "./SolvedCard";

type Level = LoadedPuzzle["difficulty"];

const words = text.puzzlePage.result;

// Today's Guzzle puzzles in these tests: #1049 of each level.
const today = [
  { id: "guzzle-easy-1049", difficulty: "easy" },
  { id: "guzzle-medium-1049", difficulty: "medium" },
  { id: "guzzle-hard-1049", difficulty: "hard" },
] as const;

// The page data of one Guzzle puzzle. The card uses only the type, the ID, the level and today's puzzles.
function loadedAs(id: string, difficulty: Level): LoadedPuzzle {
  return {
    type: "guzzle",
    id,
    difficulty,
    author: "skardela",
    today,
    puzzle: Promise.resolve(example as GuzzlePuzzle),
  };
}

// A saved solve of a Guzzle puzzle, today or on an earlier "day". The card counts only the levels solved today.
function solve(
  puzzleId: string,
  difficulty: Level,
  seconds: number,
  mistakes?: number,
  day = dayKey(new Date()),
) {
  useAppStore.getState().recordSolve({
    puzzleId,
    type: "guzzle",
    difficulty,
    seconds,
    day,
    ...(mistakes === undefined ? {} : { mistakes }),
  });
}

// The card of a puzzle that the player solved on this visit.
function renderSolved(loaded: LoadedPuzzle) {
  usePlaySession.setState({ puzzleId: loaded.id, startedAt: 1000, solvedAt: 135_000 });
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
// The mark of each square in the shown share text. The CSS gives each mark its colour.
function shownMarks(): (string | undefined)[] {
  const squares = screen
    .getByText(words.shareHeading)
    .nextElementSibling?.querySelectorAll<HTMLElement>("[data-mark]");
  return [...(squares ?? [])].map((square) => square.dataset.mark);
}

function shownShareText(): string {
  return String(screen.getByText(words.shareHeading).nextElementSibling?.textContent);
}

describe("result card numbers", () => {
  it("does not show before a solve on this visit", () => {
    solve("guzzle-medium-1049", "medium", 134, 1);
    render(
      <MemoryRouter>
        <SolvedCard loaded={loadedAs("guzzle-medium-1049", "medium")} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("region", { name: words.title })).toBeNull();
  });

  it("shows the time, the mistakes and the time against the average", () => {
    solve("guzzle-medium-1047", "medium", 150);
    solve("guzzle-medium-1048", "medium", 180);
    solve("guzzle-medium-1049", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-medium-1049", "medium"));
    const card = screen.getByRole("region", { name: words.title });
    expect(within(card).getByText(words.puzzle("Guzzle", "Medium", "1049"))).toBeInTheDocument();
    expect(numberOf(words.time)).toBe("2:14");
    expect(numberOf(text.guzzle.scoreWord(1))).toBe("1");
    // The average of the other medium solves is 2:45. Thus this solve is 0:31 faster.
    expect(numberOf(words.faster)).toBe("0:31");
  });

  it("shows First for the first solve of a level", () => {
    solve("guzzle-medium-1049", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-medium-1049", "medium"));
    expect(numberOf(words.firstLabel("Medium"))).toBe(words.first);
  });
});

describe("result card share", () => {
  it("shows the share text with today's levels, copies it, and links to the next level", async () => {
    const writeText = vi.fn<(value: string) => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    solve("guzzle-easy-1049", "easy", 102, 0);
    solve("guzzle-medium-1049", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-medium-1049", "medium"));
    const shareText = shownShareText();
    expect(shareText.split("\n")[0]).toMatch(/^Skardela · \d{1,2} [A-Z][a-z]+$/u);
    expect(shareText.split("\n").slice(1)).toEqual([
      "Guzzle #1049, Medium",
      `${symbols.share.clean}${symbols.share.mistakes}${symbols.share.unsolved}`,
      "Solved in 2:14 with 1 mistake",
      text.share.site,
    ]);
    // Each square of the text has the colour of its mark on the screen.
    expect(shownMarks()).toEqual(["clean", "mistakes", "unsolved"]);
    fireEvent.click(screen.getByRole("button", { name: words.copy }));
    expect(await screen.findByText(text.share.copiedMessage)).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(shareText);
    expect(screen.getByRole("link", { name: words.next("Hard") })).toHaveAttribute(
      "href",
      "/puzzles/guzzle-hard-1049",
    );
  });
});

describe("result card share of today's levels", () => {
  // A player can solve the puzzle of tomorrow one day early. That solve does not count on the next day.
  it("does not count a level that the player solved on an earlier day", () => {
    solve("guzzle-easy-1049", "easy", 102, 0, addDays(dayKey(new Date()), -1));
    solve("guzzle-medium-1049", "medium", 134, 1);
    renderSolved(loadedAs("guzzle-medium-1049", "medium"));
    expect(shownShareText().split("\n")[2]).toBe(
      `${symbols.share.unsolved}${symbols.share.mistakes}${symbols.share.unsolved}`,
    );
    expect(screen.getByRole("link", { name: words.next("Easy") })).toHaveAttribute(
      "href",
      "/puzzles/guzzle-easy-1049",
    );
  });

  it("shares only its own level for a puzzle that is not one of today's puzzles", () => {
    solve("guzzle-hard-123456", "hard", 75, 0);
    renderSolved(loadedAs("guzzle-hard-123456", "hard"));
    // The text has no date.
    expect(shownShareText().split("\n").slice(0, 3)).toEqual([
      "Skardela",
      "Guzzle #123456, Hard",
      symbols.share.clean,
    ]);
    // The next level is today's first level that the player did not solve.
    expect(screen.getByRole("link", { name: words.next("Easy") })).toHaveAttribute(
      "href",
      "/puzzles/guzzle-easy-1049",
    );
  });
});
