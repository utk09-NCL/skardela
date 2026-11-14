import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import type { Game } from "./useGame";

const words = text["colour-binary"];

// Undo and Hint. Each button has "aria-disabled" when the machine does not accept its event.
// A button with "aria-disabled" keeps the focus, so a keyboard user does not lose the place, for example after
// the last Undo or after a Hint. The machine ignores the event of such a button. See "machine.ts".
export function Controls({ game }: { game: Game }) {
  const buttonClass = `${shared.button} ${shared.boxed}`;
  return (
    <div className={styles.buttons}>
      <button
        type="button"
        className={buttonClass}
        aria-disabled={!game.canUndo}
        onClick={game.undo}
      >
        {words.undoButton}
      </button>
      <button
        type="button"
        className={buttonClass}
        aria-disabled={!game.canAskHint}
        onClick={game.askHint}
      >
        {words.hintButton}
      </button>
    </div>
  );
}
