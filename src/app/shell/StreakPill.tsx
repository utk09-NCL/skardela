import { useTranslation } from "react-i18next";
import { currentStreak } from "../../shared/state/progress";
import { useAppStore } from "../../shared/state/store";
import { useToday } from "../../shared/useNow";
import styles from "./Layout.module.css";

// The streak in the header: the days in a row with at least one solved puzzle. A new player has no streak,
// thus the pill shows only from 1 day. The clock changes each minute, so the streak is correct after midnight.
export function StreakPill() {
  const { t } = useTranslation();
  const results = useAppStore((state) => state.results);
  const today = useToday();
  const streak = currentStreak(results, today);
  if (streak === 0) return null;
  return (
    <p className={styles.streak}>
      <span className={styles.streakDot} aria-hidden="true" />
      <span>{streak}</span>
      <span className={styles.streakWord}>{t(($) => $.streak.word)}</span>
    </p>
  );
}
