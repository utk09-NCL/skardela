import { flushSync } from "react-dom";
import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { bankLetters, type KeyHint, type LetterKey } from "./rules-check";
import { modes } from "./machine";
import type { Game } from "./useGame";

const words = text.guzzle;

const alphabet: LetterKey[] = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((letter) => ({ letter }));

type KeyProps = LetterKey & { hint: KeyHint | undefined; onPut: (letter: string) => void };

// One letter key. It shows what the player knows about its letter for the selected square,
// from the earlier moves. The symbol shows the hint as a shape too, so the colour is not the only signal.
// A key of the bank goes away when its last square is green. Then the focus goes to the key at its place,
// so a keyboard user stays in the bank. "flushSync" removes the key before the focus moves.
function KeyButton({ letter, count, hint, onPut }: KeyProps) {
  return (
    <button
      type="button"
      className={`${shared.button} ${styles.key}`}
      data-hint={hint ?? "none"}
      aria-label={words.key(letter, count, hint)}
      onClick={(event) => {
        const key = event.currentTarget;
        const group = key.closest("fieldset");
        const place = [...(group?.querySelectorAll("button") ?? [])].indexOf(key);
        flushSync(() => {
          onPut(letter);
        });
        if (key.isConnected || group === null) return;
        const keys = [...group.querySelectorAll("button")];
        (keys[place] ?? keys.at(-1))?.focus();
      }}
    >
      {letter}
      {hint !== undefined && (
        <span className={styles.keySymbol} aria-hidden="true">
          {hint === "wrong" ? words.symbols.absent : words.symbols.present}
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

// Before the first move, the player selects a mode with these buttons. The buttons then go away,
// thus the focus goes to the first open square, which the machine selects with the mode.
// "flushSync" shows the selected square before the focus moves.
function ModeButtons({ game }: { game: Game }) {
  return (
    <fieldset className={styles.modes}>
      <legend className="visually-hidden">{words.modeLabel}</legend>
      {modes.map((option) => (
        <button
          key={option}
          type="button"
          className={shared.button}
          onClick={(event) => {
            const board = event.currentTarget.closest(`.${shared.game}`);
            flushSync(() => {
              game.chooseMode(option);
            });
            board?.querySelector<HTMLButtonElement>('[data-selected="true"]')?.focus();
          }}
        >
          {words.modes[option]}
        </button>
      ))}
    </fieldset>
  );
}

// Before the first move, the player selects a mode. Then the player gets letter keys.
// With the bank, the keys are the letters that are not green yet. Without the bank, the keys are A to Z.
export function Controls({ game }: { game: Game }) {
  if (game.mode === null) return <ModeButtons game={game} />;

  const keys = game.mode === "bank" ? bankLetters(game.answer, game.guesses) : alphabet;
  return (
    <fieldset className={styles.keys} disabled={!game.canUseKeys}>
      <legend className="visually-hidden">
        {game.mode === "bank" ? words.bankLabel : words.keysLabel}
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
