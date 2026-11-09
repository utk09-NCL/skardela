import type { TFunction } from "i18next";
import type { Move } from "./machine";
import { holeAt, type Ball, type Layout } from "./rules-check";
import type { Game } from "./useGame";

// The text of a tilt for the status and the screen reader: the tilt, what each ball did, and the tilts.
// For example "Tilt left. The red ball rolls 3 squares. The blue ball falls into its hole. Tilts: 4."
export function moveText(t: TFunction, move: Move): string {
  return [
    t(($) => $.tilt.status.tilt, { direction: t(($) => $.tilt.directions[move.direction]) }),
    ...move.balls.map((ball) => {
      const colour = t(($) => $.tilt.colours[ball.colour]);
      return ball.fallsIn
        ? t(($) => $.tilt.status.fallsIn, { colour })
        : t(($) => $.tilt.status.rolls, { colour, count: ball.squares });
    }),
    t(($) => $.tilt.status.tilts, { count: move.tilts }),
  ].join(" ");
}

// The text of a solve. 0 extra tilts is a perfect solve.
function solvedText(t: TFunction, extra: number): string {
  if (extra === 0) return t(($) => $.tilt.status.perfect);
  return t(($) => $.tilt.status.solved, { extra: t(($) => $.tilt.score, { count: extra }) });
}

// The status text tells the player what to do, what the last tilt did, or the result.
// The status box is a live region, thus a screen reader tells each new text. See "## Screen reader" in "rules.md".
// After the solve, the text tells the last tilt too, so a screen reader also tells the last tilt.
export function statusText(t: TFunction, game: Game): string {
  const { blocked } = game;
  if (blocked !== null) {
    return t(($) => $.tilt.status.noMove, { direction: t(($) => $.tilt.directions[blocked]) });
  }
  if (game.lastMove === null) return t(($) => $.tilt.status.start);
  const tilt = moveText(t, game.lastMove);
  return game.isSolved ? `${tilt} ${solvedText(t, game.extraTilts)}` : tilt;
}

// What is on a square, in words: a wall, a ball, a hole, a ball on a hole, or nothing.
function contentOf(t: TFunction, layout: Layout, balls: readonly Ball[], index: number): string {
  if (layout.walls[index] === true) return t(($) => $.tilt.squares.wall);
  const ball = balls.find((item) => item.index === index);
  const hole = holeAt(layout, index);
  const holeColour = hole === undefined ? undefined : t(($) => $.tilt.colours[hole]);
  if (ball === undefined) {
    return holeColour === undefined
      ? t(($) => $.tilt.squares.empty)
      : t(($) => $.tilt.squares.hole, { colour: holeColour });
  }
  const colour = t(($) => $.tilt.colours[ball.colour]);
  if (ball.isInHole) return t(($) => $.tilt.squares.inHole, { colour });
  if (holeColour !== undefined) {
    return t(($) => $.tilt.squares.onHole, { ball: colour, hole: holeColour });
  }
  return t(($) => $.tilt.squares.ball, { colour });
}

// The name of a square for a screen reader, for example "Row 2, column 3, red ball" or "Row 1, column 5, wall".
export function squareLabel(
  t: TFunction,
  layout: Layout,
  balls: readonly Ball[],
  index: number,
): string {
  return t(($) => $.tilt.square, {
    row: Math.floor(index / layout.size) + 1,
    column: (index % layout.size) + 1,
    content: contentOf(t, layout, balls, index),
  });
}
