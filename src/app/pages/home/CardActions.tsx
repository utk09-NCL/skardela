import { Link } from "react-router";
import { formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { marksText } from "../../../shared/share";
import { ShareButton } from "../../../shared/ShareButton";
import { text } from "../../../text/en";
import type { TodayCard } from "../../puzzles";
import styles from "./HomePage.module.css";

const words = text.home.today;

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
  const name = text[card.type].name;
  const shareText = () =>
    text.share.today({
      day,
      typeName: name,
      marks: marksText(bests),
      times: card.levels.flatMap(({ difficulty }, index) => {
        const best = bests[index];
        return best === undefined
          ? []
          : [{ level: text.levels[difficulty], time: formatDuration(best.seconds) }];
      }),
    });
  return (
    <div className={styles.cardActions}>
      {next === undefined ? (
        <p className={styles.allSolved}>{words.allSolved(totalTime(bests))}</p>
      ) : (
        <Link className={styles.cta} to={`/puzzles/${next.id}`}>
          {words.play(text.levels[next.difficulty])}
        </Link>
      )}
      {bests.some((best) => best !== undefined) && (
        <ShareButton
          getText={shareText}
          label={words.share}
          accessibleName={words.shareLabel(name)}
          className={styles.share}
        />
      )}
    </div>
  );
}
