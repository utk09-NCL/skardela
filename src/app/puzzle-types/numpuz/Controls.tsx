import shared from "../../../shared/Board.module.css";
import { useTranslation } from "react-i18next";
import { symbols } from "../../../text/symbols";
import styles from "./Board.module.css";
import { operators } from "./rules-check";
import type { Game } from "./useGame";

// The four operator keys put an operator in the selected blank.
// Before the player selects a blank, and after the solve, the keys have "aria-disabled",
// so a screen reader can still read them. See "Board.module.css".
export function Controls({ game }: { game: Game }) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.keys}>
      <legend className="visually-hidden">{t(($) => $.numpuz.keysLabel)}</legend>
      {operators.map((operator) => (
        <button
          key={operator}
          type="button"
          className={`${shared.button} ${shared.boxed} ${styles.key}`}
          aria-label={t(($) => $.numpuz.key, { name: t(($) => $.numpuz.operatorNames[operator]) })}
          aria-disabled={!game.canUseKeys}
          onClick={() => {
            game.fill(operator);
          }}
        >
          <span aria-hidden="true">{symbols.numpuz.operators[operator]}</span>
        </button>
      ))}
    </fieldset>
  );
}
