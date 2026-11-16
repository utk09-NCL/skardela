// The builder of the Latics generator: a board that gets its pieces one by one, and the functions that put a piece
// on the path of the beam. "candidate.ts" uses them to build a board from a solution.
// It is pure: no React, no DOM and no side effects.
import type { Difficulty } from "../../../shared/difficulty";
import { traceBeam, type BeamPart, type BoardLayout } from "./beam";
import {
  directions,
  levelRules,
  mirrors,
  type BeamColour,
  type Direction,
  type LaserData,
  type Monster,
  type Square,
} from "./puzzle";
import { opposite, reflect } from "./rules-check";

type Where = "dry" | "wet" | "any";

// A board that the generator builds piece by piece. It always has the pieces of the solution.
export type Builder = {
  readonly level: Difficulty;
  readonly size: number;
  readonly squares: Square[];
  readonly water: boolean[];
  // Each laser with its square, in the order of the code. The data needs them in reading order.
  readonly lasers: { readonly index: number; readonly laser: LaserData }[];
  // The mirrors on the path of a beam: the mirrors of the board, and the mirrors that go back to the tray.
  readonly boardMirrors: number[];
  readonly trayMirrors: number[];
  readonly random: () => number;
};

export function pick<Item>(builder: Builder, list: readonly Item[]): Item {
  return list[Math.floor(builder.random() * list.length)] as Item;
}

export function between(builder: Builder, low: number, high: number): number {
  return low + Math.floor(builder.random() * (high - low + 1));
}

// The board of the builder for the beam. The lasers are in the reading order of their squares.
export function layoutOf(builder: Builder): BoardLayout {
  const lasers = builder.lasers
    .toSorted((first, second) => first.index - second.index)
    .map(({ laser }) => laser);
  return { squares: builder.squares, water: builder.water, lasers };
}

// A rectangle of water with 2 or more rows and columns.
export function addWater(builder: Builder) {
  const { size } = builder;
  const rows = between(builder, 2, Math.min(4, size - 2));
  const columns = between(builder, 2, Math.min(5, size - 2));
  const top = between(builder, 0, size - rows);
  const left = between(builder, 0, size - columns);
  for (let row = top; row < top + rows; row += 1) {
    for (let column = left; column < left + columns; column += 1) {
      builder.water[row * size + column] = true;
    }
  }
}

// A piece on a random empty square: out of the water ("dry"), in the water ("wet"), or on each square ("any").
// It does not use the squares of "avoid". It gives the square, or "null" when no square is free.
export function place(
  builder: Builder,
  square: Square,
  where: Where,
  avoid: ReadonlySet<number> = new Set(),
): number | null {
  const free = [...builder.squares.keys()].filter((index) => {
    const isWet = builder.water[index] === true;
    const isPlace = where === "any" || (where === "wet" ? isWet : !isWet);
    return builder.squares[index] === "." && isPlace && !avoid.has(index);
  });
  if (free.length === 0) return null;
  const index = pick(builder, free);
  builder.squares[index] = square;
  return index;
}

// A laser with a random direction of the list. It gives the square of the laser.
export function addLaser(
  builder: Builder,
  colour: BeamColour,
  where: Where,
  list: readonly Direction[] = directions,
): number | null {
  const index = place(builder, "L", where);
  if (index !== null)
    builder.lasers.push({ index, laser: { direction: pick(builder, list), colour } });
  return index;
}

// ---------- The path of the beam ----------

// An empty square that the beam goes through: the direction and the colour of the beam there.
type PathSquare = {
  readonly index: number;
  readonly enter: Direction;
  readonly colour: BeamColour;
};

