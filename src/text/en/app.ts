import { symbols } from "../symbols";

// The text of the app frame: the site name, the header, the footer, the analytics notice and the error pages.
// i18next fills each "{{name}}" with a value from the code. A key that ends in "_one" or "_other" is a plural.
// "shortDate" and "longDate" are date formats of the language. See "src/i18n/config.ts".
export const app = {
  siteName: "Skardela",
  skipLink: "Skip to main content",
  nav: {
    label: "Main",
    stats: "Your stats",
  },
  // The language list in the header. The names of the languages are in "src/i18n/config.ts".
  language: { label: "Language" },
  // The streak in the header: the days in a row with at least one solved puzzle.
  // A small screen shows only the number. A screen reader always reads the full text.
  streak: { word: "-day streak" },
  // The name of each level. The home page and the puzzle page both use it.
  levels: { easy: "Easy", medium: "Medium", hard: "Hard" },
  // The lines of the share text and the share buttons. The home page and the puzzle page both use them.
  // See "src/shared/share.ts".
  share: {
    site: "skardela.netlify.app",
    // The first line. It has the date when the puzzles are the puzzles of today.
    title: "Skardela",
    titleWithDate: "Skardela · {{date, shortDate}}",
    // The result of one puzzle, for example "Guzzle #0024, Medium" and "Solved in 2:14 with 1 mistake".
    puzzle: "{{typeName}} #{{number}}, {{level}}",
    solvedIn: "Solved in {{time}}",
    solvedInWith: "Solved in {{time}} with {{score}}",
    // Today's results of one puzzle type, for example "Easy 1:42 · Medium 2:14".
    levelTime: "{{level}} {{time}}",
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
    content: "© {{year}} Skardela. This website uses analytics without cookies.",
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
  // The title of a page in the browser tab, for example "Page not found | Skardela".
  pageTitle: "{{title}} | {{siteName}}",
};
