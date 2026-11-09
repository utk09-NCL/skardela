import type { TFunction } from "i18next";
import { brokenRuleAt } from "./rules-check";
import type { Game } from "./useGame";

// The name of the colour of a square. An empty square is "." in the puzzle data, and "empty" in the text.
export function colourName(t: TFunction, square: "R" | "B" | "."): string {
  return t(($) => $["colour-binary"].colours[square === "." ? "empty" : square]);
}

// The name of a line, for example "Row 3".
function lineName(t: TFunction, line: "row" | "column", number: number): string {
  return t(($) => $["colour-binary"].lines[line], { number });
}

// The status text tells the user if the board is solved, shows a hint, or tells the rule that the last change
// breaks. The board puts the text in an <output>, thus a screen reader reads each new text.
export function statusText(t: TFunction, game: Game, size: number): string {
  if (game.isSolved) return t(($) => $["colour-binary"].status.solved);
  const { hint } = game;
  if (hint.status === "none") return t(($) => $["colour-binary"].noHint);
  if (hint.status === "shown") {
    const { index, colour, reason, line, number } = hint.hint;
    return t(($) => $["colour-binary"].hint[reason], {
      row: Math.floor(index / size) + 1,
      column: (index % size) + 1,
      line: lineName(t, line, number),
      colour: colourName(t, colour),
      otherColour: colourName(t, colour === "R" ? "B" : "R"),
    });
  }
  const broken =
    game.lastChanged === null ? undefined : brokenRuleAt(game.squares, game.lastChanged);
  if (broken === undefined) return t(($) => $["colour-binary"].status.start);
  return t(($) => $["colour-binary"].broken[broken.reason], {
    line: lineName(t, broken.line, broken.number),
    colour: colourName(t, broken.colour),
    half: size / 2,
  });
}
