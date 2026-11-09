import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { marksText, todayShareText } from "../../../shared/share";
import { ShareButton } from "../../../shared/ShareButton";
import type { TodayCard } from "../../puzzles";
import styles from "./HomePage.module.css";

type CardActionsProps = {
  card: TodayCard;
  // The best solve of each level of the card, in level order. "undefined" is a level that is not solved.
  bests: readonly (SolveResult | undefined)[];
  // The first level that the player did not solve, or undefined when all levels are solved.
  next: TodayCard["levels"][number] | undefined;
  // Today, as a day key. The share text shows the date.
  day: string;
};

// The total of the best times of all levels, or undefined when a level has no saved time.
function totalTime(bests: readonly (SolveResult | undefined)[]): string | undefined {
  if (bests.some((best) => best === undefined)) return undefined;
  return formatDuration(bests.reduce((sum, best) => sum + (best?.seconds ?? 0), 0));
}

// The last row of a card: the link to the next level, or the total time when all levels are solved.
// After the first solve, "Share" copies today's results of this puzzle type.
export function CardActions({ card, bests, next, day }: CardActionsProps) {
  const { t } = useTranslation();
  const name = t(($) => $[card.type].name);
  const total = totalTime(bests);
  const shareText = () =>
    todayShareText(t, {
      day,
      typeName: name,
      marks: marksText(bests),
      times: card.levels.flatMap(({ difficulty }, index) => {
        const best = bests[index];
        return best === undefined
          ? []
          : [{ level: t(($) => $.levels[difficulty]), time: formatDuration(best.seconds) }];
      }),
    });
  return (
    <div className={styles.cardActions}>
      {next === undefined ? (
        <p className={styles.allSolved}>
          {total === undefined
            ? t(($) => $.home.today.allSolved)
            : t(($) => $.home.today.allSolvedTotal, { total })}
        </p>
      ) : (
        <Link className={styles.cta} to={`/puzzles/${next.id}`}>
          {t(($) => $.home.today.play, { level: t(($) => $.levels[next.difficulty]) })}
        </Link>
      )}
      {bests.some((best) => best !== undefined) && (
        <ShareButton
          getText={shareText}
          label={t(($) => $.home.today.share)}
          accessibleName={t(($) => $.home.today.shareLabel, { typeName: name })}
          className={styles.share}
        />
      )}
    </div>
  );
}
