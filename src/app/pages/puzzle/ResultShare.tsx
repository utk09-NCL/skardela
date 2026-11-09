import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import shared from "../../../shared/Board.module.css";
import { bestResult, formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { marksText, prefersShareMenu, puzzleShareText } from "../../../shared/share";
import { ShareButton } from "../../../shared/ShareButton";
import { puzzleNumber, type LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzlePage.module.css";

type ResultShareProps = {
  loaded: LoadedPuzzle;
  solve: SolveResult;
  results: readonly SolveResult[];
  solved: readonly string[];
  // Today, as a day key. A puzzle of today shows the date in its share text.
  day: string;
};

// The share text of the solve, and its line of squares. A puzzle of today shows the date and the squares
// of all levels of today. A different puzzle shows only its own square.
function useShareText({ loaded, solve, results, solved, day }: ResultShareProps) {
  const { t } = useTranslation();
  const { type, puzzle, today } = loaded;
  const isToday = today.some(({ id }) => id === puzzle.id);
  const levelResults: (SolveResult | undefined)[] = isToday
    ? today.map(({ id }) =>
        id === puzzle.id ? solve : solved.includes(id) ? bestResult(results, id) : undefined,
      )
    : [solve];
  const marks = marksText(levelResults);
  const { mistakes } = solve;
  const shareText = puzzleShareText(t, {
    day: isToday ? day : undefined,
    typeName: t(($) => $[type].name),
    number: puzzleNumber(puzzle.id),
    level: t(($) => $.levels[puzzle.difficulty]),
    marks,
    time: formatDuration(solve.seconds),
    score: mistakes === undefined ? undefined : t(($) => $[type].score, { count: mistakes }),
  });
  return { shareText, marks };
}

// The share text as the player sees it. Each line is a span, with the line breaks between the spans,
// so a copy of the shown text is the same as the share text. The line of squares uses an emoji font,
// because the text font has plain shapes for some of these characters.
function ShownText({ shareText, marks }: { shareText: string; marks: string }) {
  return (
    <p className={styles.shareText}>
      {shareText.split("\n").map((line, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the lines never move. Two lines can have the same text.
        <Fragment key={index}>
          {index > 0 && "\n"}
          <span className={line === marks ? styles.shareMarks : undefined}>{line}</span>
        </Fragment>
      ))}
    </p>
  );
}

// The share part of the result card: the share text, the button to copy or share it,
// and the link to today's first level of this type that the player did not solve.
export function ResultShare(props: ResultShareProps) {
  const { loaded, solved } = props;
  const { t } = useTranslation();
  const name = t(($) => $[loaded.type].name);
  const { shareText, marks } = useShareText(props);
  const next = loaded.today.find(({ id }) => id !== loaded.puzzle.id && !solved.includes(id));
  return (
    <>
      <div className={styles.shareBox}>
        <h3 className={styles.shareHeading}>{t(($) => $.puzzlePage.result.shareHeading)}</h3>
        <ShownText shareText={shareText} marks={marks} />
      </div>
      <div className={styles.solvedActions}>
        <ShareButton
          getText={() => shareText}
          label={
            prefersShareMenu()
              ? t(($) => $.puzzlePage.result.share)
              : t(($) => $.puzzlePage.result.copy)
          }
          className={`${shared.button} ${styles.copy}`}
        />
        {next !== undefined && (
          <Link
            className={`${shared.button} ${shared.boxed} ${styles.nextLink}`}
            to={`/puzzles/${next.id}`}
            aria-label={t(($) => $.puzzlePage.result.nextLabel, {
              typeName: name,
              level: t(($) => $.levels[next.difficulty]),
            })}
          >
            {t(($) => $.puzzlePage.result.next, { level: t(($) => $.levels[next.difficulty]) })}
          </Link>
        )}
      </div>
    </>
  );
}
