import type { LoaderFunctionArgs } from "react-router";
import type { Difficulty } from "../shared/difficulty";
import { dayNumber, localDate, puzzlesForDay } from "./daily";
import {
  isPuzzleType,
  puzzleTypes,
  type PuzzleMap,
  type PuzzleType,
} from "./puzzle-types/registry";

// One puzzle of today: its ID and its level.
export type TodayPuzzle = { readonly id: string; readonly difficulty: Difficulty };

// One puzzle with the name of its type. The type tells the page which board to show.
// "others" has the IDs of the other puzzles of the same type and level. The "Random puzzle" button uses them.
// "today" has today's puzzles of the same type, one for each level. The result card links to the next one.
export type LoadedPuzzle = {
  [Type in PuzzleType]: { type: Type; puzzle: PuzzleMap[Type] };
}[PuzzleType] & { readonly others: readonly string[]; readonly today: readonly TodayPuzzle[] };

// A puzzle ID has the form: type-number, with a number of 4 digits, such as colour-binary-0001.
// The loader checks the format, loads the correct puzzle file, and returns one item if it exists.
export async function loadPuzzle(id: string): Promise<LoadedPuzzle | null> {
  const type = /^([a-z]+(?:-[a-z]+)*)-\d{4}$/u.exec(id)?.[1];
  if (type === undefined || !isPuzzleType(type)) return null;
  const puzzles: readonly PuzzleMap[PuzzleType][] = await puzzleTypes[type].loadPuzzles();
  const puzzle = puzzles.find((item) => item.id === id);
  if (!puzzle) return null;
  const others = puzzles
    .filter((item) => item.difficulty === puzzle.difficulty && item.id !== puzzle.id)
    .map((item) => item.id);
  const today = puzzlesForDay(puzzles, dayNumber(localDate(new Date())));
  return { type, puzzle, others, today } as LoadedPuzzle;
}

// The number of a puzzle, from its ID: "0007" for "tilt-0007". The page and the share text show it.
export function puzzleNumber(id: string): string {
  return id.slice(id.lastIndexOf("-") + 1);
}

export function puzzleLoader({ params }: LoaderFunctionArgs): Promise<LoadedPuzzle | null> {
  return loadPuzzle(params.puzzleId ?? "");
}

// One card of the home page: a puzzle type and the IDs of its puzzles of today, one for each level.
export type TodayCard = Awaited<ReturnType<typeof homeLoader>>[number];

// The home page shows one recommended puzzle for each type and difficulty for the current day.
export function homeLoader() {
  const day = dayNumber(localDate(new Date()));
  return Promise.all(
    (Object.keys(puzzleTypes) as PuzzleType[]).map(async (type) => ({
      type,
      levels: puzzlesForDay(await puzzleTypes[type].loadPuzzles(), day),
    })),
  );
}
