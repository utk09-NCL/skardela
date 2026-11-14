---
name: fix-bug
description: Fix a bug in Skardela from a GitHub issue or a description. Shows the bug, finds the root cause, writes a test that fails, makes the smallest fix and gets a review. Use when the author reports a bug or a wrong behaviour.
argument-hint: "[issue number or description]"
---

# Fix a bug

Arguments: $ARGUMENTS

Fix the cause of the bug, not only its symptom. Do not change the code before you can show the bug.

## Step 1: Get the facts

1. If the argument is an issue number, run `gh issue view <number> --comments`.
2. Write down the steps, the expected result, the actual result, the page, the puzzle type, the level, the browser and the device. Most of these are fields of `.github/ISSUE_TEMPLATE/bug_report.yml`. The puzzle link gives the puzzle type, and the puzzle page shows the level.
3. If you do not have a fact that you need, ask the author.
4. If the bug is in a puzzle type, find the rule in its `rules.md` that tells the expected result.

## Step 2: Show the bug

Use the fastest method that shows the bug each time:

- Logic, score, puzzle data or saved data: write a unit test.
- A click, a key or a text on a board: write a test with Testing Library, as `Board.test.tsx` of the puzzle type does.
- The look, the layout or a behaviour that only a real browser has: start the dev server with `npm run dev` in the background. Then start the `ui-checker` agent with the URL and the steps of the bug. jsdom does not apply CSS, so a unit test cannot show these bugs.

Run the test with `npm run test -- <path>`. Make sure that it fails because of the bug, not because of a mistake in the test.

If you cannot show the bug, stop. Tell the author what you tried. Ask for more facts.

## Step 3: Find the root cause

1. Follow the wrong value back to the place where it starts. The table below tells where to look first.
2. Write the cause in one or two sentences, with the file and the line.
3. If the code obeys `rules.md` and the player expects a different result, the rule is the problem, not the code. Stop and ask the author if `rules.md` must change.
4. Look for the same mistake in the other puzzle types and in `src/shared/`. Write each place in your report. Do not fix these places without the approval of the author.

| Symptom                                     | Look first in                                                                                      |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A wrong status text or name                 | `status.ts` of the type, `src/text/en/`                                                            |
| A wrong move, score or solve                | `machine.ts`, `rules-check.ts`                                                                     |
| A click, a tap or a key does nothing        | `Board.tsx`, `Grid.tsx`, `Controls.tsx`, `keys.ts`, `useGame.ts`                                   |
| A puzzle has no solution or a wrong answer  | `puzzles/<type>.json`, `findPuzzleProblems` in `puzzle.ts`, `npm run validate`                     |
| Stats, streaks, the timer or the saved data | `src/shared/state/store.ts`, `progress.ts`, `playSession.ts`, `saved-data.ts`, `storage-format.ts` |
| The puzzles of the day                      | `src/app/daily.ts`                                                                                 |
| A page, a link or a URL                     | `src/app/routes.tsx`, `src/app/puzzles.ts`                                                         |
| The look or the layout                      | the `.module.css` file of the component, `src/index.css`                                           |

## Step 4: Fix

1. Make the smallest change that removes the cause. Obey "Simple code" in `AGENTS.md`.
2. Do not refactor. Do not fix other problems in the same change. Write them in your report.
3. Run the test from step 2. It must pass now. Keep the test, so that the bug cannot come back.
4. If the fix does not work, remove it and go back to step 3. Do not put a second fix on top of the first. After 3 fixes that do not work, stop. Tell the author what you found. The design can be the problem.

## Step 5: Check and review

1. Run `npm run fix && npm run check`.
2. If you used the `ui-checker` agent in step 2, start it again with the same steps. It must not find the bug.
3. Start the `code-reviewer` agent. Tell it the bug, the cause and the fix.
4. Fix each "Must fix" finding. Ask the author about the other findings. After each fix, run the checks again.

## Step 6: Report

Tell the author:

- The cause, with the file and the line.
- The fix.
- The test that shows the bug, and the result of each check.
- The other places with the same mistake, if you found them.

Then tell the author that `/open-pr` can commit the change and open a pull request.
