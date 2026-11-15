import { Suspense, useState } from "react";
import { useLoaderData } from "react-router";
import { ErrorBoundary } from "../../../shared/ErrorBoundary";
import { text } from "../../../text/en";
import { type puzzleLoader } from "../../puzzles";
import { NotFoundPage } from "../NotFoundPage";
import { PuzzleBoard } from "./PuzzleBoard";
import { PuzzleHeader } from "./PuzzleHeader";
import styles from "./PuzzlePage.module.css";
import { PuzzleSide } from "./PuzzleSide";

const page = text.puzzlePage;

// The puzzle page: the header with the level tabs, the timer and the actions,
// then the board on the left and the side column with the result card and the rules on the right.
export function PuzzlePage() {
  const loaded = useLoaderData<typeof puzzleLoader>();
  // Each restart gives the board a new key. React then removes the old board and makes a new board,
  // thus the board, its state machine, its logs and the timer start again from the start state.
  const [attempt, setAttempt] = useState(0);
  if (!loaded) return <NotFoundPage />;

  const { type, puzzle } = loaded;
  return (
    <>
      <title>{page.title(text[type].name, puzzle.id, text.siteName)}</title>
      <PuzzleHeader loaded={loaded} onRestart={() => setAttempt((count) => count + 1)} />
      {/* The board comes first, so a small screen shows the board without scrolling.
          On a wide screen, the CSS puts the side column on the right. */}
      <div className={styles.layout}>
        <div className={styles.play}>
          <ErrorBoundary
            key={`${puzzle.id}:${attempt}`}
            fallback={<p role="alert">{page.boardError}</p>}
          >
            <Suspense fallback={<p>{page.loadingBoard}</p>}>
              <PuzzleBoard type={type} puzzle={puzzle} />
            </Suspense>
          </ErrorBoundary>
        </div>
        <PuzzleSide loaded={loaded} />
      </div>
    </>
  );
}
