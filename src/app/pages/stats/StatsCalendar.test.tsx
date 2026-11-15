import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SolveResult } from "../../../shared/state/saved-data";
import { text } from "../../../text/en";
import { StatsCalendar } from "./StatsCalendar";

const words = text.stats.calendar;

function solveOn(day: string): SolveResult {
  return {
    puzzleId: "guzzle-0001",
    type: "guzzle",
    difficulty: "easy",
    seconds: 60,
    mistakes: 0,
    day,
  };
}

describe("stats calendar", () => {
  // A day after today has no data yet, thus it shows only its outline. A solve can have a later day,
  // for example from an imported file, or after a travel to a different time zone.
  it("shows no number on a day after today", () => {
    // 2026-11-14 is a Saturday. The last day of the calendar is Sunday 2026-11-15.
    render(<StatsCalendar results={[solveOn("2026-11-15")]} today="2026-11-14" />);
    const days = within(screen.getByRole("list", { name: words.heading })).getAllByRole(
      "listitem",
      {
        hidden: true,
      },
    );
    expect(days.at(-1)).toHaveAttribute("data-future", "true");
    expect(days.at(-1)?.textContent).toBe("");
  });
});
