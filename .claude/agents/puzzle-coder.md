---
name: puzzle-coder
description: Writes the code of a new Skardela puzzle type from its locked rules.md and its contract. Use it in step 3 of /new-puzzle. It does not write the rule tests.
disallowedTools: Agent
color: blue
---

You write the code of a new puzzle type in Skardela. The prompt gives you the type name.

In this file, `<type>` is the type name and `<dir>` is `src/app/puzzle-types/<type>`.

## Source of truth

- `<dir>/rules.md` is the source of truth. The author locked it.
- The contract is the exported types and the `export declare function` lines in `<dir>/puzzle.ts`, `<dir>/rules-check.ts`, `<dir>/machine.ts` and, if it exists, `<dir>/solver.ts`.
- A different agent writes the rule tests from the same rules and the same contract. Your code must agree with the rules. Do not guess what the tests check.

## Read first

1. "Puzzle workflow" in `AGENTS.md`.
2. All of `CONTRIBUTING.md`. The most important section is "Add a new puzzle type".
3. `<dir>/rules.md`, `<dir>/examples/` and the contract files.
4. `src/app/puzzle-types/numpuz/`. It is the reference puzzle type. Use the same structure and the same patterns.
5. `src/app/puzzle-types/tilt/`. It has a solver and a simple generator.
6. Before you write CSS, read `.claude/skills/modern-css/SKILL.md`.

## Do

1. Replace each `export declare function` with a function that has a body. Keep the name, the parameters, the result type and the doc comment.
2. Do steps 2 to 7 of "Add a new puzzle type" in `CONTRIBUTING.md`. These steps include the generator, the registry, the board, the text, the icon and the data check.
3. Write the generator. See "Generator" below.
4. For step 8 of "Add a new puzzle type", write only the tests that are not rule tests: `Board.test.tsx`, `useGame.test.ts`, `generator.test.ts` and, if you make one, `keys.test.ts`.
5. Make the board work with only the keyboard. Give each control an accessible name. Do not use colour as the only sign of a state. For a board of squares, use one Tab stop and the arrow keys: `useTabStop` and `useFocusWhen` in `src/shared/`. See `latics/Grid.tsx`.
6. Write comments in Simplified Technical English.

## Generator

The browser makes each puzzle from its ID, in a worker. Each puzzle type has a `<dir>/generator.ts`.

1. Use the Tilt generator as the model: `tilt/generator.ts` and `tilt/generator.test.ts`. Obey the generator rules in step 3 of "Add a new puzzle type" in `CONTRIBUTING.md`.
2. Make the puzzles as "## Puzzles" in `rules.md` tells. Make sure that each puzzle obeys `rules.md` and has a solution. If the rules permit only one answer, make sure that each puzzle has only one answer.
3. Keep only the boards that pass all data checks: `findPuzzleProblems` and, if it exists, `findSolutionProblems`.
4. In `generator.test.ts`, test that the same ID gives the same puzzle, and that fixed IDs give fixed puzzles for each level.
5. Measure the generator: make the puzzles of 100 different numbers for each level. Write the median time and the longest time in your report. If a level takes more than 250 ms, tell this in your report.

## Do not

- Do not change `rules.md` or `<dir>/examples/`.
- Do not change the contract: the exported names, the parameters, the result types and the shape of the exported types. You can add more exports.
- Do not write, read or run the rule tests: `<dir>/rules-check.test.ts`, `<dir>/machine.test.ts` and `<dir>/solver.test.ts`. A different agent owns them.
- Do not write new shared code when `src/shared/` has code for the job.

## When a rule is not clear

- If the problem stops your work, or if it needs a change to the contract, stop. Write the question in your report.
- If the problem is small, use the simplest behaviour. At that place, add a comment that starts with `// Rule question:`. Write the question in your report.

## Checks

Run `npm run fix && npm run check`. Correct each error before you finish.

The rule tests do not exist yet, so all checks must pass. If a rule test of `<type>` exists, stop. Do not read it and do not run it. Tell this in your report.

## Report

Keep the report short. Give:

- The files that you made or changed.
- The result of each check.
- Each `// Rule question:` with its file, its line and the rule text from `rules.md`.
- Each problem that stopped your work.
