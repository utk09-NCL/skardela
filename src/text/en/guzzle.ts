import type { KeyItem, Rule } from "../../shared/RuleList";
import { samples } from "../samples";
import { symbols } from "../symbols";

// The text of the Guzzle puzzle type.
export const guzzle = {
  name: "Guzzle",
  summary: "Find four words that cross at the center letter. Make the fewest mistakes.",
  // The three short rules show at all times. The rules key tells the meaning of each square colour.
  // The other rules are under "More rules". It is open only on the first visit.
  rules: [
    "Four words of the same length cross at the center letter.",
    "An arrow shows where each word starts. Select a square to see the clue of its word.",
    "Make all squares green with the fewest mistakes.",
  ] satisfies Rule[],
  rulesKey: [
    { text: "correct", sample: samples.guzzle.correct },
    { text: "in this word, in a different square", sample: samples.guzzle.present },
    { text: "not in this word", sample: samples.guzzle.absent },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: modes, keys, mistakes",
    rules: [
      `The words go across, down and on the two diagonals. An arrow (${Object.values(symbols.guzzle.arrows).join(" ")}) shows the direction to read the word.`,
      "Before you start, select a mode. The timer starts when you select it.",
      "With bank: the letter keys show only the letters that the words still need. A number on a key shows how many squares need that letter, when more than one square needs it.",
      "Without bank: the letter keys show all letters from A to Z. Use the clues to find the words.",
      "Put a letter in a square. After a green letter, the cursor goes to the next square of the same word.",
      `The letter keys show what you know about the selected square. ${symbols.guzzle.absent}: the letter is not in this square. ${symbols.guzzle.present}: the word has the letter.`,
      "A wrong letter adds a mistake. A letter that you already know is wrong does not add a mistake.",
    ] satisfies Rule[],
  },
  // The score of a solve: the number of mistakes. The home page, the board and the result card show it.
  score_one: "{{count}} mistake",
  score_other: "{{count}} mistakes",
  scoreWord_one: "mistake",
  scoreWord_other: "mistakes",
  boardLabel: "Guzzle board",
  modeLabel: "How do you want to play?",
  modes: { bank: "With bank", noBank: "Without bank" },
  bankLabel: "Letter bank",
  keysLabel: "Letters",
  // The parts of the label of a letter key. The count is only in the bank. The hint comes from the earlier moves.
  // The code puts the parts together with ". " between them.
  key: {
    put: "Put {{letter}} in the selected square",
    left: "{{count}} left",
    wrong: "Not in this square",
    inWord: "In this word",
  },
  marks: {
    correct: "green, correct",
    present: "yellow, in a different square",
    absent: "red, not in this word",
  },
  lines: {
    across: "across word",
    down: "down word",
    diagonalDown: "diagonal from the top left",
    diagonalUp: "diagonal from the bottom left",
  },
  // The parts of the label of a square, for example "Row 1, column 1, A, green, correct, start of the across word".
  // The code puts the parts together with ", " between them.
  square: {
    position: "Row {{row}}, column {{column}}",
    empty: "empty",
    fixed: "fixed",
    // The name of the word that starts at a square, for example "start of the across word".
    start: "start of the {{line}}",
  },
  cluesLabel: "Clues",
  // The name of each word in the list of clues.
  clueLines: {
    across: "Across",
    down: "Down",
    diagonalDown: "Diagonal from the top left",
    diagonalUp: "Diagonal from the bottom left",
  },
  // The position of the selected square in its word, for example "letter 2 of 5".
  position: "letter {{position}} of {{length}}",
  status: {
    choose: "Select a mode to start.",
    start: "Select a square. Then type a letter or select a letter.",
    correct: "{{letter}} is correct.",
    present: "The {{line}} has {{letter}} in a different square.",
    absent: "The {{line}} does not have {{letter}}.",
    // "mistakes" is the score, for example "2 mistakes".
    solved: "You solved the puzzle. {{mode}}, {{mistakes}}.",
  },
};
