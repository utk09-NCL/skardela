import { useTranslation } from "react-i18next";
import { bestResult } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { useToday } from "../../../shared/useNow";
import type { TodayCard } from "../../puzzles";
import { CardActions } from "./CardActions";
import styles from "./HomePage.module.css";
import { LevelLink } from "./LevelLink";
import { PuzzleIcon } from "./PuzzleIcon";

// One card for each puzzle type, with a link to today's puzzle of each level.
// The main link goes to the first level that the player did not solve. See "CardActions" for the last row.
function Card({ card, day }: { card: TodayCard; day: string }) {
  const { t } = useTranslation();
  const solved = useAppStore((state) => state.solved);
  const results = useAppStore((state) => state.results);
  const { type, levels } = card;
  const name = t(($) => $[type].name);
  const next = levels.find(({ id }) => !solved.includes(id));
  const bests = levels.map(({ id }) => (solved.includes(id) ? bestResult(results, id) : undefined));
  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <PuzzleIcon type={type} />
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>{name}</h3>
          <p className={styles.summary}>{t(($) => $[type].summary)}</p>
        </div>
      </div>
      <nav aria-label={t(($) => $.home.today.levelsLabel, { typeName: name })}>
        <ul className={styles.levels}>
          {levels.map(({ id, difficulty }, index) => (
            <li key={id}>
              <LevelLink
                id={id}
                type={type}
                difficulty={difficulty}
                isSolved={solved.includes(id)}
                best={bests[index]}
                isNext={next?.id === id}
              />
            </li>
          ))}
        </ul>
      </nav>
      <CardActions card={card} bests={bests} next={next} day={day} />
    </li>
  );
}

export function TodayPuzzles({ cards }: { cards: readonly TodayCard[] }) {
  // The clock changes each minute, so the date in a share text is correct after midnight.
  const day = useToday();
  const { t } = useTranslation();
  return (
    <section
      id="today"
      data-testid="puzzle-types-section"
      aria-labelledby="today-heading"
      className={styles.section}
    >
      <div className={styles.sectionHeader}>
        <h2 id="today-heading">{t(($) => $.home.today.heading)}</h2>
        <p className={styles.sectionIntro}>{t(($) => $.home.today.intro)}</p>
      </div>
      <ul className={styles.cards}>
        {cards.map((card) => (
          <Card key={card.type} card={card} day={day} />
        ))}
      </ul>
    </section>
  );
}
