import { calendarDays } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { text } from "../../../text/en";
import styles from "./StatsPage.module.css";

const words = text.stats.calendar;
const weeks = 5;

// The colour step of a day: 0 is no puzzle, then 1–3, 4–6 and 7 or more puzzles.
function stepOf(puzzles: number): number {
  if (puzzles === 0) return 0;
  if (puzzles <= 3) return 1;
  return puzzles <= 6 ? 2 : 3;
}

// The puzzles that the player solved on each day of the last five weeks, Monday first. Today has a ring.
// The title shows the first and the last day of the calendar.
// A day with puzzles shows their number, so the colour is not the only signal. The number is for the eyes.
// Each day has its text for a screen reader. The days after today and the legend are only for the eyes.
export function StatsCalendar({
  results,
  today,
}: {
  results: readonly SolveResult[];
  today: string;
}) {
  const days = calendarDays(results, today, weeks);
  const first = days[0]?.day;
  const last = days.at(-1)?.day;
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>{words.heading}</h2>
        {first !== undefined && last !== undefined && (
          <p className={styles.panelDetail}>{words.range(first, last)}</p>
        )}
      </div>
      <div className={styles.weekdays} aria-hidden="true">
        {words.weekdays.map((weekday, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- two weekdays have the same letter.
          <span key={index}>{weekday}</span>
        ))}
      </div>
      <ol className={styles.days} aria-label={words.heading}>
        {days.map(({ day, puzzles, isToday, isFuture }) => (
          <li
            key={day}
            className={styles.day}
            data-step={stepOf(puzzles)}
            data-today={isToday}
            data-future={isFuture}
            aria-hidden={isFuture}
          >
            {puzzles > 0 && !isFuture && <span aria-hidden="true">{puzzles}</span>}
            {!isFuture && <span className="visually-hidden">{words.day(day, puzzles)}</span>}
          </li>
        ))}
      </ol>
      <ul className={styles.legend} aria-hidden="true">
        {(["none", "low", "mid", "high"] as const).map((step, index) => (
          <li key={step}>
            <span className={styles.day} data-step={index} />
            {words.legend[step]}
          </li>
        ))}
      </ul>
    </div>
  );
}
