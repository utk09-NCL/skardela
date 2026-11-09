// The text of the Tilt puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";
import { samples } from "../samples";

export const tilt = {
  name: "Tilt",
  summary: "Tilt the board to roll each ball into the hole of its colour.",
  // The three short rules show at all times. The rules key shows the icon of each colour.
  // The other rules are under "More rules".
  rules: [
    "Tilt the board up, down, left or right. All balls roll until something stops them.",
    "A coloured ball that rolls over the hole of its colour falls in and stays there.",
    "Get all coloured balls into their holes with the fewest tilts.",
  ] satisfies Rule[],
  rulesKey: [
    { text: "red ball and hole", sample: samples.tilt.red },
    { text: "blue ball and hole", sample: samples.tilt.blue },
    { text: "yellow ball and hole", sample: samples.tilt.yellow },
    { text: "ball in its hole", sample: samples.tilt.full },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: walls, holes, the grey ball and the controls",
    rules: [
      "A ball stops at a wall, at the edge of the board, at another ball or at a full hole.",
      "A ball in its hole does not move again. A full hole stops the other balls, as a wall does.",
      "A ball rolls over an empty hole of a different colour. It can also stop on it. Then it stops the other balls.",
      "When two balls are in one line, the front ball moves first. The ball behind it stops next to it.",
      "Hard: the grey ball has no hole. It only stops the other balls. You need it to solve the puzzle.",
      "A tilt that moves no ball does not count.",
      "Your score is the extra tilts: your tilts minus the fewest tilts. 0 is a perfect solve.",
      "Keyboard: the arrow keys tilt the board. Mouse and touch: use the arrow buttons, or swipe on the board.",
      "There is no undo. Restart puts the balls back at the start.",
    ] satisfies Rule[],
  },
  // The score of a solve: the number of extra tilts. The home page and the result card show it.
  score_one: "{{count}} extra tilt",
  score_other: "{{count}} extra tilts",
  scoreWord_one: "extra tilt",
  scoreWord_other: "extra tilts",
  colours: { red: "red", blue: "blue", yellow: "yellow", grey: "grey" },
  directions: { up: "up", down: "down", left: "left", right: "right" },
  // The name of the board, for example "Tilt board, 6 by 6".
  boardLabel: "Tilt board, {{size}} by {{size}}",
  boardHelp: "Use the arrow keys to tilt the board.",
  // The key hint above the board, with a mouse. It tells the player to give the focus to the board.
  // "idle": the board and the arrow buttons do not have the focus. "active": one of them has the focus.
  keyHint: {
    idle: "Click the board to use the arrow keys.",
    active: "The arrow keys tilt the board.",
  },
  // The name of a square, for example "Row 2, column 3, red ball". "content" is one of "squares" below.
  square: "Row {{row}}, column {{column}}, {{content}}",
  squares: {
    empty: "empty",
    wall: "wall",
    ball: "{{colour}} ball",
    hole: "{{colour}} hole",
    inHole: "{{colour}} ball in its hole",
    // A ball that stopped on an empty hole of a different colour, for example "blue ball on the red hole".
    onHole: "{{ball}} ball on the {{hole}} hole",
  },
  // The tilts and the fewest tilts, for example "Tilts: 7. Fewest: 5."
  counts: "Tilts: {{tilts}}. Fewest: {{fewest}}.",
  fewestUnknown: "unknown",
  controlsLabel: "Tilt the board",
  tiltButton: "Tilt {{direction}}",
  status: {
    start: "Tilt the board with the arrow keys, the arrow buttons or a swipe.",
    // The text after a tilt, for example "Tilt left. The red ball rolls 3 squares. Tilts: 4."
    tilt: "Tilt {{direction}}.",
    rolls_one: "The {{colour}} ball rolls {{count}} square.",
    rolls_other: "The {{colour}} ball rolls {{count}} squares.",
    fallsIn: "The {{colour}} ball falls into its hole.",
    tilts: "Tilts: {{count}}.",
    noMove: "No ball can move {{direction}}.",
    perfect: "You solved the puzzle with 0 extra tilts. This is a perfect solve.",
    // "extra" is the score, for example "2 extra tilts".
    solved: "You solved the puzzle with {{extra}}.",
  },
};
