import { useTranslation } from "react-i18next";
import { hoursAndMinutes, isoDuration, msUntilMidnight } from "../../../shared/state/progress";
import styles from "./HomePage.module.css";
import { timeLong, timeShort } from "./timeText";

// One puzzle of today, with its type name and its level name.
export type Segment = { id: string; typeName: string; level: string; isSolved: boolean };

// A bar with one segment for each puzzle of today. A solved puzzle has the orange colour.
// Each segment has its text for a screen reader. The line under the bar gives the count and the time to midnight.
// The time shows its units, for example "3 h 57 min", so nobody reads it as minutes and seconds.
export function TodayProgress({ segments, now }: { segments: readonly Segment[]; now: number }) {
  const { t } = useTranslation();
  const solved = segments.filter((segment) => segment.isSolved).length;
  const time = hoursAndMinutes(msUntilMidnight(new Date(now)));
  return (
    <div className={styles.progress}>
      <ol
        className={styles.segments}
        aria-label={t(($) => $.home.hero.progressLabel)}
        style={{ gridTemplateColumns: `repeat(${segments.length}, 1fr)` }}
      >
        {segments.map(({ id, typeName, level, isSolved }) => (
          <li key={id} className={styles.segment} data-solved={isSolved}>
            <span className="visually-hidden">
              {isSolved
                ? t(($) => $.home.hero.segmentSolved, { typeName, level })
                : t(($) => $.home.hero.segmentNotSolved, { typeName, level })}
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.progressLine}>
        {t(($) => $.home.hero.progress, { solved, total: segments.length })} ·{" "}
        {t(($) => $.home.hero.newPuzzlesIn)}{" "}
        <time dateTime={isoDuration(time)}>
          <span aria-hidden="true">{timeShort(t, time)}</span>
          <span className="visually-hidden">{timeLong(t, time)}</span>
        </time>
      </p>
    </div>
  );
}
