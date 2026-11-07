# AGENTS.md

Rules for AI agents working in the Skardela project.

## Core rules

- Always talk in ASD-STE100 Simplified Technical English.
- Always document your changes with comments. Use Simplified Technical English in code comments.
- Work only on the task assigned to you.
- Keep changes small, clear and relevant.
- Do not weaken tests or skip validation to make a task pass.
- Do not add server code, backend logic, auth, or database changes. This is a UI only project.
- Ask before breaking existing functionality, making large changes, broad refactors or unclear work.

## Project expectations

- Follow the current project structure in `src/`.
- Keep the puzzle logic browser-safe and pure.
- Keep UI text simple and accessible.
- Put all UI text in the `src/text/en/` folder and all emoji symbols in `src/text/symbols.ts`.
- Use the shared code in `src/shared/` before you write new code.
- Prefer the existing stack and patterns over new abstractions.

## Adding a new puzzle type

- Create a new folder in `src/app/puzzle-types/` with the puzzle type name.
- Read the `rules.md` file explaining the rules of the puzzle.
- Add an example puzzle file in the `examples/` folder.
- Implement the puzzle logic in a TypeScript file within the puzzle type folder.
- Ensure the UI components follow the existing patterns and are accessible.
- Register the puzzle type in `src/app/puzzle-types/registry.ts`. Then follow the TypeScript errors.
- Follow all steps in "Add a new puzzle type" in `CONTRIBUTING.md`.
- To make a puzzle type from the rules of the author with AI agents, use "Puzzle workflow" below.

## Puzzle workflow (rules first)

Use this workflow to make a new puzzle type from the rules of the author. In Claude Code, run `/new-puzzle <type>`, `/review-puzzle <type>` and `/verify-puzzle <type>`. The skills are in `.claude/skills/`. The agents are in `.claude/agents/`.

1. The author writes `src/app/puzzle-types/<type>/rules.md`.
2. Spec: the main session checks the rules with the author and updates `rules.md`. Then it writes the contract.
3. Coder: an agent writes the code from `rules.md` and the contract.
4. Test writer: a different agent writes the rule tests from `rules.md` and the contract.
5. The author runs the tests.
6. Reviewer: when a test fails, an agent finds the wrong side and fixes it.
7. Browser checker: an agent plays the puzzle in a browser and reports the problems.

Rules for each step:

- `rules.md` is the source of truth. The code and the tests follow it.
- If `rules.md` does not tell what to do, do not guess. Ask the author, or write the question in your report.
- Change `rules.md` only after the author answers a question.
- The contract is the exported types and function signatures in `puzzle.ts`, `rules-check.ts`, `machine.ts` and, if the type needs a search, `solver.ts`. Only the spec step writes it. Change it only after the author agrees.
- The rule tests are `rules-check.test.ts`, `machine.test.ts` and, if `solver.ts` exists, `solver.test.ts`.
- Change only the files of your step:
  - Coder: the files of the new type, the shared files that "Add a new puzzle type" in `CONTRIBUTING.md` names, and a generator in `tools/` if `rules.md` asks for one. Not `rules.md`, `examples/`, the contract or the rule tests.
  - Test writer: the rule tests only.
  - Reviewer: the code or a test, only after it finds the rule that the other side does not obey.
  - Browser checker: no files.
- The coder does not read the rule tests. The test writer does not read the code of the new type. Two independent readings of `rules.md` find more mistakes.
- The coder and the test writer do not run the rule tests. The author runs them.
- The reviewer can change a test only when the test disagrees with `rules.md`. It must quote the rule. This change does not make the test weaker.

## Code quality

- Use strict TypeScript.
- Do not use `any` or `@ts-ignore` without a clear reason.

## Validation

Before you finish, run: `npm run fix && npm run check`. A task is not complete until it passes all checks.
In the puzzle workflow, only the last step must pass all checks. See "Puzzle workflow".

## Git and pull requests

- Use Conventional Commits for commit messages.
- In the PR text, state what changed, why, how it was tested and which AI tool was used.
