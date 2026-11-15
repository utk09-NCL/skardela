import { Link } from "react-router";
import type { Difficulty } from "../../../shared/difficulty";
import { formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { text } from "../../../text/en";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./HomePage.module.css";

const words = text.home.today;

type LevelProps = {
  id: string;
  type: PuzzleType;
  difficulty: Difficulty;
  isSolved: boolean;
  // The best solve of this puzzle. A puzzle can be solved without a saved solve, for example after an import.
  best: SolveResult | undefined;
  isNext: boolean;
};

type StatusProps = { isSolved: boolean; time: string | undefined; isNext: boolean };

// The status under the level name: a check mark and the best time of a solved level, "play" on the next level
// to play, and a dash on the other levels. The check mark is only for the eyes: the name of the link says "solved".
function LevelStatus({ isSolved, time, isNext }: StatusProps) {
  if (!isSolved) {
    return <span className={styles.levelStatus}>{isNext ? words.next : words.notSolved}</span>;
  }
  return (
    <span className={styles.levelStatus}>
      <span aria-hidden="true">{words.solvedMark}</span> {time ?? words.solvedNoTime}
    </span>
  );
}

// A link to the puzzle of one level, with its status. The next level to play has a ring.
// The name of the link tells a screen reader the full result: the time and the score, for example
// "Medium, solved in 2:14 with 1 mistake". The screen shows only the time.
export function LevelLink({ id, type, difficulty, isSolved, best, isNext }: LevelProps) {
  const level = text.levels[difficulty];
  const time = best === undefined ? undefined : formatDuration(best.seconds);
  const score = best?.mistakes === undefined ? undefined : text[type].score(best.mistakes);
  return (
    <Link
      className={styles.level}
      data-solved={isSolved}
      data-next={isNext}
      to={`/puzzles/${id}`}
      aria-label={words.levelLink(level, isSolved ? { time, score } : undefined, isNext)}
    >
      {/* The space keeps the two words apart in the text of the link, for voice control. */}
      <span className={styles.levelName}>{level}</span>{" "}
      <LevelStatus isSolved={isSolved} time={time} isNext={isNext} />
    </Link>
  );
}
