import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { symbols } from "../../../text/symbols";
import { puzzleNumber, type LoadedPuzzle } from "../../puzzles";
import { PlayTimer } from "./PlayTimer";
import styles from "./PuzzlePage.module.css";

// The top of the panel: "Now playing", the name of the puzzle type, the level and the details on the left,
// and the timer and the close link on the right.
export function PuzzleHeader({ loaded }: { loaded: LoadedPuzzle }) {
  const { t } = useTranslation();
  const { type, puzzle } = loaded;
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{t(($) => $.puzzlePage.nowPlaying)}</p>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t(($) => $[type].name)}</h1>
          <p className={styles.level}>{t(($) => $.levels[puzzle.difficulty])}</p>
        </div>
        <ul className={styles.details} aria-label={t(($) => $.puzzlePage.detailsLabel)}>
          <li>{t(($) => $.puzzlePage.puzzleNumber, { number: puzzleNumber(puzzle.id) })}</li>
          <li>{t(($) => $.puzzlePage.author, { author: puzzle.author })}</li>
        </ul>
      </div>
      <div className={styles.headerActions}>
        <PlayTimer puzzleId={puzzle.id} />
        <Link className={styles.close} to="/" aria-label={t(($) => $.puzzlePage.close)}>
          {symbols.puzzlePage.close}
        </Link>
      </div>
    </header>
  );
}
