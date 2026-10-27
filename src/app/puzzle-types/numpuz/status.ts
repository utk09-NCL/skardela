import { text } from "../../../text/en";
import type { Game } from "./useGame";

const words = text.numpuz;

// The status text tells the player what to do next, or what the last check found.
// The result of a check goes away when the guess changes. See "machine.ts".
export function statusText(game: Game): string {
  switch (game.checked) {
    case "correct":
      return words.status.solved(game.mistakes);
    case "wrong":
      return words.status.wrong(game.mistakes);
    case "incomplete":
      return words.status.incomplete;
    case null:
      return words.status.start;
  }
}
