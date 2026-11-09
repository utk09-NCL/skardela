import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Difficulty } from "../../../shared/difficulty";
import { formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./HomePage.module.css";

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
  const { t } = useTranslation();
  const level = t(($) => $.levels[difficulty]);
  const time = best === undefined ? undefined : formatDuration(best.seconds);
  const mistakes = best?.mistakes;
  const score = mistakes === undefined ? undefined : t(($) => $[type].score, { count: mistakes });
  // The name of the link for a screen reader. It starts with the visible level name.
  const linkName = isSolved
    ? time === undefined && score === undefined
      ? t(($) => $.home.today.levelSolved, { level })
      : score === undefined
        ? t(($) => $.home.today.levelSolvedIn, { level, time })
        : time === undefined
          ? t(($) => $.home.today.levelSolvedWith, { level, score })
          : t(($) => $.home.today.levelSolvedInWith, { level, time, score })
    : t(($) => $.home.today.levelNotSolved, { level });
  return (
    <Link
      className={styles.level}
      data-solved={isSolved}
      data-next={isNext}
      to={`/puzzles/${id}`}
      aria-label={linkName}
    >
      <span className={styles.levelName}>
        {level}
        {isSolved && (
          <span className={styles.levelMark} aria-hidden="true">
            {t(($) => $.home.today.solvedMark)}
          </span>
        )}
      </span>
      {/* A narrow card has no space for the time and the score in one line, thus each has its own line. */}
      <span className={styles.levelStatus}>
        {isSolved
          ? (time ?? t(($) => $.home.today.solvedNoTime))
          : t(($) => $.home.today.notSolved)}
      </span>
      {score !== undefined && <span className={styles.levelStatus}>{score}</span>}
    </Link>
  );
}
