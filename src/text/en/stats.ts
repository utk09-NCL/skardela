// The text of the stats page. Each part of "src/app/pages/stats/" has one part.
import { longDate, puzzleCount } from "./home";

// A short date for the calendar range, for example "13 Oct". A day key is a date without a time,
// thus the time zone is UTC. See "src/shared/state/progress.ts".
const shortDay = (day: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );

export const stats = {
  heading: "Your stats",
  note: "Saved in this browser only. No account.",
  kpis: {
    streak: "day streak",
    longest: "longest streak",
    solved: "puzzles solved",
    days: "days played",
  },
  calendar: {
    heading: "Last five weeks",
    // The first and the last day of the calendar, for example "13 Oct – 16 Nov". The CSS shows it in capitals.
    range: (first: string, last: string) => `${shortDay(first)} – ${shortDay(last)}`,
    weekdays: ["M", "T", "W", "T", "F", "S", "S"],
    day: (day: string, puzzles: number) =>
      `${longDate(new Date(`${day}T00:00:00Z`), "UTC")}: ${puzzleCount(puzzles)} solved`,
    legend: { none: "none", low: "1–3", mid: "4–6", high: "7+" },
  },
  // One row for each puzzle type and one column for each level. A cell shows the best time.
  // The name of a puzzle type is a button that shows the average times of its row.
  bests: {
    heading: "Personal bests",
    puzzle: "Puzzle",
    noTime: "No solves",
    average: (time: string) => `average ${time}`,
    note: "Best times. Select a puzzle to see your average times.",
    // Before the first solve, the panel shows one message and a link to a puzzle.
    empty: "Your best times show here after your first solve.",
    play: (typeName: string, level: string) => `Play ${typeName} ${level}`,
  },
  // Export, import and clear. The message line tells the result of each action.
  data: {
    heading: "Your data",
    export: "Export my data",
    import: "Import",
    fileName: (day: string) => `skardela-data-${day}.json`,
    exported: (fileName: string) => `Your data is in the file "${fileName}".`,
    imported: (count: number) =>
      count === 0
        ? "The file has no new solves."
        : `${count} new ${count === 1 ? "solve" : "solves"} added.`,
    notData: 'This file is not a Skardela data file. Select a file from "Export my data".',
    tooLarge: "This file is too large for a Skardela data file.",
    note: "Export makes a backup file. Import adds the solves of a backup file to your data.",
  },
  clear: {
    button: "Clear my data",
    question: "Delete all your Skardela data?",
    // The visible text is short. The label tells a screen reader what each answer does. It starts with the text.
    yes: { text: "Delete", label: "Delete all my data" },
    no: { text: "Keep it", label: "Keep it, do not delete my data" },
    note: '"Clear my data" deletes your stats, your solved puzzles, your theme and your OK for the analytics notice from this browser.',
  },
};
