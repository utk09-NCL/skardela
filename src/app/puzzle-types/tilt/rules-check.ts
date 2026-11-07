import {
  ballColours,
  ballOfSquare,
  cellsOf,
  colours,
  holeOfSquare,
  type BallColour,
  type Colour,
} from "./puzzle";

// The pure rules of Tilt: read a board, tilt it, and check if it is solved. No React and no side effects.
//
// The index of a square is row × size + column. Row 0 is the top row and column 0 is the left column.
// Thus "row 3, column 2" in "rules.md" is the index (3 - 1) × size + (2 - 1).

// The four tilts. See "## Rules": "Tilt the board up, down, left or right."
export const directions = ["up", "down", "left", "right"] as const;
export type Direction = (typeof directions)[number];

// The parts of a board that do not change during a game.
export type Layout = {
  // The number of squares in one row and in one column.
  readonly size: number;
  // One item for each square: "true" for a wall.
  readonly walls: readonly boolean[];
  // The index of the hole of each colour on the board. A colour with no hole on the board has no item.
  readonly holes: Readonly<Partial<Record<Colour, number>>>;
};

// One ball on the board.
export type Ball = {
  readonly colour: BallColour;
  // The index of the square of the ball. For a ball in its hole, it is the index of the hole.
  readonly index: number;
  // "true" when the ball is in its hole. Then the hole is full, and the ball does not move again.
  // The grey ball is never in a hole.
  readonly isInHole: boolean;
};

// The board as the game uses it: the parts that do not change, and the balls.
export type Board = {
  readonly layout: Layout;
  // The balls in the order of "ballColours" in "puzzle.ts": red, blue, yellow, then grey.
  // It has only the balls of the board.
  readonly balls: readonly Ball[];
};

// What one ball does in one tilt.
export type BallMove = {
  readonly colour: BallColour;
  // The index of the square before the tilt.
  readonly from: number;
  // The index of the square after the tilt. For a ball that falls into its hole, it is the index of the hole.
  readonly to: number;
  // The number of squares that the ball rolls. It is 1 or more.
  // A ball that falls into its hole counts the square of the hole too.
  readonly squares: number;
  // "true" when the ball falls into its hole in this tilt.
  readonly fallsIn: boolean;
};

// The result of one tilt.
export type TiltResult = {
  // All balls after the tilt, in the same order as before the tilt.
  readonly balls: readonly Ball[];
  // One item for each ball that moves, in the order of "balls". It is empty when no ball can move.
  readonly moves: readonly BallMove[];
};

// The change in row and in column for one square in the direction of each tilt.
export const steps: Readonly<Record<Direction, { readonly row: number; readonly column: number }>> =
  {
    up: { row: -1, column: 0 },
    down: { row: 1, column: 0 },
    left: { row: 0, column: -1 },
    right: { row: 0, column: 1 },
  };

type Step = (typeof steps)[Direction];

// How far a ball is in the direction of the tilt. The front ball has the largest number.
function progress(layout: Layout, ball: Ball | undefined, step: Step): number {
  if (ball === undefined) return 0;
  const row = Math.floor(ball.index / layout.size);
  const column = ball.index % layout.size;
  return row * step.row + column * step.column;
}

// The number of squares between two squares in one row or in one column.
function distance(size: number, from: number, to: number): number {
  const rows = Math.abs(Math.floor(from / size) - Math.floor(to / size));
  const columns = Math.abs((from % size) - (to % size));
  return rows + columns;
}

// One ball rolls one square at a time. It stops before the edge of the board, a wall, or a square that "isBlocked"
// tells (another ball or a full hole). A coloured ball that gets to the hole of its colour falls in and stops there.
// The grey ball and a ball of a different colour roll over an empty hole.
function roll(layout: Layout, ball: Ball, step: Step, isBlocked: (index: number) => boolean): Ball {
  const { size } = layout;
  const ownHole = ball.colour === "grey" ? undefined : layout.holes[ball.colour];
  let row = Math.floor(ball.index / size);
  let column = ball.index % size;
  for (;;) {
    const nextRow = row + step.row;
    const nextColumn = column + step.column;
    const isOnBoard = nextRow >= 0 && nextRow < size && nextColumn >= 0 && nextColumn < size;
    if (!isOnBoard) break;
    const next = nextRow * size + nextColumn;
    if (layout.walls[next] === true || isBlocked(next)) break;
    row = nextRow;
    column = nextColumn;
    if (next === ownHole) return { colour: ball.colour, index: next, isInHole: true };
  }
  const index = row * size + column;
  return index === ball.index ? ball : { colour: ball.colour, index, isInHole: false };
}

