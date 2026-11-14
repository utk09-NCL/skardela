import { text } from "../../../text/en";
import type { Point } from "./puzzle";
import { maxSteps, stepsPerSecond, type Board, type Flight } from "./rules-check";
import type { Game } from "./useGame";

const words = text.orbital;

// A position in words, for example "x 12, y 40". See "## Screen reader" in "rules.md".
// A position of the probe after a flight is not a whole number, thus it is rounded.
function positionText(point: Point): string {
  return words.at(Math.round(point.x), Math.round(point.y));
}

// Why the flight stopped, for example "The probe hit the big planet at x 50, y 45."
function endText(flight: Flight): string {
  const { end } = flight;
  switch (end.type) {
    case "ring":
      return words.status.ends.ring;
    case "planet":
      return words.status.ends.planet(words.sizes[end.planet.size], positionText(end.planet));
    case "edge":
      return words.status.ends.edge;
    case "time":
      return words.status.ends.time(maxSteps / stepsPerSecond);
  }
}

// The status text tells the player what to do, or what the last flight did and the misses.
// The status box is a live region, thus a screen reader tells each new text. See "## Screen reader" in "rules.md".
// It changes only at the end of a flight. After the solve, it tells the last launch and then the solve.
export function statusText(game: Game): string {
  const flight = game.lastFlight;
  if (flight === null) return words.status.start;
  const launch = `${words.status.aim(flight.aim.angle, flight.aim.power)} ${endText(flight)}`;
  if (game.isSolved) return `${launch} ${words.status.solved(game.score)}`;
  return `${launch} ${words.status.closest(flight.closest)} ${words.misses(game.score)}`;
}

// The list of the items on the board for a screen reader, for example "Probe at x 12, y 40.",
// "Ring at x 82, y 30." and "Big planet at x 50, y 45."
export function itemTexts(board: Board, probe: Point): string[] {
  return [
    words.items.probe(positionText(probe)),
    words.items.ring(positionText(board.ring)),
    ...board.planets.map((planet) =>
      words.items.planet(words.sizes[planet.size], positionText(planet)),
    ),
  ];
}
