import { positionOf } from "../../../shared/grid";
import { text } from "../../../text/en";
import { brokenRuleAt } from "./rules-check";
import type { Game } from "./useGame";

const words = text["colour-binary"];

// The status text tells the user if the board is solved, shows a hint, or tells the rule that the last change
// breaks. The board puts the text in an <output>, thus a screen reader reads each new text.
export function statusText(game: Game): string {
  const { size } = game;
  if (game.isSolved) return words.status.solved;
  const { hint } = game;
  if (hint.status === "none") return words.noHint;
  if (hint.status === "shown") {
    const { index, colour } = hint.hint;
    const { row, column } = positionOf(index, size);
    return words.hint({
      ...hint.hint,
      row: row + 1,
      column: column + 1,
      colour: words.colours[colour],
      otherColour: words.colours[colour === "R" ? "B" : "R"],
    });
  }
  const broken =
    game.lastChanged === null ? undefined : brokenRuleAt(game.squares, game.lastChanged);
  if (broken === undefined) return words.status.start;
  return words.broken({ ...broken, colour: words.colours[broken.colour], half: size / 2 });
}
