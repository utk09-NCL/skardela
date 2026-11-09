import { useTranslation } from "react-i18next";
import { Confetti } from "../../../shared/Confetti";
import { KeyList, type KeyItem } from "../../../shared/RuleList";
import styles from "./Board.module.css";
import shared from "../../../shared/Board.module.css";
import { Grid } from "./Grid";
import { createMoveLog, getColourBinaryLog, useColourBinaryLifecycle } from "./log";
import { toSquares, type ColourBinaryPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame, type Game } from "./useGame";

// Undo and Hint. Each button is disabled when the machine does not accept its event.
function Buttons({ game }: { game: Game }) {
  const { t } = useTranslation();
  const buttonClass = `${shared.button} ${shared.boxed}`;
  return (
    <div className={styles.buttons}>
      <button type="button" className={buttonClass} disabled={!game.canUndo} onClick={game.undo}>
        {t(($) => $["colour-binary"].undoButton)}
      </button>
      <button
        type="button"
        className={buttonClass}
        disabled={!game.canAskHint}
        onClick={game.askHint}
      >
        {t(($) => $["colour-binary"].hintButton)}
      </button>
    </div>
  );
}

// The board keeps the start layout and the current player state in one state machine. See "machine.ts".
// The puzzle is solved when the board matches the rule set.
// The board shows the grid, the key, the status text, and the Undo and Hint buttons.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const { t } = useTranslation();
  const size = puzzle.start.length;
  // The key under the board. A given square and a square of the player have the same colour.
  // Only the given square has a dot.
  const legend: KeyItem[] = [
    {
      text: t(($) => $["colour-binary"].legend.given),
      sample: { fill: "red", symbol: "", isGiven: true },
    },
    { text: t(($) => $["colour-binary"].legend.yours), sample: { fill: "red", symbol: "" } },
  ];
  const log = getColourBinaryLog();
  const meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const game = useGame(toSquares(puzzle.start), createMoveLog(log, meta));
  useColourBinaryLifecycle(log, meta, size, { isSolved: game.isSolved, hints: game.hints });

  return (
    <div className={shared.game}>
      <Grid game={game} size={size} />

      <div className={styles.legend}>
        <KeyList items={legend} label={t(($) => $["colour-binary"].legend.label)} />
      </div>

      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(t, game, size)}
      </output>

      {/* The confetti shows when the puzzle is solved. It is not in the grid, because the grid has "container-type". */}
      {game.isSolved && <Confetti />}

      <Buttons game={game} />
    </div>
  );
}
