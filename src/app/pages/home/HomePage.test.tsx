import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";
import { levels } from "../../../shared/difficulty";
import { dayKey } from "../../../shared/progress";
import { useAppStore } from "../../../shared/store";
import { text } from "../../../text/en";
import { homeLoader, type TodayCard } from "../../puzzles";
import { routes } from "../../routes";

const home = text.home;

// The tests play as a returning player of the analytics notice, so the notice does not show.
function renderHome() {
  useAppStore.getState().acknowledgeNotice();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/"] })} />);
  return screen.findByRole("heading", { level: 1 });
}

// Today's puzzle of one type and level.
function todayId(cards: readonly TodayCard[], type: string, level: string): string {
  const card = cards.find((item) => item.type === type);
  const found = card?.levels.find((item) => item.difficulty === level);
  if (found === undefined) throw new Error(`No puzzle for ${type} ${level} today.`);
  return found.id;
}

// A solve of today's puzzle, saved as the app saves it.
function solveToday(cards: readonly TodayCard[], seconds: number) {
  useAppStore.getState().recordSolve({
    puzzleId: todayId(cards, "guzzle", "easy"),
    type: "guzzle",
    difficulty: "easy",
    seconds,
    day: dayKey(new Date()),
  });
}

describe("home page hero", () => {
  it("tells a new player what Skardela is, and shows today's progress", async () => {
    expect(await renderHome()).toHaveTextContent(home.hero.title);
    expect(screen.getByRole("link", { name: home.hero.play })).toHaveAttribute("href", "#today");
    const progress = screen.getByRole("list", { name: home.hero.progressLabel });
    expect(within(progress).getAllByRole("listitem")).toHaveLength(12);
    expect(
      screen.getByText(new RegExp(`^${home.hero.progress(0, 12)} · `, "u")),
    ).toBeInTheDocument();
  });

  it("links to the last puzzle that the player opened and did not solve", async () => {
    useAppStore
      .getState()
      .openPuzzle({ puzzleId: "latics-0012", type: "latics", difficulty: "medium" });
    expect(await renderHome()).toHaveTextContent(home.hero.pickUp);
    const link = screen.getByRole("link", { name: /^Continue/u });
    expect(link).toHaveAttribute("href", "/puzzles/latics-0012");
    expect(link).toHaveTextContent(home.hero.puzzleName(text.latics.name, text.levels.medium));
    expect(screen.queryByRole("link", { name: home.hero.play })).toBeNull();
  });

  it("counts the solved puzzles of today, and does not link to a solved puzzle", async () => {
    const cards = await homeLoader();
    solveToday(cards, 42);
    const id = todayId(cards, "guzzle", "easy");
    useAppStore.getState().openPuzzle({ puzzleId: id, type: "guzzle", difficulty: "easy" });
    expect(await renderHome()).toHaveTextContent(home.hero.solvedSome(1, 12));
    expect(screen.queryByRole("link", { name: /^Continue/u })).toBeNull();
    expect(
      screen.getByText(home.hero.segment(text.guzzle.name, text.levels.easy, true)),
    ).toBeInTheDocument();
  });
});

describe("home page cards", () => {
  it("links to today's puzzle of each level for each puzzle type, in level order", async () => {
    await renderHome();
    for (const type of ["colour-binary", "guzzle", "latics"] as const) {
      const nav = screen.getByRole("navigation", { name: home.today.levelsLabel(text[type].name) });
      const links = within(nav).getAllByRole("link");
      expect(links.map((link) => link.getAttribute("aria-label"))).toEqual(
        levels.map((level) => home.today.levelLink(text.levels[level])),
      );
      for (const link of links) {
        expect(link.getAttribute("href")).toMatch(new RegExp(`^/puzzles/${type}-\\d{4}$`, "u"));
      }
    }
  });

  it("shows the best time of a solved level, and links to the next level", async () => {
    const cards = await homeLoader();
    solveToday(cards, 42);
    await renderHome();
    expect(
      screen.getByRole("link", { name: home.today.levelLink(text.levels.easy, { time: "0:42" }) }),
    ).toHaveTextContent("0:42");
    expect(screen.getByRole("link", { name: home.today.play(text.levels.medium) })).toHaveAttribute(
      "href",
      `/puzzles/${todayId(cards, "guzzle", "medium")}`,
    );
  });
});

describe("home page sections", () => {
  it("explains how it works and answers the questions", async () => {
    await renderHome();
    const steps = screen.getByRole("region", { name: home.steps.heading });
    expect(within(steps).getAllByRole("listitem")).toHaveLength(home.steps.items.length);
    const faq = screen.getByRole("region", { name: home.faq.heading });
    expect(within(faq).getAllByRole("group")).toHaveLength(home.faq.items.length);
    expect(within(faq).getByRole("link", { name: /GitHub/u })).toHaveAttribute(
      "href",
      text.footer.source.href,
    );
  });
});

describe("home page time to new puzzles", () => {
  it.each([
    [{ hours: 3, minutes: 57 }, "3 h 57 min", "3 hours 57 minutes"],
    [{ hours: 0, minutes: 1 }, "1 min", "1 minute"],
    [{ hours: 1, minutes: 0 }, "1 h", "1 hour"],
  ])("shows %j with units, and with full words for a screen reader", (time, short, long) => {
    expect(home.hero.timeShort(time)).toBe(short);
    expect(home.hero.timeLong(time)).toBe(long);
  });

  it("shows the time with its units next to the progress", async () => {
    await renderHome();
    const line = screen.getByText(new RegExp(`^${home.hero.progress(0, 12)} · `, "u"));
    expect(line.textContent).toMatch(/new puzzles in (\d+ h ?)?(\d+ min)?/u);
    expect(line.querySelector("time")?.getAttribute("datetime")).toMatch(/^PT\d+H\d+M$/u);
  });
});
