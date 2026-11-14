import type { KeyItem, Rule } from "../../shared/RuleList";
import { symbols } from "../symbols";

// "hint", "hints". The hints are the score of Colour Binary.
const hintWord = (count: number) => (count === 1 ? "hint" : "hints");

// "Row 3", "Column 2".
const lineName = (line: "row" | "column", number: number) =>
  `${line === "row" ? "Row" : "Column"} ${number}`;

// The text of the Colour Binary puzzle type.
export const colourBinary = {
  name: "Colour Binary",
  summary: "Make each square red or blue. Each line has half of each colour.",
  // The three short rules show at all times. The rules key tells what each tap does.
  // The other rules are under "More rules". It is open only on the first visit.
  rules: [
    "Make each square red or blue.",
    "Each row and each column has the same number of red squares and blue squares.",
    "Three squares of the same colour must not be next to each other in a row or a column.",
  ] satisfies Rule[],
  rulesKey: [
    { text: "tap one time: red", sample: { fill: "red", symbol: symbols["colour-binary"].R } },
    { text: "two times: blue", sample: { fill: "blue", symbol: symbols["colour-binary"].B } },
    { text: "three times: empty", sample: { fill: "empty", symbol: "" } },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: given squares, hints and keys",
    rules: [
      "Each puzzle has exactly one answer. You can find each square by reason, so you never need to guess.",
      "A square with a white dot is given. You cannot change it.",
      "Undo removes your last change.",
      "Hint shows one square that the rules decide, and the reason. While a hint shows, Hint does nothing.",
    ] satisfies Rule[],
    controls: [
      "Mouse and touch: tap a square to change its colour.",
      "Keyboard: the arrow keys move between the squares. R makes a square red, B makes it blue and Space makes it empty.",
    ] satisfies Rule[],
    scoreRule: "Score: each hint that shows a square. 0 is a perfect solve.",
  },
  // The name of the board grid, for example "Colour Binary, 6 by 6".
  boardLabel: (size: number) => `Colour Binary, ${size} by ${size}`,
  colours: { R: "red", B: "blue", ".": "empty" },
  symbols: symbols["colour-binary"],
  // The label of a square, for example "Row 1, column 4: red" or "Row 1, column 1: red, given".
  square: (square: { row: number; column: number; colour: string; isGiven: boolean }) =>
    `Row ${square.row}, column ${square.column}: ${square.colour}${square.isGiven ? ", given" : ""}`,
  // The key under the board. A given square and a square of the player have the same colour.
  // Only the given square has a dot.
  legend: {
    label: "Square key",
    given: "given",
    yours: "yours",
  },
  status: {
    start: "Tap a square to make it red. Tap again for blue, and again to make it empty.",
    solved: "You solved the puzzle. Each row and each column obeys the rules.",
  },
  // The message after a change that breaks a rule, for example "Row 3 has three blue squares next to each other."
  broken: (broken: {
    line: "row" | "column";
    number: number;
    colour: string;
    reason: "half" | "three";
    half: number;
  }) =>
    broken.reason === "three"
      ? `${lineName(broken.line, broken.number)} has three ${broken.colour} squares next to each other.`
      : `${lineName(broken.line, broken.number)} has more than ${broken.half} ${broken.colour} squares.`,
  undoButton: "Undo",
  hintButton: "Hint",
  hint: (hint: {
    row: number;
    column: number;
    colour: string;
    otherColour: string;
    reason: "half" | "three";
    line: "row" | "column";
    number: number;
  }) => {
    const line = lineName(hint.line, hint.number);
    const why =
      hint.reason === "half"
        ? `${line} already has half of its squares ${hint.otherColour}.`
        : `${hint.otherColour} here makes three ${hint.otherColour} squares next to each other in ${line}.`;
    return `Row ${hint.row}, column ${hint.column}: ${why} Thus this square is ${hint.colour}.`;
  },
  noHint: "No hints available",
  // The score of a solve: the number of hints. The home page and the result card show it.
  score: (count: number) => `${count} ${hintWord(count)}`,
  scoreWord: hintWord,
};
