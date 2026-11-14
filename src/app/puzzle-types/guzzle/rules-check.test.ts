import { describe, expect, it } from "vitest";
import example from "./examples/guzzle-0000.json";
import {
  findPuzzleProblems,
  lineOf,
  lineStartingAt,
  toSquares,
  wordsOf,
  type GuzzlePuzzle,
} from "./puzzle";
import {
  bankLetters,
  checkLetter,
  isAnswerFound,
  keyHints,
  nextSquareInWord,
  type Guess,
  type Guesses,
  type Move,
} from "./rules-check";

// The example board from rules.md: CAT across, BAG down, RAN and MAP on the diagonals.
const answer = toSquares(example.answer);

describe("guzzle puzzle", () => {
  it("reads the four words of the example", () => {
    expect(wordsOf(example.answer)).toEqual({
      across: "CAT",
      down: "BAG",
      diagonalDown: "RAN",
      diagonalUp: "MAP",
    });
  });

  it("finds the word through each square", () => {
    expect(lineOf(0, 3)).toBe("diagonalDown");
    expect(lineOf(1, 3)).toBe("down");
    expect(lineOf(3, 3)).toBe("across");
    expect(lineOf(4, 3)).toBeUndefined();
    expect(lineOf(6, 3)).toBe("diagonalUp");
    expect(lineOf(1, 5)).toBeUndefined();
  });

  it("finds the word that starts at a square", () => {
    expect(lineStartingAt(0, 3)).toBe("diagonalDown");
    expect(lineStartingAt(1, 3)).toBe("down");
    expect(lineStartingAt(3, 3)).toBe("across");
    expect(lineStartingAt(6, 3)).toBe("diagonalUp");
    expect(lineStartingAt(8, 3)).toBeUndefined();
  });

  it("finds broken puzzle data", () => {
    // A 3 by 3 board is too small for the medium level.
    expect(findPuzzleProblems({ ...(example as GuzzlePuzzle), difficulty: "medium" })).toEqual([
      '"answer" must have 5 rows of 5 squares for the level "medium".',
    ]);
    // The medium example is PLANT across, BEACH down, GRAPE and SNAKE on the diagonals.
    const medium = { ...(example as GuzzlePuzzle), difficulty: "medium" as const };
    const rows = ["G.B.E", ".REK.", "PLANT", ".NCP.", "S.H.E"];
    expect(findPuzzleProblems({ ...medium, answer: rows })).toEqual([]);
    expect(findPuzzleProblems({ ...medium, answer: rows.with(0, "GQB.E") })).toEqual([
      'Row 1, column 2 is not on a word. It must be ".".',
    ]);
    expect(findPuzzleProblems({ ...medium, answer: rows.with(0, "..B.E") })).toEqual([
      "Row 1, column 1 must have a letter from A to Z.",
    ]);
  });
});

describe("guzzle clue check", () => {
  it("finds a missing clue and a clue that shows its word", () => {
    const easy = example as GuzzlePuzzle;
    expect(findPuzzleProblems({ ...easy, clues: { ...easy.clues, down: " " } })).toEqual([
      '"clues.down" must not be empty.',
    ]);
    expect(findPuzzleProblems({ ...easy, clues: { ...easy.clues, across: "A cat" } })).toEqual([
      '"clues.across" must not have the word "CAT".',
    ]);
  });
});

// This helper joins the letters of the bank keys, so a test can compare one string.
function letters(keys: readonly { letter: string }[]): string {
  return keys.map((key) => key.letter).join("");
}

