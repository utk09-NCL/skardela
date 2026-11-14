# Contributing to Skardela

Skardela is a UI-only puzzle site. It has no server, no accounts and no database.
AI agents must also read [AGENTS.md](AGENTS.md).

## Set up

1. Use the Node.js version in `.nvmrc`.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:5173`.

Before you open a pull request, run `npm run fix && npm run check`. CI runs the same checks.

## Scripts

| Script                           | What it does                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                    | Starts the app on your computer.                                                                                          |
| `npm run fix`                    | Formats the code and fixes lint problems that a tool can fix.                                                             |
| `npm run check`                  | Runs the format, lint, type, build, unit test and data checks.                                                            |
| `npm run test`                   | Runs the unit tests in `src/`.                                                                                            |
| `npm run validate`               | Checks all puzzle files in `puzzles/`, the tools in `tools/` and the two skill folders. See `tools/puzzles.test.ts`.      |
| `npm run generate:colour-binary` | Makes new Colour Binary puzzles and adds them to `puzzles/colour-binary.json`. See `tools/generate-colour-binary.gen.ts`. |
| `npm run generate:latics`        | Makes new Latics puzzles and adds them to `puzzles/latics.json`. See `tools/generate-latics.gen.ts`.                      |
| `npm run generate:orbital`       | Makes new Orbital puzzles and adds them to `puzzles/orbital.json`. See `tools/generate-orbital.gen.ts`.                   |
| `npm run generate:tilt`          | Makes new Tilt puzzles and adds them to `puzzles/tilt.json`. See `tools/generate-tilt.gen.ts`.                            |

## Project structure

```text
puzzles/                     Puzzle data. One JSON file for each puzzle type. The build ciphers the answers.
tools/puzzles.test.ts        Checks all puzzle data.
tools/react-compiler.test.ts Fails when React Compiler cannot compile a component or a hook in src/.
tools/agent-skills.test.ts   Fails when ".claude/skills" and ".agents/skills" do not have the same files.
tools/generator-script.ts    The parts that each puzzle generator shares: the plan, the search and the puzzle file.
tools/<type>-generator.ts    Makes new puzzles of one type. "npm run generate:<type>" runs it.
src/
  main.tsx                   Starts the app.
  index.css                  Global styles and colour values.
  app/
    routes.tsx               All pages and their URLs.
    puzzles.ts               Loads puzzles for the home page and the puzzle page.
    daily.ts                 Selects the puzzles of the day.
    shell/                   The frame of each page: the header, the notices, the footer and the route error.
      AnalyticsNotice.tsx    The notice for new players. Analytics loads only after the OK.
      useReloadAtMidnight.ts Loads the puzzles of the new day after midnight, on each page.
      reloadAfterRelease.ts  Loads the page again when an open tab asks for a file of an old release.
    pages/                   One file or one folder for each page.
      home/                  The home page: today's progress, today's puzzles, the stats and the questions.
      puzzle/                The puzzle page ("Now playing"), with the timer, Restart and Random puzzle.
    puzzle-types/
      registry.ts            The list of puzzle types and their puzzle files.
      boards.ts              The board component of each puzzle type.
      <type>/                One folder for each puzzle type. See below.
  shared/                    Code that more than one page or puzzle type uses.
    state/                   The saved data and the code that reads it. No React components.
      store.ts               The Zustand store: the saved data and its actions. It saves to one localStorage item.
      saved-data.ts          The shape of the saved data and its checks.
      storage-format.ts      The stored text and the export file. The lists of solves are compressed.
      playSession.ts         The game that the player plays now: the timer and the saving of a solve.
      progress.ts            Pure functions for the stats: streaks, the calendar and personal bests.
    share.ts                 The squares of a share text, and the copy or the share menu. See ShareButton.tsx.
    usePuzzleTracking.ts     The logs, the timer and the saved solve of each puzzle type. "useGame" calls it.
    useTabStop.ts            One Tab stop for a board of squares, and the arrow keys. See also "useFocusWhen.ts".
    useReducedMotion.ts      The "reduce motion" setting, for an animation that the game logic needs.
  text/
    en/                      All UI text. "index.ts" puts the parts together. One file for each page and puzzle type.
    es/                      Spanish text, with the same structure. The app does not use it yet. It has only a part
                             of the text. A type check makes sure that each field has the same type as in "en".
    symbols.ts               All emoji symbols.
  test/                      The test setup, and "deepFreeze" for the machine tests.
