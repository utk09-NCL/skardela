# AGENTS.md

Rules for AI agents that work in the Skardela project. Skardela is a puzzle website. It has no server, no accounts and no database. All code runs in the browser.

In this file and in the files in `.claude/`, "the author" is the person who gives you the task.

## Core rules

- Write in ASD-STE100 Simplified Technical English: your messages, code comments, `rules.md` files, commit messages and PR text. See "Simplified Technical English" below.
- Work only on the task. If you find a different problem, tell the author. Do not fix it.
- Keep each change small, clear and related to the task.
- Ask the author before you:
  - break current behaviour,
  - make a large change or a broad refactor,
  - add an npm package,
  - start work that is not clear.
- Do not add server code, backend logic, auth or database changes. This is a UI only project.
- Do not weaken, skip or delete tests to make a check pass.
- Do not tell the author that a task is complete before all checks pass. Give the result of each check.
- If 3 different fixes do not make a check pass, stop. Tell the author what you tried and what you found.

## Commands

Use the npm scripts. Do not use `npx`. To run a script on some files only, put the paths after `--`.

| Command                         | What it does                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`                   | Starts the app at `http://localhost:5173`.                                                        |
| `npm run fix`                   | Formats all files and fixes the lint problems that a tool can fix.                                |
| `npm run check`                 | Runs all checks: format, lint, types, build, unit tests and puzzle data. CI runs the same checks. |
| `npm run test -- <path>`        | Runs the unit tests in one file or folder, for example `npm run test -- src/shared`.              |
| `npm run typecheck`             | Checks the types of all files.                                                                    |
| `npm run lint:check -- <files>` | Finds the lint problems in some files.                                                            |
| `npm run format:fix -- <files>` | Formats some files.                                                                               |
| `npm run validate`              | Checks all puzzle files in `puzzles/` and runs the tests in `tools/`.                             |

## Project rules

- Use the structure in "Project structure" in `CONTRIBUTING.md`.
- Put all UI text in `src/text/en/`. Put all emoji symbols in `src/text/symbols.ts`. Do not put words in CSS `content`.
- Keep UI text short, simple and accessible.
- Use the shared code in `src/shared/` before you write new code.
- Keep the puzzle logic pure. `rules-check.ts`, `machine.ts` and `solver.ts` have no React, no DOM and no side effects.
- Make each control work with a keyboard and a screen reader. Do not use colour as the only signal.
- Use strict TypeScript. Do not use `any` or `@ts-ignore`. The lint check refuses `any`.
- To turn off a lint rule, turn it off for one line and give the reason: `// oxlint-disable-next-line <rule> -- <reason>`. Turn off a rule for a full file only when the rule is about the full file, for example `max-lines`.
- Use the logger in `src/shared/logger.ts`. The lint check refuses `console`.
- The files in `puzzles/` keep each answer as readable rows. The build ciphers the answers. Do not cipher them yourself.
- Use British spelling, as the project does: "colour", "behaviour" and "grey". Code keeps the spelling of its API, for example the CSS property `color`.

## Simple code

Write the simplest code that does the task correctly. Simple code is easy to read, easy to test and easy to delete.

- Before you write code, read the code near your change. Use its patterns.
- Do not add an abstraction, an option or a file for a possible future use. Add it when a second real use occurs.
- Do not keep the same data in two places. Calculate a value from the state when you can.
- Use HTML and CSS before JavaScript when they can do the job, for example `<dialog>`, `<details>`, `:focus-within`, `:has()` and media queries. Before you write CSS, read `.claude/skills/modern-css/SKILL.md`.
- React Compiler is on. Do not add `useMemo`, `useCallback` or `memo`.
- Do not use `useEffect` to calculate data or to respond to an event. Use it only to connect to a system outside React.
- Give new code a comment that tells why it is there. Do not write comments about the change, for example "fixed" or "was X before". Git keeps the history.
- Before you finish, remove dead code, unused exports and debug code.

## Simplified Technical English

- Write one instruction in each sentence. Write an instruction as a command: "Run the tests."
- Use the active voice.
- Keep each sentence short: 20 words or fewer. Keep each paragraph to 6 sentences or fewer.
- Use only the simple tenses: present, past and future. Do not use the "-ing" form of a verb.
- Do not use contractions or phrasal verbs. Write "do not", not "don't".
- Use one word for one meaning. Use the words of the project, for example "puzzle type", "level", "board", "square" and "mistake".
- Use simple words: "make sure", not "ensure". "Occur", not "happen". "Use", not "utilize". "Before", not "prior to".

## Workflows

Each workflow is a skill in `.claude/skills/<name>/SKILL.md`. In Claude Code, type the command. In a different tool, read the `SKILL.md` file and do its steps. The skills use the agents in `.claude/agents/`.

| Task                                             | Command                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Fix a bug                                        | `/fix-bug [issue number or description]`                                       |
| Add a feature, change behaviour or refactor code | `/write-code [task]`                                                           |
| Change the look or the layout of a page          | `/design-ui [task]`                                                            |
| Review a change as a senior developer            | `/review-code [PR number or branch]`                                           |
| Make a new puzzle type                           | `/new-puzzle [type]`, then `/review-puzzle [type]` and `/verify-puzzle [type]` |
| Commit the change and open a pull request        | `/open-pr [issue number]`                                                      |

## Puzzle workflow

`/new-puzzle` makes a new puzzle type from the rules of the author. Without AI agents, follow "Add a new puzzle type" in `CONTRIBUTING.md`.

1. The author writes `src/app/puzzle-types/<type>/rules.md`.
2. Spec: the main session checks the rules with the author and updates `rules.md`. Then it writes the contract.
3. Coder: an agent writes the code from `rules.md` and the contract.
4. Test writer: a different agent writes the rule tests from `rules.md` and the contract.
5. The author runs the tests.
6. Reviewer: when a test fails, an agent finds the wrong side and fixes it.
7. Browser checker: an agent plays the puzzle in a browser and reports the problems.

Rules for each step:

- `rules.md` is the source of truth. The code and the tests obey it.
- If `rules.md` does not tell what to do, do not guess. Ask the author, or write the question in your report.
- Change `rules.md` only after the author answers a question.
- The contract is the exported types and function signatures in `puzzle.ts`, `rules-check.ts`, `machine.ts` and, if the type needs a search, `solver.ts`. Only the spec step writes it. Change it only after the author agrees.
- The rule tests are `rules-check.test.ts`, `machine.test.ts` and, if `solver.ts` exists, `solver.test.ts`.
- The coder does not read the rule tests. The test writer does not read the code of the new type. Two independent readings of `rules.md` find more mistakes.
- Only the author and `/review-puzzle` run the rule tests.
- Each agent changes only the files that its agent file names.
- The reviewer can change a test only when the test disagrees with `rules.md`. It must quote the rule. The change must not make the test weaker.

## Validation

Before you finish, run `npm run fix && npm run check`. A task is complete only when all checks pass.

In the puzzle workflow, the test writer does not run the tests. It runs only the checks in its agent file. `/review-puzzle` runs all checks at the end.

## Git and pull requests

- Commit and push only when the author asks.
- Use Conventional Commits, for example `fix(tilt): stop the ball at a full hole`.
- In the PR text, fill in `.github/pull_request_template.md`: what changed, why, how it was tested and which AI tool was used.
