import { useState } from "react";
import { addDays, bestResult, solvesOnDay } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { useToday } from "../../../shared/useNow";
import { text } from "../../../text/en";
import type { TodayCard } from "../../puzzles";
import { CardShare } from "./CardShare";
import styles from "./HomePage.module.css";
import { LevelLink } from "./LevelLink";
import { PuzzleIcon } from "./PuzzleIcon";

const words = text.home.today;

// A puzzle type is new for two weeks after the date when it came to the site.
const newDays = 14;

function isNew(card: TodayCard, today: string): boolean {
  return addDays(card.added, newDays) > today;
}

// One card for each puzzle type: the icon, the name, the details, the summary and a link to each level.
// A level is solved when the player solved its puzzle today. Its time is the best solve of today.
// A solve of the same puzzle on an earlier day does not count. See "solvesOnDay".
// The next level to play is the first level that is not solved.
function Card({ card, today }: { card: TodayCard; today: string }) {
  const results = useAppStore((state) => state.results);
  const { type, levels, author, added } = card;
  const { name, summary } = text[type];
  const todays = solvesOnDay(results, today);
  const bests = levels.map(({ id }) => bestResult(todays, id));
  const next = levels.find((_, index) => bests[index] === undefined);
  return (
    <li className={styles.card}>
      <div className={styles.cardHead}>
        <PuzzleIcon type={type} />
        <div className={styles.cardText}>
          <h2 className={styles.cardTitle}>{name}</h2>
          <p className={styles.cardDetails}>
            <span>
              {words.by} <span className={styles.author}>{author}</span>
            </span>
            <span>{words.added(added)}</span>
            {isNew(card, today) && <span className={styles.newTag}>{words.newTag}</span>}
          </p>
        </div>
        <CardShare card={card} bests={bests} day={today} />
      </div>
      <p className={styles.summary}>{summary}</p>
      <nav aria-label={words.levelsLabel(name)}>
        <ul className={styles.levels}>
          {levels.map(({ id, difficulty }, index) => (
            <li key={id}>
              <LevelLink
                id={id}
                type={type}
                difficulty={difficulty}
                isSolved={bests[index] !== undefined}
                best={bests[index]}
                isNext={next?.id === id}
              />
            </li>
          ))}
        </ul>
      </nav>
    </li>
  );
}

type Filter = keyof typeof words.filters;

// Today's puzzles: the filter chips, then one card for each puzzle type.
// "New" shows the puzzle types of the last two weeks. Without a new puzzle type, the chips do not show.
export function TodayPuzzles({ cards }: { cards: readonly TodayCard[] }) {
  // The clock changes each minute, so the new types and the date in a share text are correct after midnight.
  const today = useToday();
  const [filter, setFilter] = useState<Filter>("all");
  const newCards = cards.filter((card) => isNew(card, today));
  const counts: Record<Filter, number> = { all: cards.length, new: newCards.length };
  // After midnight, the last new type can become old. Then the page shows all types again.
  const active: Filter = filter === "new" && newCards.length > 0 ? "new" : "all";
  const shown = active === "new" ? newCards : cards;
  return (
    <section id="today" data-testid="puzzle-types-section" className={styles.today}>
      {newCards.length > 0 && (
        <fieldset className={styles.filters}>
          <legend className="visually-hidden">{words.filtersLabel}</legend>
          {(Object.keys(words.filters) as Filter[]).map((key) => (
            <button
              key={key}
              type="button"
              className={styles.chip}
              aria-pressed={active === key}
              onClick={() => {
                setFilter(key);
              }}
            >
              {words.filters[key]}
              <span className={styles.chipCount}>{counts[key]}</span>
            </button>
          ))}
        </fieldset>
      )}
      <ul className={styles.cards}>
        {shown.map((card) => (
          <Card key={card.type} card={card} today={today} />
        ))}
      </ul>
    </section>
  );
}
