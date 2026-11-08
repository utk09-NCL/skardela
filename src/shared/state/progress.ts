import type { Difficulty } from "../difficulty";
import type { SolveResult } from "./saved-data";

// Pure functions that make the stats from the list of solves. No React and no storage, thus they are easy to test.
// A day is a local date as text, for example "2026-10-24". Text of this form sorts in date order.

// A number with two digits, for example "05".
const pad = (value: number) => String(value).padStart(2, "0");

// The local date of a moment, as a day key.
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// The day that is "count" days after "day". A negative count gives an earlier day.
// The calculation uses UTC, thus a change to summer time does not change the result.
export function addDays(day: string, count: number): string {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  const moment = new Date(Date.UTC(year, month - 1, date + count));
  return moment.toISOString().slice(0, 10);
}

// The number of solves on each day.
export function solvesPerDay(results: readonly SolveResult[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { day } of results) counts.set(day, (counts.get(day) ?? 0) + 1);
  return counts;
}

// The days in a row with at least one solve, up to today. A streak that ends yesterday continues,
// because the player can still solve a puzzle today.
export function currentStreak(results: readonly SolveResult[], today: string): number {
  const counts = solvesPerDay(results);
  let day = counts.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (counts.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

// The most days in a row with at least one solve.
export function longestStreak(results: readonly SolveResult[]): number {
  const days = [...solvesPerDay(results).keys()].toSorted();
  let longest = 0;
  let streak = 0;
  for (const [index, day] of days.entries()) {
    const previous = days[index - 1];
    streak = previous !== undefined && addDays(previous, 1) === day ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  return longest;
}

export type CalendarDay = {
  readonly day: string;
  readonly solves: number;
  readonly isToday: boolean;
  // A day after today has no data yet.
  readonly isFuture: boolean;
};

// The days of the last weeks, Monday first, up to the end of this week. The calendar on the home page shows them.
export function calendarDays(
  results: readonly SolveResult[],
  today: string,
  weeks: number,
): CalendarDay[] {
  const counts = solvesPerDay(results);
  // The day of the week of "today": 0 is Monday, 6 is Sunday.
  const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const first = addDays(today, -weekday - (weeks - 1) * 7);
  return Array.from({ length: weeks * 7 }, (_, index) => {
    const day = addDays(first, index);
    return { day, solves: counts.get(day) ?? 0, isToday: day === today, isFuture: day > today };
  });
}

export type Best = { readonly average: number; readonly best: number; readonly solves: number };

// The average time and the best time of the solves of one puzzle type and one level.
export function bestOf(
  results: readonly SolveResult[],
  type: string,
  difficulty: Difficulty,
): Best | undefined {
  const times = results
    .filter((result) => result.type === type && result.difficulty === difficulty)
    .map((result) => result.seconds);
  if (times.length === 0) return undefined;
  const total = times.reduce((sum, seconds) => sum + seconds, 0);
  return { average: total / times.length, best: Math.min(...times), solves: times.length };
}

// The mistakes of a solve. A solve without a count of mistakes is not better than a solve with a count.
const mistakesOf = (result: SolveResult) => result.mistakes ?? Number.POSITIVE_INFINITY;

// The solve of one puzzle with the best time, or undefined when the player did not solve it.
// When two solves have the same time, the solve with fewer mistakes is better.
export function bestResult(
  results: readonly SolveResult[],
  puzzleId: string,
): SolveResult | undefined {
  let best: SolveResult | undefined;
  for (const result of results) {
    if (result.puzzleId !== puzzleId) continue;
    const isBetter =
      best === undefined ||
      result.seconds < best.seconds ||
      (result.seconds === best.seconds && mistakesOf(result) < mistakesOf(best));
    if (isBetter) best = result;
  }
  return best;
}

// The best time of one puzzle, or undefined when the player did not solve it.
export function bestTime(results: readonly SolveResult[], puzzleId: string): number | undefined {
  return bestResult(results, puzzleId)?.seconds;
}

// The time of one solve minus the average time of the other solves of the same puzzle type and level.
// A negative number is faster than the average. Undefined: the player has no other solve of this level.
export function compareToAverage(
  results: readonly SolveResult[],
  solve: SolveResult,
): number | undefined {
  const others = results.filter((result) => result !== solve);
  const average = bestOf(others, solve.type, solve.difficulty)?.average;
  return average === undefined ? undefined : solve.seconds - average;
}

// A time as minutes and seconds, for example "4:37". From one hour, the hours show too, for example "1:02:09".
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

// The milliseconds from "now" to the next local midnight, when the puzzles of the day change.
export function msUntilMidnight(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

export type HoursAndMinutes = { readonly hours: number; readonly minutes: number };

// A time in whole hours and minutes, for example 3 hours and 57 minutes. The text in "src/text/en/" shows
// the units. The minutes round up, thus the last minute before midnight is 1 minute, not 0.
export function hoursAndMinutes(ms: number): HoursAndMinutes {
  const total = Math.max(0, Math.ceil(ms / 60_000));
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

// A time as an ISO 8601 duration, for example "PT3H57M". A <time> element gives it to the browser.
export function isoDuration({ hours, minutes }: HoursAndMinutes): string {
  return `PT${hours}H${minutes}M`;
}
