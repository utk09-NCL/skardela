import { currentStreak, longestStreak, solvesPerDay } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { useToday } from "../../../shared/useNow";
import { text } from "../../../text/en";
import type { TodayCard } from "../../puzzles";
import { DataActions } from "./DataActions";
import styles from "./HomePage.module.css";
import { PersonalBests } from "./PersonalBests";
import { StatsCalendar } from "./StatsCalendar";

const words = text.home.stats;

// The stats of the player. They come from the solves that the browser saved. There is no account.
// The cards of today give the puzzle types, and the first puzzle for a player without solves.
export function Stats({ cards }: { cards: readonly TodayCard[] }) {
  const results = useAppStore((state) => state.results);
  const solved = useAppStore((state) => state.solved);
  // The clock changes each minute, so the streak and the calendar are correct after midnight.
  const today = useToday();
  const types = cards.map((card) => card.type);
  const [firstCard] = cards;
  const firstLevel = firstCard?.levels[0];
  const first =
    firstCard === undefined || firstLevel === undefined
      ? undefined
      : { id: firstLevel.id, type: firstCard.type, difficulty: firstLevel.difficulty };
  const numbers = [
    { label: words.kpis.streak, value: currentStreak(results, today), isMain: true },
    { label: words.kpis.longest, value: longestStreak(results), isMain: false },
    { label: words.kpis.solved, value: solved.length, isMain: false },
    { label: words.kpis.days, value: solvesPerDay(results).size, isMain: false },
  ];
  return (
    <section id="stats" aria-labelledby="stats-heading" className={styles.section}>
      <div className={styles.statsHeader}>
        <h2 id="stats-heading">{words.heading}</h2>
        <p className={styles.sectionIntro}>{words.note}</p>
      </div>
      <ul className={styles.kpis}>
        {numbers.map(({ label, value, isMain }) => (
          <li key={label} className={styles.kpi}>
            <span className={styles.kpiValue} data-main={isMain}>
              {value}
            </span>
            <span className={styles.kpiLabel}>{label}</span>
          </li>
        ))}
      </ul>
      <div className={styles.statsGrid}>
        <StatsCalendar results={results} today={today} />
        <PersonalBests results={results} types={types} first={first} />
      </div>
      <DataActions />
    </section>
  );
}
