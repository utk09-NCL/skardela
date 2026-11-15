import { Link } from "react-router";
import { solvesOnDay } from "../../../shared/state/progress";
import { useAppStore } from "../../../shared/state/store";
import { useToday } from "../../../shared/useNow";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import type { LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzlePage.module.css";

const page = text.puzzlePage;

// The tabs link to today's puzzle of each level of this type. A level that the player solved today
// shows a check mark. A solve of the same puzzle on an earlier day does not count.
// The tab of the level of this puzzle shows as current. It has "aria-current" only when the puzzle
// is today's puzzle, because a random puzzle is a different page.
export function LevelTabs({ loaded }: { loaded: LoadedPuzzle }) {
  const results = useAppStore((state) => state.results);
  // The clock changes each minute, so the check marks are correct after midnight.
  const todays = solvesOnDay(results, useToday());
  const { type, puzzle, today } = loaded;
  if (today.length === 0) return null;
  return (
    <nav aria-label={page.levelsLabel(text[type].name)}>
      <ul className={styles.tabs}>
        {today.map(({ id, difficulty }) => (
          <li key={id}>
            <Link
              className={styles.tab}
              to={`/puzzles/${id}`}
              data-current={difficulty === puzzle.difficulty}
              aria-current={id === puzzle.id ? "page" : undefined}
            >
              {text.levels[difficulty]}
              {todays.some(({ puzzleId }) => puzzleId === id) && (
                <span className={styles.tabMark}>
                  <span aria-hidden="true">{symbols.progress.solved}</span>
                  <span className="visually-hidden">{page.levelSolved}</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
