import { gridStyle, positionOf } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { useFocusWhen } from "../../../shared/useFocusWhen";
import { useTabStop } from "../../../shared/useTabStop";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { isMonster, type LaserData } from "./puzzle";
import { SquareArt, SquareMarks, WaterAreas } from "./Art";
import type { Game } from "./useGame";
import { beamLines, laserSquares, type BeamLine } from "./beam";

const words = text.latics;

type SquareProps = {
  game: Game;
  index: number;
  lines: readonly BeamLine[];
  laser: LaserData | undefined;
  tabStop: ReturnType<typeof useTabStop>;
};

// The label of a square for a screen reader, for example "Row 1, column 1, laser, points right".
function squareLabel(game: Game, index: number, laser: LaserData | undefined, isHit: boolean) {
  const square = game.squares[index] ?? ".";
  const { row, column } = positionOf(index, game.size);
  return words.square({
    row: row + 1,
    column: column + 1,
    piece: laser === undefined ? words.pieces[square] : words.laserName(laser.colour),
    laser: laser === undefined ? "" : words.directions[laser.direction],
    isFromTray: game.fromTray.includes(index),
    isHit,
    isInWater: game.config.water[index] === true,
  });
}

// Each square is a button in a grid cell. The player selects a square to change its piece.
// A square that the player cannot change has "aria-disabled", so a screen reader can still read it.
// The board has one Tab stop, and the arrow keys move the focus. See "useTabStop.ts".
function SquareButton({ game, index, lines, laser, tabStop }: SquareProps) {
  const isTabStop = tabStop.tabStop === index;
  const ref = useFocusWhen(isTabStop);
  const square = game.squares[index] ?? ".";
  const isHit = isMonster(square) && game.beam?.hits.includes(index) === true;

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={isTabStop ? 0 : -1}
      className={`${shared.square} ${styles.square}`}
      data-square={square}
      data-water={game.config.water[index] === true}
      data-from-tray={game.fromTray.includes(index)}
      data-hit={isHit}
      aria-label={squareLabel(game, index, laser, isHit)}
      aria-disabled={!game.canSelect(index)}
      onClick={() => {
        game.select(index);
      }}
      onFocus={() => {
        tabStop.focus(index);
      }}
      onKeyDown={(event) => {
        tabStop.arrowKey(index, event);
      }}
    >
      <SquareArt square={square} laser={laser} lines={lines} />
      <SquareMarks square={square} laser={laser} isHit={isHit} />
    </button>
  );
}

// The grid shows all squares in rows and columns, with the beam when the game shows it.
// The board is a grid with rows, so a screen reader can tell the row and the column of each square.
export function Grid({ game }: { game: Game }) {
  const { size } = game;
  const tabStop = useTabStop(size);
  const lines = game.beam === null ? new Map<number, BeamLine[]>() : beamLines(game.beam);
  const lasers = laserSquares(game.squares);
  const all = Array.from({ length: size }, (_, position) => position);
  return (
    <div role="grid" aria-label={words.boardLabel} className={shared.grid} style={gridStyle(size)}>
      <WaterAreas water={game.config.water} size={size} />
      {all.map((row) => (
        // The rows have a fixed place in the grid, so a water area can be in the same place, under the squares.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
        <div key={row} role="row" className={shared.row} style={{ gridRow: row + 1 }}>
          {all.map((column) => {
            const index = row * size + column;
            const number = lasers.indexOf(index);
            return (
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
              <div key={column} role="gridcell" className={shared.cell}>
                <SquareButton
                  game={game}
                  index={index}
                  lines={lines.get(index) ?? []}
                  laser={number === -1 ? undefined : game.lasers[number]}
                  tabStop={tabStop}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
