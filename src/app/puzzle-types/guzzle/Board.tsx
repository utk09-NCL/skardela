import shared from "../../../shared/Board.module.css";
import { Confetti } from "../../../shared/Confetti";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { Clues } from "./Clues";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import type { GuzzlePuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.guzzle;

// The board shows the grid, the mistake count, the status text, the clues and the letter keys.
// The puzzle is solved when all squares on the words are green.
export function Board({ puzzle }: { puzzle: GuzzlePuzzle }) {
  const game = useGame(puzzle);

  return (
    <div className={shared.game}>
      <div className={shared.stage}>
        <Grid game={game} />
      </div>

      <output className={styles.mistakes}>{words.mistakes(game.score)}</output>

      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(game.mode, game.lastMove, game.isSolved, game.score, game.size)}
      </output>

      <Clues clues={puzzle.clues} size={game.size} selected={game.selected} />

      <Controls game={game} />

      {/* The confetti is not in the grid, because the grid has "container-type". */}
      {game.isSolved && <Confetti />}
    </div>
  );
}
