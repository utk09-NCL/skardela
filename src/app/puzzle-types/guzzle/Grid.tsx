import { useState, type KeyboardEvent } from "react";
import { gridStyle, positionOf } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { useFocusWhen } from "../../../shared/useFocusWhen";
import { useTabStop } from "../../../shared/useTabStop";
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
  // The board has one Tab stop. See "useTabStop.ts".
  isTabStop: boolean;
  onFocus: () => void;
  onArrowKey: (event: KeyboardEvent) => boolean;
};

// The marks of a square: the arrow on the first square of a word, the letter and the symbol of the colour.
function SquareMarks({ start, letter, guess }: Pick<SquareProps, "start" | "letter" | "guess">) {
  return (
    <>
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
    </>
  );
}

// Each square on a word is a button. The player selects a square and then types a letter.
// The symbol shows the colour as a shape too, so the colour is not the only signal.
// The first square of a word shows an arrow. The arrow shows the direction to read the word.
// "isInWord" marks the other squares of the selected word, so the player can see the full word.
// The arrow keys move the focus. When the selection moves, the Tab stop and the focus move too.
// Then the player can type the next letter.
function SquareButton(props: SquareProps) {
  const { label, letter, guess, isFixed, isSelected, isInWord, start, isLocked } = props;
  const ref = useFocusWhen(props.isTabStop);

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={props.isTabStop ? 0 : -1}
      className={`${shared.square} ${styles.square}`}
      data-mark={guess?.mark ?? "none"}
      data-fixed={isFixed}
      data-selected={isSelected}
      data-in-word={isInWord}
      aria-label={label}
      aria-pressed={isFixed ? undefined : isSelected}
      aria-disabled={isLocked}
      onClick={() => {
        if (!isLocked) props.onSelect?.();
      }}
      onFocus={props.onFocus}
      onKeyDown={(event) => {
        if (props.onArrowKey(event)) return;
        const typed = letterFromKey(event);
        if (isLocked || typed === undefined) return;
        event.preventDefault();
        props.onLetter?.(typed);
      }}
    >
      <SquareMarks start={start} letter={letter} guess={guess} />
    </button>
  );
}

// A gap is a place that is not on a word. It keeps the shape of the grid. The centre square is on all words.
function isGap(index: number, size: number): boolean {
  return index !== (size * size - 1) / 2 && !isPlayable(index, size);
}

type GridSquareProps = { game: Game; index: number; tabStop: ReturnType<typeof useTabStop> };

// One square of the grid: the fixed center letter, a square on a word or a gap.
function GridSquare({ game, index, tabStop }: GridSquareProps) {
  const { answer, size } = game;
  const isCenter = index === (size * size - 1) / 2;
  if (isGap(index, size)) {
    return <span className={styles.gap} aria-hidden="true" />;
  }
  const guess = isCenter ? undefined : game.guesses[index];
  const letter = isCenter ? (answer[index] ?? "") : (guess?.letter ?? "");
  const start = lineStartingAt(index, size);
  const selectedLine = game.selected === null ? undefined : lineOf(game.selected, size);
  const { row, column } = positionOf(index, size);
  const label = words.square({
    row: row + 1,
    column: column + 1,
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
      isTabStop={tabStop.tabStop === index}
      onFocus={() => {
        tabStop.focus(index);
      }}
      onArrowKey={(event) => tabStop.arrowKey(index, event)}
    />
  );
}

// The grid shows all squares in rows and columns. The board is a grid with rows, so a screen reader can tell
// the row and the column of each square. It has one Tab stop, and the arrow keys go past the gaps.
// After each letter and each change of the selection, the Tab stop goes to the selected square: the next square
// after a green letter, or the same square after a wrong letter. The next square can be selected already.
// React allows this change during the render, to follow a new value of the game.
export function Grid({ game }: { game: Game }) {
  const { size, selected, lastMove } = game;
  const tabStop = useTabStop(size, (index) => isGap(index, size));
  const [followed, setFollowed] = useState({ selected, lastMove });
  if (selected !== followed.selected || lastMove !== followed.lastMove) {
    setFollowed({ selected, lastMove });
    if (selected !== null) tabStop.focus(selected);
  }
  const all = Array.from({ length: size }, (_, position) => position);
  return (
    <div role="grid" aria-label={words.boardLabel} className={shared.grid} style={gridStyle(size)}>
      {all.map((row) => (
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
        <div key={row} role="row" className={shared.row}>
          {all.map((column) => (
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
            <div key={column} role="gridcell" className={shared.cell}>
              <GridSquare game={game} index={row * size + column} tabStop={tabStop} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
