import { gridStyle, positionOf } from "../../../shared/grid";
import shared from "../../../shared/Board.module.css";
import { useFocusWhen } from "../../../shared/useFocusWhen";
import { useTabStop } from "../../../shared/useTabStop";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import {
  beamColours,
  directions,
  isFilter,
  isMirror,
  isMonster,
  mirrors,
  type Direction,
  type LaserData,
  type Mirror,
  type Square,
} from "./puzzle";
import type { Game } from "./useGame";
import { beamLines, laserSquares, type BeamLine } from "./beam";
import { steps } from "./rules-check";

const words = text.latics;
const shapes = words.symbols.colours;

// Each square has a drawing in a box from −50 to 50. The middle of the square is at 0, 0.
// A beam line goes a little past the side of the square, so the lines of two squares meet in the gap.
const beamLength = 58;
const mirrorLength = 38;
const barrelLength = 40;

// A line from "from" to "to" times the step of the direction.
// A beam line uses the step as it is, so a diagonal line goes to the corner of the square.
// The default of "from" is in the body, because React Compiler cannot compile a default in the parameters.
function Line({ direction, from, to }: { direction: Direction; from?: number; to: number }) {
  const { row, column } = steps[direction];
  const start = from ?? 0;
  return <line x1={column * start} y1={row * start} x2={column * to} y2={row * to} />;
}

// A diagonal step is √2 long. This gives the multiplier for a line of the given length in the direction,
// so a diagonal mirror or laser has the same length as a straight one.
function reach(direction: Direction, length: number): number {
  const { row, column } = steps[direction];
  return row !== 0 && column !== 0 ? length / Math.SQRT2 : length;
}

// A mirror at the angle m goes in the direction m, and in the opposite direction.
function mirrorDirection(mirror: Mirror): Direction {
  return directions[mirrors.indexOf(mirror)] as Direction;
}

// The beam lines, one group for each colour. Each colour has its own line pattern too,
// so the colour is not the only signal: see "Board.module.css".
function BeamLines({ lines }: { lines: readonly BeamLine[] }) {
  return beamColours.map((colour) => (
    <g key={colour} className={styles.beam} data-colour={colour}>
      {lines
        .filter((line) => line.colour === colour)
        .map(({ direction }) => (
          <Line key={direction} direction={direction} to={beamLength} />
        ))}
    </g>
  ));
}

type ArtProps = { square: Square; laser: LaserData | undefined; lines: readonly BeamLine[] };

// The drawing of one square: a filter under the beam, the beam lines, then the mirror, the prism or the laser.
// The drawing is only decoration. The label of the square gives the same information.
function SquareArt({ square, laser, lines }: ArtProps) {
  return (
    <svg className={styles.art} viewBox="-50 -50 100 100" aria-hidden="true">
      {isFilter(square) && (
        <rect
          className={styles.filter}
          data-colour={square === "r" ? "red" : "blue"}
          x={-40}
          y={-40}
          width={80}
          height={80}
          rx={10}
        />
      )}
      <BeamLines lines={lines} />
      {isMirror(square) && (
        <g className={styles.mirror}>
          <Line
            direction={mirrorDirection(square)}
            from={-reach(mirrorDirection(square), mirrorLength)}
            to={reach(mirrorDirection(square), mirrorLength)}
          />
        </g>
      )}
      {square === "^" && <polygon className={styles.prism} points="0,-30 27,17 -27,17" />}
      {laser !== undefined && (
        <g className={styles.laser} data-colour={laser.colour}>
          <Line direction={laser.direction} to={reach(laser.direction, barrelLength)} />
          <circle r={18} />
        </g>
      )}
    </svg>
  );
}

// The colour of a red or a blue piece: a monster, a filter or a laser. Other pieces have no colour.
function pieceColour(square: Square, laser: LaserData | undefined): "red" | "blue" | null {
  if (square === "R" || square === "r" || laser?.colour === "red") return "red";
  if (square === "B" || square === "b" || laser?.colour === "blue") return "blue";
  return null;
}

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
  // A red piece shows a circle and a blue piece shows a square, as in Colour Binary.
  const colour = pieceColour(square, laser);

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
      {isMonster(square) && (
        <span aria-hidden="true" className={styles.monster}>
          {words.symbols.monster}
        </span>
      )}
      {colour !== null && (
        <span aria-hidden="true" className={styles.shape} data-colour={colour}>
          {shapes[colour]}
        </span>
      )}
      {isHit && (
        <span aria-hidden="true" className={styles.hit}>
          {words.symbols.hit}
        </span>
      )}
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
      {all.map((row) => (
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a table with a CSS grid loses its table role in some browsers.
        <div key={row} role="row" className={shared.row}>
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
