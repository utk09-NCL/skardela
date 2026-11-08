import LZString from "lz-string";
import { isRecord, readSavedData, type SavedData } from "./saved-data";

// The text forms of the saved data: the stored text in localStorage, and the export file.
// The lists of solved puzzles and of solves can be long, thus both forms compress them with lz-string.
// The compression is synchronous, thus the app reads the data before the first render and nothing flickers.

// This parses a JSON text. Text that is not JSON gives undefined. It never throws.
function parseJson(text: string | null): unknown {
  try {
    return JSON.parse(text ?? "null");
  } catch {
    return undefined;
  }
}

// A decompression of broken text can throw or give null. Both give undefined.
function decompress(text: string, read: (packed: string) => string | null): unknown {
  try {
    return parseJson(read(text));
  } catch {
    return undefined;
  }
}

// ---------- The stored text ----------

// The stored text is one flat JSON object. The theme, the OK and the last opened puzzle are plain text,
// because the script in "index.html" reads the theme before the page shows, and it cannot decompress.
// "progress" holds the solved puzzles and the solves, compressed for localStorage (lz-string UTF-16).
// "v" is the version of this format. Version 1 had the lists as plain JSON. This file still reads them.
const storedVersion = 2;

// The last compressed lists. The store gives new arrays only when the lists change,
// thus a change of the theme, for example, does not compress the lists again.
let packed: { solved: SavedData["solved"]; results: SavedData["results"]; text: string } | null =
  null;

function packProgress({ solved, results }: SavedData): string {
  if (packed?.solved !== solved || packed.results !== results) {
    packed = {
      solved,
      results,
      text: LZString.compressToUTF16(JSON.stringify({ solved, results })),
    };
  }
  return packed.text;
}

// The fields of a stored object, with the compressed lists made plain again.
function unpackFields(value: unknown): unknown {
  if (!isRecord(value) || typeof value.progress !== "string") return value;
  const progress = decompress(value.progress, (text) => LZString.decompressFromUTF16(text));
  return isRecord(progress)
    ? { ...value, solved: progress.solved, results: progress.results }
    : value;
}

// "seenRules" is a short list of puzzle types, thus it is plain text and not in "progress".
export function toStoredText(data: SavedData): string {
  const { theme, cookieBanner, lastOpened, seenRules } = data;
  return JSON.stringify({
    v: storedVersion,
    theme,
    cookieBanner,
    lastOpened,
    seenRules,
    progress: packProgress(data),
  });
}

// This reads a stored text. Broken text, or text with broken fields, gives the default value of each field.
export function parseStoredText(text: string | null): SavedData {
  return readSavedData(unpackFields(parseJson(text)));
}

// A stored text from a newer version of the app, for example from a different tab after a new release.
// This version cannot read all of it, thus it must not write over it. See "store.ts".
export function isNewerText(text: string | null): boolean {
  const value = parseJson(text);
  return isRecord(value) && typeof value.v === "number" && value.v > storedVersion;
}

// ---------- The export file ----------

// The export file is a JSON file with a format name, so the import can see that the file is from Skardela.
// "data" is all saved data, compressed as base64 text, which is safe in each file and each email.
export const exportFormat = "skardela-data";
const exportVersion = 2;

export function toExportText(data: SavedData, exportedAt: Date): string {
  const file = {
    format: exportFormat,
    version: exportVersion,
    exportedAt: exportedAt.toISOString(),
    data: LZString.compressToBase64(JSON.stringify(data)),
  };
  return JSON.stringify(file, null, 2);
}

// This reads an import file. It also reads a copy of the stored text, with or without compression.
// A file that is not from Skardela gives null.
export function parseImportText(text: string): SavedData | null {
  const value = parseJson(text);
  if (!isRecord(value)) return null;
  if (value.format === exportFormat) {
    if (typeof value.data !== "string") return null;
    const data = decompress(value.data, (packedText) => LZString.decompressFromBase64(packedText));
    return isRecord(data) ? readSavedData(unpackFields(data)) : null;
  }
  const isStoredCopy = "progress" in value || "results" in value || "solved" in value;
  return isStoredCopy ? readSavedData(unpackFields(value)) : null;
}