// The empty squares that the beam goes through after the square "from". "from" is a laser or a piece on the path.
// A square that the beam goes through two times is not in the list: a piece there changes two parts of the path.
function squaresAfter(builder: Builder, from: number): PathSquare[] {
  const { parts } = traceBeam(layoutOf(builder));
  const visits = new Map<number, number>();
  for (const { index } of parts.flatMap((part) => part.steps)) {
    visits.set(index, (visits.get(index) ?? 0) + 1);
  }
  const found: PathSquare[] = [];
  // The steps of a part from the position "first", then the parts that start where this part ends:
  // a prism or a filter starts new parts.
  const follow = (part: BeamPart, first: number) => {
    for (const { index, enter } of part.steps.slice(first)) {
      if (builder.squares[index] === "." && visits.get(index) === 1) {
        found.push({ index, enter, colour: part.colour });
      }
    }
    const end = part.steps.at(-1)?.index;
    if (part.end !== "split" && part.end !== "colour") return;
    for (const next of parts.filter((other) => other.from === end)) follow(next, 0);
  };
  for (const part of parts) {
    const at = part.steps.findIndex((step) => step.index === from);
    if (part.from === from) follow(part, 0);
    else if (at !== -1) follow(part, at + 1);
  }
  return found;
}

// A piece on a random square of the path after "from". "accept" selects the squares.
// It gives the square of the piece, or "null" when the path has no such square.
export function addOnPath(
  builder: Builder,
  from: number | null,
  pieceFor: (square: PathSquare) => Square,
  accept: (square: PathSquare) => boolean,
): number | null {
  if (from === null) return null;
  const options = squaresAfter(builder, from).filter((square) => accept(square));
  if (options.length === 0) return null;
  const square = pick(builder, options);
  builder.squares[square.index] = pieceFor(square);
  return square.index;
}

export const isDry = (builder: Builder) => (square: PathSquare) =>
  builder.water[square.index] !== true;

// A mirror that turns the beam by 90°. A mirror along the beam does not change it,
// and a mirror square to the beam sends it back.
function turningMirror(builder: Builder, { enter }: PathSquare): Square {
  const turning = mirrors.filter((mirror) => {
    const out = reflect(enter, mirror);
    return out !== enter && out !== opposite(enter);
  });
  return pick(builder, turning);
}

// Mirrors on the path after "from", each one after the mirror before it: "board" mirrors of the board
// and "tray" mirrors of the tray, in a random order. It gives the last piece on the path.
// With "colour", the mirrors are only on the part of the beam with this colour.
export function addMirrors(
  builder: Builder,
  from: number | null,
  count: { readonly board: number; readonly tray: number },
  colour?: BeamColour,
): number | null {
  const lists = [
    ...Array.from({ length: count.board }, () => builder.boardMirrors),
    ...Array.from({ length: count.tray }, () => builder.trayMirrors),
  ];
  let last = from;
  while (lists.length > 0) {
    const [list] = lists.splice(Math.floor(builder.random() * lists.length), 1);
    const index = addOnPath(
      builder,
      last,
      (square) => turningMirror(builder, square),
      (square) => isDry(builder)(square) && (colour === undefined || square.colour === colour),
    );
    if (index === null) return null;
    list?.push(index);
    last = index;
  }
  return last;
}

// "true" when a straight line across, up and down, or diagonal goes through both squares.
function isInLine(first: number, second: number, size: number): boolean {
  const rows = Math.abs(Math.floor(first / size) - Math.floor(second / size));
  const columns = Math.abs((first % size) - (second % size));
  return rows === 0 || columns === 0 || rows === columns;
}

// A monster at the end of the path, after "from". A monster with a colour is on a beam of its colour.
// On a level with aim, the monster is not in a line with a laser: the player could turn that laser to the monster,
// and then the puzzle needs no mirror.
export function addMonster(builder: Builder, from: number | null, monster: Monster): number | null {
  const colour = { M: undefined, R: "red", B: "blue" }[monster];
  const { canAim } = levelRules[builder.level];
  return addOnPath(
    builder,
    from,
    () => monster,
    (square) =>
      (colour === undefined || square.colour === colour) &&
      !(canAim && builder.lasers.some(({ index }) => isInLine(index, square.index, builder.size))),
  );
}
