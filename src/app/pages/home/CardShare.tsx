import { formatDuration } from "../../../shared/state/progress";
import type { SolveResult } from "../../../shared/state/saved-data";
import { marksText } from "../../../shared/share";
import { ShareButton } from "../../../shared/ShareButton";
import { text } from "../../../text/en";
import type { TodayCard } from "../../puzzles";
import styles from "./HomePage.module.css";

const words = text.home.today;

type CardShareProps = {
  card: TodayCard;
  // The best solve of each level of the card, in level order. "undefined" is a level that is not solved.
  bests: readonly (SolveResult | undefined)[];
  // Today, as a day key. The share text shows the date.
  day: string;
};

// After the first solve of today, "Share" copies today's results of this puzzle type:
// one square for each level and the time of each solved level.
export function CardShare({ card, bests, day }: CardShareProps) {
  if (bests.every((best) => best === undefined)) return null;
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
    <ShareButton
      getText={shareText}
      label={words.share}
      accessibleName={words.shareLabel(name)}
      className={styles.share}
    />
  );
}
