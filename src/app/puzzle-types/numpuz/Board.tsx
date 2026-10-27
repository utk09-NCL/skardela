import { Confetti } from "../../../shared/Confetti";
import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { Controls } from "./Controls";
import { Equation } from "./Equation";
import { createMoveLog, getNumpuzLog, useNumpuzLifecycle, type Meta } from "./log";
import type { NumpuzPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.numpuz;

// The board shows the equation, the operator keys, the status text and the Check button.
// The game is in one state machine. See "machine.ts".
// The puzzle is solved when a check finds that the equation is equal to the target.
export function Board({ puzzle }: { puzzle: NumpuzPuzzle }) {
  const log = getNumpuzLog();
  const meta: Meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const game = useGame(puzzle, createMoveLog(log, meta));
  // The lifecycle hook starts the timer and saves the solve with the mistakes. See "log.ts".
  useNumpuzLifecycle(log, meta, game.isSolved, game.mistakes);

  return (
    <div className={shared.game}>
      <Equation game={game} />

      <Controls game={game} />

      {/* The red edge after a wrong check is not the only signal. The status text tells it too. */}
      <output
        className={`${shared.status} ${styles.status}`}
        data-solved={game.isSolved}
        data-wrong={game.checked === "wrong"}
      >
        {statusText(game)}
      </output>

      {/* The Check button is disabled after a check, until the player changes the guess. See "machine.ts". */}
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={!game.canCheck}
        onClick={game.check}
      >
        {words.checkButton}
      </button>

      {/* The confetti shows when the puzzle is solved, as on the boards of the other puzzle types. */}
      {game.isSolved && <Confetti />}
    </div>
  );
}
