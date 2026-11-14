import { useEffect, useRef } from "react";

// A board moves the keyboard focus with its state, for example to the square of an arrow key,
// or to the next square after a correct letter. Then the page shows only one ring.
// The focus is a part of the browser, outside React, thus the move is in an effect.
// The focus moves only when it is on a different element of the same board, so a click on a key
// outside the board keeps the focus on the key. The board is the closest grid or <fieldset>.
export function useFocusWhen(isTarget: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = ref.current;
    if (!isTarget || button === null) return;
    const focused = document.activeElement;
    const board = button.closest('[role="grid"], fieldset');
    if (focused !== button && board?.contains(focused) === true) button.focus();
  }, [isTarget]);
  return ref;
}
