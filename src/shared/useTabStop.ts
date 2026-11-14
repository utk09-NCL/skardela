import { useState, type KeyboardEvent } from "react";
import { squareAfterArrow } from "./grid";

// A board with one Tab stop, as a grid: one square has "tabIndex" 0 and the others have -1.
// The Tab key goes past the board in one step, and the arrow keys move between the squares.
// Each square calls "focus" when it gets the focus, also after a click, thus the Tab stop follows the focus.
// Each square uses "useFocusWhen(tabStop === index)", so the focus follows an arrow key.
export function useTabStop(size: number) {
  const [tabStop, setTabStop] = useState(0);
  return {
    tabStop,
    focus: setTabStop,
    // This moves the Tab stop for an arrow key, and gives true. For a different key, it gives false.
    // A key with Ctrl, Alt or Meta is a shortcut of the browser, thus the board does not use it.
    arrowKey: (index: number, event: KeyboardEvent): boolean => {
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      const target = squareAfterArrow(index, event.key, size);
      if (target === undefined) return false;
      event.preventDefault();
      setTabStop(target);
      return true;
    },
  };
}
