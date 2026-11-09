// The text of the Numpuz puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";
import { symbols } from "../symbols";

// The operator symbols come from "src/text/symbols.ts", so the text and the board show the same symbols.
const { "+": add, "-": subtract, "×": multiply, "÷": divide } = symbols.numpuz.operators;

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
    label: "More rules: blanks and checking",
    rules: [
      "Each blank takes one operator.",
      "Select a blank. Then choose an operator to put in it.",
      "Fill every blank. Then select Check.",
      // The board counts the mistakes for the score. See "machine.ts".
      "A check with a wrong answer is one mistake. Change an operator before you check again.",
      // The keys that the board reads are in "src/app/puzzle-types/numpuz/keys.ts".
      `With a keyboard: type +, -, * or / on a blank. * gives ${multiply} and / gives ${divide}.`,
    ] satisfies Rule[],
  },
  // The score of a solve: the number of mistakes. The home page and the result card show it.
  score_one: "{{count}} mistake",
  score_other: "{{count}} mistakes",
  scoreWord_one: "mistake",
  scoreWord_other: "mistakes",
  boardLabel: "Numpuz board",
  target: "Target: {{target}}",
  operatorNames: { "+": "plus", "-": "minus", "×": "times", "÷": "divided by" },
  // The label of a blank, for example "Blank 2, plus". "empty" is a blank without an operator.
  blank: "Blank {{position}}, {{operator}}",
  empty: "empty",
  keysLabel: "Operators",
  key: "Put {{name}} in the selected blank",
  checkButton: "Check",
  status: {
    start: "Select a blank. Then type an operator or select an operator.",
    incomplete: "Fill every blank before you check.",
    wrong:
      "Not yet. The equation is not equal to the target. Change an operator and check again. Mistakes: {{count}}.",
    // "mistakes" is the score, for example "2 mistakes".
    solved: "You solved the puzzle with {{mistakes}}. The equation is equal to the target.",
  },
};
