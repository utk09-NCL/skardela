import type { TFunction } from "i18next";
import { lineOf } from "./puzzle";
import type { Mode } from "./machine";
import type { Move as LetterMove } from "./rules-check";

// The status text tells the player what to do, what the last letter did, or the result.
export function statusText(
  t: TFunction,
  mode: Mode | null,
  lastMove: LetterMove | null,
  isSolved: boolean,
  mistakes: number,
  size: number,
): string {
  if (mode === null) return t(($) => $.guzzle.status.choose);
  if (isSolved) {
    return t(($) => $.guzzle.status.solved, {
      mode: t(($) => $.guzzle.modes[mode]),
      mistakes: t(($) => $.guzzle.score, { count: mistakes }),
    });
  }
  if (lastMove === null) return t(($) => $.guzzle.status.start);
  const { letter, mark } = lastMove.guess;
  const line = lineOf(lastMove.index, size);
  const lineName = line === undefined ? "" : t(($) => $.guzzle.lines[line]);
  switch (mark) {
    case "correct":
      return t(($) => $.guzzle.status.correct, { letter });
    case "present":
      return t(($) => $.guzzle.status.present, { letter, line: lineName });
    case "absent":
      return t(($) => $.guzzle.status.absent, { letter, line: lineName });
  }
}
