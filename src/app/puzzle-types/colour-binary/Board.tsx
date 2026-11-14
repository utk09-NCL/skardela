import shared from "../../../shared/Board.module.css";
import { Confetti } from "../../../shared/Confetti";
import { KeyList, type KeyItem } from "../../../shared/RuleList";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import { Controls } from "./Controls";
import { Grid } from "./Grid";
import type { ColourBinaryPuzzle } from "./puzzle";
import { statusText } from "./status";
import { useGame } from "./useGame";

const words = text["colour-binary"];

// The key under the board. A given square and a square of the player have the same colour.
// Only the given square has a dot.
const legend: KeyItem[] = [
  { text: words.legend.given, sample: { fill: "red", symbol: "", isGiven: true } },
  { text: words.legend.yours, sample: { fill: "red", symbol: "" } },
];

// The board keeps the start layout and the current player state in one state machine. See "machine.ts".
// The puzzle is solved when the board matches the rule set.
// The board shows the grid, the key, the status text, and the Undo and Hint buttons.
export function Board({ puzzle }: { puzzle: ColourBinaryPuzzle }) {
  const game = useGame(puzzle);

  return (
    <div className={shared.game}>
      <Grid game={game} />

      <div className={styles.legend}>
        <KeyList items={legend} label={words.legend.label} />
      </div>

      <output className={shared.status} data-solved={game.isSolved}>
        {statusText(game)}
      </output>

      {/* The confetti is not in the grid, because the grid has "container-type". */}
      {game.isSolved && <Confetti />}

      <Controls game={game} />
    </div>
  );
}
