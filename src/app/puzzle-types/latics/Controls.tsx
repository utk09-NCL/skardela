import shared from "../../../shared/Board.module.css";
import { text } from "../../../text/en";
import styles from "./Board.module.css";
import type { Game } from "./useGame";

const words = text.latics;

// On medium and hard, the player fires the laser to test the plan. The controls show the tray and the misses.
// On easy, the beam shows at all times, thus there are no controls.
export function Controls({ game }: { game: Game }) {
  if (game.config.liveBeam) return null;
  return (
    <fieldset className={styles.controls}>
      <legend className="visually-hidden">{words.controlsLabel}</legend>
      {game.config.tray > 0 && <output>{words.tray(game.trayLeft)}</output>}
      <output>{words.misses(game.score)}</output>
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={!game.canFire}
        onClick={game.fire}
      >
        {words.fire}
      </button>
    </fieldset>
  );
}
