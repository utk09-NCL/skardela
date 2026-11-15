import shared from "../../../shared/Board.module.css";
import { SolveBurst } from "../../../shared/SolveBurst";
import { StatusRow } from "../../../shared/StatusRow";
import { text } from "../../../text/en";
import { BeamPath } from "./BeamPath";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import type { LaticsPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.latics;

// The board shows the grid with the beam, the status line, the laser controls and the path of the beam.
// The puzzle is solved when the beam hits the monster.
export function Board({ puzzle }: { puzzle: LaticsPuzzle }) {
  const game = useGame(puzzle);
  // Medium and hard show the mirrors in the tray and the misses. On easy, the beam always shows,
  // thus a miss cannot occur.
  const metrics = game.config.liveBeam
    ? []
    : [
        ...(game.config.tray > 0
          ? [
              {
                label: words.metrics.tray,
                value: game.trayLeft,
                text: words.tray(game.trayLeft),
              },
            ]
          : []),
        { label: words.metrics.misses, value: game.score, text: words.misses(game.score) },
      ];

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

      <BeamPath beam={game.beam} layout={{ squares: game.squares, water: game.config.water }} />
    </div>
  );
}