describe("guzzle rules check", () => {
  it("marks a letter green, yellow or red", () => {
    expect(checkLetter(answer, 0, "T")).toBe("absent");
    expect(checkLetter(answer, 0, "N")).toBe("present");
    expect(checkLetter(answer, 8, "N")).toBe("correct");
    expect(checkLetter(answer, 1, "A")).toBe("present");
  });

  it("removes green letters from the bank", () => {
    const guesses = Array.from<Guess | undefined>({ length: answer.length });
    expect(letters(bankLetters(answer, guesses))).toBe("BCGMNPRT");
    guesses[8] = { letter: "N", mark: "correct" };
    guesses[0] = { letter: "T", mark: "absent" };
    expect(letters(bankLetters(answer, guesses))).toBe("BCGMPRT");
  });

  it("counts a letter that more than one square needs", () => {
    // In this medium board, three squares need E: one in BEACH, one in GRAPE and one in SNAKE.
    const medium = toSquares(["G.B.E", ".REK.", "PLANT", ".NCP.", "S.H.E"]);
    const none = Array.from<Guess | undefined>({ length: medium.length });
    expect(bankLetters(medium, none).find((key) => key.letter === "E")).toEqual({
      letter: "E",
      count: 3,
    });
  });

  it("is solved only when all playable squares are green", () => {
    const guesses = answer.map((letter): Guess => ({ letter, mark: "correct" }));
    expect(isAnswerFound(answer, guesses)).toBe(true);
    expect(isAnswerFound(answer, guesses.with(0, { letter: "N", mark: "present" }))).toBe(false);
  });
});

// This helper makes one move: a letter in a square, with the colour that the rules give.
function move(index: number, letter: string): Move {
  return { index, guess: { letter, mark: checkLetter(answer, index, letter) } };
}

describe("guzzle key hints", () => {
  it("marks a red letter as wrong for each square of the word", () => {
    // T is red in the top-left square. The diagonal RAN does not have T.
    const hints = keyHints(answer, [move(0, "T")], 8);
    expect(hints.get("T")).toBe("wrong");
  });

  it("marks a yellow letter as wrong here and in the word for the other squares", () => {
    // N is yellow in the top-left square, because RAN has N in the bottom-right square.
    const moves = [move(0, "N")];
    expect(keyHints(answer, moves, 0).get("N")).toBe("wrong");
    expect(keyHints(answer, moves, 8).get("N")).toBe("inWord");
  });

  it("gives no hint for a letter of a different word", () => {
    // The top-middle square is on the word BAG. A red T on the diagonal RAN tells nothing about BAG.
    expect(keyHints(answer, [move(0, "T")], 1).size).toBe(0);
  });

  it("gives no inWord hint when the center letter can be the cause of the yellow", () => {
    // A is yellow in the top-left square, but the A in RAN is the center letter.
    expect(keyHints(answer, [move(0, "A")], 8).has("A")).toBe(false);
  });
});

// A 5 by 5 board. Across: 10 to 14. Down: 2, 7, 12, 17, 22. Diagonal from the top left: 0, 6, 12, 18, 24.
// Diagonal from the bottom left: 20, 16, 12, 8, 4. Square 12 is the fixed center.
function greenAt(...indexes: number[]): Guesses {
  const guesses = Array.from<Guess | undefined>({ length: 25 });
  for (const index of indexes) guesses[index] = { letter: "A", mark: "correct" };
  return guesses;
}

describe("guzzle cursor after a correct letter", () => {
  it.each([
    ["the diagonal from the top left", 0, 6],
    ["the diagonal from the top left, over the fixed center", 6, 18],
    ["the diagonal from the bottom left, up to the right", 20, 16],
    ["the diagonal from the bottom left, over the fixed center", 16, 8],
    ["the across word", 10, 11],
    ["the across word, over the fixed center", 11, 13],
    ["the down word", 2, 7],
    ["the down word, over the fixed center", 7, 17],
  ])("follows %s", (_, from, next) => {
    expect(nextSquareInWord(greenAt(from), from, 5)).toBe(next);
  });

  it("skips the green squares of the word", () => {
    expect(nextSquareInWord(greenAt(0, 6), 0, 5)).toBe(18);
  });

  it("goes back to an open square before the square in the same word", () => {
    expect(nextSquareInWord(greenAt(6, 18, 24), 24, 5)).toBe(0);
  });

  it("goes to the next word in the order of the clues when the word is all green", () => {
    expect(nextSquareInWord(greenAt(10, 11, 13, 14), 14, 5)).toBe(2);
    expect(nextSquareInWord(greenAt(20, 16, 8, 4), 4, 5)).toBe(10);
  });

  it("gives null when all squares are green", () => {
    const all = [0, 2, 4, 6, 7, 8, 10, 11, 13, 14, 16, 17, 18, 20, 22, 24];
    expect(nextSquareInWord(greenAt(...all), 24, 5)).toBeNull();
  });
});
