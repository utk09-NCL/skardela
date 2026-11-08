import { symbols } from "../symbols";

// A short date in British English, for example "25 October". "timeZone" is set for a day key,
// because a day key is a date without a time. See "src/shared/state/progress.ts".
const shortDate = (date: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone }).format(date);

// The lines of a share text. An empty line is removed. Apps that show the text keep the line breaks.
const shareLines = (lines: readonly string[]) => lines.filter((line) => line !== "").join("\n");

// The first line of a share text: the site name, and the date when the puzzles are the puzzles of today.
const shareTitle = (day: string | undefined) =>
  day === undefined ? "Skardela" : `Skardela · ${shortDate(new Date(`${day}T00:00:00Z`), "UTC")}`;

// The address of the site at the end of a share text.
const site = "skardela.netlify.app";

// The text of the app frame: the site name, the header, the footer, the analytics notice and the error pages.
export const app = {
  siteName: "Skardela",
  skipLink: "Skip to main content",
  nav: {
    label: "Main",
    stats: "Your stats",
  },
  // The streak in the header: the days in a row with at least one solved puzzle.
  // A small screen shows only the number. A screen reader always reads the full text.
  streak: { word: "-day streak" },
  // The name of each level. The home page and the puzzle page both use it.
  levels: { easy: "Easy", medium: "Medium", hard: "Hard" },
  // The share text and the share buttons. The home page and the puzzle page both use them.
  // "day" is the day key of today's puzzles. It is undefined for a puzzle that is not one of today's puzzles.
  // "marks" is one square symbol for each level. See "src/shared/share.ts".
  share: {
    site,
    // The result of one puzzle, for example "Guzzle #0024, Medium" and "Solved in 2:14 with 1 mistake".
    puzzle: (result: {
      day: string | undefined;
      typeName: string;
      number: string;
      level: string;
      marks: string;
      time: string;
      score: string | undefined;
    }) =>
      shareLines([
        shareTitle(result.day),
        `${result.typeName} #${result.number}, ${result.level}`,
        result.marks,
        `Solved in ${result.time}${result.score === undefined ? "" : ` with ${result.score}`}`,
        site,
      ]),
    // Today's results of one puzzle type, for example "Easy 1:42 · Medium 2:14". Each "time" is a solved level.
    today: (result: {
      day: string;
      typeName: string;
      marks: string;
      times: readonly { level: string; time: string }[];
    }) =>
      shareLines([
        shareTitle(result.day),
        result.typeName,
        result.marks,
        result.times.map(({ level, time }) => `${level} ${time}`).join(" · "),
        site,
      ]),
    // The button text after the action, for a short time. The message tells a screen reader the result.
    copied: "Copied",
    copiedMessage: "The result is copied. You can paste it now.",
    sharedMessage: "The result is shared.",
    failed: "Not copied",
    failedMessage: "Your browser did not let Skardela copy the result.",
  },
  theme: {
    label: "Theme",
    options: {
      system: `${symbols.theme.system} System`,
      light: `${symbols.theme.light} Light`,
      dark: `${symbols.theme.dark} Dark`,
    },
  },
  // The analytics line is for returning players. New players see the analytics notice.
  footer: {
    tagline: "Skardela · free daily puzzles · no account, no download",
    source: { label: "Source on GitHub", href: "https://github.com/utk09-NCL/skardela" },
    content: (year: number) => `© ${year} Skardela. This website uses analytics without cookies.`,
  },
  // The message when the browser cannot save data. See "src/app/shell/StorageNotice.tsx".
  storage: {
    unavailable:
      "Your browser does not let Skardela save data. You can play, but your progress is lost when you close the page.",
    full: 'The browser storage is full, thus Skardela cannot save your new progress. Select "Export my data" under "Your stats", then "Clear my data".',
    outdated:
      "A different tab has a new version of Skardela. Reload this page to save your progress.",
    statsLink: "Go to your stats",
    close: "Close the message",
  },
  analyticsNotice: {
    title: "This website uses analytics",
    body: "Skardela uses analytics to count visits and to see which puzzles people play. The analytics tool does not use cookies, and it does not follow you to other websites.",
    ok: "OK",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist.",
    homeLink: "Go to the home page",
  },
  routeError: {
    title: "Something went wrong",
    body: "An error stopped this page. Reload the page to try again.",
    homeLink: "Go to the home page",
  },
};
