---
name: write-code
description: Write simple and effective code in Skardela for a feature, a change of behaviour or a refactor. Plans the smallest change, writes the test first, writes the simplest code, makes it simpler and gets a review. Use for code work that is not a bug fix, a UI design change or a new puzzle type.
argument-hint: "[task]"
---

# Write simple code

Arguments: $ARGUMENTS

Simple code does the task with the fewest parts. Effective code is correct, tested, accessible and clear to the next person.

Use a different workflow for these tasks:

- A bug: `/fix-bug`.
- A change of the look or the layout only: `/design-ui`.
- A new puzzle type: `/new-puzzle`.

## Step 1: Understand the task

1. Write the task in 1 to 3 sentences: what changes for the player, and why.
2. Write what is not part of the task.
3. If the task is not clear, ask the author. Give 2 to 4 options and your recommendation.

## Step 2: Read before you write

1. Find the code that the task changes. Read it and its tests.
2. Find code that does a similar job, in `src/shared/`, in the other puzzle types and in the other pages. Use this code, or use its pattern.
3. If the task changes what the player sees, read `.claude/skills/modern-css/SKILL.md`. Find out if HTML or CSS can do a part of the job with no JavaScript.

## Step 3: Plan

Write a short plan:

- The files that you change, and the change in each file.
- The tests that you add or change.
- How you check the result: the commands, and the pages in the browser for a UI change.

In these cases, show the plan to the author. Wait for the approval.

- The plan changes more than 5 files.
- The plan adds a file to `src/shared/`.
- The plan adds an npm package.
- The plan changes current behaviour that the task does not name.

## Step 4: Write the test first

1. Write a test for the new behaviour. Test what the player sees, or what an exported function gives. Do not test private details.
2. Run it with `npm run test -- <path>`. Make sure that it fails for the correct reason.

A refactor does not change the behaviour. Before a refactor, make sure that the current tests cover the code that you change. If they do not, add tests first.

## Step 5: Write the simplest code

1. Write the least code that makes the test pass. Obey "Simple code" and "Project rules" in `AGENTS.md`.
2. Run the test again. It must pass.
3. Run `npm run fix && npm run check`.

## Step 6: Make it simpler

Read your full change with `git status` and `git diff`. For each part, ask:

- Does the task need it? If not, remove it.
- Can current code, a native HTML element or CSS do the same job?
- Does a helper, a type or a file have only one use and add no meaning? Put its code at the place where you use it.
- Is each name clear? Does it use the words of the project?
- Does each comment tell why? Is each comment still true?

Then run `npm run fix && npm run check` again.

## Step 7: Review

1. Start the `code-reviewer` agent. Tell it the task and the plan.
2. If the change has a UI part, start the `ui-checker` agent. Give it the URL of the dev server, the changed pages and the expected result.
3. Fix each "Must fix" finding and each "Fail". Ask the author about the other findings. After each fix, run the checks again.

## Step 8: Report

Tell the author what changed, the new tests, the result of each check and the open questions. Then tell the author that `/open-pr` can commit the change and open a pull request.
