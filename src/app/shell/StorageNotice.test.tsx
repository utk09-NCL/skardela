import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, describe, expect, it } from "vitest";
import { useStorageStatus } from "../../shared/state/store";
import { text } from "../../text/en";
import { StorageNotice } from "./StorageNotice";

const words = text.storage;

// The notice has a link, thus it needs a router.
function renderNotice() {
  render(
    <RouterProvider router={createMemoryRouter([{ path: "/", element: <StorageNotice /> }])} />,
  );
}

afterEach(() => {
  useStorageStatus.setState({ status: "ok" });
});

describe("storage notice", () => {
  it("shows nothing when the storage works", () => {
    renderNotice();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("tells that the storage is full and links to the stats, and closes", async () => {
    const user = userEvent.setup();
    renderNotice();
    act(() => {
      useStorageStatus.setState({ status: "full" });
    });
    expect(screen.getByRole("alert")).toHaveTextContent(words.full);
    expect(screen.getByRole("link", { name: words.statsLink })).toHaveAttribute("href", "/#stats");
    await user.click(screen.getByRole("button", { name: words.close }));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("tells that the browser blocks storage, also after the player closed the message about a full storage", async () => {
    const user = userEvent.setup();
    useStorageStatus.setState({ status: "full" });
    renderNotice();
    await user.click(screen.getByRole("button", { name: words.close }));
    act(() => {
      useStorageStatus.setState({ status: "unavailable" });
    });
    expect(screen.getByRole("alert")).toHaveTextContent(words.unavailable);
  });

  it("tells the player to reload when a different tab has a newer version", () => {
    useStorageStatus.setState({ status: "outdated" });
    renderNotice();
    expect(screen.getByRole("alert")).toHaveTextContent(words.outdated);
    expect(screen.queryByRole("link", { name: words.statsLink })).toBeNull();
  });
});
