import { useId, type CSSProperties } from "react";
import { gridStyle } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { tiltOnArrowKey, useSwipe } from "./input";
import { holeAt, type Ball, type Direction } from "./rules-check";
import { squareLabel } from "./status";
import type { Game } from "./useGame";

const words = text.tilt;

// One square of the board: empty, a wall or a hole. The balls are not in the squares. See "BallView".
// The name of the square tells what is on it, the ball too, so a screen reader can read the full board.
// The drawing is only decoration: a hole is the outline of a circle with the icon of its colour.
function Square({ game, index }: { game: Game; index: number }) {
  const hole = holeAt(game.layout, index);
  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the square is a drawing with a name, not an image file.
      role="img"
      className={`${shared.square} ${styles.square}`}
      data-wall={game.layout.walls[index] === true}
      aria-label={squareLabel(game.layout, game.balls, index)}
    >
      {hole !== undefined && (
        <span className={styles.hole} data-colour={hole} aria-hidden="true">
          {words.symbols.colours[hole]}
        </span>
      )}
    </div>
  );
}

// The position of a ball on the board, for the CSS. See ".ball" in "Board.module.css".
type BallStyle = CSSProperties & { "--row": number; "--column": number };

// A ball is a full circle on top of the squares. It keeps the same element after a tilt,
// thus the CSS can slide it to its new square. A ball in its hole fills the hole and shows ✓.
// Each ball shows the icon of its colour, so colour is not the only signal. The grey ball has no icon.
function BallView({ ball, size }: { ball: Ball; size: number }) {
  const style: BallStyle = {
    "--row": Math.floor(ball.index / size),
    "--column": ball.index % size,
  };
  return (
    <span
      className={styles.ball}
      data-colour={ball.colour}
      data-in-hole={ball.isInHole}
      style={style}
      aria-hidden="true"
    >
      <span className={styles.disc}>
        {ball.isInHole ? words.symbols.full : words.symbols.colours[ball.colour]}
      </span>
    </span>
  );
}

// The board takes the focus, and the arrow keys tilt it. A swipe on the board tilts it too.
// "--slide" is the time of the slide. It is 0 ms when "reduce motion" is on, so the balls move at once.
type GridStyle = ReturnType<typeof gridStyle> & { "--slide": string };

// "onTilt" tilts the board. The board gives it, so each tilt also lights up its arrow button.
export function Grid({ game, onTilt }: { game: Game; onTilt: (direction: Direction) => void }) {
  const swipe = useSwipe(onTilt);
  const helpId = useId();
  const style: GridStyle = { ...gridStyle(game.size), "--slide": `${game.slide}ms` };
  const squares = Array.from({ length: game.size * game.size }, (_, index) => index);
  return (
    <>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the board takes the arrow keys and the swipes. */}
      <div
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a fieldset adds a border and a legend. The board needs only a name.
        role="group"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the board takes the focus for the arrow keys. See "rules.md".
        tabIndex={0}
        aria-label={words.boardLabel(game.size)}
        aria-describedby={helpId}
        className={`${shared.grid} ${styles.grid}`}
        style={style}
        onKeyDown={(event) => {
          tiltOnArrowKey(event, onTilt);
        }}
        {...swipe}
      >
        {/* The index is the identity of a square. The squares never move. */}
        {squares.map((index) => (
          <Square key={index} game={game} index={index} />
        ))}
        {game.balls.map((ball) => (
          <BallView key={ball.colour} ball={ball} size={game.size} />
        ))}
      </div>
      <p id={helpId} className="visually-hidden">
        {words.boardHelp}
      </p>
    </>
  );
}
