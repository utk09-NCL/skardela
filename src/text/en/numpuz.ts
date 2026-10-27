// The text of the Numpuz puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";

// "mistake", "mistakes". The mistakes are the score of Numpuz.
const mistakeWord = (count: number) => (count === 1 ? "mistake" : "mistakes");

// "1 mistake", "2 mistakes".
const mistakeCount = (count: number) => `${count} ${mistakeWord(count)}`;
export const numpuz = {
  name: "Numpuz",
  summary: "Fill each blank with + \u2212 \u00D7 or \u00F7 to reach the target number.",
  tagline: "Fill in the operators",
  // The three short rules show at all times.
  rules: [
    "Fill each blank between the numbers with + \u2212 \u00D7 or \u00F7.",
    "The equation must be equal to the target number.",
    "\u00D7 and \u00F7 are worked out before + and \u2212.",
  ] satisfies Rule[],
  // Numpuz has no square colours, so the rules key is empty.
  rulesKey: [] satisfies KeyItem[],
  // The other rules are under "More rules".
  moreRules: {
    label: "More rules: blanks and checking",
    rules: [
      "Each blank takes one operator.",
      "Select a blank. Then choose an operator to put in it.",
      "Fill every blank. Then select Check.",
    ] satisfies Rule[],
  },
  // The score of a solve: the number of mistakes. The home page and the result card show it.
  score: mistakeCount,
  scoreWord: mistakeWord,
  boardLabel: "Numpuz board",
  target: (target: number) => `Target: ${target}`,
  operatorSymbols: { "+": "+", "-": "\u2212", "\u00D7": "\u00D7", "\u00F7": "\u00F7" },
  operatorNames: { "+": "plus", "-": "minus", "\u00D7": "times", "\u00F7": "divided by" },
  blank: (blank: { position: number; operator: string }) =>
    `Blank ${blank.position}, ${blank.operator === "" ? "empty" : blank.operator}`,
  key: (name: string) => `Put ${name} in the selected blank`,
  checkButton: "Check",
  status: {
    start: "Select a blank. Then choose an operator.",
    incomplete: "Fill every blank before you check.",
    wrong: "Not yet. The equation is not equal to the target. Try again.",
    solved: "You solved the puzzle. The equation is equal to the target.",
  },
};
