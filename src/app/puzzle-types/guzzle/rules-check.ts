import { lineIndexes, lineNames, lineOf } from "./puzzle";

// "correct" is green, "present" is yellow and "absent" is red.
export type Mark = "correct" | "present" | "absent";

export type Guess = { readonly letter: string; readonly mark: Mark };

// The guess in each square. A square without a guess is "undefined".
export type Guesses = readonly (Guess | undefined)[];

// A square is playable when it is on a word and it is not the center square.
export function isPlayable(index: number, size: number): boolean {
  return lineOf(index, size) !== undefined;
}

// This check gives the colour for a letter in a square.
// Green: the letter is correct.
// Yellow: the word through the square has the letter in a different square.
// Red: the word through the square does not have the letter.
export function checkLetter(answer: readonly string[], index: number, letter: string): Mark {
  if (answer[index] === letter) return "correct";
  const size = Math.sqrt(answer.length);
  const line = lineOf(index, size);
  if (line === undefined) return "absent";
  const isPresent = lineIndexes(line, size).some(
    (other) => other !== index && answer[other] === letter,
  );
  return isPresent ? "present" : "absent";
}

// A letter key. "count" is how many squares still need the letter. A key without a bank has no count.
export type LetterKey = { readonly letter: string; readonly count?: number };

// The bank has one key for each letter that a square that is not green still needs.
// The keys are in alphabetical order, so the bank does not show the answer.
export function bankLetters(answer: readonly string[], guesses: Guesses): LetterKey[] {
  const size = Math.sqrt(answer.length);
  const counts = new Map<string, number>();
  for (const [index, letter] of answer.entries()) {
    if (isPlayable(index, size) && guesses[index]?.mark !== "correct") {
      counts.set(letter, (counts.get(letter) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([letter, count]) => ({ letter, count }))
    .toSorted((first, second) => first.letter.localeCompare(second.letter));
}

// The puzzle is solved when all playable squares are green.
export function isAnswerFound(answer: readonly string[], guesses: Guesses): boolean {
  const size = Math.sqrt(answer.length);
  return answer.every((_, index) => !isPlayable(index, size) || guesses[index]?.mark === "correct");
}

// This helper finds the next playable square that is not green.
// It starts after the given square and goes back to the start of the board at the end.
export function nextOpenSquare(guesses: Guesses, from: number, size: number): number | null {
  const total = size * size;
  for (let step = 1; step <= total; step += 1) {
    const index = (from + step) % total;
    if (isPlayable(index, size) && guesses[index]?.mark !== "correct") return index;
  }
  return null;
}

// The square after a correct letter. The cursor follows the word of the square, in its reading direction:
// right on the across word, down on the down word, down to the right on the diagonal from the top left,
// and up to the right on the diagonal from the bottom left. The fixed center square and green squares are skipped.
// After the end of the word, it goes back to an open square before "from" in the same word.
// When the word is all green, it goes to the first open square of the next word, in the order of the clues.
// "null": no square is open.
export function nextSquareInWord(guesses: Guesses, from: number, size: number): number | null {
  const line = lineOf(from, size);
  if (line === undefined) return nextOpenSquare(guesses, from, size);
  const isOpenSquare = (index: number) =>
    isPlayable(index, size) && guesses[index]?.mark !== "correct";
  const word = lineIndexes(line, size);
  const at = word.indexOf(from);
  const inWord = [...word.slice(at + 1), ...word.slice(0, at)].find((index) => isOpenSquare(index));
  if (inWord !== undefined) return inWord;
  const lineAt = lineNames.indexOf(line);
  const nextLines = [...lineNames.slice(lineAt + 1), ...lineNames.slice(0, lineAt)];
  for (const next of nextLines) {
    const open = lineIndexes(next, size).find((index) => isOpenSquare(index));
    if (open !== undefined) return open;
  }
  return null;
}

// One move of the player: a letter in a square and its colour.
export type Move = { readonly index: number; readonly guess: Guess };

// What the player knows about a letter for the selected square. The letter keys show it.
// "wrong": the letter is not in this square. The word does not have the letter (red),
// or the player already put the letter in this square and it was not green.
// "inWord": the letter is yellow in a different square of the word. Thus the word has the letter,
// and it can be in this square.
export type KeyHint = "wrong" | "inWord";

// This function finds the key hints for a square from the earlier moves.
// It uses only the center letter of the answer. The player can see the center letter.
export function keyHints(
  answer: readonly string[],
  moves: readonly Move[],
  index: number,
): Map<string, KeyHint> {
  const size = Math.sqrt(answer.length);
  const line = lineOf(index, size);
  const hints = new Map<string, KeyHint>();
  if (line === undefined) return hints;
  const word = lineIndexes(line, size);
  const wordMoves = moves.filter((move) => word.includes(move.index));

  for (const { index: square, guess } of wordMoves) {
    if (guess.mark === "absent" || (square === index && guess.mark !== "correct")) {
      hints.set(guess.letter, "wrong");
    }
  }

  // A green letter or the center letter can be the cause of a yellow letter.
  // Then the word maybe has no more of that letter, thus the key gets no "inWord" hint.
  const found = new Set([
    answer[(answer.length - 1) / 2],
    ...wordMoves.filter((move) => move.guess.mark === "correct").map((move) => move.guess.letter),
  ]);
  for (const { index: square, guess } of wordMoves) {
    const isNew = !hints.has(guess.letter) && !found.has(guess.letter);
    if (guess.mark === "present" && square !== index && isNew) hints.set(guess.letter, "inWord");
  }

  return hints;
}
