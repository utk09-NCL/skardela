import type { TFunction } from "i18next";
import type { Point } from "./puzzle";
import { maxSteps, stepsPerSecond, type Board, type Flight } from "./rules-check";
import type { Game } from "./useGame";

// A position in words, for example "x 12, y 40". See "## Screen reader" in "rules.md".
// A position of the probe after a flight is not a whole number, thus it is rounded.
export function positionText(t: TFunction, point: Point): string {
  return t(($) => $.orbital.at, { x: Math.round(point.x), y: Math.round(point.y) });
}

// Why the flight stopped, for example "The probe hit the big planet at x 50, y 45."
function endText(t: TFunction, flight: Flight): string {
  const { end } = flight;
  switch (end.type) {
    case "ring":
      return t(($) => $.orbital.status.ends.ring);
    case "planet":
      return t(($) => $.orbital.status.ends.planet, {
        size: t(($) => $.orbital.sizes[end.planet.size]),
        at: positionText(t, end.planet),
      });
    case "edge":
      return t(($) => $.orbital.status.ends.edge);
    case "time":
      return t(($) => $.orbital.status.ends.time, { seconds: maxSteps / stepsPerSecond });
  }
}

// The status text tells the player what to do, or what the last flight did and the misses.
// The status box is a live region, thus a screen reader tells each new text. See "## Screen reader" in "rules.md".
// It changes only at the end of a flight. After the solve, it tells the last launch and then the solve.
export function statusText(t: TFunction, game: Game): string {
  const flight = game.lastFlight;
  if (flight === null) return t(($) => $.orbital.status.start);
  const aim = t(($) => $.orbital.status.aim, {
    angle: flight.aim.angle,
    power: flight.aim.power,
  });
  const launch = `${aim} ${endText(t, flight)}`;
  if (game.isSolved) {
    const misses = t(($) => $.orbital.score, { count: game.misses });
    return `${launch} ${t(($) => $.orbital.status.solved, { misses })}`;
  }
  const closest = t(($) => $.orbital.status.closest, { count: flight.closest });
  return `${launch} ${closest} ${t(($) => $.orbital.misses, { count: game.misses })}`;
}

// The list of the items on the board for a screen reader, for example "Probe at x 12, y 40.",
// "Ring at x 82, y 30." and "Big planet at x 50, y 45."
export function itemTexts(t: TFunction, board: Board, probe: Point): string[] {
  return [
    t(($) => $.orbital.items.probe, { at: positionText(t, probe) }),
    t(($) => $.orbital.items.ring, { at: positionText(t, board.ring) }),
    ...board.planets.map((planet) =>
      t(($) => $.orbital.items.planets[planet.size], { at: positionText(t, planet) }),
    ),
  ];
}
