import shared from "../../../shared/Board.module.css";
import { StatusRow } from "../../../shared/StatusRow";
import { text } from "../../../text/en";
import { Controls } from "./Controls";
import { useDrag } from "./input";
import type { OrbitalPuzzle } from "./puzzle";
import { Scene } from "./Scene";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text.orbital;

// The board shows the drawing of the board, the status line with the misses, the sliders and the Launch button.
// The game is in one state machine. See "machine.ts". The flight animation is in "motion.ts",
// and the drag is in "input.ts". The puzzle is solved when the probe reaches the ring.
export function Board({ puzzle }: { puzzle: OrbitalPuzzle }) {
  const game = useGame(puzzle);
  // The drawing and the sliders both show the aim of a drag. Thus the drag state is here.
  const drag = useDrag(game);
  // rules.md, "## Score": the board shows the misses. The status text already tells the misses
  // after each flight, thus the number is not a live region.
  const metrics = [
    { label: words.metric, value: game.score, text: words.misses(game.score), isAnnounced: false },
  ];

  return (
    <div className={shared.game}>
      <Scene game={game} drag={drag} />

      <StatusRow metrics={metrics}>
        {/* The status is a live region. A screen reader tells each flight at its end. See "status.ts". */}
        <output className={shared.status} data-solved={game.isSolved}>
          {statusText(game)}
        </output>
      </StatusRow>

      <Controls game={game} aim={drag.aim} />
    </div>
  );
}
