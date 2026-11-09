import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import { symbols } from "../../../text/symbols";
import styles from "./Board.module.css";
import { bankLetters, type KeyHint, type LetterKey } from "./rules-check";
import { modes } from "./machine";
import type { Game } from "./useGame";

const alphabet: LetterKey[] = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((letter) => ({ letter }));

type KeyProps = LetterKey & { hint: KeyHint | undefined; onPut: (letter: string) => void };

// One letter key. It shows what the player knows about its letter for the selected square,
// from the earlier moves. The symbol shows the hint as a shape too, so the colour is not the only signal.
function KeyButton({ letter, count, hint, onPut }: KeyProps) {
  const { t } = useTranslation();
  // The parts of the label: the action, the count in the bank, and the hint from the earlier moves.
  const label = [
    t(($) => $.guzzle.key.put, { letter }),
    count === undefined ? "" : t(($) => $.guzzle.key.left, { count }),
    hint === undefined ? "" : t(($) => $.guzzle.key[hint]),
  ]
    .filter((part) => part !== "")
    .join(". ");
  return (
    <button
      type="button"
      className={`${shared.button} ${styles.key}`}
      data-hint={hint ?? "none"}
      aria-label={label}
      onClick={() => {
        onPut(letter);
      }}
    >
      {letter}
      {hint !== undefined && (
        <span className={styles.keySymbol} aria-hidden="true">
          {hint === "wrong" ? symbols.guzzle.absent : symbols.guzzle.present}
        </span>
      )}
      {/* The count shows only when more than one square needs the letter. */}
      {count !== undefined && count > 1 && (
        <span className={styles.count} aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

// Before the first move, the player selects a mode with these buttons.
function ModeButtons({ game }: { game: Game }) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.modes}>
      <legend className="visually-hidden">{t(($) => $.guzzle.modeLabel)}</legend>
      {modes.map((option) => (
        <button
          key={option}
          type="button"
          className={shared.button}
          onClick={() => {
            game.chooseMode(option);
          }}
        >
          {t(($) => $.guzzle.modes[option])}
        </button>
      ))}
    </fieldset>
  );
}

// Before the first move, the player selects a mode. Then the player gets letter keys.
// With the bank, the keys are the letters that are not green yet. Without the bank, the keys are A to Z.
export function Controls({ answer, game }: { answer: readonly string[]; game: Game }) {
  const { t } = useTranslation();
  if (game.mode === null) return <ModeButtons game={game} />;

  const keys = game.mode === "bank" ? bankLetters(answer, game.guesses) : alphabet;
  return (
    <fieldset className={styles.keys} disabled={!game.canUseKeys}>
      <legend className="visually-hidden">
        {game.mode === "bank" ? t(($) => $.guzzle.bankLabel) : t(($) => $.guzzle.keysLabel)}
      </legend>
      {keys.map(({ letter, count }) => (
        <KeyButton
          key={letter}
          letter={letter}
          count={count}
          hint={game.hints.get(letter)}
          onPut={game.putLetter}
        />
      ))}
    </fieldset>
  );
}
