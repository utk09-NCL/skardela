import type { TFunction } from "i18next";
import type { LaserData, Square } from "./puzzle";
import type { Game } from "./useGame";
import {
  endSquare,
  monsterSquares,
  pathParts,
  type Beam,
  type BeamPart,
  type PathPart,
} from "./beam";
import type { Layout } from "./water";

// The name of a piece. An empty square is "." in the puzzle data, and "empty" in the text.
function pieceName(t: TFunction, square: Square): string {
  return t(($) => $.latics.pieces[square === "." ? "empty" : square]);
}

// The label of a square for a screen reader, for example "Row 1, column 1, laser, points right".
// The code puts the parts together with ", " between them.
export function squareLabel(
  t: TFunction,
  game: Game,
  index: number,
  laser: LaserData | undefined,
  isHit: boolean,
): string {
  const square = game.squares[index] ?? ".";
  const piece =
    laser === undefined ? pieceName(t, square) : t(($) => $.latics.lasers[laser.colour]);
  return [
    t(($) => $.latics.square.position, {
      row: Math.floor(index / game.size) + 1,
      column: (index % game.size) + 1,
    }),
    game.fromTray.includes(index) ? t(($) => $.latics.square.fromTray, { piece }) : piece,
    laser === undefined
      ? ""
      : t(($) => $.latics.square.points, {
          direction: t(($) => $.latics.directions[laser.direction]),
        }),
    game.config.water[index] === true ? t(($) => $.latics.square.inWater) : "",
    isHit ? t(($) => $.latics.square.hit) : "",
  ]
    .filter((part) => part !== "")
    .join(", ");
}

// "row 2, column 5" for a square index.
function at(t: TFunction, index: number, size: number): string {
  return t(($) => $.latics.at, { row: Math.floor(index / size) + 1, column: (index % size) + 1 });
}

// The end of a part of the beam in words, for example "A wall at row 2, column 5 stops the beam."
export function endText(t: TFunction, part: BeamPart, size: number): string {
  return t(($) => $.latics.ends[part.end], { at: at(t, endSquare(part), size) });
}

function partText(t: TFunction, part: PathPart, colour: BeamPart["colour"], size: number): string {
  const direction = t(($) => $.latics.directions[part.direction]);
  if (part.kind === "move") {
    return t(($) => $.latics.path.move, {
      beam: t(($) => $.latics.beams[colour]),
      direction,
      count: part.squares,
    });
  }
  return t(($) => $.latics.path.turns[part.cause], { at: at(t, part.index, size), direction });
}

// The start of a part in words: the laser, the prism or the filter where the part starts.
function startText(t: TFunction, part: BeamPart, layout: Layout, size: number): string {
  const square = layout.squares[part.from] ?? "L";
  const from = square === "L" ? t(($) => $.latics.lasers[part.colour]) : pieceName(t, square);
  return t(($) => $.latics.path.start, {
    beam: t(($) => $.latics.beams[part.colour]),
    from,
    at: at(t, part.from, size),
  });
}

// The full path of the beam in words: for each part, one sentence for each straight part and each turn,
// and then the end. A beam with more than one part also tells where each part starts.
// The path helps a player who cannot see the beam, and each player who wants to check the angles.
export function pathText(t: TFunction, beam: Beam, layout: Layout): string[] {
  const size = Math.sqrt(layout.squares.length);
  const hasParts = beam.parts.length > 1;
  return beam.parts.flatMap((part) => [
    ...(hasParts ? [startText(t, part, layout, size)] : []),
    ...pathParts(part, layout).map((item) => partText(t, item, part.colour, size)),
    endText(t, part, size),
  ]);
}

// The status text tells the player the result, where the beam ends, or what to do.
// With one part and one monster, the status tells where the beam ends. Otherwise it tells the number of hits.
export function statusText(t: TFunction, game: Game): string {
  const monsters = monsterSquares(game.squares).length;
  const [first] = game.beam?.parts ?? [];
  const isSimple = monsters === 1 && game.beam?.parts.length === 1;
  if (game.isSolved) {
    if (!game.config.liveBeam) {
      return t(($) => $.latics.status.solvedWithMisses, {
        misses: t(($) => $.latics.score, { count: game.misses }),
      });
    }
    return isSimple ? t(($) => $.latics.status.solved) : t(($) => $.latics.status.solvedAll);
  }
  if (game.beam !== null) {
    if (isSimple && first !== undefined) return endText(t, first, game.size);
    return t(($) => $.latics.status.hits, { hit: game.beam.hits.length, count: monsters });
  }
  // The actions of the plan. The tray and the aim are only on some levels.
  const actions = [
    t(($) => $.latics.status.planActions.mirrors),
    ...(game.config.tray > 0 ? [t(($) => $.latics.status.planActions.tray)] : []),
    ...(game.config.canAim ? [t(($) => $.latics.status.planActions.aim)] : []),
  ];
  return t(($) => $.latics.status.plan, { actions });
}
