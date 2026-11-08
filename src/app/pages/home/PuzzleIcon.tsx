import type { ReactNode } from "react";
import type { PuzzleType } from "../../puzzle-types/registry";
import { symbols } from "../../../text/symbols";
import styles from "./PuzzleIcon.module.css";

type Tile = "red" | "blue" | "muted";

// Colour Binary: a grid of red and blue squares.
const binaryTiles: readonly Tile[] = [
  "red",
  "muted",
  "muted",
  "blue",
  "muted",
  "red",
  "blue",
  "muted",
  "muted",
  "blue",
  "red",
  "muted",
  "blue",
  "muted",
  "muted",
  "red",
] as Tile[];

function ColourBinaryIcon() {
  return (
    <div className={styles.iconGrid} data-columns={4}>
      {binaryTiles.map((tile, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the tiles never move in the list.
        <span key={index} className={styles.iconTile} data-tile={tile} />
      ))}
    </div>
  );
}

// Guzzle: two words that cross at the center letter, "CAT" across and "BAG" down.
// The letters are decoration, thus a screen reader does not read them (the icon has "aria-hidden").
const crossLetters = ["", "B", "", "C", "A", "T", "", "G", ""];

function GuzzleIcon() {
  return (
    <div className={styles.iconGrid} data-columns={3}>
      {crossLetters.map((letter, index) => (
        <span
          // oxlint-disable-next-line react/no-array-index-key -- the tiles never move in the list.
          key={index}
          className={styles.letterTile}
          data-center={index === 4}
          data-empty={letter === ""}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

// Latics: a laser beam that goes right, turns up at a mirror and hits a target.
function LaticsIcon() {
  return (
    <svg className={styles.beamIcon} viewBox="0 0 32 32" width="34" height="34">
      <circle className={styles.beamTarget} cx="22" cy="6" r="3.5" />
      <path className={styles.beamPath} d="M6 23 H22 V10" />
      <path className={styles.beamMirror} d="M17.5 27.5 L26.5 18.5" />
      <circle className={styles.beamLaser} cx="6" cy="23" r="3.5" />
    </svg>
  );
}

// Numpuz: a short equation with an operator in the middle, "8 ÷ 2".
// The characters are decoration, thus a screen reader does not read them (the icon has "aria-hidden").
// The operator symbol comes from "src/text/symbols.ts", as on the Numpuz board.
const equationParts = ["8", symbols.numpuz.operators["\u00F7"], "2"];

function NumpuzIcon() {
  return (
    <div className={styles.iconGrid} data-columns={3}>
      {equationParts.map((part, index) => (
        <span
          // oxlint-disable-next-line react/no-array-index-key -- the tiles never move in the list.
          key={index}
          className={styles.letterTile}
          data-center={index === 1}
          data-empty={false}
        >
          {part}
        </span>
      ))}
    </div>
  );
}

// Orbital: the probe flies on a curved path past a planet and into the ring.
function OrbitalIcon() {
  return (
    <svg className={styles.orbitalIcon} viewBox="0 0 32 32" width="34" height="34">
      <circle className={styles.orbitalPlanet} cx="14" cy="17" r="5.5" />
      <path className={styles.orbitalPath} d="M5 28 Q4 6 21 8" />
      <circle className={styles.orbitalRing} cx="25" cy="8" r="4" />
      <path className={styles.orbitalProbe} d="M5 24.5 L7.5 27 L5 29.5 L2.5 27 Z" />
    </svg>
  );
}

// Tilt: a red ball rolls along a path to the outline of its hole. A wall is under the path.
function TiltIcon() {
  return (
    <svg className={styles.tiltIcon} viewBox="0 0 32 32" width="34" height="34">
      <rect className={styles.tiltWall} x="13" y="19" width="7" height="7" rx="1.5" />
      <path className={styles.tiltPath} d="M12 11 H19" />
      <circle className={styles.tiltHole} cx="25" cy="11" r="4.5" />
      <circle className={styles.tiltBall} cx="7" cy="11" r="4.5" />
    </svg>
  );
}

// A small picture of each puzzle type. Each type has a different kind of picture, so the cards are easy to tell
// apart. It is only decoration. TypeScript makes sure that each puzzle type has an icon.
const icons: { [Type in PuzzleType]: () => ReactNode } = {
  "colour-binary": ColourBinaryIcon,
  guzzle: GuzzleIcon,
  latics: LaticsIcon,
  numpuz: NumpuzIcon,
  orbital: OrbitalIcon,
  tilt: TiltIcon,
};

export function PuzzleIcon({ type }: { type: PuzzleType }) {
  const Icon = icons[type];
  return (
    <div className={styles.icon} aria-hidden="true">
      <Icon />
    </div>
  );
}
