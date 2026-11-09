import { symbols } from "../symbols";

// The text of the puzzle page that is the same for each puzzle type.
// The text of each puzzle type is in its own file in this folder.
export const puzzlePage = {
  title: "{{typeName}} {{id}} | {{siteName}}",
  detailsLabel: "Puzzle details",
  // The details under the title have no labels. The words "#" and "by" are enough.
  puzzleNumber: "#{{number}}",
  author: "by {{author}}",
  // The label above the title of the panel.
  nowPlaying: "Now playing",
  // The time since the start of the puzzle. A screen reader reads the label before the time.
  timerLabel: "Time",
  // The link that closes the puzzle. It shows only the symbol "✕".
  close: "Close the puzzle and go to today's puzzles",
  // The result card that shows after a solve: the time, the score, the time against the average,
  // the share text and the link to the next level of today.
  result: {
    title: "Solved",
    puzzle: "{{typeName}}, {{level}}, #{{number}}",
    numbersLabel: "Your result",
    time: "time",
    // The time against the average of the other solves of this level.
    faster: "faster than average",
    slower: "slower than average",
    same: "same as average",
    first: "First",
    firstLabel: "{{level}} solve",
    shareHeading: "Share text",
    copy: "Copy result",
    // On a phone, the button opens the share menu of the phone.
    share: "Share result",
    next: `Next: {{level}} ${symbols.puzzlePage.next}`,
    nextLabel: "Next puzzle: {{typeName}} {{level}}",
  },
  // The rules beside the board: three short rules, a key, and the other rules under "More rules".
  rulesHeading: "How to play",
  keyLabel: "Key",
  loading: "The puzzle is loading...",
  loadingBoard: "The board is loading...",
  boardError: "An error stopped the board. Reload the page to try again.",
  // The bar above the rules. "Restart" asks one time before it deletes the moves.
  restart: "Restart",
  restartQuestion: "Restart the puzzle?",
  // Each answer shows a short text. The label tells a screen reader what the answer does.
  restartYes: { text: "Yes", label: "Yes, restart the puzzle" },
  restartNo: { text: "No", label: "No, keep playing" },
  random: "Random puzzle",
};
