import { text } from "../../../text/en";
import type { Move } from "./machine";
import { holeAt, type Ball, type Layout } from "./rules-check";
import type { Game } from "./useGame";

const words = text.tilt;

// The text of a tilt for the status and the screen reader: the tilt, what each ball did, and the tilts.
// For example "Tilt left. The red ball rolls 3 squares. The blue ball falls into its hole. Tilts: 4."
function moveText(move: Move): string {
  return [
    words.status.tilt(words.directions[move.direction]),
    ...move.balls.map((ball) => {
      const colour = words.colours[ball.colour];
      return ball.fallsIn ? words.status.fallsIn(colour) : words.status.rolls(colour, ball.squares);
    }),
    words.status.tilts(move.tilts),
  ].join(" ");
}

// The status text tells the player what to do, what the last tilt did, or the result.
// The status box is a live region, thus a screen reader tells each new text. See "## Screen reader" in "rules.md".
// After the solve, the text tells the last tilt too, so a screen reader also tells the last tilt.
export function statusText(game: Game): string {
  if (game.blocked !== null) return words.status.noMove(words.directions[game.blocked]);
  if (game.lastMove === null) return words.status.start;
  const tilt = moveText(game.lastMove);
  return game.isSolved ? `${tilt} ${words.status.solved(game.score)}` : tilt;
}

// What is on a square, in words: a wall, a ball, a hole, a ball on a hole, or nothing.
function contentOf(layout: Layout, balls: readonly Ball[], index: number): string {
  if (layout.walls[index] === true) return words.squares.wall;
  const ball = balls.find((item) => item.index === index);
  const hole = holeAt(layout, index);
  if (ball === undefined) {
    return hole === undefined ? words.squares.empty : words.squares.hole(words.colours[hole]);
  }
  const colour = words.colours[ball.colour];
  if (ball.isInHole) return words.squares.inHole(colour);
  if (hole !== undefined) return words.squares.onHole(colour, words.colours[hole]);
  return words.squares.ball(colour);
}

// The name of a square for a screen reader, for example "Row 2, column 3, red ball" or "Row 1, column 5, wall".
export function squareLabel(layout: Layout, balls: readonly Ball[], index: number): string {
  const row = Math.floor(index / layout.size) + 1;
  const column = (index % layout.size) + 1;
  return words.square(row, column, contentOf(layout, balls, index));
}
