import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";
import { usePlaySession } from "../../../shared/state/playSession";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { routes } from "../../routes";

describe("puzzle page timer", () => {
  it("starts the Guzzle timer when the player selects a mode, not before", async () => {
    useAppStore.getState().acknowledgeNotice();
    const user = userEvent.setup();
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ["/puzzles/guzzle-0001"] })}
      />,
    );
    const mode = await screen.findByRole("button", { name: text.guzzle.modes.bank });
    expect(usePlaySession.getState()).toMatchObject({ puzzleId: "guzzle-0001", startedAt: null });
    expect(screen.getByRole("timer")).toHaveTextContent("0:00");
    await user.click(mode);
    expect(usePlaySession.getState().startedAt).not.toBeNull();
  });

  it("starts the timer of a board without a mode at once", async () => {
    useAppStore.getState().acknowledgeNotice();
    render(
      <RouterProvider
        router={createMemoryRouter(routes, { initialEntries: ["/puzzles/latics-0001"] })}
      />,
    );
    await screen.findByRole("grid", { name: text.latics.boardLabel });
    expect(usePlaySession.getState()).toMatchObject({ puzzleId: "latics-0001" });
    expect(usePlaySession.getState().startedAt).not.toBeNull();
  });
});
