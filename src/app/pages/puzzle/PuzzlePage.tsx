import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { ErrorBoundary } from "../../../shared/ErrorBoundary";
import { type puzzleLoader } from "../../puzzles";
import { NotFoundPage } from "../NotFoundPage";
import { PuzzleBoard } from "./PuzzleBoard";
import { PuzzleHeader } from "./PuzzleHeader";
import styles from "./PuzzlePage.module.css";
import { PuzzleSide } from "./PuzzleSide";

// The puzzle page is one panel, as "Now playing" in the redesign: the header with the timer and a close link,
// then the board, and the side column with the actions and the rules.
export function PuzzlePage() {
  const { t } = useTranslation();
  const loaded = useLoaderData<typeof puzzleLoader>();
  // Each restart gives the board a new key. React then removes the old board and makes a new board,
  // thus the board, its state machine, its logs and the timer start again from the start state.
  const [attempt, setAttempt] = useState(0);
  if (!loaded) return <NotFoundPage />;

  const { type, puzzle } = loaded;
  return (
    <div className={styles.panel}>
      <title>
        {t(($) => $.puzzlePage.title, {
          typeName: t(($) => $[type].name),
          id: puzzle.id,
          siteName: t(($) => $.siteName),
        })}
      </title>
      <PuzzleHeader loaded={loaded} />
      {/* The board comes first, so a small screen shows the board without scrolling.
          On a wide screen, the CSS puts the side column on the right. */}
      <div className={styles.layout}>
        <div className={styles.play}>
          <ErrorBoundary
            key={`${puzzle.id}:${attempt}`}
            fallback={<p role="alert">{t(($) => $.puzzlePage.boardError)}</p>}
          >
            <Suspense fallback={<p>{t(($) => $.puzzlePage.loadingBoard)}</p>}>
              <PuzzleBoard type={type} puzzle={puzzle} />
            </Suspense>
          </ErrorBoundary>
        </div>
        <PuzzleSide loaded={loaded} onRestart={() => setAttempt((count) => count + 1)} />
      </div>
    </div>
  );
}
