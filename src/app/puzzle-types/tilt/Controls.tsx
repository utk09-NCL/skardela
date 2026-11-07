import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { tiltOnArrowKey } from "./input";
import { directions } from "./rules-check";
import type { Game } from "./useGame";

const words = text.tilt;

// The four arrow buttons tilt the board with a mouse or a touch. An arrow key on a button tilts the board too.
// After the solve, the buttons have "aria-disabled", so a screen reader can still read them.
export function Controls({ game }: { game: Game }) {
  return (
    <fieldset className={styles.arrows}>
      <legend className="visually-hidden">{words.controlsLabel}</legend>
      {directions.map((direction) => (
        <button
          key={direction}
          type="button"
          className={`${shared.button} ${shared.boxed} ${styles.arrow}`}
          data-direction={direction}
          aria-label={words.tiltButton(words.directions[direction])}
          aria-disabled={game.isSolved}
          onClick={() => {
            game.tilt(direction);
          }}
          onKeyDown={(event) => {
            tiltOnArrowKey(event, game.tilt);
          }}
        >
          <span aria-hidden="true">{words.symbols.arrows[direction]}</span>
        </button>
      ))}
    </fieldset>
  );
}

// The key hint above the board tells a mouse player to click the board before the arrow keys.
// It has two texts. The CSS shows "idle" when the board and the arrow buttons do not have the focus,
// and "active" when one of them has the focus (".game:focus-within" in "Board.module.css").
// A screen reader does not read it, because the board has its own help text.
// The CSS shows it only with a mouse. See "## Controls" in "rules.md".
export function KeyHint() {
  return (
    <p className={styles.keyHint} aria-hidden="true">
      <span className={styles.keyHintIdle}>
        {words.symbols.keyboard} {words.keyHint.idle}
      </span>
      <span className={styles.keyHintActive}>
        {words.symbols.keyboard} {words.keyHint.active}
      </span>
    </p>
  );
}
