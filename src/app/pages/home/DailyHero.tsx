import { Link } from "react-router";
import type { PuzzleRef } from "../../../shared/state/saved-data";
import { useAppStore } from "../../../shared/state/store";
import { useNow } from "../../../shared/useNow";
import { text } from "../../../text/en";
import { isPuzzleType } from "../../puzzle-types/registry";
import type { TodayCard } from "../../puzzles";
import styles from "./HomePage.module.css";
import { TodayProgress, type Segment } from "./TodayProgress";

const words = text.home.hero;

// The headline follows the progress of the player: all solved, some solved, a puzzle to continue,
// or nothing yet. A new player sees what Skardela is.
function headline(solved: number, total: number, canContinue: boolean): string {
  if (solved === total) return words.solvedAll;
  if (solved > 0) return words.solvedSome(solved, total);
  return canContinue ? words.pickUp : words.title;
}

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

// The first section of the home page: the date, the headline, a link to continue and the progress of today.
export function DailyHero({ cards }: { cards: readonly TodayCard[] }) {
  const solved = useAppStore((state) => state.solved);
  const lastOpened = useAppStore((state) => state.lastOpened);
  const results = useAppStore((state) => state.results);
  // The clock changes each 30 seconds, for the date and for the time to midnight.
  const now = useNow(30_000);

  const segments: Segment[] = cards.flatMap(({ type, levels }) =>
    levels.map(({ id, difficulty }) => ({
      id,
      typeName: text[type].name,
      level: text.levels[difficulty],
      isSolved: solved.includes(id),
    })),
  );
  const solvedToday = segments.filter((segment) => segment.isSolved).length;
  const toContinue =
    lastOpened !== null && !solved.includes(lastOpened.puzzleId) ? lastOpened : null;
  const isNewPlayer = solved.length === 0 && results.length === 0 && lastOpened === null;

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroText}>
        <p className={styles.date}>{text.home.date(new Date(now))}</p>
        <h1 id="home-title" data-testid="home-page-title" className={styles.heroTitle}>
          {headline(solvedToday, segments.length, toContinue !== null)}
        </h1>
        {toContinue !== null && <ContinueLink puzzle={toContinue} />}
        {isNewPlayer && (
          <>
            <p className={styles.intro}>{words.intro}</p>
            <div className={styles.ctas}>
              <a className={styles.primary} href="#today">
                {words.play}
              </a>
              <a className={styles.secondary} href="#how-it-works">
                {words.howItWorks}
              </a>
            </div>
          </>
        )}
      </div>
      <TodayProgress segments={segments} now={now} />
    </section>
  );
}
