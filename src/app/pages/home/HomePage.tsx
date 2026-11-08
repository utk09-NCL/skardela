import { useLoaderData } from "react-router";
import { text } from "../../../text/en";
import type { homeLoader } from "../../puzzles";
import { useScrollToHash } from "./useScrollToHash";
import { DailyHero } from "./DailyHero";
import { Faq } from "./Faq";
import { HowItWorks } from "./HowItWorks";
import { Stats } from "./Stats";
import { TodayPuzzles } from "./TodayPuzzles";

// The home page: the progress of today, today's puzzles, the stats of the player, how it works and the questions.
// Each section is in its own file in this folder. All sections use "HomePage.module.css",
// except the icons of the puzzle types, which use "PuzzleIcon.module.css".
// The progress and the stats come from the saved data in the store. See "src/shared/state/store.ts".
export function HomePage() {
  const cards = useLoaderData<typeof homeLoader>();
  // A link such as "/#stats" from a different page goes to its section after the sections render.
  useScrollToHash();
  return (
    <>
      <title>{text.siteName}</title>
      <DailyHero cards={cards} />
      <TodayPuzzles cards={cards} />
      <Stats cards={cards} />
      <HowItWorks />
      <Faq />
    </>
  );
}
