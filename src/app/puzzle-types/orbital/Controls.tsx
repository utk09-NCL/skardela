import { useId } from "react";
import { useTranslation } from "react-i18next";
import shared from "../../../shared/Board.module.css";
import styles from "./Board.module.css";
import { maxAngle, maxPower, minPower, type Aim } from "./rules-check";
import type { Game } from "./useGame";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  // The value as text, for example "40°". The screen reader tells it too.
  valueText: string;
  isDisabled: boolean;
  onChange: (value: number) => void;
};

// A native range slider. The arrow keys change it by 1, and it does not wrap at the ends.
// The slider is never "disabled", so it keeps the keyboard focus during a flight. It has "aria-disabled",
// and the machine ignores a change. Thus the slider goes back to the value of the game.
function Slider({ label, value, min, max, valueText, isDisabled, onChange }: SliderProps) {
  const id = useId();
  return (
    <div className={styles.slider}>
      <label htmlFor={id}>{label}</label>
      {/* The slider tells its value to a screen reader, thus this copy is only for the eyes. */}
      <span className={styles.value} aria-hidden="true">
        {valueText}
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-valuetext={valueText}
        aria-disabled={isDisabled}
        onChange={(event) => {
          onChange(Number(event.currentTarget.value));
        }}
      />
    </div>
  );
}

// The two sliders set the angle and the power, and the Launch button launches the probe.
// The misses show next to the Launch button. See "## Score": "The board shows the misses, for example "Misses: 2.""
// "aim" is the aim that the sliders show: during a drag, it is the aim of the drag.
// During a flight and after the solve, the controls have "aria-disabled" and do nothing.
// See "## Motion": "During the flight, the sliders and the Launch button keep the keyboard focus."
export function Controls({ game, aim }: { game: Game; aim: Aim }) {
  const { t } = useTranslation();
  const isDisabled = !game.canLaunch;
  return (
    <fieldset className={styles.controls}>
      <legend className="visually-hidden">{t(($) => $.orbital.controlsLabel)}</legend>
      <Slider
        label={t(($) => $.orbital.angle)}
        value={aim.angle}
        min={0}
        max={maxAngle}
        valueText={t(($) => $.orbital.degrees, { angle: aim.angle })}
        isDisabled={isDisabled}
        onChange={(angle) => {
          game.setAim({ angle, power: aim.power });
        }}
      />
      <Slider
        label={t(($) => $.orbital.power)}
        value={aim.power}
        min={minPower}
        max={maxPower}
        valueText={String(aim.power)}
        isDisabled={isDisabled}
        onChange={(power) => {
          game.setAim({ angle: aim.angle, power });
        }}
      />
      <div className={styles.launchRow}>
        <p className={styles.misses}>{t(($) => $.orbital.misses, { count: game.misses })}</p>
        <button
          type="button"
          className={`${shared.button} ${shared.boxed} ${styles.launch}`}
          aria-disabled={isDisabled}
          onClick={game.launch}
        >
          {t(($) => $.orbital.launch)}
        </button>
      </div>
    </fieldset>
  );
}
