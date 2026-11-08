import { Link } from "react-router";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import { puzzleNumber, type LoadedPuzzle } from "../../puzzles";
import { PlayTimer } from "./PlayTimer";
import styles from "./PuzzlePage.module.css";

const page = text.puzzlePage;

// The top of the panel: "Now playing", the name of the puzzle type, the level and the details on the left,
// and the timer and the close link on the right.
export function PuzzleHeader({ loaded }: { loaded: LoadedPuzzle }) {
  const { type, puzzle } = loaded;
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{page.nowPlaying}</p>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{text[type].name}</h1>
          <p className={styles.level}>{text.levels[puzzle.difficulty]}</p>
        </div>
        <ul className={styles.details} aria-label={page.detailsLabel}>
          <li>{page.puzzleNumber(puzzleNumber(puzzle.id))}</li>
          <li>{page.author(puzzle.author)}</li>
        </ul>
      </div>
      <div className={styles.headerActions}>
        <PlayTimer puzzleId={puzzle.id} />
        <Link className={styles.close} to="/" aria-label={page.close}>
          {symbols.puzzlePage.close}
        </Link>
      </div>
    </header>
  );
}
