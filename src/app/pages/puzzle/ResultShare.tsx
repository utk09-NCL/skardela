import { Fragment } from "react";
import { Link } from "react-router";
import shared from "../../../shared/Board.module.css";
import { bestResult, formatDuration, solvesOnDay } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { markOfSquare, marksText, prefersShareMenu } from "../../../shared/share";
import { ShareButton } from "../../../shared/ShareButton";
import { text } from "../../../text/en";
import { puzzleNumber, type LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzlePage.module.css";

const words = text.puzzlePage.result;

type ResultShareProps = {
  loaded: LoadedPuzzle;
  solve: SolveResult;
  results: readonly SolveResult[];
  // Today, as a day key. A puzzle of today shows the date in its share text and the levels solved today.
  day: string;
};

// The share text of the solve, and its line of squares. A puzzle of today shows the date and the squares
// of all levels of today. A different puzzle shows only its own square.
function shareTextOf({ loaded, solve, results, day }: ResultShareProps) {
  const { type, today } = loaded;
  const isToday = today.some(({ id }) => id === loaded.id);
  // The other levels show the best solve of today. A solve on an earlier day does not count.
  const todays = solvesOnDay(results, day);
  const levelResults: (SolveResult | undefined)[] = isToday
    ? today.map(({ id }) => (id === loaded.id ? solve : bestResult(todays, id)))
    : [solve];
  const marks = marksText(levelResults);
  const shareText = text.share.puzzle({
    day: isToday ? day : undefined,
    typeName: text[type].name,
    number: puzzleNumber(loaded.id),
    level: text.levels[loaded.difficulty],
    marks,
    time: formatDuration(solve.seconds),
    score: solve.mistakes === undefined ? undefined : text[type].score(solve.mistakes),
  });
  return { shareText, marks };
}

// The line of squares: one small square in the colour of each mark. Each square keeps its character,
// so a copy of the shown text is the same as the share text.
function MarkSquares({ marks }: { marks: string }) {
  return (
    <span className={styles.shareMarks}>
      {[...marks].map((character, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the squares never move. Two squares can be the same.
        <span key={index} className={styles.mark} data-mark={markOfSquare(character)}>
          {character}
        </span>
      ))}
    </span>
  );
}

// The share text as the player sees it. Each line is a span, with the line breaks between the spans,
// so a copy of the shown text is the same as the share text.
function ShownText({ shareText, marks }: { shareText: string; marks: string }) {
  return (
    <p className={styles.shareText}>
      {shareText.split("\n").map((line, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the lines never move. Two lines can have the same text.
        <Fragment key={index}>
          {index > 0 && "\n"}
          {line === marks ? <MarkSquares marks={marks} /> : <span>{line}</span>}
        </Fragment>
      ))}
    </p>
  );
}

// The share part of the result card: the share text, the button to copy or share it,
// and the link to today's first level of this type that the player did not solve today.
export function ResultShare(props: ResultShareProps) {
  const { loaded, results, day } = props;
  const { shareText, marks } = shareTextOf(props);
  // The next level is the first level of today that the player did not solve today.
  const todays = solvesOnDay(results, day);
  const next = loaded.today.find(
    ({ id }) => id !== loaded.id && !todays.some(({ puzzleId }) => puzzleId === id),
  );
  return (
    <>
      <div className={styles.shareBox}>
        <h3 className={styles.shareHeading}>{words.shareHeading}</h3>
        <ShownText shareText={shareText} marks={marks} />
      </div>
      <div className={styles.solvedActions}>
        <ShareButton
          getText={() => shareText}
          label={prefersShareMenu() ? words.share : words.copy}
          className={`${shared.button} ${styles.copy}`}
        />
        {next !== undefined && (
          <Link
            className={`${shared.button} ${shared.boxed} ${styles.nextLink}`}
            to={`/puzzles/${next.id}`}
          >
            {words.next(text.levels[next.difficulty])}{" "}
            <span aria-hidden="true">{words.nextArrow}</span>
          </Link>
        )}
      </div>
    </>
  );
}