```

### A puzzle type folder

```text
src/app/puzzle-types/<type>/
  rules.md                   The rules and one example, step by step.
  examples/<type>-0000.json  The example from rules.md as puzzle data.
  puzzle.ts                  The puzzle data type and the data check "findPuzzleProblems".
  rules-check.ts             Pure rule logic. No React. Easy to test.
  machine.ts                 The state machine. Pure. No React. Each type exports "initialState(puzzle)", "transition",
                             "isSolved", "scoreOf" (the number to keep low) and the queries. The state keeps its moves,
                             for example "moves", or "flights" in Orbital.
  solver.ts                  The search, for example for the fewest moves. Only when the type needs a search.
  useGame.ts                 "useGame(puzzle)": the hook that connects the state machine to React, to the move log and
                             to "usePuzzleTracking". It has no rules of its own.
  status.ts                  The status text for each state of the game.
  log.ts                     The log of each move: "createMoveLog".
  keys.ts                    The keys that the board reads. Only when the type has its own keys.
  Board.tsx                  The board component. It shows the game of "useGame" and has no logs of its own.
  Controls.tsx               The buttons and the keys under the board.
  Board.module.css           Styles for this board only.
  *.test.ts(x)               Tests next to the code that they test.
```

A type can have more files, each with one job. For example `motion.ts` for an animation, `input.ts` for a drag or
a swipe, and `hint.ts` for the hint of Colour Binary.

Put pure logic in `.ts` files and keep React components small. When a component file gets long, move
parts into their own files. See `guzzle/` for an example: `useGame.ts`, `Grid.tsx`, `Controls.tsx`, `status.ts`.

## Add a new puzzle type

1. Make the folder `src/app/puzzle-types/<type>/` with the files above. Start with `rules.md`.
2. In `puzzle.ts`, make the puzzle type with `PuzzleBase & { readonly type: "<type>"; ... }`.
3. Add your puzzles to `puzzles/<type>.json`. Add at least one puzzle for each level.
   Put the answer in the field `answer` as readable rows. A Vite plugin in `vite.config.ts` ciphers `answer`, so the browser does not get a readable answer. In `registry.ts`, use `decipherPuzzles` to load the file. A puzzle type that checks the moves with its rules can have no `answer`, for example `latics`. Then the plugin does not change the file, and the type does not need `decipherPuzzles`.
4. In `src/app/puzzle-types/registry.ts`, add your type to `PuzzleMap` and to `puzzleTypes`.
5. Run `npm run typecheck`. TypeScript then shows each place that needs your type:
   - `src/app/puzzle-types/boards.ts`: your board component.
   - `src/text/en/index.ts`: your UI text. Put it in a new file `src/text/en/<type>.ts`, with `name`,
     `summary`, `rules`, `rulesKey`, `moreRules`, `score` and `scoreWord`. Then add it to `index.ts` with the name of your type. `rules` has three short rules. `rulesKey` is a list of sample squares and their meaning, or an empty list. `moreRules` has a label and the other rules. `score` gives the score of a solve as text, for example "2 mistakes".
   - `src/app/pages/home/PuzzleIcon.tsx`: the small icon of your type on the home page.
   - `tools/puzzles.test.ts`: your example and your data check.
6. Put emoji symbols in `src/text/symbols.ts`, not in other files.
7. In `useGame.ts`, call `usePuzzleTracking` from `src/shared/`. Give it `isSolved` and `scoreOf` of your machine,
   the moves of the state, and `createMoveLog` from your `log.ts`.
   It logs each move, the start and the solve. It starts the timer and saves each solve, for the stats and for "Random puzzle".
   `scoreOf` gives the score to keep low, for example the misses of Latics. The solve saves it as `mistakes`. The result card and the share text show it. See `latics/useGame.ts`.
   For a board of squares, use one Tab stop and the arrow keys: `useTabStop` and `useFocusWhen` from `src/shared/`. See `latics/Grid.tsx`.
8. Add tests for your rule logic and your board.
9. Add your type to the table of puzzle types in `README.md`.
10. Run `npm run fix && npm run check`.

## Rules for code

- Use strict TypeScript. Do not use `any` or `@ts-ignore`.
- Put all UI text in the `src/text/en/` folder. Put all emoji symbols in `src/text/symbols.ts`.
- Use the shared code in `src/shared/` before you write new code. For example `RuleList`, `useTabStop`, `useFocusWhen`, `useReducedMotion`,
  `Board.module.css`, `gridStyle` and `PuzzleBase`.
- Make each control work with a keyboard and a screen reader. Do not use colour as the only signal.
- Write comments and UI text in simple, clear English.
- Do not weaken or skip tests.

## Pull requests

- Use a [Conventional Commits](https://www.conventionalcommits.org/) title, for example `feat: add puzzle timer`.
- Fill in the pull request template: what changed, why, how you tested it, and which AI tool you used.
