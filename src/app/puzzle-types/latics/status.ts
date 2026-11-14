import { text } from "../../../text/en";
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

const words = text.latics;

// "row 2, column 5" for a square index.
function at(index: number, size: number): string {
  return words.at(Math.floor(index / size) + 1, (index % size) + 1);
}

// The end of a part of the beam in words, for example "A wall at row 2, column 5 stops the beam."
export function endText(part: BeamPart, size: number): string {
  return words.ends[part.end](at(endSquare(part), size));
}

function partText(part: PathPart, colour: BeamPart["colour"], size: number): string {
  if (part.kind === "move") {
    return words.path.move(words.directions[part.direction], part.squares, colour);
  }
  return words.path.turns[part.cause](at(part.index, size), words.directions[part.direction]);
}

// The start of a part in words: the laser, the prism or the filter where the part starts.
function startText(part: BeamPart, layout: Layout, size: number): string {
  const square = layout.squares[part.from] ?? "L";
  const from = square === "L" ? words.laserName(part.colour) : words.pieces[square];
  return words.path.start(part.colour, from, at(part.from, size));
}

// The full path of the beam in words: for each part, one sentence for each straight part and each turn,
// and then the end. A beam with more than one part also tells where each part starts.
// The path helps a player who cannot see the beam, and each player who wants to check the angles.
export function pathText(beam: Beam, layout: Layout): string[] {
  const size = Math.sqrt(layout.squares.length);
  const hasParts = beam.parts.length > 1;
  return beam.parts.flatMap((part) => [
    ...(hasParts ? [startText(part, layout, size)] : []),
    ...pathParts(part, layout).map((item) => partText(item, part.colour, size)),
    endText(part, size),
  ]);
}

// The status text tells the player the result, where the beam ends, or what to do.
// With one part and one monster, the status tells where the beam ends. Otherwise it tells the number of hits.
export function statusText(game: Game): string {
  const monsters = monsterSquares(game.squares).length;
  const [first] = game.beam?.parts ?? [];
  const isSimple = monsters === 1 && game.beam?.parts.length === 1;
  if (game.isSolved) {
    if (!game.config.liveBeam) return words.status.solvedWithMisses(game.score);
    return isSimple ? words.status.solved : words.status.solvedAll;
  }
  if (game.beam !== null) {
    if (isSimple && first !== undefined) return endText(first, game.size);
    return words.status.hits(game.beam.hits.length, monsters);
  }
  return words.status.plan({ tray: game.config.tray > 0, aim: game.config.canAim });
}
