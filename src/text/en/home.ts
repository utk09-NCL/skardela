// The text of the home page. Each section of "src/app/pages/home/" has one part.
import { symbols } from "../symbols";

// The text of the home page. Each section of "src/app/pages/home/" has one part.
// "longDate" is a long date of the language, for example "Saturday 24 October". See "src/i18n/config.ts".
export const home = {
  // The date above the headline. The CSS shows it in capitals.
  date: "{{date, longDate}}",
  hero: {
    // A new player sees what Skardela is, and two links.
    title: "A new set of puzzles every day",
    intro:
      "Skardela has new kinds of logic and word puzzles. Each puzzle type has an easy, a medium and a hard puzzle each day. Play in your browser. You do not need an account or a download.",
    play: "Play today's puzzles",
    howItWorks: "How it works",
    // A returning player sees the progress of today. "count" is the number of puzzles that are not solved.
    solvedSome_one: "{{solved}} down. {{count}} puzzle left today.",
    solvedSome_other: "{{solved}} down. {{count}} puzzles left today.",
    solvedAll: "All of today's puzzles are solved. See you tomorrow.",
    pickUp: "Pick up where you left off.",
    // The link to the last puzzle that the player opened and did not solve.
    continueLabel: "Continue",
    puzzleName: "{{typeName}} · {{level}}",
    progressLabel: "Today's puzzles",
    segmentSolved: "{{typeName}} {{level}}: solved",
    segmentNotSolved: "{{typeName}} {{level}}: not solved",
    progress: "{{solved}} of {{total}} solved",
    // The time to the next midnight. The screen shows units in short form, for example "3 h 57 min".
    // A screen reader reads the full words, for example "3 hours 57 minutes".
    newPuzzlesIn: "new puzzles in",
    hoursShort: "{{count}} h",
    minutesShort: "{{count}} min",
    hours_one: "{{count}} hour",
    hours_other: "{{count}} hours",
    minutes_one: "{{count}} minute",
    minutes_other: "{{count}} minutes",
  },
  today: {
    heading: "Today's puzzles",
    intro:
      "The puzzles change at midnight, your local time. All players get the same puzzles on the same date.",
    levelsLabel: "Today's {{typeName}}",
    // The status under the name of each level. A solved level shows a check mark after its name,
    // and the result of its best solve: the time and the score, for example "1:42" and "0 mistakes".
    // An older solve has no score. Then the status shows only the time.
    notSolved: "not solved",
    solvedMark: symbols.progress.solved,
    solvedNoTime: "solved",
    // The name of a level link for a screen reader. It starts with the visible level name.
    levelNotSolved: "{{level}}, not solved",
    levelSolved: "{{level}}, solved",
    levelSolvedIn: "{{level}}, solved in {{time}}",
    levelSolvedWith: "{{level}}, solved with {{score}}",
    levelSolvedInWith: "{{level}}, solved in {{time}} with {{score}}",
    play: "Play {{level}}",
    // When all levels are solved, the card shows the total of the best times.
    allSolved: "All solved today",
    allSolvedTotal: "All solved · {{total}} total",
    // Each card has a Share button. Its label tells a screen reader which puzzle type it shares.
    share: "Share",
    shareLabel: "Share your {{typeName}} results of today",
  },
  stats: {
    heading: "Your stats",
    note: "Saved in this browser only · no account",
    kpis: {
      streak: "day streak",
      longest: "longest streak",
      solved: "puzzles solved",
      days: "days played",
    },
    calendar: {
      heading: "Last five weeks",
      weekdays: ["M", "T", "W", "T", "F", "S", "S"],
      day_one: "{{date, longDate}}: {{count}} puzzle solved",
      day_other: "{{date, longDate}}: {{count}} puzzles solved",
      legendLabel: "Solved puzzles in a day",
      legend: { none: "none", low: "1–3", mid: "4–6", high: "7+" },
    },
    // One row for each puzzle type and one column for each level. A cell shows the best time.
    // The name of a puzzle type is a button that shows the average times of its row.
    bests: {
      heading: "Personal bests",
      puzzle: "Puzzle",
      noTime: "No solves",
      average: "average {{time}}",
      note: "Best times. Select a puzzle to see your average times.",
      // Before the first solve, the panel shows one message and a link to a puzzle.
      empty: "Your best times show here after your first solve.",
      play: "Play {{typeName}} {{level}}",
    },
    // Export, import and clear. The message line tells the result of each action.
    data: {
      export: "Export my data",
      import: "Import",
      fileName: "skardela-data-{{day}}.json",
      exported: 'Your data is in the file "{{fileName}}".',
      imported_zero: "The file has no new solves.",
      imported_one: "{{count}} new solve added.",
      imported_other: "{{count}} new solves added.",
      notData: 'This file is not a Skardela data file. Select a file from "Export my data".',
      tooLarge: "This file is too large for a Skardela data file.",
      note: "Export makes a backup file. Import adds the solves of a backup file to your data.",
    },
    clear: {
      button: "Clear my data",
      question: "Delete all your Skardela data?",
      yes: { text: "Yes", label: "Yes, delete all my data" },
      no: { text: "No", label: "No, keep my data" },
      note: '"Clear my data" deletes your stats, your solved puzzles, your theme and your OK for the analytics notice from this browser.',
    },
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
        body: "New puzzles come each day at midnight, your local time.",
      },
    ],
  },
  faq: {
    heading: "Questions",
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
          'Yes. Select "Export my data" under "Your stats" to save a backup file. In the other browser, select "Import" and select the file. The solves of the file are added to the solves of that browser.',
      },
      {
        question: "Something does not work. What can I do?",
        answer:
          'Reload the page first. If the problem stays, select "Clear my data" under "Your stats" on the home page. This deletes all your Skardela data from this browser: your stats, your solved puzzles, your theme and your OK for the analytics notice. Then the page loads again, as for a new player.',
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
