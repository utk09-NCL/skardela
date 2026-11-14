import { describe, expect, it } from "vitest";
import { dayNumber, localDate, puzzlesForDay } from "./daily";

const pool = [
  { id: "tilt-0003", difficulty: "easy" },
  { id: "tilt-0001", difficulty: "easy" },
  { id: "tilt-0002", difficulty: "easy" },
  { id: "tilt-0004", difficulty: "medium" },
  { id: "tilt-0005", difficulty: "hard" },
  { id: "tilt-0006", difficulty: "hard" },
] as const;

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

describe("puzzlesForDay", () => {
  it("gives one puzzle for each level, in level order", () => {
    expect(puzzlesForDay(pool, 0).map((puzzle) => puzzle.difficulty)).toEqual([
      "easy",
      "medium",
      "hard",
    ]);
  });

  it("gives the puzzles of a level in the order of their IDs, one for each day, and then starts again", () => {
    const easy = [0, 1, 2, 3].map((day) => puzzlesForDay(pool, day)[0]?.id);
    expect(easy).toEqual(["tilt-0001", "tilt-0002", "tilt-0003", "tilt-0001"]);
  });

  it("gives the same puzzles for the same day", () => {
    expect(puzzlesForDay(pool, 1000)).toEqual(puzzlesForDay(pool.toReversed(), 1000));
  });

  it("gives a puzzle for a day before the start date", () => {
    expect(puzzlesForDay(pool, -1)[0]?.id).toBe("tilt-0003");
  });

  it("gives no puzzle for a level without puzzles", () => {
    expect(puzzlesForDay([{ id: "tilt-0001", difficulty: "easy" }], 5)).toEqual([
      { id: "tilt-0001", difficulty: "easy" },
    ]);
  });
});
