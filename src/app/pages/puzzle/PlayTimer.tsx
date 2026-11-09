import { useTranslation } from "react-i18next";
import { usePlaySession } from "../../../shared/state/playSession";
import { formatDuration } from "../../../shared/state/progress";
import { useNow } from "../../../shared/useNow";
import styles from "./PuzzlePage.module.css";

// The time since the game started. It stops at the solve. The board starts and ends the play session,
// thus a restart starts the timer again. Before the game starts, for example before the player selects
// a mode in Guzzle, the timer shows "0:00".
// The role "timer" does not read each second aloud. A screen reader reads the time when the player goes to it.
export function PlayTimer({ puzzleId }: { puzzleId: string }) {
  const { t } = useTranslation();
  const { puzzleId: current, startedAt, solvedAt } = usePlaySession();
  const isRunning = current === puzzleId && startedAt !== null && solvedAt === null;
  const now = useNow(1000, isRunning);
  const seconds =
    current === puzzleId && startedAt !== null ? ((solvedAt ?? now) - startedAt) / 1000 : 0;
  return (
    <p className={styles.timer} role="timer">
      <span className="visually-hidden">{t(($) => $.puzzlePage.timerLabel)} </span>
      {formatDuration(seconds)}
    </p>
  );
}
