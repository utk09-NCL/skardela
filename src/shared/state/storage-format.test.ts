import LZString from "lz-string";
import { afterEach, describe, expect, it, vi } from "vitest";
import indexHtml from "../../../index.html?raw";
import { defaultSavedData, savedDataKey, type SavedData } from "./saved-data";
import {
  isNewerText,
  parseImportText,
  parseStoredText,
  toExportText,
  toStoredText,
} from "./storage-format";

const data: SavedData = {
  theme: "dark",
  cookieBanner: true,
  solved: ["guzzle-0001"],
  results: [
    { puzzleId: "guzzle-0001", type: "guzzle", difficulty: "easy", seconds: 42, day: "2026-10-24" },
    {
      puzzleId: "latics-0002",
      type: "latics",
      difficulty: "easy",
      seconds: 30,
      day: "2026-10-24",
      mistakes: 2,
    },
  ],
  lastOpened: { puzzleId: "latics-0003", type: "latics", difficulty: "hard" },
  seenRules: ["guzzle"],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("stored text", () => {
  it("keeps the theme plain, compresses the lists, and reads them again", () => {
    const text = toStoredText(data);
    const fields: unknown = JSON.parse(text);
    expect(fields).toMatchObject({ v: 2, theme: "dark", cookieBanner: true });
    expect(fields).not.toHaveProperty("results");
    expect(parseStoredText(text)).toEqual(data);
  });

  it("reads the plain lists of version 1", () => {
    expect(parseStoredText(JSON.stringify(data))).toEqual(data);
  });

  it.each([null, "", "{", "[]", JSON.stringify({ theme: "dark", progress: "broken" })])(
    "gives correct data for the broken text %j",
    (text) => {
      expect(parseStoredText(text)).toMatchObject({ solved: [], results: [] });
    },
  );

  it("compresses the lists again only when they change", () => {
    const compress = vi.spyOn(LZString, "compressToUTF16");
    const first = { ...data, results: [...data.results] };
    toStoredText(first);
    toStoredText({ ...first, theme: "light" });
    expect(compress).toHaveBeenCalledTimes(1);
    toStoredText({ ...first, results: [] });
    expect(compress).toHaveBeenCalledTimes(2);
  });

  it("finds a stored text of a newer version", () => {
    expect(isNewerText(JSON.stringify({ v: 3, progress: "" }))).toBe(true);
    expect(isNewerText(toStoredText(data))).toBe(false);
  });

  it.each([null, "", "{", "[]", '{"v":"3"}', JSON.stringify({ solved: [] })])(
    "does not find a newer version in the text %j",
    (text) => {
      expect(isNewerText(text)).toBe(false);
    },
  );
});

describe("export file", () => {
  it("has the format name and the compressed data, and an import reads it again", () => {
    const text = toExportText(data, new Date("2026-10-24T10:00:00Z"));
    expect(JSON.parse(text)).toMatchObject({
      format: "skardela-data",
      version: 2,
      exportedAt: "2026-10-24T10:00:00.000Z",
    });
    expect(parseImportText(text)).toEqual(data);
  });

  it("reads a copy of the stored text, compressed or plain", () => {
    expect(parseImportText(toStoredText(data))).toEqual(data);
    expect(parseImportText(JSON.stringify(data))).toEqual(data);
  });

  it.each([
    "not JSON",
    "[]",
    JSON.stringify({ name: "a different app" }),
    JSON.stringify({ format: "skardela-data", data: 42 }),
    JSON.stringify({ format: "skardela-data", data: "broken" }),
  ])("gives null for a file that is not a Skardela data file: %j", (text) => {
    expect(parseImportText(text)).toBeNull();
  });
});

// The script in index.html runs before the app. It sets the saved theme, so the page does not flash.
describe("the theme script in index.html", () => {
  const source = /<script>([\s\S]*?)<\/script>/u.exec(indexHtml)?.[1] ?? "";
  // The test runs the script from index.html as the browser does.
  const runScript = new Function(source) as () => void;

  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it("sets the theme of the stored text", () => {
    localStorage.setItem(savedDataKey, toStoredText(data));
    runScript();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("sets no theme when nothing is saved", () => {
    expect(runScript).not.toThrow();
    expect(Object.hasOwn(document.documentElement.dataset, "theme")).toBe(false);
  });

  it.each([toStoredText(defaultSavedData), "{", "[]", '{"theme":"purple"}'])(
    "sets no theme for the saved value %j",
    (json) => {
      localStorage.setItem(savedDataKey, json);
      expect(runScript).not.toThrow();
      expect(Object.hasOwn(document.documentElement.dataset, "theme")).toBe(false);
    },
  );
});
