import { Link } from "react-router";
import { text } from "../../../text/en";
import { symbols } from "../../../text/symbols";
import { puzzleNumber, type LoadedPuzzle } from "../../puzzles";
import { LevelTabs } from "./LevelTabs";
import { PlayTimer } from "./PlayTimer";
import { PuzzleActions } from "./PuzzleActions";
import styles from "./PuzzlePage.module.css";

const page = text.puzzlePage;

type PuzzleHeaderProps = { loaded: LoadedPuzzle; onRestart: () => void };

// The top of the page: the link back to all puzzles, then the name and the details on the left,
// and the level tabs, the timer and the actions on the right.
export function PuzzleHeader({ loaded, onRestart }: PuzzleHeaderProps) {
  const { type, id, difficulty, author } = loaded;
  const details = page.details(text.levels[difficulty], puzzleNumber(id), author);
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <Link className={styles.back} to="/">
          <span aria-hidden="true">{symbols.puzzlePage.back}</span> {page.back}
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{text[type].name}</h1>
          <p className={styles.details}>
            <span className="visually-hidden">{details.level}</span>
            {details.shown}
          </p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <LevelTabs loaded={loaded} />
        <PlayTimer puzzleId={id} />
        <PuzzleActions loaded={loaded} onRestart={onRestart} />
      </div>
    </header>
  );
}
