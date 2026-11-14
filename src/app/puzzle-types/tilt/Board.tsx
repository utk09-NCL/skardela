import shared from "../../../shared/Board.module.css";
import { Confetti } from "../../../shared/Confetti";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { Controls, KeyHint } from "./Controls";
import { Grid } from "./Grid";
import type { TiltPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.tilt;

// The board shows the tilts and the fewest tilts, the grid with the balls, the arrow buttons and the status text.
// The game is in one state machine. See "machine.ts": "transition" for a tilt, and "applyInput" for the slide
// and the status of a tilt that moves no ball. The puzzle is solved when all coloured balls are in their holes.
export function Board({ puzzle }: { puzzle: TiltPuzzle }) {
  const game = useGame(puzzle);

  return (
    // "styles.game" lets the CSS of the key hint see when the board or an arrow button has the focus.
    <div className={`${shared.game} ${styles.game}`}>
      <p className={styles.counts}>{words.counts(game.tilts, game.fewest)}</p>

      {/* After the solve, the arrow keys do nothing, thus the key hint does not show. */}
      {!game.isSolved && <KeyHint />}

      <Grid game={game} />

      <Controls game={game} />

      {/* The status box is a live region. A screen reader tells each tilt. See "status.ts". */}
      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(game)}
      </output>

      {/* The confetti is not in the grid, because the grid has "container-type". */}
      {game.isSolved && <Confetti />}
    </div>
  );
}
