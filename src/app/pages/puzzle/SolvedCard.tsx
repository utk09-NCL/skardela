import { useTranslation } from "react-i18next";
import { usePlaySession } from "../../../shared/state/playSession";
import { useAppStore } from "../../../shared/state/store";
import { useToday } from "../../../shared/useNow";
import { puzzleNumber, type LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzlePage.module.css";
import { ResultNumbers } from "./ResultNumbers";
import { ResultShare } from "./ResultShare";

// The result card. It shows after a solve: the time, the score and the time against the average,
// the share text with a button to copy or share it, and a link to the next level of today.
// The solve comes from the saved data: it is the last solve of this puzzle. The play session tells
// that the player solved the puzzle on this visit.
export function SolvedCard({ loaded }: { loaded: LoadedPuzzle }) {
  const { t } = useTranslation();
  const { type, puzzle } = loaded;
  const current = usePlaySession((session) => session.puzzleId);
  const solvedAt = usePlaySession((session) => session.solvedAt);
  const results = useAppStore((state) => state.results);
  const solved = useAppStore((state) => state.solved);
  // The clock changes each minute, so the date in the share text is correct after midnight.
  const day = useToday();
  if (current !== puzzle.id || solvedAt === null) return null;
  const solve = results.findLast((result) => result.puzzleId === puzzle.id);
  if (solve === undefined) return null;
  const level = t(($) => $.levels[puzzle.difficulty]);
  const number = puzzleNumber(puzzle.id);

  return (
    <section className={styles.solved} aria-labelledby="solved-heading">
      <div className={styles.solvedHead}>
        <h2 id="solved-heading" className={styles.solvedTitle}>
          {t(($) => $.puzzlePage.result.title)}
        </h2>
        <p className={styles.solvedPuzzle}>
          {t(($) => $.puzzlePage.result.puzzle, {
            typeName: t(($) => $[type].name),
            level,
            number,
          })}
        </p>
      </div>
      <ResultNumbers type={type} level={level} solve={solve} results={results} />
      <ResultShare loaded={loaded} solve={solve} results={results} solved={solved} day={day} />
    </section>
  );
}
