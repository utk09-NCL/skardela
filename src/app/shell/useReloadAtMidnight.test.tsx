import { act, render, screen } from "@testing-library/react";
import { createMemoryRouter, useLoaderData } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReloadAtMidnight } from "./useReloadAtMidnight";

// The loader reads the local date, as the loaders of the puzzles of the day do.
// The page shows it, so the test sees each new run of the loader.
const loader = () => new Date().toDateString();

function Page() {
  useReloadAtMidnight();
  return <p>{useLoaderData<typeof loader>()}</p>;
}

// The time moves forward, and the test waits for the loader and the render.
async function wait(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

afterEach(() => {
  vi.useRealTimers();
});

// The page at the given local time. Only the clock and the timers are fake, so the promises of the router still run.
async function openPageAt(time: Date) {
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
  });
  vi.setSystemTime(time);
  render(
    <RouterProvider router={createMemoryRouter([{ path: "/", loader, element: <Page /> }])} />,
  );
  await wait(0);
}

describe("useReloadAtMidnight", () => {
  it("runs the loader again after each local midnight", async () => {
    await openPageAt(new Date(2026, 10, 7, 23, 58));
    expect(screen.getByText(new Date(2026, 10, 7).toDateString())).toBeInTheDocument();

    await wait(60_000);
    expect(screen.getByText(new Date(2026, 10, 7).toDateString())).toBeInTheDocument();

    await wait(2 * 60_000);
    expect(screen.getByText(new Date(2026, 10, 8).toDateString())).toBeInTheDocument();

    await wait(24 * 60 * 60_000);
    expect(screen.getByText(new Date(2026, 10, 9).toDateString())).toBeInTheDocument();
  });

  // While a computer sleeps, the clock moves on but the timers stop. A timer then fires late.
  it("runs the loader again soon after a computer wakes up on a new day", async () => {
    await openPageAt(new Date(2026, 10, 7, 23, 0));
    vi.setSystemTime(new Date(2026, 10, 8, 7, 0));
    await wait(60_000);
    expect(screen.getByText(new Date(2026, 10, 8).toDateString())).toBeInTheDocument();
  });
});
