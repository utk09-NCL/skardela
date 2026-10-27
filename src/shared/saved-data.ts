import { levels, type Difficulty } from "./difficulty";
import { isTheme, type Theme } from "./theme";

// The data that Skardela saves in the browser, and its checks. It is one localStorage item.
// "storage-format.ts" makes the stored text and the export file from it, and reads them again.
// The store in "store.ts" holds the data. Components use the store, not this file.
// The script in "index.html" reads the theme before the page shows. It must use the same key and field names.

export const savedDataKey = "skardela.netlify.app";

// One puzzle: its ID, its type and its level.
export type PuzzleRef = {
  readonly puzzleId: string;
  readonly type: string;
  readonly difficulty: Difficulty;
};

// One solve of one puzzle. "day" is the local date of the solve, for example "2026-10-24".
// "mistakes" is the score to keep low: the mistakes in Guzzle, the misses in Latics, the hints in Colour Binary
// and the wrong checks in Numpuz.
// Solves from before this field do not have it.
export type SolveResult = {
  readonly puzzleId: string;
  readonly type: string;
  readonly difficulty: Difficulty;
  readonly seconds: number;
  readonly day: string;
  readonly mistakes?: number;
};

export type SavedData = {
  // The theme that the player selected. "system" follows the setting of the device.
  readonly theme: Theme;
  // True after the player selected OK on the analytics notice. Then the notice does not show again.
  readonly cookieBanner: boolean;
  // The IDs of the puzzles that the player solved. "Random puzzle" skips them.
  readonly solved: readonly string[];
  // Each solve, the oldest first. The stats on the home page come from this list.
  readonly results: readonly SolveResult[];
  // The puzzle that the player opened last. The home page links to it when it is not solved.
  readonly lastOpened: PuzzleRef | null;
  // The puzzle types that the player opened. "More rules" is open only on the first visit to a puzzle type.
  readonly seenRules: readonly string[];
};

export const defaultSavedData: SavedData = {
  theme: "system",
  cookieBanner: false,
  solved: [],
  results: [],
  lastOpened: null,
  seenRules: [],
};

// The list of results keeps at most this number of solves. Then the oldest solves go first.
// The stored list is compressed: 2000 solves take about 12,000 characters. See "storage-format.ts".
export const maxResults = 2000;

type Fields = Partial<Record<string, unknown>>;

export const isRecord = (value: unknown): value is Fields =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDayKey = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value);

function isPuzzleRef(value: unknown): value is PuzzleRef {
  if (!isRecord(value)) return false;
  const { puzzleId, type, difficulty } = value;
  return (
    typeof puzzleId === "string" &&
    typeof type === "string" &&
    levels.includes(difficulty as Difficulty)
  );
}

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

// A solve without "mistakes" is correct too, because older solves do not have it.
function isSolveResult(value: unknown): value is SolveResult {
  if (!isPuzzleRef(value)) return false;
  const { seconds, day, mistakes } = value as Fields;
  return (
    typeof seconds === "number" &&
    Number.isFinite(seconds) &&
    seconds >= 0 &&
    isDayKey(day) &&
    (mistakes === undefined || isCount(mistakes))
  );
}

const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

// Each field has a reader. A reader gives the value when it is correct, and undefined when it is not.
// Then the field gets its default value, thus a broken or an old value in the storage does not break the app.
// The list of results keeps each correct solve and drops each broken one.
// To add a field, add it to "SavedData", "defaultSavedData" and "readers".
const readers: { [Name in keyof SavedData]: (value: unknown) => SavedData[Name] | undefined } = {
  theme: (value) => (isTheme(value) ? value : undefined),
  cookieBanner: (value) => (typeof value === "boolean" ? value : undefined),
  solved: (value) => (isTextList(value) ? value : undefined),
  results: (value) =>
    Array.isArray(value)
      ? value.filter((item) => isSolveResult(item)).slice(-maxResults)
      : undefined,
  lastOpened: (value) => (isPuzzleRef(value) || value === null ? value : undefined),
  seenRules: (value) => (isTextList(value) ? value : undefined),
};

// This makes correct saved data from a value, for example from parsed JSON.
// A value that is not an object gives the default data. It never throws.
export function readSavedData(value: unknown): SavedData {
  const fields = isRecord(value) ? value : {};
  const read = <Name extends keyof SavedData>(name: Name): SavedData[Name] =>
    readers[name](fields[name]) ?? defaultSavedData[name];
  return {
    theme: read("theme"),
    cookieBanner: read("cookieBanner"),
    solved: read("solved"),
    results: read("results"),
    lastOpened: read("lastOpened"),
    seenRules: read("seenRules"),
  };
}

// One solve has one key. Two solves with the same key are the same solve.
const keyOf = ({ puzzleId, day, seconds }: SolveResult) => `${puzzleId}|${day}|${seconds}`;

// This adds the solves of an imported file to the current data. A solve that is already in the data
// is not added again. The theme, the OK on the analytics notice, the last opened puzzle and the seen rules
// stay as they are.
// "added" is the number of new solves.
export function mergeProgress(
  current: SavedData,
  imported: SavedData,
): { data: SavedData; added: number } {
  const known = new Set(current.results.map((result) => keyOf(result)));
  const added = imported.results.filter((result) => {
    const key = keyOf(result);
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
  // The solves stay in date order, thus the oldest solves go first when the list is full.
  const results = [...current.results, ...added]
    .toSorted((first, second) => first.day.localeCompare(second.day))
    .slice(-maxResults);
  const solved = [...new Set([...current.solved, ...imported.solved])];
  const lastOpened = current.lastOpened ?? imported.lastOpened;
  return { data: { ...current, solved, results, lastOpened }, added: added.length };
}

// This keeps only the saved fields of an object, for example of the store state with its actions.
export function pickSavedData(state: SavedData): SavedData {
  const { theme, cookieBanner, solved, results, lastOpened, seenRules } = state;
  return { theme, cookieBanner, solved, results, lastOpened, seenRules };
}
