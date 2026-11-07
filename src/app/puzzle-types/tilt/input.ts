import { useRef, type KeyboardEvent, type TouchEvent } from "react";
import { directionOfKey, swipeDirection } from "./keys";
import type { Direction } from "./rules-check";

// The keyboard and the swipe of the Tilt board. See "## Controls" in "rules.md".
// The pure parts are in "keys.ts". This file connects them to the React events.

// An arrow key tilts the board. The board and each arrow button use it.
// A key with Ctrl, Meta or Alt is a shortcut of the browser, thus it does not tilt.
// The key does not scroll the page, because the arrow key is for the board.
export function tiltOnArrowKey(event: KeyboardEvent, tilt: (direction: Direction) => void) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const direction = directionOfKey(event.key);
  if (direction === undefined) return;
  event.preventDefault();
  tilt(direction);
}

// A swipe on the board tilts it in the main direction of the swipe. The hook keeps the start of the swipe.
// A touch with more than one finger is not a swipe.
export function useSwipe(tilt: (direction: Direction) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (event: TouchEvent) => {
      const touch = event.touches.length === 1 ? event.touches[0] : undefined;
      start.current = touch === undefined ? null : { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (event: TouchEvent) => {
      const from = start.current;
      const touch = event.changedTouches[0];
      start.current = null;
      if (from === null || touch === undefined) return;
      const direction = swipeDirection(touch.clientX - from.x, touch.clientY - from.y);
      if (direction !== undefined) tilt(direction);
    },
    onTouchCancel: () => {
      start.current = null;
    },
  };
}
