import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";
import { addDays, dayKey } from "../../../shared/progress";
import { reloadPage } from "../../../shared/reload";
import { useAppStore } from "../../../shared/store";
import { text } from "../../../text/en";
import { routes } from "../../routes";

// jsdom cannot load a page again, thus the test replaces "reloadPage".
vi.mock(import("../../../shared/reload"), () => ({ reloadPage: vi.fn<() => void>() }));

const stats = text.home.stats;

function renderHome() {
  useAppStore.getState().acknowledgeNotice();
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ["/"] })} />);
  return screen.findByRole("region", { name: stats.heading });
}

// Four solves of easy Guzzle puzzles: two today, one yesterday and one five days ago.
function solveOnDays() {
  const today = dayKey(new Date());
  const days = [today, today, addDays(today, -1), addDays(today, -5)];
  for (const [index, day] of days.entries()) {
    useAppStore.getState().recordSolve({
      puzzleId: `guzzle-000${index + 1}`,
      type: "guzzle",
      difficulty: "easy",
      seconds: 30 * (index + 1),
      day,
    });
  }
  return today;
}

// The value of one number of the stats, by its label.
function kpi(label: string): string | null {
  return screen.getByText(label).previousElementSibling?.textContent ?? null;
}

describe("home page stats", () => {
  it("shows the streaks, the solved puzzles and the days played", async () => {
    solveOnDays();
    await renderHome();
    expect(kpi(stats.kpis.streak)).toBe("2");
    expect(kpi(stats.kpis.longest)).toBe("2");
    expect(kpi(stats.kpis.solved)).toBe("4");
    expect(kpi(stats.kpis.days)).toBe("3");
  });

  it("shows the solves of today in the calendar, and the personal bests in a table", async () => {
    const today = solveOnDays();
    await renderHome();
    const calendar = screen.getByRole("list", { name: stats.calendar.heading });
    expect(within(calendar).getByText(stats.calendar.day(today, 2))).toBeInTheDocument();
    const table = screen.getByRole("table", { name: stats.bests.heading });
    // One row for each puzzle type, and one column for each level.
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    const row = within(table).getByRole("row", { name: /^Guzzle/u });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["0:30", `—${stats.bests.noTime}`, `—${stats.bests.noTime}`]);
  });

  it("shows the average times of a row after a select on the name of the puzzle type", async () => {
    solveOnDays();
    const user = userEvent.setup();
    await renderHome();
    const toggle = screen.getByRole("button", { name: text.guzzle.name });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(stats.bests.average("1:15"))).toBeNull();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(stats.bests.average("1:15"))).toBeInTheDocument();
  });

  it("shows one message and a link to a puzzle before the first solve", async () => {
    await renderHome();
    expect(screen.queryByRole("table", { name: stats.bests.heading })).toBeNull();
    expect(screen.getByText(stats.bests.empty)).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: stats.bests.play(text["colour-binary"].name, text.levels.easy),
    });
    expect(link.getAttribute("href")).toMatch(/^\/puzzles\/colour-binary-\d{4}$/u);
  });
});

describe("home page clear data", () => {
  it("asks first, then deletes all saved data and loads the page again", async () => {
    solveOnDays();
    const user = userEvent.setup();
    await renderHome();
    await user.click(screen.getByRole("button", { name: stats.clear.button }));
    expect(screen.getByRole("button", { name: stats.clear.yes.label })).toHaveFocus();
    expect(useAppStore.getState().results).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: stats.clear.yes.label }));
    // The store test checks that the saved item is removed from the storage. See "src/shared/store.test.ts".
    expect(useAppStore.getState().results).toEqual([]);
    expect(reloadPage).toHaveBeenCalledOnce();
  });

  it("keeps the data after No", async () => {
    solveOnDays();
    const user = userEvent.setup();
    await renderHome();
    await user.click(screen.getByRole("button", { name: stats.clear.button }));
    await user.click(screen.getByRole("button", { name: stats.clear.no.label }));
    expect(useAppStore.getState().results).toHaveLength(4);
    expect(screen.getByRole("button", { name: stats.clear.button })).toHaveFocus();
  });

  it("explains Clear data in the questions", async () => {
    await renderHome();
    const item = text.home.faq.items.find(({ answer }) => answer.includes(stats.clear.button));
    expect(screen.getByText(String(item?.question))).toBeInTheDocument();
  });
});
