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

// A link to the puzzle of one level, with its status. A solved level shows a check mark and the result
// of its best solve: the time and the score, for example "1:42" and "0 mistakes". The next level to play has a ring.
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
      aria-label={words.levelLink(level, isSolved ? { time, score } : undefined)}
    >
      <span className={styles.levelName}>
        {level}
        {isSolved && (
          <span className={styles.levelMark} aria-hidden="true">
            {words.solvedMark}
          </span>
        )}
      </span>
      {/* A narrow card has no space for the time and the score in one line, thus each has its own line. */}
      <span className={styles.levelStatus}>
        {isSolved ? (time ?? words.solvedNoTime) : words.notSolved}
      </span>
      {score !== undefined && <span className={styles.levelStatus}>{score}</span>}
    </Link>
  );
}
