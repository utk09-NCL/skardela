import type { KeyItem, Rule } from "../../shared/RuleList";
import { samples } from "../samples";

const sample = samples["colour-binary"];

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
    { text: "tap one time: red", sample: sample.red },
    { text: "two times: blue", sample: sample.blue },
    { text: "three times: empty", sample: sample.empty },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: given squares, keys, hints",
    rules: [
      "A square with a white dot is given. You cannot change it.",
      "With a keyboard: the arrow keys move between the squares. R makes a square red, B makes it blue and Space makes it empty.",
      "Undo removes your last change.",
      "Hint shows one square that the rules decide, and the reason. Each hint counts in your result.",
    ] satisfies Rule[],
  },
  // The name of the board grid, for example "Colour Binary, 6 by 6".
  boardLabel: "Colour Binary, {{size}} by {{size}}",
  // An empty square is "." in the puzzle data. A "." cannot be a key, thus its key is "empty".
  colours: { R: "red", B: "blue", empty: "empty" },
  // The label of a square, for example "Row 1, column 4: red" or "Row 1, column 1: red, given".
  square: "Row {{row}}, column {{column}}: {{colour}}",
  squareGiven: "Row {{row}}, column {{column}}: {{colour}}, given",
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
  // The name of a line in a message, for example "Row 3".
  lines: { row: "Row {{number}}", column: "Column {{number}}" },
  // The message after a change that breaks a rule, for example "Row 3 has three blue squares next to each other."
  broken: {
    three: "{{line}} has three {{colour}} squares next to each other.",
    half: "{{line}} has more than {{half}} {{colour}} squares.",
  },
  undoButton: "Undo",
  hintButton: "Hint",
  // The hint and its reason, for example "Row 1, column 2: Row 1 already has half of its squares blue.
  // Thus this square is red."
  hint: {
    half: "Row {{row}}, column {{column}}: {{line}} already has half of its squares {{otherColour}}. Thus this square is {{colour}}.",
    three:
      "Row {{row}}, column {{column}}: {{otherColour}} here makes three {{otherColour}} squares next to each other in {{line}}. Thus this square is {{colour}}.",
  },
  noHint: "No hints available",
  // The score of a solve: the number of hints. The home page and the result card show it.
  score_one: "{{count}} hint",
  score_other: "{{count}} hints",
  scoreWord_one: "hint",
  scoreWord_other: "hints",
};
