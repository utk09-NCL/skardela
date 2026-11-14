import type { KeyItem, Rule } from "../../shared/RuleList";
import { symbols } from "../symbols";

// "mistake", "mistakes". The mistakes are the score of Guzzle.
const mistakeWord = (count: number) => (count === 1 ? "mistake" : "mistakes");

// "1 mistake", "2 mistakes". More than one text in this file uses it.
const mistakeCount = (count: number) => `${count} ${mistakeWord(count)}`;

// The text of the Guzzle puzzle type.
export const guzzle = {
  name: "Guzzle",
  summary: "Find four words that cross at the centre letter. Make the fewest mistakes.",
  // The three short rules show at all times. The rules key tells the meaning of each square colour.
  // The other rules are under "More rules". It is open only on the first visit.
  rules: [
    "Four words of the same length cross at the centre letter.",
    "An arrow shows where each word starts. Select a square to see the clue of its word.",
    "Make all squares green with the fewest mistakes.",
  ] satisfies Rule[],
  rulesKey: [
    { text: "correct", sample: { fill: "green", symbol: symbols.guzzle.correct } },
    {
      text: "in this word, in a different square",
      sample: { fill: "yellow", symbol: symbols.guzzle.present },
    },
    { text: "not in this word", sample: { fill: "red", symbol: symbols.guzzle.absent } },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: modes, letter keys and mistakes",
    rules: [
      `The words go across, down and on the two diagonals. An arrow (${Object.values(symbols.guzzle.arrows).join(" ")}) shows the direction to read the word.`,
      "Before you start, select a mode. The timer starts then. With bank: the letter keys show only the letters that the words still need. A number on a key shows how many squares need that letter. Without bank: the letter keys show A to Z.",
      "After a green letter, the cursor goes to the next square of the same word.",
      `The letter keys show what you know about the selected square. ${symbols.guzzle.absent}: the letter is not in this square. ${symbols.guzzle.present}: the word has the letter.`,
    ] satisfies Rule[],
    controls: [
      "Mouse and touch: select a square, then select a letter key.",
      "Keyboard: the arrow keys move between the squares. Type a letter to put it in the square with the focus.",
    ] satisfies Rule[],
    scoreRule:
      "Score: each wrong letter. A letter that you already know is wrong does not count. 0 is a perfect solve.",
  },
  // The score of a solve: the number of mistakes. The home page and the result card show it.
  score: mistakeCount,
  scoreWord: mistakeWord,
  boardLabel: "Guzzle board",
  modeLabel: "How do you want to play?",
  modes: { bank: "With bank", noBank: "Without bank" },
  bankLabel: "Letter bank",
  keysLabel: "Letters",
  // The label of a letter key. The count is only in the bank. The hint comes from the earlier moves.
  key: (letter: string, count?: number, hint?: "wrong" | "inWord") =>
    [
      `Put ${letter} in the selected square`,
      count === undefined ? "" : `${count} left`,
      hint === undefined ? "" : { wrong: "Not in this square", inWord: "In this word" }[hint],
    ]
      .filter((part) => part !== "")
      .join(". "),
  marks: {
    correct: "green, correct",
    present: "yellow, in a different square",
    absent: "red, not in this word",
  },
  symbols: symbols.guzzle,
  lines: {
    across: "across word",
    down: "down word",
    diagonalDown: "diagonal from the top left",
    diagonalUp: "diagonal from the bottom left",
  },
  // The name of the word that starts at a square, for example "start of the across word".
  start: (line: string) => `start of the ${line}`,
  square: (square: {
    row: number;
    column: number;
    letter: string;
    mark: string;
    isFixed: boolean;
    start: string;
  }) =>
    [
      `Row ${square.row}, column ${square.column}`,
      square.letter === "" ? "empty" : square.letter,
      square.mark,
      square.isFixed ? "fixed" : "",
      square.start,
    ]
      .filter((part) => part !== "")
      .join(", "),
  cluesLabel: "Clues",
  // The name of each word in the list of clues.
  clueLines: {
    across: "Across",
    down: "Down",
    diagonalDown: "Diagonal from the top left",
    diagonalUp: "Diagonal from the bottom left",
  },
  // The position of the selected square in its word, for example "letter 2 of 5".
  position: (position: number, length: number) => `letter ${position} of ${length}`,
  mistakes: mistakeCount,
  status: {
    choose: "Select a mode to start.",
    start: "Select a square. Then type a letter or select a letter.",
    correct: (letter: string) => `${letter} is correct.`,
    present: (letter: string, line: string) => `The ${line} has ${letter} in a different square.`,
    absent: (letter: string, line: string) => `The ${line} does not have ${letter}.`,
    solved: (mode: string, mistakes: number) =>
      `You solved the puzzle. ${mode}, ${mistakeCount(mistakes)}.`,
  },
};
