import { useTranslation } from "react-i18next";
import { calendarDays } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import styles from "./HomePage.module.css";

const weeks = 5;

// The colour step of a day: 0 is no solve, then 1–3, 4–6 and 7 or more solves.
function stepOf(solves: number): number {
  if (solves === 0) return 0;
  if (solves <= 3) return 1;
  return solves <= 6 ? 2 : 3;
}

// The solves of each day of the last five weeks, Monday first. Today has a ring.
// Each day has its text for a screen reader. The days after today and the legend are only for the eyes.
export function StatsCalendar({
  results,
  today,
}: {
  results: readonly SolveResult[];
  today: string;
}) {
  const { t } = useTranslation();
  const heading = t(($) => $.home.stats.calendar.heading);
  const days = calendarDays(results, today, weeks);
  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>{heading}</h3>
      <div className={styles.weekdays} aria-hidden="true">
        {t(($) => $.home.stats.calendar.weekdays, { returnObjects: true }).map((weekday, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- two weekdays have the same letter.
          <span key={index}>{weekday}</span>
        ))}
      </div>
      <ol className={styles.days} aria-label={heading}>
        {days.map(({ day, solves, isToday, isFuture }) => (
          <li
            key={day}
            className={styles.day}
            data-step={stepOf(solves)}
            data-today={isToday}
            data-future={isFuture}
            aria-hidden={isFuture}
          >
            {!isFuture && (
              <span className="visually-hidden">
                {t(($) => $.home.stats.calendar.day, { date: day, count: solves })}
              </span>
            )}
          </li>
        ))}
      </ol>
      <ul className={styles.legend} aria-hidden="true">
        {(["none", "low", "mid", "high"] as const).map((step, index) => (
          <li key={step}>
            <span className={styles.day} data-step={index} />
            {t(($) => $.home.stats.calendar.legend[step])}
          </li>
        ))}
      </ul>
    </div>
  );
}
