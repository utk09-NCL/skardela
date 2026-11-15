import shared from "../../../shared/Board.module.css";
import { SolveBurst } from "../../../shared/SolveBurst";
import { StatusRow } from "../../../shared/StatusRow";
import { text } from "../../../text/en";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import type { ColourBinaryPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text["colour-binary"];

// The board keeps the start layout and the current player state in one state machine. See "machine.ts".
// The puzzle is solved when the board matches the rule set.
// The board shows the grid, the status line with the hints, and the Undo and Hint buttons.
// The key of the squares is in the rules beside the board.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const game = useGame(puzzle);
  const metrics = [{ label: words.metric, value: game.score, text: words.score(game.score) }];

  return (
    <div className={shared.game}>
      <div className={shared.stage}>
        <Grid game={game} />
        {/* The burst is not in the grid, because the grid has "container-type". */}
        {game.isSolved && <SolveBurst />}
      </div>

      <StatusRow metrics={metrics}>
        <output className={shared.status} data-solved={game.isSolved}>
          {statusText(game)}
        </output>
      </StatusRow>

      <Controls game={game} />
    </div>
  );
}
