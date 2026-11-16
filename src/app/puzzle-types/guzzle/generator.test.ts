import { describe, expect, it } from "vitest";
import { levels } from "../../../shared/difficulty";
import { baseOf } from "../../../test/puzzle-base";
import { firstDay } from "../../daily";
import { makePuzzle } from "../registry";
import { bank, dailyWords, gaps, generate, type Entry } from "./generator";
import { findPuzzleProblems, sizes, wordsOf } from "./puzzle";

// The words of the bank with the length of a level.
function wordsOfLevel(level: (typeof levels)[number]): Entry[] {
  return bank.filter(({ word }) => word.length === sizes[level]);
}

// The middle letter of each word. The four words of a puzzle cross at it.
function middles(words: readonly string[]): string[] {
  return words.map((word) => word[(word.length - 1) / 2] ?? "");
}

// "true" when a clue is not a short text, or has its word in it.
function hasBrokenClue({ word, clue }: Entry): boolean {
  return (
    clue.trim() !== clue || clue.length < 4 || clue.length > 60 || clue.toUpperCase().includes(word)
  );
}

// The words that come back before the end of the gap, in the days of a schedule.
function earlyWords(days: readonly (readonly Entry[])[], gap: number): string[] {
  const lastUse = new Map<string, number>();
  return days.flatMap((entries, day) =>
    entries.flatMap(({ word }) => {
      const isEarly = day - (lastUse.get(word) ?? -Infinity) < gap;
      lastUse.set(word, day);
      return isEarly ? [`${word} on day ${day}`] : [];
    }),
  );
}

// "true" when the words are four different words that cross at the same middle letter.
function crossAtMiddle(words: readonly string[]): boolean {
  return new Set(words).size === 4 && new Set(middles(words)).size === 1;
}

// The words of fixed days. See the last test.
const fixedWords = [
  ["easy", 1050, { across: "SUM", down: "FUR", diagonalDown: "RUB", diagonalUp: "YUM" }],
  ["easy", 1200, { across: "BOA", down: "KOI", diagonalDown: "WOO", diagonalUp: "FOE" }],
  ["medium", 1050, { across: "COAST", down: "GLAZE", diagonalDown: "ALARM", diagonalUp: "SHAME" }],
  ["medium", 1200, { across: "MILES", down: "RALLY", diagonalDown: "ALLOY", diagonalUp: "SILKY" }],
  [
    "hard",
    1050,
    { across: "GOGGLES", down: "DRAGGED", diagonalDown: "JUGGLER", diagonalUp: "IMAGINE" },
  ],
  [
    "hard",
    1200,
    { across: "RIVALRY", down: "TOTALLY", diagonalDown: "THEATRE", diagonalUp: "DYNAMIC" },
  ],
  ["easy", 123456, { across: "ARC", down: "URN", diagonalDown: "ORE", diagonalUp: "CRY" }],
] as const;

describe("guzzle word bank", () => {
  it("has only words of 3, 5 or 7 capital letters, each one time", () => {
    const words = bank.map(({ word }) => word);
    expect(words.filter((word) => !/^([A-Z]{3}|[A-Z]{5}|[A-Z]{7})$/u.test(word))).toEqual([]);
    expect(words.filter((word, index) => words.indexOf(word) !== index)).toEqual([]);
  });

  it("has a short clue for each word, and no clue has its word", () => {
    expect(bank.filter((entry) => hasBrokenClue(entry))).toEqual([]);
  });

  // See "gaps" in "generator.ts": a gap of G days needs 4 × (G − 1) + 79 words.
  it.each(levels)("has enough %s words for the gap of the level", (level) => {
    expect(wordsOfLevel(level).length).toBeGreaterThanOrEqual(4 * (gaps[level] - 1) + 79);
  });

  it("has the gaps that the author set: the longest possible easy gap, 270 days and 360 days", () => {
    expect(gaps.easy).toBe(Math.floor((wordsOfLevel("easy").length - 79) / 4) + 1);
    expect(gaps.easy).toBeGreaterThanOrEqual(90);
    expect(gaps).toMatchObject({ medium: 270, hard: 360 });
  });
});

describe("guzzle daily schedule", () => {
  it.each(levels)("uses no %s word again inside the gap, in 3 years", (level) => {
    const days = dailyWords(level, firstDay + 1095);
    expect(earlyWords(days, gaps[level])).toEqual([]);
    expect(days.filter((entries) => !crossAtMiddle(entries.map(({ word }) => word)))).toEqual([]);
  });
});

describe("guzzle generator puzzles", () => {
  it("makes a puzzle that passes the data check, with the fields of its ID", () => {
    for (const level of levels) {
      // A day before the schedule, days of the schedule, and the number of a random puzzle.
      for (const number of [7, firstDay, firstDay + 30, 123_456]) {
        const base = baseOf("guzzle", level, number);
        const puzzle = generate(base, number);
        expect(puzzle).toMatchObject({ ...base, type: "guzzle" });
        expect(findPuzzleProblems(puzzle)).toEqual([]);
        expect(crossAtMiddle(Object.values(wordsOf(puzzle.answer)))).toBe(true);
      }
    }
  });

  it("gives each word the clue of the bank", () => {
    const puzzle = generate(baseOf("guzzle", "medium", firstDay), firstDay);
    for (const [line, word] of Object.entries(wordsOf(puzzle.answer))) {
      expect(puzzle.clues[line as keyof typeof puzzle.clues]).toBe(
        bank.find((entry) => entry.word === word)?.clue,
      );
    }
  });

  it("makes the same puzzle again for the same ID", () => {
    for (const number of [7, firstDay + 3, 123_456]) {
      const base = baseOf("guzzle", "hard", number);
      expect(generate(base, number)).toEqual(generate(base, number));
    }
  });

  // The words of a day must not change, because each player of that day gets the same puzzle.
  // A new line at the end of the bank, a deleted line or a different order of the lines changes these words.
  // A change to the text of a clue does not change them.
  it.each(fixedWords)("makes the fixed words of %s-%i", async (level, number, words) => {
    expect(wordsOf((await makePuzzle("guzzle", level, number)).answer)).toEqual(words);
  });
});
