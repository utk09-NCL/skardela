import type { ReactNode } from "react";
import styles from "./Board.module.css";

// One number of the game, for example the misses. The screen shows a short label and the value,
// for example "Misses 2". A screen reader reads "text", for example "2 misses".
// "isAnnounced: false" is for a number that the status text already tells, so a screen reader does not
// read it two times. Such a number is not a live region.
export type Metric = {
  readonly label: string;
  readonly value: number | string;
  readonly text: string;
  readonly isAnnounced?: boolean;
};

// The line under the stage: the status text of the board on the left, and the numbers of the game on the right.
// Each number is a live region, so a screen reader tells each change. It is not an <output>,
// because the status text is the one "status" of the board.
export function StatusRow({
  metrics,
  children,
}: {
  metrics: readonly Metric[];
  children: ReactNode;
}) {
  return (
    <div className={styles.statusRow}>
      {children}
      {metrics.length > 0 && (
        <div className={styles.metrics}>
          {metrics.map(({ label, value, text, isAnnounced }) => (
            <p
              key={label}
              className={styles.metric}
              aria-live={isAnnounced === false ? undefined : "polite"}
              aria-atomic={isAnnounced === false ? undefined : true}
            >
              <span aria-hidden="true" className={styles.metricLabel}>
                {label}
              </span>
              <span aria-hidden="true" className={styles.metricValue}>
                {value}
              </span>
              <span className="visually-hidden">{text}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
