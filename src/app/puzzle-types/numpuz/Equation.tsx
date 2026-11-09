import { Fragment, useEffect, useRef, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import { symbols } from "../../../text/symbols";
import styles from "./Board.module.css";
import { operatorOfKey } from "./keys";
import type { Operator } from "./rules-check";
import type { Game } from "./useGame";

// This helper reads an operator from a physical keyboard. Other keys and shortcuts give no operator.
function operatorFromKey(event: KeyboardEvent): Operator | undefined {
  if (event.ctrlKey || event.metaKey || event.altKey) return undefined;
  return operatorOfKey(event.key);
}

// When the selection moves to a blank and the player uses the board with the keyboard,
// the focus moves too. Then the player can type the next operator, and the page shows only one ring.
function useFocusWhenSelected(isSelected: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = ref.current;
    if (!isSelected || button === null) return;
    const focused = document.activeElement;
    const isBoardFocused = focused !== button && button.parentElement?.contains(focused) === true;
    if (isBoardFocused) button.focus();
  }, [isSelected]);
  return ref;
}

// Each blank is a button, so the player can select it with a tap, a click or the keyboard.
// An operator key typed on a blank goes in that blank.
// After the solve, the blank has "aria-disabled", so a screen reader can still read it.
function Blank({ game, index }: { game: Game; index: number }) {
  const operator = game.guess[index] ?? null;
  const isSelected = game.selected === index;
  const ref = useFocusWhenSelected(isSelected);
  const { t } = useTranslation();
  const label = t(($) => $.numpuz.blank, {
    position: index + 1,
    operator:
      operator === null ? t(($) => $.numpuz.empty) : t(($) => $.numpuz.operatorNames[operator]),
  });
  return (
    <button
      ref={ref}
      type="button"
      className={styles.blank}
      // These names must be the same as the selectors in "Board.module.css".
      data-filled={operator !== null}
      data-selected={isSelected}
      aria-label={label}
      aria-pressed={isSelected}
      aria-disabled={game.isSolved}
      onClick={() => {
        game.select(index);
      }}
      onKeyDown={(event) => {
        const typed = operatorFromKey(event);
        if (game.isSolved || typed === undefined) return;
        event.preventDefault();
        game.fill(typed, index);
      }}
    >
      <span aria-hidden="true">
        {operator === null ? symbols.numpuz.empty : symbols.numpuz.operators[operator]}
      </span>
    </button>
  );
}

// The equation shows the numbers, the blanks between them, and the target.
export function Equation({ game }: { game: Game }) {
  const { t } = useTranslation();
  return (
    <fieldset className={shared.board}>
      <legend className="visually-hidden">{t(($) => $.numpuz.boardLabel)}</legend>
      <div className={styles.equation}>
        {game.numbers.map((number, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- the numbers never move in the list.
          <Fragment key={index}>
            <span className={styles.number}>{number}</span>
            {index < game.guess.length && <Blank game={game} index={index} />}
          </Fragment>
        ))}
      </div>
      <p className={styles.target}>{t(($) => $.numpuz.target, { target: game.target })}</p>
    </fieldset>
  );
}
