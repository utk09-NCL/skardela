import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";
import { useAppStore } from "../../../shared/state/store";
import { t } from "../../../test/i18n";
import { symbols } from "../../../text/symbols";
import { homeLoader, type TodayCard } from "../../puzzles";
import { routes } from "../../routes";

const home = t(($) => $.home, { returnObjects: true });

type Difficulty = TodayCard["levels"][number]["difficulty"];

// The tests play as a returning player of the analytics notice, so the notice does not show.
function renderHome() {
  useAppStore.getState().acknowledgeNotice();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/"] })} />);
  return screen.findByRole("heading", { level: 1 });
}

// A solve of today's Guzzle puzzle of one level, saved as the app saves it. The day does not change the card.
function solveToday(
  cards: readonly TodayCard[],
  seconds: number,
  difficulty: Difficulty = "easy",
  mistakes?: number,
) {
  const card = cards.find((item) => item.type === "guzzle");
  const found = card?.levels.find((item) => item.difficulty === difficulty);
  if (found === undefined) throw new Error(`No Guzzle puzzle for ${difficulty} today.`);
  useAppStore.getState().recordSolve({
    puzzleId: found.id,
    type: "guzzle",
    difficulty,
    seconds,
    day: "2026-10-25",
    ...(mistakes === undefined ? {} : { mistakes }),
  });
}

describe("home page card results", () => {
  it("shows the time and the mistakes of a solved level", async () => {
    const cards = await homeLoader();
    solveToday(cards, 102, "easy", 1);
    await renderHome();
    const link = screen.getByRole("link", {
      name: "Easy, solved in 1:42 with 1 mistake",
    });
    expect(link).toHaveTextContent(`Easy${home.today.solvedMark}`);
    expect(link).toHaveTextContent("1:42");
    expect(link).toHaveTextContent("1 mistake");
  });

  it("has a Share button only after a solve, and copies today's results", async () => {
    const cards = await homeLoader();
    const user = userEvent.setup();
    const shareName = "Share your Guzzle results of today";
    await renderHome();
    expect(screen.queryByRole("button", { name: shareName })).toBeNull();
    solveToday(cards, 102, "easy", 0);
    solveToday(cards, 134, "medium", 2);
    await user.click(await screen.findByRole("button", { name: shareName }));
    const lines = (await navigator.clipboard.readText()).split("\n");
    expect(lines[0]).toMatch(/^Skardela · \d{1,2} [A-Z][a-z]+$/u);
    expect(lines.slice(1)).toEqual([
      "Guzzle",
      `${symbols.share.clean}${symbols.share.mistakes}${symbols.share.unsolved}`,
      "Easy 1:42 · Medium 2:14",
      t(($) => $.share.site),
    ]);
    expect(screen.getByRole("button", { name: shareName })).toHaveTextContent(
      t(($) => $.share.copied),
    );
  });

  it("shows the total of the best times when all levels are solved", async () => {
    const cards = await homeLoader();
    solveToday(cards, 42, "easy");
    solveToday(cards, 60, "medium");
    solveToday(cards, 100, "hard");
    await renderHome();
    expect(screen.getByText("All solved · 3:22 total")).toBeInTheDocument();
  });
});
