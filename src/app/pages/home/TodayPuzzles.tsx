import { bestResult } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { useToday } from "../../../shared/useNow";
import { text } from "../../../text/en";
import type { TodayCard } from "../../puzzles";
import { CardActions } from "./CardActions";
import styles from "./HomePage.module.css";
import { LevelLink } from "./LevelLink";
import { PuzzleIcon } from "./PuzzleIcon";

const words = text.home.today;

// One card for each puzzle type, with a link to today's puzzle of each level.
// The main link goes to the first level that the player did not solve. See "CardActions" for the last row.
function Card({ card, day }: { card: TodayCard; day: string }) {
  const solved = useAppStore((state) => state.solved);
  const results = useAppStore((state) => state.results);
  const { type, levels } = card;
  const { name, summary } = text[type];
  const next = levels.find(({ id }) => !solved.includes(id));
  const bests = levels.map(({ id }) => (solved.includes(id) ? bestResult(results, id) : undefined));
  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <PuzzleIcon type={type} />
        <div className={styles.cardText}>
          <h3 className={styles.cardTitle}>{name}</h3>
          <p className={styles.summary}>{summary}</p>
        </div>
      </div>
      <nav aria-label={words.levelsLabel(name)}>
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
  return (
    <section
      id="today"
      data-testid="puzzle-types-section"
      aria-labelledby="today-heading"
      className={styles.section}
    >
      <div className={styles.sectionHeader}>
        <h2 id="today-heading">{words.heading}</h2>
        <p className={styles.sectionIntro}>{words.intro}</p>
      </div>
      <ul className={styles.cards}>
        {cards.map((card) => (
          <Card key={card.type} card={card} day={day} />
        ))}
      </ul>
    </section>
  );
}
