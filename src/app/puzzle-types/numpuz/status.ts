import type { TFunction } from "i18next";
import type { Game } from "./useGame";

// The status text tells the player what to do next, or what the last check found.
// The result of a check goes away when the guess changes. See "machine.ts".
export function statusText(t: TFunction, game: Game): string {
  switch (game.checked) {
    case "correct":
      return t(($) => $.numpuz.status.solved, {
        mistakes: t(($) => $.numpuz.score, { count: game.mistakes }),
      });
    case "wrong":
      return t(($) => $.numpuz.status.wrong, { count: game.mistakes });
    case "incomplete":
      return t(($) => $.numpuz.status.incomplete);
    case null:
      return t(($) => $.numpuz.status.start);
  }
}
