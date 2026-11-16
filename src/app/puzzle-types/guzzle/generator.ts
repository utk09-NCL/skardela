// The generator of Guzzle puzzles. It selects four words of the bank with the same middle letter.
// A schedule keeps each word out of the daily puzzles for the gap of its level. See "## Puzzles" in "rules.md".
// It is pure: no React, no DOM and no side effects. The worker runs it. See "src/app/generator.ts".
import { decipherText } from "../../../shared/cipher";
import type { Difficulty } from "../../../shared/difficulty";
import { puzzleIdOf, type PuzzleBase } from "../../../shared/puzzle";
import { makeRandom, pickOne, seedOf } from "../../../shared/random";
import { firstDay, isScheduled } from "../../daily";
import { lineIndexes, lineNames, sizes, type GuzzlePuzzle } from "./puzzle";
// The Vite plugin in "vite.config.ts" compresses and ciphers the file. The import gives the ciphered text.
import bankCode from "./words.txt";

// One word of the bank, with its clue.
export type Entry = { readonly word: string; readonly clue: string };

// Each line of the bank has a word in capital letters, a space, then the clue.
export const bank: readonly Entry[] = decipherText(bankCode)
  .split("\n")
  .filter((line) => line !== "")
  .map((line) => {
    const space = line.indexOf(" ");
    return { word: line.slice(0, space), clue: line.slice(space + 1) };
  });

// A word of a daily puzzle comes back only after this number of days.
// For a gap of G days, the last G − 1 days use at most 4 × (G − 1) words. When 79 or more words are free,
// one of the 26 middle letters has 4 free words (3 × 26 + 1). Thus the bank needs 4 × (G − 1) + 79 words
// of each length. The easy gap is the largest gap that the 3-letter words of the bank permit.
export const gaps: Readonly<Record<Difficulty, number>> = { easy: 92, medium: 270, hard: 360 };

function middleOf({ word }: Entry): string {
  return word[(word.length - 1) / 2] ?? "";
}

// The items in a random order.
function shuffled<Item>(items: readonly Item[], random: () => number): Item[] {
  const result = [...items];
  for (let last = result.length - 1; last > 0; last -= 1) {
    const other = Math.floor(random() * (last + 1));
    [result[last], result[other]] = [result[other] as Item, result[last] as Item];
  }
  return result;
}

// Four random words of "free" with the same middle letter, in a random order.
// The first selection is one word of all the words whose middle letter has 4 words or more.
// Thus a middle letter with more words comes more frequently.
function fourWords(free: readonly Entry[], random: () => number): Entry[] {
  const groups = new Map<string, Entry[]>();
  for (const entry of free) {
    const group = groups.get(middleOf(entry));
    if (group === undefined) groups.set(middleOf(entry), [entry]);
    else group.push(entry);
  }
  const first = pickOne(
    free.filter((entry) => (groups.get(middleOf(entry))?.length ?? 0) >= 4),
    random,
  );
  if (first === undefined)
    throw new Error("The word bank has no 4 free words with one middle letter.");
  return shuffled(groups.get(middleOf(first)) ?? [], random).slice(0, 4);
}

// The random source of one level and one number.
function randomFor(level: Difficulty, number: number): () => number {
  return makeRandom(seedOf(puzzleIdOf("guzzle", level, number)));
}

// The four words of each day from "firstDay" to "lastDay", for one level.
// Each day selects from the free words: the words that the last days of the gap did not use.
// Each browser runs the same schedule from "firstDay", thus each browser gets the same words.
// A change to the list of words changes the words of each day: a new line, a deleted line or a different order
// of the lines. See "## Puzzles" in "rules.md".
export function dailyWords(level: Difficulty, lastDay: number): Entry[][] {
  const words = bank.filter(({ word }) => word.length === sizes[level]);
  // The last day that used each word.
  const lastUse = new Map<Entry, number>();
  const days: Entry[][] = [];
  for (let day = firstDay; day <= lastDay; day += 1) {
    const free = words.filter((entry) => day - (lastUse.get(entry) ?? -Infinity) >= gaps[level]);
    const selected = fourWords(free, randomFor(level, day));
    for (const entry of selected) lastUse.set(entry, day);
    days.push(selected);
  }
  return days;
}

// The four words of one level and one number. A daily puzzle from "firstDay" gets the words of its day
// in the schedule. Each other number selects from all words of the level, with no gap.
function wordsFor(level: Difficulty, number: number): Entry[] {
  const scheduled = isScheduled(number) ? dailyWords(level, number).at(-1) : undefined;
  if (scheduled !== undefined) return scheduled;
  const words = bank.filter(({ word }) => word.length === sizes[level]);
  return fourWords(words, randomFor(level, number));
}

// The puzzle of an ID: four words that cross at their middle letter, one for each line, with their clues.
export function generate(base: PuzzleBase, number: number): GuzzlePuzzle {
  const size = sizes[base.difficulty];
  const words = wordsFor(base.difficulty, number);
  const squares = Array.from({ length: size * size }, () => ".");
  for (const [position, line] of lineNames.entries()) {
    for (const [step, index] of lineIndexes(line, size).entries()) {
      squares[index] = words[position]?.word[step] ?? ".";
    }
  }
  const [across, down, diagonalDown, diagonalUp] = words.map(({ clue }) => clue);
  if (
    across === undefined ||
    down === undefined ||
    diagonalDown === undefined ||
    diagonalUp === undefined
  ) {
    throw new Error("A Guzzle puzzle needs four words.");
  }
  return {
    ...base,
    type: "guzzle",
    answer: Array.from({ length: size }, (_, row) =>
      squares.slice(row * size, row * size + size).join(""),
    ),
    clues: { across, down, diagonalDown, diagonalUp },
  };
}
