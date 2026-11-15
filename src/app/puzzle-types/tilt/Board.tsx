import shared from "../../../shared/Board.module.css";
import { SolveBurst } from "../../../shared/SolveBurst";
import { StatusRow } from "../../../shared/StatusRow";
import styles from "./Board.module.css";
import { Controls, KeyHint } from "./Controls";
import { Grid } from "./Grid";
import { usePressedArrow } from "./input";
import type { TiltPuzzle } from "./puzzle";
import { countsOf, statusText } from "./status";
import { useGame } from "./useGame";

// The board shows the key hint, the grid with the balls, the status line with the tilts and the fewest tilts,
// and the arrow buttons.
// The game is in one state machine. See "machine.ts": "transition" for a tilt, and "applyInput" for the slide
// and the status of a tilt that moves no ball. The puzzle is solved when all coloured balls are in their holes.
export function Board({ puzzle }: { puzzle: TiltPuzzle }) {
  const game = useGame(puzzle);
  // Each tilt from a key, a button or a swipe also lights up its arrow button.
  const arrow = usePressedArrow(game.tilt, game.isSolved);

  return (
    // "styles.game" lets the CSS of the key hint see when the board or an arrow button has the focus.
    <div className={`${shared.game} ${styles.game}`}>
      {/* rules.md: "Above the board, a key hint tells the player to give the focus to the board". */}
      <KeyHint isHidden={game.isSolved} />

      <div className={shared.stage}>
        <Grid game={game} onTilt={arrow.tilt} />
        {/* The burst is not in the grid, because the grid has "container-type". */}
        {game.isSolved && <SolveBurst />}
      </div>

      <StatusRow metrics={countsOf(game)}>
        {/* The status is a live region. A screen reader tells each tilt. See "status.ts". */}
        <output className={shared.status} data-solved={game.isSolved}>
          {statusText(game)}
        </output>
      </StatusRow>

      <Controls game={game} pressed={arrow.pressed} onTilt={arrow.tilt} />
    </div>
  );
}
