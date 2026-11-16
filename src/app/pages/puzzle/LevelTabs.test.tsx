import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { addDays, dayKey } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import example from "../../puzzle-types/guzzle/examples/guzzle-0000.json";
import type { GuzzlePuzzle } from "../../puzzle-types/guzzle/puzzle";
import type { LoadedPuzzle } from "../../puzzles";
import { LevelTabs } from "./LevelTabs";

const page = text.puzzlePage;

// Today's Guzzle puzzles in these tests: #1049 of each level.
const today = [
  { id: "guzzle-easy-1049", difficulty: "easy" },
  { id: "guzzle-medium-1049", difficulty: "medium" },
  { id: "guzzle-hard-1049", difficulty: "hard" },
] as const;

// The page data of one Guzzle puzzle. The tabs use only the ID, the level and today's puzzles.
function renderTabs(id: string, difficulty: LoadedPuzzle["difficulty"]) {
  const loaded: LoadedPuzzle = {
    type: "guzzle",
    id,
    difficulty,
    author: "skardela",
    today,
    puzzle: Promise.resolve(example as GuzzlePuzzle),
  };
  render(
    <MemoryRouter>
      <LevelTabs loaded={loaded} />
    </MemoryRouter>,
  );
  return screen.getByRole("navigation", { name: page.levelsLabel(text.guzzle.name) });
}

function solve(puzzleId: string, day: string) {
  useAppStore
    .getState()
    .recordSolve({ puzzleId, type: "guzzle", difficulty: "easy", seconds: 60, day });
}

describe("puzzle page level tabs", () => {
  it("links to today's puzzle of each level, and marks the tab of this puzzle as the current page", () => {
    const tabs = within(renderTabs("guzzle-medium-1049", "medium")).getAllByRole("link");
    expect(tabs.map((tab) => tab.getAttribute("href"))).toEqual(
      today.map(({ id }) => `/puzzles/${id}`),
    );
    expect(tabs.map((tab) => tab.getAttribute("aria-current"))).toEqual([null, "page", null]);
  });

  // A random puzzle is not one of today's puzzles. The tab of its level shows as current, but it is a different page.
  it("shows the level of a random puzzle, without aria-current", () => {
    const tabs = within(renderTabs("guzzle-hard-123456", "hard")).getAllByRole("link");
    expect(tabs.map((tab) => tab.dataset.current)).toEqual(["false", "false", "true"]);
    expect(tabs.every((tab) => !tab.hasAttribute("aria-current"))).toBe(true);
  });

  // A player can solve the puzzle of tomorrow one day early. Only a solve of today gives a level its check mark.
  it("marks a level that the player solved today, and not a level that was solved on an earlier day", () => {
    solve("guzzle-easy-1049", dayKey(new Date()));
    solve("guzzle-hard-1049", addDays(dayKey(new Date()), -1));
    const tabs = within(renderTabs("guzzle-medium-1049", "medium")).getAllByRole("link");
    expect(tabs.map((tab) => tab.textContent?.includes(page.levelSolved))).toEqual([
      true,
      false,
      false,
    ]);
  });
});
