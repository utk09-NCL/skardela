import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { operators } from "./rules-check";
import type { Game } from "./useGame";

const words = text.numpuz;

// The four operator keys put an operator in the selected blank.
// Before the player selects a blank, and after the solve, the keys have "aria-disabled",
// so a screen reader can still read them. See "Board.module.css".
export function Controls({ game }: { game: Game }) {
  return (
    <fieldset className={styles.keys}>
      <legend className="visually-hidden">{words.keysLabel}</legend>
      {operators.map((operator) => (
        <button
          key={operator}
          type="button"
          className={`${shared.button} ${shared.boxed} ${styles.key}`}
          aria-label={words.key(words.operatorNames[operator])}
          aria-disabled={!game.canUseKeys}
          onClick={() => {
            game.fill(operator);
          }}
        >
          <span aria-hidden="true">{words.symbols.operators[operator]}</span>
        </button>
      ))}
    </fieldset>
  );
}