// Reads the "board" rows of a puzzle. See "## Puzzle data" in "rules.md".
// "size" is the number of rows. Each ball starts with "isInHole" false.
// The balls are in the order of "ballColours", and only the balls of the board are in the list.
// Use it only for rows that have no problems from "findPuzzleProblems", or for a square board that a test makes.
// It does not check the size of a level.
export function readBoard(rows: readonly string[]): Board {
  const size = rows.length;
  const walls = Array.from({ length: size * size }, () => false);
  const holes: Partial<Record<Colour, number>> = {};
  const found = new Map<BallColour, number>();
  for (const [row, text] of rows.entries()) {
    for (const [column, character] of cellsOf(text).entries()) {
      // A character after the last column is not on the board.
      if (column >= size) continue;
      const index = row * size + column;
      if (character === "#") walls[index] = true;
      const hole = holeOfSquare(character);
      if (hole !== undefined) holes[hole] = index;
      const ball = ballOfSquare(character);
      if (ball !== undefined) found.set(ball, index);
    }
  }
  // The balls are in the order of "ballColours", not in the order of the squares.
  const balls = ballColours.flatMap((colour): Ball[] => {
    const index = found.get(colour);
    return index === undefined ? [] : [{ colour, index, isInHole: false }];
  });
  return { layout: { size, walls, holes }, balls };
}

// Tilts the board in "direction" and gives the balls after the tilt. It applies these rules:
// - Each ball rolls in the direction of the tilt until it hits a wall, the edge of the board, another ball
//   or a full hole.
// - A coloured ball that rolls over the hole of its colour falls in and stops there. The hole is now full.
// - A ball in its hole does not move again. A full hole stops the other balls, as a wall does.
// - A coloured ball rolls over an empty hole of a different colour. The grey ball rolls over all empty holes.
// - All balls roll at the same time. When two balls are in one line, the front ball moves first.
//   The ball behind it stops next to it. When the front ball falls into its hole, the ball behind it stops
//   next to that full hole, in the same tilt.
// - A ball can stop on an empty hole of a different colour. It is not in a hole, and it stops the other balls.
// When no ball can move, "balls" has the same balls as before and "moves" is empty.
// A coloured ball with no hole on the board never falls in.
export function tiltBoard(
  layout: Layout,
  balls: readonly Ball[],
  direction: Direction,
): TiltResult {
  const step = steps[direction];
  // The squares that have a ball. A ball that moved in this tilt has its new square.
  const taken = new Set(balls.map((ball) => ball.index));
  // The full holes: the squares of the balls that are in their holes.
  const full = new Set(balls.filter((ball) => ball.isInHole).map((ball) => ball.index));
  const after = [...balls];

  // The front ball moves first. The front ball is the ball that is the farthest in the direction of the tilt.
  // Balls in different lines do not touch, thus one order for all balls is correct.
  const order = [...balls.keys()].toSorted(
    (first, second) => progress(layout, balls[second], step) - progress(layout, balls[first], step),
  );
  for (const position of order) {
    const ball = balls[position];
    // A ball in its hole stays there until the end.
    if (ball === undefined || ball.isInHole) continue;
    taken.delete(ball.index);
    const rolled = roll(layout, ball, step, (index) => taken.has(index) || full.has(index));
    taken.add(rolled.index);
    if (rolled.isInHole) full.add(rolled.index);
    if (rolled.index !== ball.index) after[position] = rolled;
  }

  const moves = balls.flatMap((before, position): BallMove[] => {
    const now = after[position];
    if (now === undefined || now === before) return [];
    const squares = distance(layout.size, before.index, now.index);
    return [
      { colour: before.colour, from: before.index, to: now.index, squares, fallsIn: now.isInHole },
    ];
  });
  // When no ball can move, the result has the same list of balls.
  return { balls: moves.length === 0 ? balls : after, moves };
}

// The colour of the hole on the square "index", or "undefined" when the square has no hole.
export function holeAt(layout: Layout, index: number): Colour | undefined {
  return colours.find((colour) => layout.holes[colour] === index);
}

// "true" when each coloured ball is in its hole. The grey ball does not count.
// See "## Rules": "The puzzle is solved when all coloured balls are in their holes."
export function allInHoles(balls: readonly Ball[]): boolean {
  return balls.every((ball) => ball.colour === "grey" || ball.isInHole);
}
