import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import styles from "./Board.module.css";
import { Clues } from "./Clues";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import { createMoveLog, getGuzzleLog, useGuzzleLifecycle } from "./log";
import { toSquares, type GuzzlePuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

// The board shows the grid, the mistake count, the status text, the clues and the letter keys.
// The puzzle is solved when all squares on the words are green.
export function Board({ puzzle }: { puzzle: GuzzlePuzzle }) {
  const { t } = useTranslation();
  const answer = toSquares(puzzle.answer);
  const size = puzzle.answer.length;
  const log = getGuzzleLog();
  const meta = {
    puzzleId: puzzle.id,
    puzzleType: puzzle.type,
    difficulty: puzzle.difficulty,
  };
  const game = useGame(answer, size, createMoveLog(log, meta));
  useGuzzleLifecycle(log, meta, size, {
    isSolved: game.isSolved,
    isStarted: game.mode !== null,
    mistakes: game.mistakes,
  });

  return (
    <div className={shared.game}>
      <fieldset className={shared.board}>
        <legend className="visually-hidden">{t(($) => $.guzzle.boardLabel)}</legend>
        <Grid answer={answer} size={size} game={game} />
      </fieldset>

      <output className={styles.mistakes}>
        {t(($) => $.guzzle.score, { count: game.mistakes })}
      </output>

      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(t, game.mode, game.lastMove, game.isSolved, game.mistakes, size)}
      </output>

      <Clues clues={puzzle.clues} size={size} selected={game.selected} />

      <Controls answer={answer} game={game} />
    </div>
  );
}
