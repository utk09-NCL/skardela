import type { ReactNode } from "react";
import type { PuzzleType } from "../../puzzle-types/registry";
import styles from "./PuzzleIcon.module.css";

// A small drawing of each puzzle type, on a grid of 24 × 24. Each shape draws with "currentColor",
// and its class sets the colour from a token. Thus the icons follow the theme.
const drawings: { [Type in PuzzleType]: ReactNode } = {
  // Two red and two blue squares.
  "colour-binary": (
    <>
      <rect className={styles.red} x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect className={styles.blue} x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect className={styles.blue} x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
      <rect className={styles.red} x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
    </>
  ),
  // Four squares around the centre letter, where the words cross.
  guzzle: (
    <>
      <g className={styles.ink} fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2.5" y="9.5" width="5" height="5" rx="1.2" />
        <rect x="16.5" y="9.5" width="5" height="5" rx="1.2" />
        <rect x="9.5" y="2.5" width="5" height="5" rx="1.2" />
        <rect x="9.5" y="16.5" width="5" height="5" rx="1.2" />
      </g>
      <rect
        className={styles.accent}
        x="9.5"
        y="9.5"
        width="5"
        height="5"
        rx="1.2"
        fill="currentColor"
      />
    </>
  ),
  // A laser beam that turns at a mirror and goes up to a monster.
  latics: (
    <>
      <path
        className={styles.accent}
        d="M4 20 L12 12 L12 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className={styles.accent} cx="4" cy="20" r="2.2" fill="currentColor" />
      <path
        className={styles.ink}
        d="M9 15 L15 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        className={styles.monster}
        x="14"
        y="2"
        width="7"
        height="6.5"
        rx="3"
        fill="currentColor"
      />
    </>
  ),
  // The four operators. The equals sign has the accent colour.
  numpuz: (
    <>
      <g className={styles.ink} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6.5 4v7M3 7.5h7" />
        <path d="M14.5 4.5l5 5M19.5 4.5l-5 5" />
        <path d="M14 18.5h6" />
      </g>
      <circle className={styles.ink} cx="17" cy="15.5" r="1.2" fill="currentColor" />
      <circle className={styles.ink} cx="17" cy="21.5" r="1.2" fill="currentColor" />
      <path
        className={styles.accent}
        d="M3 17h7M3 20.5h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  // A planet, the dotted path of the probe, and the ring.
  orbital: (
    <>
      <circle className={styles.ink} cx="11" cy="13" r="4.5" fill="currentColor" />
      <path
        className={styles.muted}
        d="M3 21 C 4 8, 14 3, 21 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="1.5 2.5"
        strokeLinecap="round"
      />
      <circle
        className={styles.accent}
        cx="19"
        cy="18"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeDasharray="2 1.6"
      />
      <circle className={styles.accent} cx="3" cy="21" r="1.8" fill="currentColor" />
    </>
  ),
  // The board with a red ball that rolls to the outline of its hole.
  tilt: (
    <>
      <rect
        className={styles.ink}
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle className={styles.red} cx="8.5" cy="15.5" r="3" fill="currentColor" />
      <circle
        className={styles.red}
        cx="16"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="1.8 1.4"
      />
      <path
        className={styles.accent}
        d="M11.5 12.5 L14 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),
};

// The icon of a puzzle type on its card. It is only decoration. TypeScript makes sure that each puzzle type has one.
export function PuzzleIcon({ type }: { type: PuzzleType }) {
  return (
    <div className={styles.icon} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24">
        {drawings[type]}
      </svg>
    </div>
  );
}
