import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { levels, type Difficulty } from "../../../shared/difficulty";
import { bestOf, formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./HomePage.module.css";

// The puzzle that the message before the first solve links to.
export type FirstPuzzle = { id: string; type: PuzzleType; difficulty: Difficulty };

// A time, or a dash when there is no solve. A screen reader reads "No solves" in place of the dash.
function Time({ seconds }: { seconds: number | undefined }) {
  const { t } = useTranslation();
  if (seconds === undefined) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="visually-hidden">{t(($) => $.home.stats.bests.noTime)}</span>
      </>
    );
  }
  return <>{formatDuration(seconds)}</>;
}

// Before the first solve, the panel shows one message and a link to a puzzle, not rows of dashes.
function NoSolvesYet({ first }: { first: FirstPuzzle | undefined }) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.panel} ${styles.noSolves}`}>
      <h3 className={styles.panelTitle}>{t(($) => $.home.stats.bests.heading)}</h3>
      <p>{t(($) => $.home.stats.bests.empty)}</p>
      {first !== undefined && (
        <Link className={styles.noSolvesLink} to={`/puzzles/${first.id}`}>
          {t(($) => $.home.stats.bests.play, {
            typeName: t(($) => $[first.type].name),
            level: t(($) => $.levels[first.difficulty]),
          })}
        </Link>
      )}
    </div>
  );
}

type RowProps = {
  results: readonly SolveResult[];
  type: PuzzleType;
  isOpen: boolean;
  onToggle: () => void;
};

// One row: the name of the puzzle type, then the best time of each level.
// When the row is open, each cell also shows the average time of its level.
function BestsRow({ results, type, isOpen, onToggle }: RowProps) {
  const { t } = useTranslation();
  return (
    <tr>
      <th scope="row">
        <button
          type="button"
          className={styles.bestsToggle}
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          {t(($) => $[type].name)}
        </button>
      </th>
      {levels.map((difficulty) => {
        const best = bestOf(results, type, difficulty);
        return (
          <td key={difficulty} data-empty={best === undefined}>
            <Time seconds={best?.best} />
            {isOpen && best !== undefined && (
              <span className={styles.average}>
                {t(($) => $.home.stats.bests.average, { time: formatDuration(best.average) })}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

// The best time of each puzzle type and level: one row for each puzzle type and one column for each level.
// It is a table, so a screen reader can read it by rows and columns. One row at a time can be open.
export function PersonalBests({
  results,
  types,
  first,
}: {
  results: readonly SolveResult[];
  types: readonly PuzzleType[];
  first: FirstPuzzle | undefined;
}) {
  const { t } = useTranslation();
  const [openType, setOpenType] = useState<PuzzleType | null>(null);
  if (results.length === 0) return <NoSolvesYet first={first} />;
  return (
    <div className={styles.panel}>
      <table className={styles.bests}>
        <caption className={styles.panelTitle}>{t(($) => $.home.stats.bests.heading)}</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">{t(($) => $.home.stats.bests.puzzle)}</span>
            </th>
            {levels.map((difficulty) => (
              <th key={difficulty} scope="col">
                {t(($) => $.levels[difficulty])}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <BestsRow
              key={type}
              results={results}
              type={type}
              isOpen={openType === type}
              onToggle={() => {
                setOpenType(openType === type ? null : type);
              }}
            />
          ))}
        </tbody>
      </table>
      <p className={styles.bestsNote}>{t(($) => $.home.stats.bests.note)}</p>
    </div>
  );
}
