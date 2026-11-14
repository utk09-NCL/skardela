import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import type { Game } from "./useGame";

const words = text["colour-binary"];

// Undo and Hint. Each button is disabled when the machine does not accept its event.
export function Controls({ game }: { game: Game }) {
  const buttonClass = `${shared.button} ${shared.boxed}`;
  return (
    <div className={styles.buttons}>
      <button type="button" className={buttonClass} disabled={!game.canUndo} onClick={game.undo}>
        {words.undoButton}
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={!game.canAskHint}
        onClick={game.askHint}
      >
        {words.hintButton}
      </button>
    </div>
  );
}
