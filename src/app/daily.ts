export type LocalDate = { year: number; month: number; day: number };

// This keeps the date in a simple structure that is easy to compare and reuse.
// It avoids time-zone issues when a user opens the app in a local browser.
export function localDate(now: Date): LocalDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

// The day number gives each date a stable index from a fixed origin date.
// It is the number of the daily puzzles of that date, thus each day has its own puzzles.
export function dayNumber(date: LocalDate): number {
  return Math.round(
    (Date.UTC(date.year, date.month - 1, date.day) - Date.UTC(2024, 0, 1)) / 86_400_000,
  );
}

// "Random puzzle" uses a number in this range. The day numbers get to this range only after the year 2290.
export const randomNumbers = { min: 100_000, max: 999_999 } as const;

// The day number of the first day of the daily schedules: 16 November 2026. From this day, Guzzle and Numpuz
// make the puzzle of a day with the puzzles of the days before it. Thus a word or an equation does not come back soon.
// Do not change it: a different first day changes the puzzles of each day after it.
export const firstDay = 1050;

// "true" for the number of a daily puzzle from "firstDay". A daily puzzle before it and a random puzzle
// are not in the schedules.
export function isScheduled(number: number): boolean {
  return number >= firstDay && number < randomNumbers.min;
}

// "true" when a puzzle has this number: a day number up to tomorrow, or the number of a random puzzle.
// Tomorrow is valid because the local date is different across time zones: a shared link can be of tomorrow.
// The days after tomorrow are not valid, so nobody can open the daily puzzles before their day.
export function isPuzzleNumber(number: number, today: number): boolean {
  return (
    (number >= 0 && number <= today + 1) ||
    (number >= randomNumbers.min && number <= randomNumbers.max)
  );
}
