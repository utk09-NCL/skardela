import { describe, expect, it } from "vitest";
import {
  addDays,
  bestOf,
  bestResult,
  bestTime,
  calendarDays,
  compareToAverage,
  currentStreak,
  dayKey,
  formatDuration,
  hoursAndMinutes,
  isoDuration,
  longestStreak,
  msUntilMidnight,
} from "./progress";
import type { SolveResult } from "./saved-data";

// A solve on a day. The other fields do not change the streaks.
function solveOn(day: string, seconds = 60, puzzleId = "guzzle-0001"): SolveResult {
  return { puzzleId, type: "guzzle", difficulty: "easy", seconds, day };
}

describe("days", () => {
  it("gives the local date of a moment", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("adds days over the end of a month and of a year", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("streaks", () => {
  const results = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-10", "2026-10-11"].map(
    (day) => solveOn(day),
  );

  it("counts the days in a row up to today", () => {
    expect(currentStreak(results, "2026-10-11")).toBe(2);
  });

  it("continues a streak that ends yesterday, and ends a streak with a day without a solve", () => {
    expect(currentStreak(results, "2026-10-12")).toBe(2);
    expect(currentStreak(results, "2026-10-13")).toBe(0);
  });

  it("counts a day with many solves as one day", () => {
    expect(currentStreak([...results, solveOn("2026-10-11")], "2026-10-11")).toBe(2);
  });

  it("finds the longest streak", () => {
    expect(longestStreak(results)).toBe(3);
    expect(longestStreak([])).toBe(0);
  });
});

describe("calendarDays", () => {
  // 2026-10-24 is a Saturday.
  const days = calendarDays(
    [solveOn("2026-10-24"), solveOn("2026-10-24"), solveOn("2026-10-05")],
    "2026-10-24",
    5,
  );

  it("starts on a Monday and ends on the Sunday of this week", () => {
    expect(days).toHaveLength(35);
    expect(days[0]?.day).toBe("2026-09-21");
    expect(days.at(-1)?.day).toBe("2026-10-25");
  });

  it("counts the solves of each day and marks today and the days after it", () => {
    const today = days.find((day) => day.isToday);
    expect(today).toMatchObject({ day: "2026-10-24", solves: 2, isFuture: false });
    expect(days.find((day) => day.day === "2026-10-05")?.solves).toBe(1);
    expect(days.filter((day) => day.isFuture).map((day) => day.day)).toEqual(["2026-10-25"]);
  });
});

describe("bests", () => {
  const results = [
    solveOn("2026-10-01", 90),
    solveOn("2026-10-02", 30, "guzzle-0002"),
    solveOn("2026-10-03", 60),
  ];

  it("gives the average and the best time of a type and a level", () => {
    expect(bestOf(results, "guzzle", "easy")).toEqual({ average: 60, best: 30, solves: 3 });
    expect(bestOf(results, "guzzle", "hard")).toBeUndefined();
  });

  it("gives the best time of one puzzle", () => {
    expect(bestTime(results, "guzzle-0001")).toBe(60);
    expect(bestTime(results, "latics-0001")).toBeUndefined();
  });

  it("gives the best solve of one puzzle, with fewer mistakes for the same time", () => {
    const slow = { ...solveOn("2026-10-01", 90), mistakes: 0 };
    const old = solveOn("2026-10-02", 60);
    const clean = { ...solveOn("2026-10-03", 60), mistakes: 0 };
    const messy = { ...solveOn("2026-10-04", 60), mistakes: 2 };
    expect(bestResult([slow, old, messy, clean], "guzzle-0001")).toBe(clean);
    // A solve without a count of mistakes is not better than a solve with a count.
    expect(bestResult([old, messy], "guzzle-0001")).toBe(messy);
    expect(bestResult([slow], "latics-0001")).toBeUndefined();
  });

  it("compares a solve to the average of the other solves of its type and level", () => {
    const solve = solveOn("2026-10-04", 45, "guzzle-0009");
    // The other easy solves have an average of 60 seconds.
    expect(compareToAverage([...results, solve], solve)).toBe(-15);
    expect(compareToAverage([solve], solve)).toBeUndefined();
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [59.6, "1:00"],
    [277, "4:37"],
    [3729, "1:02:09"],
    [-5, "0:00"],
  ])("shows %d seconds as %s", (seconds, shown) => {
    expect(formatDuration(seconds)).toBe(shown);
  });
});

describe("time to midnight", () => {
  it("counts the time to the next local midnight", () => {
    expect(msUntilMidnight(new Date(2026, 9, 24, 20, 3, 0))).toBe((3 * 60 + 57) * 60_000);
  });

  it.each([
    [(3 * 60 + 57) * 60_000, { hours: 3, minutes: 57 }],
    [(3 * 60 + 56) * 60_000 + 1, { hours: 3, minutes: 57 }],
    [4 * 60 * 60_000, { hours: 4, minutes: 0 }],
    [30_000, { hours: 0, minutes: 1 }],
    [-5, { hours: 0, minutes: 0 }],
  ])("gives %d ms as whole hours and minutes, with the minutes up", (ms, time) => {
    expect(hoursAndMinutes(ms)).toEqual(time);
  });

  it("gives an ISO 8601 duration", () => {
    expect(isoDuration({ hours: 3, minutes: 57 })).toBe("PT3H57M");
  });
});
