import { useTranslation } from "react-i18next";
import { compareToAverage, formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./PuzzlePage.module.css";

// A difference of less than half a second shows as "0:00", thus it is the same as the average.
const sameTime = 0.5;

// One number of the result card. The label is first in the code, for a screen reader.
// The CSS shows the value above the label.
// "isGood" has no default value in the parameters, because React Compiler cannot compile such a default.
function ResultNumber({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood?: boolean;
}) {
  return (
    <div className={styles.solvedNumber} data-faster={isGood === true}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// The time of the solve against the average of the other solves of this level.
// The first solve of a level has no average.
function AverageNumber({ difference, level }: { difference: number | undefined; level: string }) {
  const { t } = useTranslation();
  if (difference === undefined) {
    return (
      <ResultNumber
        label={t(($) => $.puzzlePage.result.firstLabel, { level })}
        value={t(($) => $.puzzlePage.result.first)}
      />
    );
  }
  const isSame = Math.abs(difference) < sameTime;
  const label = isSame
    ? t(($) => $.puzzlePage.result.same)
    : difference < 0
      ? t(($) => $.puzzlePage.result.faster)
      : t(($) => $.puzzlePage.result.slower);
  return (
    <ResultNumber
      label={label}
      value={formatDuration(Math.abs(difference))}
      isGood={!isSame && difference < 0}
    />
  );
}

type ResultNumbersProps = {
  type: PuzzleType;
  level: string;
  solve: SolveResult;
  results: readonly SolveResult[];
};

// The numbers of the result card: the time, the score of the puzzle type, and the time against the average.
export function ResultNumbers({ type, level, solve, results }: ResultNumbersProps) {
  const { t } = useTranslation();
  const { mistakes } = solve;
  return (
    <dl className={styles.solvedNumbers} aria-label={t(($) => $.puzzlePage.result.numbersLabel)}>
      <ResultNumber
        label={t(($) => $.puzzlePage.result.time)}
        value={formatDuration(solve.seconds)}
      />
      {mistakes !== undefined && (
        <ResultNumber
          label={t(($) => $[type].scoreWord, { count: mistakes })}
          value={String(mistakes)}
        />
      )}
      <AverageNumber difference={compareToAverage(results, solve)} level={level} />
    </dl>
  );
}
