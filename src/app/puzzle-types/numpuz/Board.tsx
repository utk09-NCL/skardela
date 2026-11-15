import shared from "../../../shared/Board.module.css";
import { StatusRow } from "../../../shared/StatusRow";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { Controls } from "./Controls";
import { Equation } from "./Equation";
import type { NumpuzPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.numpuz;

// The board shows the target and the equation, the status line with the mistakes,
// and the operator keys with the Check button in one row.
// The game is in one state machine. See "machine.ts".
// The puzzle is solved when a check finds that the equation is equal to the target.
export function Board({ puzzle }: { puzzle: NumpuzPuzzle }) {
  const game = useGame(puzzle);
  const metrics = [{ label: words.metric, value: game.score, text: words.score(game.score) }];

  return (
    <div className={shared.game}>
      <Equation game={game} />

      <StatusRow metrics={metrics}>
        {/* The red text after a wrong check is not the only signal. The status text tells it too. */}
        <output
          className={`${shared.status} ${styles.status}`}
          data-solved={game.isSolved}
          data-wrong={game.checked === "wrong"}
        >
          {statusText(game)}
        </output>
      </StatusRow>

      <div className={shared.actions}>
        <Controls game={game} />
        {/* After a check, Check does nothing until the player changes the guess. See "machine.ts".
            It has "aria-disabled", not "disabled", so it keeps the keyboard focus, as the operator keys do. */}
        <button
          type="button"
          className={`${shared.button} ${shared.primary} ${styles.check}`}
          aria-disabled={!game.canCheck}
          onClick={game.check}
        >
          {words.checkButton}
        </button>
      </div>
    </div>
  );
}
