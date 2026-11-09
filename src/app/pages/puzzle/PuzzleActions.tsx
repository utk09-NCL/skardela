import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import shared from "../../../shared/Board.module.css";
import { ConfirmQuestion } from "../../../shared/ConfirmQuestion";
import { getLogger } from "../../../shared/logger";
import { useAppStore } from "../../../shared/state/store";
import { useConfirm } from "../../../shared/useConfirm";
import type { LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzleActions.module.css";
import { randomPuzzleId } from "./randomPuzzle";

const buttonClass = `${shared.button} ${shared.boxed}`;
const log = getLogger("ui.puzzle-page");

function logRestart({ type, puzzle }: LoadedPuzzle) {
  log.info("Puzzle restarted", {
    puzzleId: puzzle.id,
    puzzleType: type,
    difficulty: puzzle.difficulty,
  });
}

// The bar above the rules. "Restart" starts the same puzzle again, after one question.
// "Random puzzle" opens a different puzzle of the same type and level, if possible one that the player did not solve.
// While the question is open, it fills the bar.
// The bar is outside the board, thus each puzzle type gets it. The page keeps the bar when it opens a new puzzle,
// thus "Random puzzle" keeps the focus.
type PuzzleActionsProps = { loaded: LoadedPuzzle; onRestart: () => void };

export function PuzzleActions({ loaded, onRestart }: PuzzleActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { puzzle, others } = loaded;
  // The question belongs to one puzzle. A different puzzle, for example after the Back button, closes it.
  const { isOpen, buttonRef, yesRef, open, close } = useConfirm(puzzle.id);

  const restart = () => {
    logRestart(loaded);
    onRestart();
    close();
  };
  const openRandom = () => {
    const id = randomPuzzleId(others, useAppStore.getState().solved);
    if (id === undefined) return;
    log.info("Random puzzle opened", { from: puzzle.id, to: id });
    void navigate(`/puzzles/${id}`);
  };

  return (
    <div className={styles.bar}>
      {isOpen ? (
        <ConfirmQuestion
          question={t(($) => $.puzzlePage.restartQuestion)}
          yes={t(($) => $.puzzlePage.restartYes, { returnObjects: true })}
          no={t(($) => $.puzzlePage.restartNo, { returnObjects: true })}
          yesRef={yesRef}
          onYes={restart}
          onNo={close}
        />
      ) : (
        <>
          <button ref={buttonRef} type="button" className={buttonClass} onClick={open}>
            {t(($) => $.puzzlePage.restart)}
          </button>
          {/* A level with only one puzzle has no other puzzle to open. */}
          {others.length > 0 && (
            <button type="button" className={buttonClass} onClick={openRandom}>
              {t(($) => $.puzzlePage.random)}
            </button>
          )}
        </>
      )}
    </div>
  );
}
