import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { gridStyle } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { symbols } from "../../../text/symbols";
import styles from "./Board.module.css";
import { colourOfKey, squareAfterKey } from "./keys";
import { colourName } from "./status";
import type { Game } from "./useGame";

// The keyboard of the board, as a grid: one square has the Tab stop, the arrow keys move the focus,
// and R, B and Space set the colour of the square with the focus.
// A given square shakes when the player tries to change it. A solved board does not change, thus nothing shakes.
function useBoardKeys(game: Game, size: number) {
  const [focused, setFocused] = useState(0);
  const [shaking, setShaking] = useState<number | null>(null);
  const shake = (index: number) => {
    if (!game.isSolved) setShaking(index);
  };
  const onKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = squareAfterKey(index, event.key, size);
    if (target !== undefined) {
      event.preventDefault();
      setFocused(target);
      return;
    }
    const colour = colourOfKey(event.key);
    if (colour === undefined) return;
    event.preventDefault();
    if (game.isGiven(index)) shake(index);
    else game.set(index, colour);
  };
  return { focused, setFocused, shaking, setShaking, shake, onKeyDown };
}

// When an arrow key moves the Tab stop to a square, and the focus is on the board, the focus moves too.
function useFocusWhenTabStop(isTabStop: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = ref.current;
    if (!isTabStop || button === null) return;
    const focused = document.activeElement;
    const isBoardFocused =
      focused !== button && button.closest('[role="grid"]')?.contains(focused) === true;
    if (isBoardFocused) button.focus();
  }, [isTabStop]);
  return ref;
}

type SquareProps = {
  game: Game;
  index: number;
  size: number;
  keys: ReturnType<typeof useBoardKeys>;
};

// Each square is a button in a grid cell, so the user can tap a cell and cycle its colour.
// A square that the player cannot tap has "aria-disabled", so a screen reader can still read it.
// A tap on a given square does not change it. The square shakes a little.
function SquareButton({ game, index, size, keys }: SquareProps) {
  const square = game.squares[index] ?? ".";
  const isGiven = game.isGiven(index);
  const ref = useFocusWhenTabStop(keys.focused === index);
  const { t } = useTranslation();
  const values = {
    row: Math.floor(index / size) + 1,
    column: (index % size) + 1,
    colour: colourName(t, square),
  };
  const label = isGiven
    ? t(($) => $["colour-binary"].squareGiven, values)
    : t(($) => $["colour-binary"].square, values);
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
    <div role="gridcell" className={styles.cell}>
      <button
        ref={ref}
        type="button"
        tabIndex={keys.focused === index ? 0 : -1}
        className={`${shared.square} ${styles.square}`}
        data-colour={square}
        data-given={isGiven}
        data-shake={keys.shaking === index}
        data-hint={game.hint.status === "shown" && game.hint.hint.index === index}
        aria-label={label}
        aria-disabled={!game.canTap(index)}
        onClick={() => {
          if (isGiven) keys.shake(index);
          else game.tap(index);
        }}
        onFocus={() => {
          keys.setFocused(index);
        }}
        onKeyDown={(event) => {
          keys.onKeyDown(index, event);
        }}
        // A button clicks on the key up of Space. Space sets the colour on the key down, thus not on the key up.
        onKeyUp={(event) => {
          if (event.key === " ") event.preventDefault();
        }}
        onAnimationEnd={() => {
          keys.setShaking(null);
        }}
      >
        <span aria-hidden="true">{symbols["colour-binary"][square]}</span>
      </button>
    </div>
  );
}

// The board is a grid with rows, so a screen reader can tell the row and the column of each square.
// The rows use the columns of the board (subgrid), so the squares look the same as on the other boards.
export function Grid({ game, size }: { game: Game; size: number }) {
  const { t } = useTranslation();
  const keys = useBoardKeys(game, size);
  const all = Array.from({ length: size }, (_, position) => position);
  return (
    <div
      role="grid"
      aria-label={t(($) => $["colour-binary"].boardLabel, { size })}
      className={shared.grid}
      style={gridStyle(size)}
    >
      {all.map((row) => (
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
        <div key={row} role="row" className={styles.row}>
          {all.map((column) => (
            <SquareButton
              key={column}
              game={game}
              index={row * size + column}
              size={size}
              keys={keys}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
