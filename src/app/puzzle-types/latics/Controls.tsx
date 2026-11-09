import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import styles from "./Board.module.css";
import type { Game } from "./useGame";

// On medium and hard, the player fires the laser to test the plan. The controls show the tray and the misses.
// On easy, the beam shows at all times, thus there are no controls.
export function Controls({ game }: { game: Game }) {
  const { t } = useTranslation();
  if (game.config.liveBeam) return null;
  return (
    <fieldset className={styles.controls}>
      <legend className="visually-hidden">{t(($) => $.latics.controlsLabel)}</legend>
      {game.config.tray > 0 && <output>{t(($) => $.latics.tray, { count: game.trayLeft })}</output>}
      <output>{t(($) => $.latics.score, { count: game.misses })}</output>
      <button
        type="button"
        className={`${shared.button} ${shared.boxed}`}
        disabled={!game.canFire}
        onClick={game.fire}
      >
        {t(($) => $.latics.fire)}
      </button>
    </fieldset>
  );
}
