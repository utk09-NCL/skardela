import type { CSSProperties } from "react";
import { hoursAndMinutes, isoDuration, msUntilMidnight } from "../../../shared/state/progress";
import { text } from "../../../text/en";
import styles from "./HomePage.module.css";

const words = text.home.hero;

type TodayProgressProps = { solved: number; total: number; now: number };

// A ring that fills with the solved puzzles of today, with the count in its middle, for example "7/18".
// The ring and the short count are only for the eyes. A screen reader reads one sentence, for example
// "7 of 18 puzzles solved today". The time to midnight shows its units, for example "3 h 57 min",
// so nobody reads it as minutes and seconds.
export function TodayProgress({ solved, total, now }: TodayProgressProps) {
  const time = hoursAndMinutes(msUntilMidnight(new Date(now)));
  // The CSS reads "--part", from 0 to 1, to fill the ring.
  const ringStyle: CSSProperties & { "--part": number } = {
    "--part": total === 0 ? 0 : solved / total,
  };
  return (
    <div className={styles.progress}>
      <p className={styles.ring} style={ringStyle}>
        <span aria-hidden="true">
          <span className={styles.ringCount}>{solved}</span>
          <span className={styles.ringTotal}>/{total}</span>
        </span>
        <span className="visually-hidden">{words.progress(solved, total)}</span>
      </p>
      <div className={styles.progressText}>
        <p className={styles.progressTitle} aria-hidden="true">
          {words.solvedToday}
        </p>
        <p className={styles.progressLine}>
          {words.newPuzzlesIn}{" "}
          <time dateTime={isoDuration(time)}>
            <span aria-hidden="true">{words.timeShort(time)}</span>
            <span className="visually-hidden">{words.timeLong(time)}</span>
          </time>
        </p>
      </div>
    </div>
  );
}
