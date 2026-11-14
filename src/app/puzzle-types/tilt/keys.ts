import type { Direction } from "./rules-check";

// The keys and the swipes of the Tilt board. They are pure functions, thus they are easy to test.
// See "## Controls" in "rules.md".

// The tilt of each arrow key.
const arrowKeys: ReadonlyMap<string, Direction> = new Map([
  ["ArrowUp", "up"],
  ["ArrowDown", "down"],
  ["ArrowLeft", "left"],
  ["ArrowRight", "right"],
]);

// The tilt of a key. A key that is not an arrow key gives undefined.
export function directionOfKey(key: string): Direction | undefined {
  return arrowKeys.get(key);
}

// "A swipe shorter than 20 px does nothing."
export const shortestSwipe = 20;

// The tilt of a swipe on the board, from the start to the end of the swipe.
// "across" is the change to the right and "upDown" is the change down, in px. A change to the left or up is negative.
// The tilt is in the main direction of the swipe: the longer of the across part and the up-down part.
// A swipe shorter than "shortestSwipe" gives undefined.
export function swipeDirection(across: number, upDown: number): Direction | undefined {
  // rules.md: "The length of a swipe is the straight distance from its start to its end."
  if (Math.hypot(across, upDown) < shortestSwipe) return undefined;
  // rules.md: "A swipe with an across part and an up-down part of the same length has no main direction.
  // It does nothing."
  if (Math.abs(across) === Math.abs(upDown)) return undefined;
  if (Math.abs(across) > Math.abs(upDown)) return across > 0 ? "right" : "left";
  return upDown > 0 ? "down" : "up";
}
