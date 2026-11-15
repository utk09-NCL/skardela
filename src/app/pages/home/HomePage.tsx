import { useLoaderData } from "react-router";
import { text } from "../../../text/en";
import type { homeLoader } from "../../puzzles";
import { DailyHero } from "./DailyHero";
import { Faq } from "./Faq";
import { HowItWorks } from "./HowItWorks";
import { TodayPuzzles } from "./TodayPuzzles";

// The home page: the hero with the progress of today, today's puzzles, how it works and the questions.
// The stats are on their own page. See "src/app/pages/stats/".
// Each section is in its own file in this folder. All sections use "HomePage.module.css",
// except the icons of the puzzle types, which use "PuzzleIcon.module.css".
// The progress comes from the saved data in the store. See "src/shared/state/store.ts".
export function HomePage() {
  const cards = useLoaderData<typeof homeLoader>();
  return (
    <>
      <title>{text.siteName}</title>
      <DailyHero cards={cards} />
      <TodayPuzzles cards={cards} />
      <HowItWorks />
      <Faq />
    </>
  );
}
