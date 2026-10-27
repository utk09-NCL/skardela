import type { Operator } from "./rules-check";

// The keys of the Numpuz board. They are pure functions, thus they are easy to test.

// The operator for each key. Most keyboards have no × key and no ÷ key,
// thus "*" and "x" give ×, and "/" gives ÷. The letter key works with and without Shift.
const operatorKeys: Partial<Record<string, Operator>> = {
  "+": "+",
  "-": "-",
  "*": "×",
  x: "×",
  "×": "×",
  "/": "÷",
  "÷": "÷",
};

// The operator of a key. A key that is not an operator key gives undefined.
export function operatorOfKey(key: string): Operator | undefined {
  return operatorKeys[key.toLowerCase()];
}
