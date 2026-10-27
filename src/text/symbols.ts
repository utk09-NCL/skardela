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
    monster: "👾",
    // The monster shows this symbol too when the beam hits it.
    hit: "💥",
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
    // The four operators a blank can take.
    add: "+",
    subtract: "−",
    multiply: "×",
    divide: "÷",
    // A blank that has no operator yet.
    empty: "",
  },
} as const;
