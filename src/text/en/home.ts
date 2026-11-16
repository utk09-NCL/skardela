// The text of the home page. Each section of "src/app/pages/home/" has one part.
import { symbols } from "../symbols";

// A long date in British English, for example "Saturday 24 October". "timeZone" is set for a day key,
// because a day key is a date without a time. See "src/shared/state/progress.ts".
export const longDate = (date: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);

// "1 puzzle", "2 puzzles".
export const puzzleCount = (count: number) => `${count} ${count === 1 ? "puzzle" : "puzzles"}`;

// The text of the home page. Each section of "src/app/pages/home/" has one part.
export const home = {
  // The date above the headline. The CSS shows it in capitals.
  date: (now: Date) => longDate(now),
  hero: {
    title: "Today's puzzles",
    intro:
      "Logic, word and number puzzles. Each puzzle type has an easy, a medium and a hard puzzle. The puzzles change at midnight. You do not need an account or a download.",
    // The link to the last puzzle that the player opened and did not solve.
    continueLabel: "Continue",
    puzzleName: (typeName: string, level: string) => `${typeName} · ${level}`,
    // The ring shows the count, for example "7/18". A screen reader reads the full sentence.
    solvedToday: "Solved today",
    progress: (solved: number, total: number) => `${solved} of ${total} puzzles solved today`,
    // The time to the next midnight. The screen shows units in short form, for example "3 h 57 min".
    // A screen reader reads the full words, for example "3 hours 57 minutes".
    newPuzzlesIn: "new puzzles in",
    timeShort: ({ hours, minutes }: { hours: number; minutes: number }) =>
      [hours > 0 ? `${hours} h` : "", minutes > 0 || hours === 0 ? `${minutes} min` : ""]
        .filter((part) => part !== "")
        .join(" "),
    timeLong: ({ hours, minutes }: { hours: number; minutes: number }) =>
      [
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : "",
        minutes > 0 || hours === 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "",
      ]
        .filter((part) => part !== "")
        .join(" "),
  },
  today: {
    // The chips above the cards. "New" shows the puzzle types of the last two weeks.
    filtersLabel: "Show the puzzle types",
    filters: { all: "All", new: "New" },
    // The details under the name of a card, for example "by skardela" and "added 7 Nov".
    // "by" and the name of the author of the puzzle type. The name has the text colour.
    by: "by",
    added: (day: string) =>
      `added ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`))}`,
    newTag: "New",
    levelsLabel: (puzzleTypeName: string) => `Today's ${puzzleTypeName}`,
    // The status under the name of each level: the best time of a solved level, "play" on the next level
    // to play, and a dash on the other levels. A check mark shows before the time of a solved level.
    // An older solve has no time. Then the status shows "solved".
    solvedMark: symbols.progress.solved,
    solvedNoTime: "solved",
    next: "play",
    notSolved: "—",
    // The name of a level link for a screen reader. It has the visible words in the same order, for voice
    // control: the level, then the time or "play", then the result, for example "Easy, 1:42, solved with 1 mistake".
    levelLink: (level: string, result?: { time?: string; score?: string }, isNext = false) =>
      result === undefined
        ? `${level}, ${isNext ? "play, " : ""}not solved`
        : [
            `${level}, `,
            result.time === undefined ? "solved" : `${result.time}, solved`,
            result.score === undefined ? "" : ` with ${result.score}`,
          ].join(""),
    // After the first solve, a card has a Share button. Its label tells a screen reader which puzzle type it shares.
    share: "Share",
    shareLabel: (puzzleTypeName: string) => `Share your ${puzzleTypeName} results of today`,
  },
  steps: {
    heading: "How it works",
    items: [
      {
        title: "Select a puzzle",
        body: "Each puzzle type has an easy, a medium and a hard puzzle for today. Start with easy to learn the rules.",
      },
      {
        title: "Play in your browser",
        body: "The rules are next to the board. Restart at any time, or get a random puzzle of the same level.",
      },
      {
        title: "Come back tomorrow",
        body: "New puzzles come at midnight, your local time. All players get the same puzzles on the same date.",
      },
    ],
  },
  faq: {
    heading: "Questions",
    // The line under the heading, with a link to the issues on GitHub.
    other: "Something else? Open an issue on",
    issues: { label: "GitHub", href: "https://github.com/utk09-NCL/skardela/issues" },
    items: [
      { question: "Is Skardela free?", answer: "Yes. All puzzles are free to play." },
      {
        question: "Do I need an account?",
        answer: "No. Skardela has no accounts. Open a puzzle and play.",
      },
      {
        question: "Does Skardela keep my progress?",
        answer:
          'Partly. Skardela saves the puzzles that you solve, your times and your streak. "Random puzzle" gives you puzzles that you did not solve. A puzzle that you did not finish starts again when you reload the page. Skardela also saves your theme and your OK for the analytics notice. All of this stays in your browser.',
      },
      {
        question: "Can I move my progress to a different browser?",
        answer:
          'Yes. Select "Export my data" on the Stats page to save a backup file. In the other browser, select "Import" and select the file. The solves of the file are added to the solves of that browser.',
      },
      {
        question: "Something does not work. What can I do?",
        answer:
          'Reload the page first. If the problem stays, select "Clear my data" on the Stats page. This deletes all your Skardela data from this browser: your stats, your solved puzzles, your theme and your OK for the analytics notice. Then the page loads again, as for a new player.',
      },
      {
        question: "What data does Skardela collect?",
        answer:
          "Skardela uses analytics to count visits and to see which puzzles people play. The analytics tool does not use cookies, and it does not follow you to other websites.",
      },
      {
        question: "Can I help to make Skardela?",
        answer:
          "Yes. Skardela is open source. You can add puzzles, fix problems or add a new puzzle type.",
        link: { label: "Skardela on GitHub", href: "https://github.com/utk09-NCL/skardela" },
      },
    ],
  },
};
