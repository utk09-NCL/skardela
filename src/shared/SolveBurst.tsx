import type { CSSProperties } from "react";
import { symbols } from "../text/symbols";
import styles from "./SolveBurst.module.css";

const colours = ["--accent", "--success", "--blue", "--red", "--yellow"] as const;
const pieceCount = 16;

type PieceStyle = CSSProperties & Record<`--${string}`, string>;

// Each piece flies out from the middle in its own direction. Every third piece is round.
// The values are the same on each solve, so the burst always looks the same.
const pieces: PieceStyle[] = Array.from({ length: pieceCount }, (_, index) => {
  const angle = (index / pieceCount) * 2 * Math.PI + (index % 2) * 0.2;
  const distance = 110 + (index % 3) * 38;
  return {
    "--x": `${(Math.cos(angle) * distance).toFixed(1)}px`,
    "--y": `${(Math.sin(angle) * distance).toFixed(1)}px`,
    "--spin": `${(index * 47) % 180}deg`,
    "--size": `${6 + (index % 3) * 2}px`,
    "--delay": `${60 + (index % 4) * 30}ms`,
    "--colour": `var(${colours[index % colours.length] ?? "--accent"})`,
  };
});

// The burst after a solve: two rings, small pieces and a check mark in the middle of the stage.
// It shows in the stage of the board, and it goes away after two seconds. It is only decoration,
// thus a screen reader does not read it. The status line tells the player that the puzzle is solved.
export function SolveBurst() {
  return (
    <div className={styles.burst} aria-hidden="true" data-testid="solve-burst">
      <span className={styles.ring} />
      <span className={styles.ring} data-late="true" />
      {pieces.map((style, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the pieces never move in the list.
        <span key={index} className={styles.piece} style={style} />
      ))}
      <span className={styles.check}>{symbols.progress.solved}</span>
    </div>
  );
}
