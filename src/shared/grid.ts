import type { CSSProperties } from "react";

// The board CSS reads "--size" to make the grid columns. See "Board.module.css".
export function gridStyle(size: number): CSSProperties & { "--size": number } {
  return { "--size": size };
}

// The puzzle files keep a board as readable rows. The game keeps one flat list of squares, row by row.
// "Square" is the type of one square of the puzzle type, for example "R" | "B" | ".".
export function toSquares<Square extends string = string>(rows: readonly string[]): Square[] {
  return [...rows.join("")] as Square[];
}

// The row and the column of a square, from 0. A board has "size" squares in each row.
export function positionOf(index: number, size: number): { row: number; column: number } {
  return { row: Math.floor(index / size), column: index % size };
}

// The change in row and in column for each arrow key.
const arrowSteps: Partial<Record<string, { readonly row: number; readonly column: number }>> = {
  ArrowUp: { row: -1, column: 0 },
  ArrowDown: { row: 1, column: 0 },
  ArrowLeft: { row: 0, column: -1 },
  ArrowRight: { row: 0, column: 1 },
};

// The square that an arrow key moves to. At the edge of the board, the focus stays on the same square.
// A key that is not an arrow key gives undefined.
// "isGap" tells the places that are not squares, for example on the Guzzle board. The key goes past them.
// When only gaps are left in the direction, the focus stays on the same square.
export function squareAfterArrow(
  index: number,
  key: string,
  size: number,
  isGap: (place: number) => boolean = () => false,
): number | undefined {
  const step = arrowSteps[key];
  if (step === undefined) return undefined;
  let { row, column } = positionOf(index, size);
  for (;;) {
    row += step.row;
    column += step.column;
    const isOnBoard = row >= 0 && row < size && column >= 0 && column < size;
    if (!isOnBoard) return index;
    if (!isGap(row * size + column)) return row * size + column;
  }
}
