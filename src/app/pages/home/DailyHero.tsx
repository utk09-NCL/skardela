import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { PuzzleRef } from "../../../shared/state/saved-data";
import { useAppStore } from "../../../shared/state/store";
import { useNow } from "../../../shared/useNow";
import { isPuzzleType } from "../../puzzle-types/registry";
import type { TodayCard } from "../../puzzles";
import styles from "./HomePage.module.css";
import { TodayProgress, type Segment } from "./TodayProgress";

// The headline follows the progress of the player: all solved, some solved, a puzzle to continue,
// or nothing yet. A new player sees what Skardela is.
function headline(t: TFunction, solved: number, total: number, canContinue: boolean): string {
  if (solved === total) return t(($) => $.home.hero.solvedAll);
  if (solved > 0) return t(($) => $.home.hero.solvedSome, { solved, count: total - solved });
  return canContinue ? t(($) => $.home.hero.pickUp) : t(($) => $.home.hero.title);
}

// A link to the last puzzle that the player opened and did not solve. It shows only the name of the puzzle.
function ContinueLink({ puzzle }: { puzzle: PuzzleRef }) {
  const { t } = useTranslation();
  const { type } = puzzle;
  if (!isPuzzleType(type)) return null;
  const name = t(($) => $.home.hero.puzzleName, {
    typeName: t(($) => $[type].name),
    level: t(($) => $.levels[puzzle.difficulty]),
  });
  return (
    <Link className={styles.continue} to={`/puzzles/${puzzle.puzzleId}`}>
      <span className={styles.continueLabel}>{t(($) => $.home.hero.continueLabel)}</span>
      <span>{name}</span>
    </Link>
  );
}

// The first section of the home page: the date, the headline, a link to continue and the progress of today.
export function DailyHero({ cards }: { cards: readonly TodayCard[] }) {
  const { t } = useTranslation();
  const solved = useAppStore((state) => state.solved);
  const lastOpened = useAppStore((state) => state.lastOpened);
  const results = useAppStore((state) => state.results);
  // The clock changes each 30 seconds, for the date and for the time to midnight.
  const now = useNow(30_000);

  const segments: Segment[] = cards.flatMap(({ type, levels }) =>
    levels.map(({ id, difficulty }) => ({
      id,
      typeName: t(($) => $[type].name),
      level: t(($) => $.levels[difficulty]),
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
        <p className={styles.date}>{t(($) => $.home.date, { date: new Date(now) })}</p>
        <h1 id="home-title" data-testid="home-page-title" className={styles.heroTitle}>
          {headline(t, solvedToday, segments.length, toContinue !== null)}
        </h1>
        {toContinue !== null && <ContinueLink puzzle={toContinue} />}
        {isNewPlayer && (
          <>
            <p className={styles.intro}>{t(($) => $.home.hero.intro)}</p>
            <div className={styles.ctas}>
              <a className={styles.primary} href="#today">
                {t(($) => $.home.hero.play)}
              </a>
              <a className={styles.secondary} href="#how-it-works">
                {t(($) => $.home.hero.howItWorks)}
              </a>
            </div>
          </>
        )}
      </div>
      <TodayProgress segments={segments} now={now} />
    </section>
  );
}
