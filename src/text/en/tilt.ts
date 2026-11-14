// The text of the Tilt puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";
import { symbols } from "../symbols";

// The icons come from "src/text/symbols.ts", so the text and the board show the same icons.
const { red, blue, yellow } = symbols.tilt.colours;

// "extra tilt", "extra tilts". The extra tilts are the score of Tilt.
const extraWord = (count: number) => (count === 1 ? "extra tilt" : "extra tilts");

// "1 extra tilt", "2 extra tilts".
const extraCount = (count: number) => `${count} ${extraWord(count)}`;

// "1 square", "3 squares".
const squareCount = (count: number) => `${count} ${count === 1 ? "square" : "squares"}`;

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
    { text: "red ball and hole", sample: { fill: "red", symbol: red } },
    { text: "blue ball and hole", sample: { fill: "blue", symbol: blue } },
    { text: "yellow ball and hole", sample: { fill: "yellow", symbol: yellow } },
    { text: "ball in its hole", sample: { fill: "empty", symbol: symbols.tilt.full } },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: walls, holes and the grey ball",
    rules: [
      "A ball stops at a wall, at the edge of the board, at another ball or at a full hole.",
      "A ball in its hole does not move again. A full hole stops the other balls, as a wall does.",
      "A ball rolls over an empty hole of a different colour. It can also stop on it. Then it stops the other balls.",
      "When two balls are in one line, the front ball moves first. The ball behind it stops next to it.",
      "Hard: the grey ball has no hole. It only stops the other balls. You need it to solve the puzzle.",
    ] satisfies Rule[],
    controls: [
      "Keyboard: the arrow keys tilt the board. Mouse and touch: use the arrow buttons, or swipe on the board.",
      "There is no undo. Restart puts the balls back at the start.",
    ] satisfies Rule[],
    scoreRule:
      "Score: your tilts minus the fewest tilts. A tilt that moves no ball does not count. 0 is a perfect solve.",
  },
  // The score of a solve: the number of extra tilts. The home page and the result card show it.
  score: extraCount,
  scoreWord: extraWord,
  // The board shows these icons on the balls and the holes, and these arrows on the buttons.
  symbols: symbols.tilt,
  colours: { red: "red", blue: "blue", yellow: "yellow", grey: "grey" },
  directions: { up: "up", down: "down", left: "left", right: "right" },
  // The name of the board, for example "Tilt board, 6 by 6".
  boardLabel: (size: number) => `Tilt board, ${size} by ${size}`,
  boardHelp: "Use the arrow keys to tilt the board.",
  // The key hint above the board, with a mouse. It tells the player to give the focus to the board.
  // "idle": the board and the arrow buttons do not have the focus. "active": one of them has the focus.
  keyHint: {
    idle: "Click the board to use the arrow keys.",
    active: "The arrow keys tilt the board.",
  },
  // The name of a square, for example "Row 2, column 3, red ball". "content" is one of "squares" below.
  square: (row: number, column: number, content: string) =>
    `Row ${row}, column ${column}, ${content}`,
  squares: {
    empty: "empty",
    wall: "wall",
    ball: (colour: string) => `${colour} ball`,
    hole: (colour: string) => `${colour} hole`,
    inHole: (colour: string) => `${colour} ball in its hole`,
    // A ball that stopped on an empty hole of a different colour, for example "blue ball on the red hole".
    onHole: (ball: string, hole: string) => `${ball} ball on the ${hole} hole`,
  },
  // The tilts and the fewest tilts, for example "Tilts: 7. Fewest: 5."
  counts: (tilts: number, fewest: number | null) =>
    `Tilts: ${tilts}. Fewest: ${fewest === null ? "unknown" : fewest}.`,
  controlsLabel: "Tilt the board",
  tiltButton: (direction: string) => `Tilt ${direction}`,
  status: {
    start: "Tilt the board with the arrow keys, the arrow buttons or a swipe.",
    // The text after a tilt, for example "Tilt left. The red ball rolls 3 squares. Tilts: 4."
    tilt: (direction: string) => `Tilt ${direction}.`,
    rolls: (colour: string, squares: number) => `The ${colour} ball rolls ${squareCount(squares)}.`,
    fallsIn: (colour: string) => `The ${colour} ball falls into its hole.`,
    tilts: (count: number) => `Tilts: ${count}.`,
    noMove: (direction: string) => `No ball can move ${direction}.`,
    solved: (extra: number) =>
      extra === 0
        ? "You solved the puzzle with 0 extra tilts. This is a perfect solve."
        : `You solved the puzzle with ${extraCount(extra)}.`,
  },
};
