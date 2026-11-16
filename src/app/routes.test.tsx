import { createMemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routes } from "./routes";
import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router/dom";
import { text } from "../text/en";
import { dayNumber, localDate } from "./daily";
import { puzzleTypes, type PuzzleType } from "./puzzle-types/registry";

const today = dayNumber(localDate(new Date()));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  vi.useRealTimers();
});

describe("routes", () => {
  it("shows the home page at /", async () => {
    renderAt("/");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.home.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: text.nav.label })).toBeInTheDocument();
  });

  // Each puzzle type in the registry has a page. A new puzzle type gets this test with no change here.
  it.each(Object.keys(puzzleTypes) as PuzzleType[])("shows the %s puzzle page", async (type) => {
    renderAt(`/puzzles/${type}-easy-1`);
    expect(
      await screen.findByRole("heading", { level: 1, name: text[type].name }),
    ).toBeInTheDocument();
  });

  it("shows the board of the guzzle puzzle page", async () => {
    renderAt("/puzzles/guzzle-easy-1");
    expect(await screen.findByRole("button", { name: text.guzzle.modes.bank })).toBeInTheDocument();
  });

  it("shows the board of the latics puzzle page", async () => {
    renderAt("/puzzles/latics-easy-1");
    expect(await screen.findByRole("grid", { name: text.latics.boardLabel })).toBeInTheDocument();
  });
});

describe("routes of puzzles of other days and of old links", () => {
  // The local date is different across time zones, thus the puzzles of tomorrow have a page too.
  it("shows the page of a puzzle of tomorrow", async () => {
    renderAt(`/puzzles/tilt-easy-${today + 1}`);
    expect(
      await screen.findByRole("heading", { level: 1, name: text.tilt.name }),
    ).toBeInTheDocument();
  });

  // "tilt-0029" is a link from before the daily numbers. The last path is the day after tomorrow.
  it.each([
    "/puzzles/tilt-0029",
    "/puzzles/unknown-easy-1",
    "/puzzles/guzzle",
    `/puzzles/tilt-easy-${today + 2}`,
  ])(
    "shows the not found page, with a link to the home page, for the puzzle path %s",
    async (path) => {
      renderAt(path);
      expect(await screen.findByTestId("not-found-page-title")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: text.notFound.homeLink })).toHaveAttribute(
        "href",
        "/",
      );
    },
  );

  it("shows the not found page for an unknown route", () => {
    renderAt("/broken");
    expect(screen.getByTestId("not-found-page-title")).toBeInTheDocument();
  });
});

describe("stats route", () => {
  it("shows the stats page at /stats, with the Stats tab as the current page", async () => {
    renderAt("/stats");
    expect(
      await screen.findByRole("heading", { level: 1, name: text.stats.heading }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: text.nav.stats })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
