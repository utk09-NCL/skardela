import type { LoaderFunctionArgs } from "react-router";
import { levels, type Difficulty } from "../shared/difficulty";
import { parsePuzzleId, puzzleIdOf } from "../shared/puzzle";
import { dayNumber, isPuzzleNumber, localDate } from "./daily";
import { requestPuzzle } from "./generator";
import {
  isPuzzleType,
  puzzleTypes,
  type PuzzleMap,
  type PuzzleType,
} from "./puzzle-types/registry";

// One puzzle of today: its ID and its level.
export type TodayPuzzle = { readonly id: string; readonly difficulty: Difficulty };

// The page data of one puzzle. The type tells the page which board to show.
// The page shows the ID, the level and the author at once. Only the board needs "puzzle":
// the worker makes it, and the board waits for it. See "generator.ts".
// "today" has today's puzzles of the same type, one for each level. The result card links to the next one.
export type LoadedPuzzle = {
  [Type in PuzzleType]: { readonly type: Type; readonly puzzle: Promise<PuzzleMap[Type]> };
}[PuzzleType] & {
  readonly id: string;
  readonly difficulty: Difficulty;
  readonly author: string;
  readonly today: readonly TodayPuzzle[];
};

// Today's puzzles of one type, one for each level. Their number is the day number.
function todayPuzzles(type: PuzzleType, day: number): TodayPuzzle[] {
  return levels.map((difficulty) => ({ id: puzzleIdOf(type, difficulty, day), difficulty }));
}

// The page data of a puzzle ID, or "null" when no puzzle has this ID: the form is wrong,
// the type is not in the registry, or the number is not valid today. See "isPuzzleNumber" in "daily.ts".
// An ID from before the daily numbers, such as "tilt-0029", has no level, thus it gives "null".
export function loadPuzzle(id: string): LoadedPuzzle | null {
  const parts = parsePuzzleId(id);
  if (parts === null || !isPuzzleType(parts.type)) return null;
  const { type, level, number } = parts;
  const day = dayNumber(localDate(new Date()));
  if (!isPuzzleNumber(number, day)) return null;
  // TypeScript cannot see that "type" and the puzzle of the request are of the same puzzle type, thus the cast.
  return {
    type,
    id,
    difficulty: level,
    author: puzzleTypes[type].author,
    today: todayPuzzles(type, day),
    puzzle: requestPuzzle(type, level, number),
  } as LoadedPuzzle;
}

// "true" for an ID with the form of a puzzle ID. An ID from before the daily numbers, such as "tilt-0029",
// gives "false": its page does not exist now.
export function isPuzzleId(id: string): boolean {
  return parsePuzzleId(id) !== null;
}

// The number of a puzzle, from its ID: "1049" for "tilt-hard-1049". The page and the share text show it.
export function puzzleNumber(id: string): string {
  return id.slice(id.lastIndexOf("-") + 1);
}

export function puzzleLoader({ params }: LoaderFunctionArgs): LoadedPuzzle | null {
  return loadPuzzle(params.puzzleId ?? "");
}

// One card of the home page: a puzzle type, the IDs of its puzzles of today (one for each level),
// its author, and the date when the puzzle type came to the site.
export type TodayCard = ReturnType<typeof homeLoader>[number];

// The home page shows one puzzle for each type and level for the current day.
// It makes no boards: the IDs come from the date, and the author comes from the registry.
export function homeLoader() {
  const day = dayNumber(localDate(new Date()));
  return (Object.keys(puzzleTypes) as PuzzleType[]).map((type) => ({
    type,
    levels: todayPuzzles(type, day),
    author: puzzleTypes[type].author,
    added: puzzleTypes[type].added,
  }));
}
