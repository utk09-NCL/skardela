import type { KeyItem, RulePart } from "../shared/RuleList";
import { symbols } from "./symbols";

type Sample = KeyItem["sample"];

// The sample squares of the rules keys, and the marks in colour in the rules.
// The text of each language uses them, thus each language shows the same samples.
export const samples = {
  "colour-binary": {
    red: { fill: "red", symbol: symbols["colour-binary"].R },
    blue: { fill: "blue", symbol: symbols["colour-binary"].B },
    empty: { fill: "empty", symbol: "" },
  },
  guzzle: {
    correct: { fill: "green", symbol: symbols.guzzle.correct },
    present: { fill: "yellow", symbol: symbols.guzzle.present },
    absent: { fill: "red", symbol: symbols.guzzle.absent },
  },
  latics: {
    water: { fill: "water", symbol: "" },
    prism: { fill: "empty", symbol: symbols.latics.prism },
    filter: { fill: "red", symbol: symbols.latics.colours.red },
  },
  tilt: {
    red: { fill: "red", symbol: symbols.tilt.colours.red },
    blue: { fill: "blue", symbol: symbols.tilt.colours.blue },
    yellow: { fill: "yellow", symbol: symbols.tilt.colours.yellow },
    full: { fill: "empty", symbol: symbols.tilt.full },
  },
} as const satisfies Record<string, Record<string, Sample>>;

// The red circle and the blue square in the rules of Latics show in their colours. See "RuleList".
export const marks = {
  red: { symbol: symbols.latics.colours.red, colour: "red" },
  blue: { symbol: symbols.latics.colours.blue, colour: "blue" },
} as const satisfies Record<string, RulePart>;
