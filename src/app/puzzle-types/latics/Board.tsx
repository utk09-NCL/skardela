import shared from "../../../shared/Board.module.css";
import { Confetti } from "../../../shared/Confetti";
import { text } from "../../../text/en";
import { BeamPath } from "./BeamPath";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import { createMoveLog, getLaticsLog, useLaticsLifecycle } from "./log";
import type { LaticsPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.latics;

// The board shows the grid with the beam, the laser controls, the status text and the path of the beam.
// The puzzle is solved when the beam hits the monster.
export function Board({ puzzle }: { puzzle: LaticsPuzzle }) {
  const log = getLaticsLog();
  const meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const game = useGame(puzzle, createMoveLog(log, meta));
  useLaticsLifecycle(log, meta, game.isSolved, game.misses);

  return (
    <div className={shared.game}>
      <fieldset className={shared.board}>
        <legend className="visually-hidden">{words.boardLabel}</legend>
        <Grid game={game} />
      </fieldset>

      <Controls game={game} />

      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(game)}
      </output>

      <BeamPath beam={game.beam} layout={{ squares: game.squares, water: game.config.water }} />

      {/* The confetti is not in the grid, because the grid has "container-type". */}
      {game.isSolved && <Confetti />}
    </div>
  );
}
