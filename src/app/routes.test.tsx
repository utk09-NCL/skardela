import { createMemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routes } from "./routes";
import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router/dom";
import { t } from "../test/i18n";

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
      await screen.findByRole("heading", { level: 1, name: t(($) => $.home.hero.title) }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: t(($) => $.nav.label) })).toBeInTheDocument();
  });

  it("shows the colour-binary puzzle page", async () => {
    renderAt("/puzzles/colour-binary-0001");
    expect(
      await screen.findByRole("heading", { level: 1, name: t(($) => $["colour-binary"].name) }),
    ).toBeInTheDocument();
  });

  it("shows the guzzle puzzle page", async () => {
    renderAt("/puzzles/guzzle-0001");
    expect(
      await screen.findByRole("heading", { level: 1, name: t(($) => $.guzzle.name) }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: t(($) => $.guzzle.modes.bank) }),
    ).toBeInTheDocument();
  });

  it("shows the latics puzzle page", async () => {
    renderAt("/puzzles/latics-0001");
    expect(
      await screen.findByRole("heading", { level: 1, name: t(($) => $.latics.name) }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("group", { name: t(($) => $.latics.boardLabel) }),
    ).toBeInTheDocument();
  });

  it.each(["/puzzles/guzzle-9999", "/puzzles/unknown-0001", "/puzzles/guzzle"])(
    "shows the not found page for the puzzle path %s",
    async (path) => {
      renderAt(path);
      expect(await screen.findByTestId("not-found-page-title")).toBeInTheDocument();
    },
  );

  it("shows the route error page for an unknown route", () => {
    renderAt("/broken");
    expect(screen.getByTestId("not-found-page-title")).toBeInTheDocument();
  });
});
