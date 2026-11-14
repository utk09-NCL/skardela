// The text of the Numpuz puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";
import { symbols } from "../symbols";

// The operator symbols come from "src/text/symbols.ts", so the text and the board show the same symbols.
const { "+": add, "-": subtract, "\u00D7": multiply, "\u00F7": divide } = symbols.numpuz.operators;

// "mistake", "mistakes". The mistakes are the score of Numpuz.
const mistakeWord = (count: number) => (count === 1 ? "mistake" : "mistakes");

// "1 mistake", "2 mistakes".
const mistakeCount = (count: number) => `${count} ${mistakeWord(count)}`;
export const numpuz = {
  name: "Numpuz",
  summary: `Fill each blank with ${add} ${subtract} ${multiply} or ${divide} to reach the target number.`,
  // The three short rules show at all times.
  rules: [
    `Fill each blank between the numbers with ${add} ${subtract} ${multiply} or ${divide}.`,
    "The equation must be equal to the target number.",
    `${multiply} and ${divide} are worked out before ${add} and ${subtract}.`,
  ] satisfies Rule[],
  // Numpuz has no square colours, so the rules key is empty.
  rulesKey: [] satisfies KeyItem[],
  // The other rules are under "More rules".
  moreRules: {
    label: "More rules: the order, fractions and checks",
    rules: [
      "Operators of the same kind go from left to right.",
      "A division can give a fraction. Only the result of the full equation must be equal to the target.",
      "Fill every blank. Then select Check. Change an operator before you check again.",
    ] satisfies Rule[],
    controls: [
      "Select a blank. Then select an operator to put in it.",
      `Keyboard: type +, -, * or / on a blank. * gives ${multiply} and / gives ${divide}.`,
    ] satisfies Rule[],
    scoreRule: "Score: each check with a wrong answer. 0 is a perfect solve.",
  },
  // The score of a solve: the number of mistakes. The home page and the result card show it.
  score: mistakeCount,
  scoreWord: mistakeWord,
  boardLabel: "Numpuz board",
  target: (target: number) => `Target: ${target}`,
  // The board shows these symbols for the operators and for an empty blank.
  symbols: symbols.numpuz,
  operatorNames: { "+": "plus", "-": "minus", "\u00D7": "times", "\u00F7": "divided by" },
  blank: (blank: { position: number; operator: string }) =>
    `Blank ${blank.position}, ${blank.operator === "" ? "empty" : blank.operator}`,
  keysLabel: "Operators",
  key: (name: string) => `Put ${name} in the selected blank`,
  checkButton: "Check",
  status: {
    start: "Select a blank. Then type an operator or select an operator.",
    incomplete: "Fill every blank before you check.",
    wrong: (count: number) =>
      `Not yet. The equation is not equal to the target. Change an operator and check again. Mistakes: ${count}.`,
    solved: (count: number) =>
      `You solved the puzzle with ${mistakeCount(count)}. The equation is equal to the target.`,
  },
};
