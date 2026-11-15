/* oxlint-disable import/max-dependencies -- the tests need the router, the store, the text, the loader and the date helpers. */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addDays, dayKey } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import { homeLoader, type TodayCard } from "../../puzzles";
import { routes } from "../../routes";

const home = text.home;

type Difficulty = TodayCard["levels"][number]["difficulty"];

// The tests play as a returning player of the analytics notice, so the notice does not show.
function renderHome() {
  useAppStore.getState().acknowledgeNotice();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/"] })} />);
  return screen.findByRole("heading", { level: 1 });
}

// A solve of today's Guzzle puzzle of one level, saved as the app saves it. "day" is today, except when a test
// gives an earlier day.
function solveToday(
  cards: readonly TodayCard[],
  seconds: number,
  difficulty: Difficulty = "easy",
  mistakes?: number,
  day = dayKey(new Date()),
) {
  const card = cards.find((item) => item.type === "guzzle");
  const found = card?.levels.find((item) => item.difficulty === difficulty);
  if (found === undefined) throw new Error(`No Guzzle puzzle for ${difficulty} today.`);
  useAppStore.getState().recordSolve({
    puzzleId: found.id,
    type: "guzzle",
    difficulty,
    seconds,
    day,
    ...(mistakes === undefined ? {} : { mistakes }),
  });
}

describe("home page card results", () => {
  it("shows the time of a solved level, and tells the mistakes to a screen reader", async () => {
    const cards = await homeLoader();
    solveToday(cards, 102, "easy", 1);
    await renderHome();
    const link = screen.getByRole("link", {
      name: home.today.levelLink(text.levels.easy, { time: "1:42", score: "1 mistake" }),
    });
    expect(link).toHaveTextContent(`${text.levels.easy} ${home.today.solvedMark} 1:42`);
    expect(link).not.toHaveTextContent("1 mistake");
  });

  it("has a Share button only after a solve, and copies today's results", async () => {
    const cards = await homeLoader();
    const user = userEvent.setup();
    const shareName = home.today.shareLabel(text.guzzle.name);
    await renderHome();
    expect(screen.queryByRole("button", { name: shareName })).toBeNull();
    solveToday(cards, 102, "easy", 0);
    solveToday(cards, 134, "medium", 2);
    await user.click(await screen.findByRole("button", { name: shareName }));
    const lines = (await navigator.clipboard.readText()).split("\n");
    expect(lines[0]).toMatch(/^Skardela · \d{1,2} [A-Z][a-z]+$/u);
    expect(lines.slice(1)).toEqual([
      text.guzzle.name,
      `${symbols.share.clean}${symbols.share.mistakes}${symbols.share.unsolved}`,
      "Easy 1:42 · Medium 2:14",
      text.share.site,
    ]);
    expect(screen.getByRole("button", { name: shareName })).toHaveTextContent(text.share.copied);
  });
});

describe("home page card levels", () => {
  // The daily puzzles repeat. A solve of the same puzzle on an earlier day does not count today.
  it("does not mark a level as solved when the player solved its puzzle on an earlier day", async () => {
    const cards = await homeLoader();
    solveToday(cards, 42, "medium", 0, addDays(dayKey(new Date()), -2));
    await renderHome();
    const nav = screen.getByRole("navigation", { name: home.today.levelsLabel(text.guzzle.name) });
    const medium = within(nav).getByRole("link", {
      name: home.today.levelLink(text.levels.medium),
    });
    expect(medium).toHaveAttribute("data-solved", "false");
    expect(
      screen.queryByRole("button", { name: home.today.shareLabel(text.guzzle.name) }),
    ).toBeNull();
  });

  // The time and the square of a level come from the solves of today, not from a faster solve on an earlier day.
  it("shows the time of today's solve when an earlier day has a faster solve", async () => {
    const cards = await homeLoader();
    solveToday(cards, 50, "easy", 0, addDays(dayKey(new Date()), -14));
    solveToday(cards, 150, "easy", 2);
    await renderHome();
    const link = screen.getByRole("link", {
      name: home.today.levelLink(text.levels.easy, { time: "2:30", score: "2 mistakes" }),
    });
    expect(link).toHaveTextContent("2:30");
  });

  it("marks the next level to play, and shows a dash on the other levels", async () => {
    const cards = await homeLoader();
    solveToday(cards, 42, "easy");
    await renderHome();
    const nav = screen.getByRole("navigation", { name: home.today.levelsLabel(text.guzzle.name) });
    // The name of the next level has the visible word "play" too.
    const level = (name: string, isNext: boolean) =>
      within(nav).getByRole("link", { name: home.today.levelLink(name, undefined, isNext) });
    expect(level(text.levels.medium, true)).toHaveTextContent(
      `${text.levels.medium} ${home.today.next}`,
    );
    expect(level(text.levels.hard, false)).toHaveTextContent(
      `${text.levels.hard} ${home.today.notSolved}`,
    );
  });
});

// The card of one puzzle type, from its name.
function cardOf(name: string): HTMLElement {
  const card = screen.getByRole("heading", { level: 2, name }).closest("li");
  if (card === null) throw new Error(`No card for ${name}.`);
  return card;
}

describe("home page new puzzle types", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Tilt came on 7 November and Orbital on 8 November. See "src/app/puzzle-types/registry.ts".
  it("shows the added date, and marks the puzzle types of the last two weeks as new", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 14, 12));
    await renderHome();
    const tilt = cardOf(text.tilt.name);
    expect(within(tilt).getByText(home.today.added("2026-11-07"))).toBeInTheDocument();
    expect(within(cardOf(text.numpuz.name)).getByText("Wisdom Usiwoma")).toBeInTheDocument();
    expect(within(tilt).getByText(home.today.newTag)).toBeInTheDocument();
    expect(within(cardOf(text.guzzle.name)).queryByText(home.today.newTag)).toBeNull();
  });

  it("shows only the new puzzle types after a select on New", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 14, 12));
    const user = userEvent.setup();
    await renderHome();
    const filters = screen.getByRole("group", { name: home.today.filtersLabel });
    const all = within(filters).getByRole("button", { name: /^All/u });
    const onlyNew = within(filters).getByRole("button", { name: /^New/u });
    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(onlyNew).toHaveTextContent(`${home.today.filters.new}2`);
    await user.click(onlyNew);
    expect(onlyNew).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("heading", { level: 2, name: /^(Orbital|Tilt)$/u })).toHaveLength(2);
    expect(screen.queryByRole("heading", { level: 2, name: text.guzzle.name })).toBeNull();
  });

  it("has no filter chips when no puzzle type is new", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 11, 31, 12));
    await renderHome();
    expect(screen.queryByRole("group", { name: home.today.filtersLabel })).toBeNull();
    expect(within(cardOf(text.tilt.name)).queryByText(home.today.newTag)).toBeNull();
  });
});
