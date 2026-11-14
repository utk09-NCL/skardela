// All symbols of the app are in this file. Change a symbol here to change it everywhere.
// A symbol on a square has the text colour of the square, so it shows clearly on each square colour.
// A symbol shows a colour as a shape too, so colour is not the only signal for the player.
export const symbols = {
  "colour-binary": {
    // A circle and a square have different shapes.
    R: "●",
    B: "■",
    ".": "",
  },
  guzzle: {
    correct: "✓",
    present: "↔",
    absent: "✗",
    // An arrow on the first square of a word shows the direction to read the word.
    arrows: { across: "→", down: "↓", diagonalDown: "↘", diagonalUp: "↗" },
  },
  latics: {
    // A hit monster is green and shows this symbol too, so the colour is not the only signal.
    hit: "✓",
    // The symbol of a prism in the rules key. The board draws the prism as a triangle.
    prism: "▲",
    // A red filter, a red monster and a red laser show a circle. Blue ones show a square, as in Colour Binary.
    colours: { red: "●", blue: "■" },
  },
  // A solved level on the home page.
  progress: {
    solved: "✓",
  },
  // One square for each level in a share text: solved with no mistakes, solved with mistakes, and not solved.
  share: {
    clean: "🟩",
    mistakes: "🟨",
    unsolved: "⬜",
  },
  // The link that closes a puzzle and goes back to the home page, and the link to the next level.
  puzzlePage: {
    close: "✕",
    next: "→",
  },
  theme: {
    system: "💻",
    light: "☀️",
    dark: "🌙",
  },
  numpuz: {
    // The four operators that a blank can take. Each key is the operator in the puzzle data.
    operators: { "+": "+", "-": "−", "×": "×", "÷": "÷" },
    // A blank that has no operator yet.
    empty: "?",
  },
  tilt: {
    // The icon of each ball colour. A ball and its hole show the same icon, so colour is not the only signal.
    // The grey ball has no icon.
    colours: { red: "▲", blue: "■", yellow: "★", grey: "" },
    // A hole with its ball shows a full circle with this mark.
    full: "✓",
    // The four arrow buttons that tilt the board.
    arrows: { up: "↑", down: "↓", left: "←", right: "→" },
    // The key hint above the board starts with this mark.
    keyboard: "⌨️",
  },
} as const;
