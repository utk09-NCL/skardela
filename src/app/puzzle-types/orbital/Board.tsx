import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import { Confetti } from "../../../shared/Confetti";
import { Controls } from "./Controls";
import { useDrag } from "./input";
import { createMoveLog, getOrbitalLog, useOrbitalLifecycle } from "./log";
import type { OrbitalPuzzle } from "./puzzle";
import { Scene } from "./Scene";
import { statusText } from "./status";
import { useGame } from "./useGame";

// The board shows the drawing of the board, the sliders, the misses, the Launch button and the status text.
// The game is in one state machine. See "machine.ts". The flight animation is in "motion.ts",
// and the drag is in "input.ts". The puzzle is solved when the probe reaches the ring.
export function Board({ puzzle }: { puzzle: OrbitalPuzzle }) {
  const { t } = useTranslation();
  const log = getOrbitalLog();
  const meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const game = useGame(puzzle, createMoveLog(log, meta));
  // The lifecycle hook starts the timer and saves the solve with the misses. See "log.ts".
  useOrbitalLifecycle(log, meta, game.isSolved, game.misses);
  // The drawing and the sliders both show the aim of a drag. Thus the drag state is here.
  const drag = useDrag(game);

  return (
    <div className={shared.game}>
      <Scene game={game} drag={drag} />

      <Controls game={game} aim={drag.aim} />

      {/* The status box is a live region. A screen reader tells each flight at its end. See "status.ts". */}
      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(t, game)}
      </output>

      {game.isSolved && <Confetti />}
    </div>
  );
}
