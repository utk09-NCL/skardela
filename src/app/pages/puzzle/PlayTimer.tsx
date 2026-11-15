import { usePlaySession } from "../../../shared/state/playSession";
import { formatDuration } from "../../../shared/state/progress";
import { useNow } from "../../../shared/useNow";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import styles from "./PuzzlePage.module.css";

// The time since the game started. It stops at the solve. The board starts and ends the play session,
// thus a restart starts the timer again. Before the game starts, for example before the player selects
// a mode in Guzzle, the timer shows "0:00".
// The role "timer" does not read each second aloud. A screen reader reads the time when the player goes to it.
// After the solve, the timer is green and shows a check mark. The status line tells the solve in words.
export function PlayTimer({ puzzleId }: { puzzleId: string }) {
  const { puzzleId: current, startedAt, solvedAt } = usePlaySession();
  const isRunning = current === puzzleId && startedAt !== null && solvedAt === null;
  const now = useNow(1000, isRunning);
  const seconds =
    current === puzzleId && startedAt !== null ? ((solvedAt ?? now) - startedAt) / 1000 : 0;
  const isSolved = current === puzzleId && solvedAt !== null;
  return (
    <p className={styles.timer} role="timer" data-solved={isSolved}>
      <span className="visually-hidden">{text.puzzlePage.timerLabel} </span>
      {isSolved && <span aria-hidden="true">{symbols.progress.solved}</span>}
      {formatDuration(seconds)}
    </p>
  );
}
