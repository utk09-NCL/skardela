import { describe, expect, it } from "vitest";
import { dayNumber, isPuzzleNumber, localDate } from "./daily";

describe("localDate", () => {
  it("gives the local year, month and day of a moment", () => {
    expect(localDate(new Date(2026, 10, 14, 23, 59))).toEqual({ year: 2026, month: 11, day: 14 });
  });
});

describe("dayNumber", () => {
  it("counts the days from 1 January 2024", () => {
    expect(dayNumber({ year: 2024, month: 1, day: 1 })).toBe(0);
    expect(dayNumber({ year: 2024, month: 1, day: 2 })).toBe(1);
    // 2024 is a leap year: it has 366 days.
    expect(dayNumber({ year: 2025, month: 1, day: 1 })).toBe(366);
  });

  // The number uses the date only, thus a change to summer time does not change it.
  it("gives one more for each day, also across a change to summer time", () => {
    expect(dayNumber({ year: 2026, month: 3, day: 30 })).toBe(
      dayNumber({ year: 2026, month: 3, day: 29 }) + 1,
    );
  });
});

describe("isPuzzleNumber", () => {
  const today = 1050;

  it.each([0, 1, 1049, today, today + 1])("accepts the day number %i, up to tomorrow", (number) => {
    expect(isPuzzleNumber(number, today)).toBe(true);
  });

  it.each([100_000, 123_456, 999_999])("accepts the number %i of a random puzzle", (number) => {
    expect(isPuzzleNumber(number, today)).toBe(true);
  });

  it.each([-1, today + 2, 99_999, 1_000_000, Number.POSITIVE_INFINITY])(
    "refuses the number %d",
    (number) => {
      expect(isPuzzleNumber(number, today)).toBe(false);
    },
  );
});
