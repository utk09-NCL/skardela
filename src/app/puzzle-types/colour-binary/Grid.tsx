import { useState, type KeyboardEvent } from "react";
import { gridStyle, positionOf } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { useFocusWhen } from "../../../shared/useFocusWhen";
import { useTabStop } from "../../../shared/useTabStop";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { colourOfKey } from "./keys";
import type { Game } from "./useGame";

const words = text["colour-binary"];

// The keyboard of the board, as a grid: one square has the Tab stop, the arrow keys move the focus,
// and R, B and Space set the colour of the square with the focus. See "useTabStop.ts".
// A given square shakes when the player tries to change it. A solved board does not change, thus nothing shakes.
function useBoardKeys(game: Game) {
  const tabStop = useTabStop(game.size);
  const [shaking, setShaking] = useState<number | null>(null);
  const shake = (index: number) => {
    if (!game.isSolved) setShaking(index);
  };
  const onKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (tabStop.arrowKey(index, event)) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const colour = colourOfKey(event.key);
    if (colour === undefined) return;
    event.preventDefault();
    if (game.isGiven(index)) shake(index);
    else game.set(index, colour);
  };
  return { tabStop, shaking, setShaking, shake, onKeyDown };
}

type SquareProps = {
  game: Game;
  index: number;
  keys: ReturnType<typeof useBoardKeys>;
};

// Each square is a button in a grid cell, so the user can tap a cell and cycle its colour.
// A square that the player cannot tap has "aria-disabled", so a screen reader can still read it.
// A tap on a given square does not change it. The square shakes a little.
function SquareButton({ game, index, keys }: SquareProps) {
  const square = game.squares[index] ?? ".";
  const isGiven = game.isGiven(index);
  const isTabStop = keys.tabStop.tabStop === index;
  const ref = useFocusWhen(isTabStop);
  const { row, column } = positionOf(index, game.size);
  const label = words.square({
    row: row + 1,
    column: column + 1,
    colour: words.colours[square],
    isGiven,
  });
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
    <div role="gridcell" className={shared.cell}>
      <button
        ref={ref}
        type="button"
        tabIndex={isTabStop ? 0 : -1}
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
          keys.tabStop.focus(index);
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
        <span aria-hidden="true">{words.symbols[square]}</span>
      </button>
    </div>
  );
}

// The board is a grid with rows, so a screen reader can tell the row and the column of each square.
// The rows use the columns of the board (subgrid), so the squares look the same as on the other boards.
export function Grid({ game }: { game: Game }) {
  const { size } = game;
  const keys = useBoardKeys(game);
  const all = Array.from({ length: size }, (_, position) => position);
  return (
    <div
      role="grid"
      aria-label={words.boardLabel(size)}
      className={shared.grid}
      style={gridStyle(size)}
    >
      {all.map((row) => (
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
        <div key={row} role="row" className={shared.row}>
          {all.map((column) => (
            <SquareButton key={column} game={game} index={row * size + column} keys={keys} />
          ))}
        </div>
      ))}
    </div>
  );
}
