import { hoursAndMinutes, isoDuration, msUntilMidnight } from "../../../shared/state/progress";
import { text } from "../../../text/en";
import styles from "./HomePage.module.css";

const words = text.home.hero;

// One puzzle of today, with its type name and its level name.
export type Segment = { id: string; typeName: string; level: string; isSolved: boolean };

// A bar with one segment for each puzzle of today. A solved puzzle has the orange colour.
// Each segment has its text for a screen reader. The line under the bar gives the count and the time to midnight.
// The time shows its units, for example "3 h 57 min", so nobody reads it as minutes and seconds.
export function TodayProgress({ segments, now }: { segments: readonly Segment[]; now: number }) {
  const solved = segments.filter((segment) => segment.isSolved).length;
  const time = hoursAndMinutes(msUntilMidnight(new Date(now)));
  return (
    <div className={styles.progress}>
      <ol
        className={styles.segments}
        aria-label={words.progressLabel}
        style={{ gridTemplateColumns: `repeat(${segments.length}, 1fr)` }}
      >
        {segments.map(({ id, typeName, level, isSolved }) => (
          <li key={id} className={styles.segment} data-solved={isSolved}>
            <span className="visually-hidden">{words.segment(typeName, level, isSolved)}</span>
          </li>
        ))}
      </ol>
      <p className={styles.progressLine}>
        {words.progress(solved, segments.length)} · {words.newPuzzlesIn}{" "}
        <time dateTime={isoDuration(time)}>
          <span aria-hidden="true">{words.timeShort(time)}</span>
          <span className="visually-hidden">{words.timeLong(time)}</span>
        </time>
      </p>
    </div>
  );
}
