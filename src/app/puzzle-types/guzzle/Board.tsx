import shared from "../../../shared/Board.module.css";
import { SolveBurst } from "../../../shared/SolveBurst";
import { StatusRow } from "../../../shared/StatusRow";
import { text } from "../../../text/en";
import { Clues } from "./Clues";
import { Controls, ModeButtons } from "./Controls";
import { Grid } from "./Grid";
import type { GuzzlePuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.guzzle;

// The board shows the grid, the status line with the mistakes, the clues and the letter keys.
// The puzzle is solved when all squares on the words are green.
export function Board({ puzzle }: { puzzle: GuzzlePuzzle }) {
  const game = useGame(puzzle);
  const metrics = [{ label: words.metric, value: game.score, text: words.mistakes(game.score) }];

  return (
    <div className={shared.game}>
      <div className={shared.stage}>
        <Grid game={game} />
        {/* The burst is not in the grid, because the grid has "container-type". */}
        {game.isSolved && <SolveBurst />}
      </div>

      {game.mode === null && <ModeButtons game={game} />}

      <StatusRow metrics={metrics}>
        <output className={shared.status} data-solved={game.isSolved}>
          {statusText(game.mode, game.lastMove, game.isSolved, game.score, game.size)}
        </output>
      </StatusRow>

      <Clues clues={puzzle.clues} size={game.size} selected={game.selected} />

      <Controls game={game} />
    </div>
  );
}
