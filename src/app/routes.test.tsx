import { createMemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routes } from "./routes";
import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router/dom";
import { text } from "../text/en";
import { puzzleTypes, type PuzzleType } from "./puzzle-types/registry";

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
    renderAt(`/puzzles/${type}-0001`);
    expect(
      await screen.findByRole("heading", { level: 1, name: text[type].name }),
    ).toBeInTheDocument();
  });

  it("shows the board of the guzzle puzzle page", async () => {
    renderAt("/puzzles/guzzle-0001");
    expect(await screen.findByRole("button", { name: text.guzzle.modes.bank })).toBeInTheDocument();
  });

  it("shows the board of the latics puzzle page", async () => {
    renderAt("/puzzles/latics-0001");
    expect(await screen.findByRole("grid", { name: text.latics.boardLabel })).toBeInTheDocument();
  });

  it.each(["/puzzles/guzzle-9999", "/puzzles/unknown-0001", "/puzzles/guzzle"])(
    "shows the not found page for the puzzle path %s",
    async (path) => {
      renderAt(path);
      expect(await screen.findByTestId("not-found-page-title")).toBeInTheDocument();
    },
  );

  it("shows the not found page for an unknown route", () => {
    renderAt("/broken");
    expect(screen.getByTestId("not-found-page-title")).toBeInTheDocument();
  });
});
