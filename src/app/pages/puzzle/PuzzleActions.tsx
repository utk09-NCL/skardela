import { useNavigate } from "react-router";
import shared from "../../../shared/Board.module.css";
import { ConfirmQuestion } from "../../../shared/ConfirmQuestion";
import { getLogger } from "../../../shared/logger";
import { useConfirm } from "../../../shared/useConfirm";
import { text } from "../../../text/en";
import type { LoadedPuzzle } from "../../puzzles";
import styles from "./PuzzleActions.module.css";
import { randomPuzzleId } from "./randomPuzzle";

const page = text.puzzlePage;
const buttonClass = `${shared.button} ${shared.boxed}`;
const log = getLogger("ui.puzzle-page");

function logRestart({ type, id, difficulty }: LoadedPuzzle) {
  log.info("Puzzle restarted", { puzzleId: id, puzzleType: type, difficulty });
}

// The buttons next to the timer. "Restart" starts the same puzzle again, after one question.
// "Random puzzle" opens the puzzle of a random number, of the same type and level.
// While the question is open, it takes the place of the buttons.
// The bar is outside the board, thus each puzzle type gets it. The page keeps the bar when it opens a new puzzle,
// thus "Random puzzle" keeps the focus.
type PuzzleActionsProps = { loaded: LoadedPuzzle; onRestart: () => void };

export function PuzzleActions({ loaded, onRestart }: PuzzleActionsProps) {
  const navigate = useNavigate();
  const { type, id, difficulty } = loaded;
  // The question belongs to one puzzle. A different puzzle, for example after the Back button, closes it.
  const { isOpen, buttonRef, noRef, open, close } = useConfirm(id);

  const restart = () => {
    logRestart(loaded);
    onRestart();
    close();
  };
  const openRandom = () => {
    const to = randomPuzzleId(type, difficulty);
    log.info("Random puzzle opened", { from: id, to });
    void navigate(`/puzzles/${to}`);
  };

  return (
    <div className={styles.bar}>
      {isOpen ? (
        <ConfirmQuestion
          question={page.restartQuestion}
          yes={page.restartYes}
          no={page.restartNo}
          noRef={noRef}
          onYes={restart}
          onNo={close}
        />
      ) : (
        <>
          <button ref={buttonRef} type="button" className={buttonClass} onClick={open}>
            {page.restart}
          </button>
          <button type="button" className={buttonClass} onClick={openRandom}>
            {page.random}
          </button>
        </>
      )}
    </div>
  );
}
