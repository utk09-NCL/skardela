import type { Square } from "./puzzle";

// The colour keys of the Colour Binary board. The arrow keys are in "src/shared/grid.ts".

// The colour keys: R makes a square red, B makes it blue and Space makes it empty.
// The letter keys work with and without Shift.
const colourKeys: Partial<Record<string, Square>> = { r: "R", b: "B", " ": "." };

export function colourOfKey(key: string): Square | undefined {
  return colourKeys[key.toLowerCase()];
}
