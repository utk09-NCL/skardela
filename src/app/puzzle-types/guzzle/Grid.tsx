import { useEffect, useRef, type KeyboardEvent } from "react";
import { Confetti } from "../../../shared/Confetti";
import { gridStyle } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { lineOf, lineStartingAt, type Line } from "./puzzle";
import { isPlayable, type Guess } from "./rules-check";
import type { Game } from "./useGame";

const words = text.guzzle;

// This helper reads a letter from a physical keyboard. Other keys and shortcuts give no letter.
function letterFromKey(event: KeyboardEvent): string | undefined {
  if (event.ctrlKey || event.metaKey || event.altKey) return undefined;
  return /^[a-z]$/iu.test(event.key) ? event.key.toUpperCase() : undefined;
}

// When the selection moves to a square and the player uses the board with the keyboard,
// the focus moves too. Then the player can type the next letter, and the page shows only one ring.
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

type SquareProps = {
  label: string;
  letter: string;
  guess: Guess | undefined;
  isFixed: boolean;
  isSelected: boolean;
  isInWord: boolean;
  start?: Line;
  isLocked: boolean;
  onSelect?: () => void;
  onLetter?: (letter: string) => void;
};

// Each square on a word is a button. The player selects a square and then types a letter.
// The symbol shows the colour as a shape too, so the colour is not the only signal.
// The first square of a word shows an arrow. The arrow shows the direction to read the word.
// "isInWord" marks the other squares of the selected word, so the player can see the full word.
function SquareButton({
  label,
  letter,
  guess,
  isFixed,
  isSelected,
  isInWord,
  start,
  isLocked,
  onSelect,
  onLetter,
}: SquareProps) {
  const ref = useFocusWhenSelected(isSelected);

  return (
    <button
      ref={ref}
      type="button"
      className={`${shared.square} ${styles.square}`}
      data-mark={guess?.mark ?? "none"}
      data-fixed={isFixed}
      data-selected={isSelected}
      data-in-word={isInWord}
      aria-label={label}
      aria-pressed={isFixed ? undefined : isSelected}
      aria-disabled={isLocked}
      onClick={() => {
        if (!isLocked) onSelect?.();
      }}
      onKeyDown={(event) => {
        const typed = letterFromKey(event);
        if (isLocked || typed === undefined) return;
        event.preventDefault();
        onLetter?.(typed);
      }}
    >
      {start !== undefined && (
        <span aria-hidden="true" className={styles.arrow}>
          {words.symbols.arrows[start]}
        </span>
      )}
      <span aria-hidden="true">{letter}</span>
      {guess !== undefined && (
        <span aria-hidden="true" className={styles.symbol}>
          {words.symbols[guess.mark]}
        </span>
      )}
    </button>
  );
}

type GameProps = { answer: readonly string[]; size: number; game: Game };

// One square of the grid: the fixed center letter, a square on a word or a gap.
// A gap is a square that is not on a word. It keeps the shape of the grid.
function GridSquare({ answer, size, game, index }: GameProps & { index: number }) {
  const isCenter = index === (size * size - 1) / 2;
  if (!isCenter && !isPlayable(index, size)) {
    return <span className={styles.gap} aria-hidden="true" />;
  }
  const guess = isCenter ? undefined : game.guesses[index];
  const letter = isCenter ? (answer[index] ?? "") : (guess?.letter ?? "");
  const start = lineStartingAt(index, size);
  const selectedLine = game.selected === null ? undefined : lineOf(game.selected, size);
  const label = words.square({
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    letter,
    mark: guess === undefined ? "" : words.marks[guess.mark],
    isFixed: isCenter,
    start: start === undefined ? "" : words.start(words.lines[start]),
  });
  return (
    <SquareButton
      label={label}
      letter={letter}
      guess={guess}
      isFixed={isCenter}
      isSelected={game.selected === index}
      isInWord={selectedLine !== undefined && lineOf(index, size) === selectedLine}
      start={start}
      isLocked={!game.canSelect(index)}
      onSelect={() => {
        game.select(index);
      }}
      onLetter={(typed) => {
        game.typeLetter(index, typed);
      }}
    />
  );
}

// The grid shows all squares in rows and columns.
// When the puzzle is solved, the confetti shows. It is next to the grid and not in it,
// because the grid has "container-type" and then the confetti cannot cover the full window.
export function Grid({ answer, size, game }: GameProps) {
  return (
    <>
      <div className={shared.grid} style={gridStyle(size)}>
        {answer.map((_, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- the index is the identity of a square. The squares never move.
          <GridSquare key={index} answer={answer} size={size} game={game} index={index} />
        ))}
      </div>
      {game.isSolved && <Confetti />}
    </>
  );
}
