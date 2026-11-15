import type { LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzlePage.module.css";
import { PuzzleRules } from "./PuzzleRules";
import { SolvedCard } from "./SolvedCard";

// The side column: the result card after a solve, then the rules.
// The rules have the type as key, so a different puzzle type gets a new rules panel.
export function PuzzleSide({ loaded }: { loaded: LoadedPuzzle }) {
  return (
    <aside className={styles.side}>
      <SolvedCard loaded={loaded} />
      <PuzzleRules key={loaded.type} type={loaded.type} />
    </aside>
  );
}
