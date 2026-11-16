import { Link } from "react-router";
import type { PuzzleRef } from "../../../shared/state/saved-data";
import { dayKey, solvesOnDay } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { useNow } from "../../../shared/useNow";
import { text } from "../../../text/en";
import { isPuzzleType } from "../../puzzle-types/registry";
import { isPuzzleId, type TodayCard } from "../../puzzles";
import styles from "./HomePage.module.css";
import { TodayProgress } from "./TodayProgress";

const words = text.home.hero;

// A link to the last puzzle that the player opened and did not solve. It shows only the name of the puzzle.
function ContinueLink({ puzzle }: { puzzle: PuzzleRef }) {
  if (!isPuzzleType(puzzle.type)) return null;
  const name = words.puzzleName(text[puzzle.type].name, text.levels[puzzle.difficulty]);
  return (
    <Link className={styles.continue} to={`/puzzles/${puzzle.puzzleId}`}>
      <span className={styles.continueLabel}>{words.continueLabel}</span>
      <span>{name}</span>
    </Link>
  );
}

// The first section of the home page: the date, the title, what Skardela is and a link to continue on the left,
// and the progress of today on the right.
export function DailyHero({ cards }: { cards: readonly TodayCard[] }) {
  const solved = useAppStore((state) => state.solved);
  const results = useAppStore((state) => state.results);
  const lastOpened = useAppStore((state) => state.lastOpened);
  // The clock changes each 30 seconds, for the date, the solves of today and the time to midnight.
  const now = useNow(30_000);

  // The ring counts the puzzles of today that the player solved today.
  const todays = solvesOnDay(results, dayKey(new Date(now)));
  const todayIds = cards.flatMap(({ levels }) => levels.map(({ id }) => id));
  const solvedToday = todayIds.filter((id) =>
    todays.some(({ puzzleId }) => puzzleId === id),
  ).length;
  // A puzzle from before the daily numbers has an ID of the old form. Its page does not exist now.
  const toContinue =
    lastOpened !== null && !solved.includes(lastOpened.puzzleId) && isPuzzleId(lastOpened.puzzleId)
      ? lastOpened
      : null;

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroText}>
        <p className={styles.date}>{text.home.date(new Date(now))}</p>
        <h1 id="home-title" data-testid="home-page-title" className={styles.heroTitle}>
          {words.title}
        </h1>
        <p className={styles.intro}>{words.intro}</p>
        {toContinue !== null && <ContinueLink puzzle={toContinue} />}
      </div>
      <TodayProgress solved={solvedToday} total={todayIds.length} now={now} />
    </section>
  );
}
