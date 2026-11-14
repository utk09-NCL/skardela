---
name: review-puzzle
description: When a test of a new puzzle type fails, or the browser check finds a problem, start the reviewer agent. It finds the wrong side, the code or the test, and fixes it. It asks the author when a rule is not clear.
argument-hint: "[type]"
disable-model-invocation: true
---

# Review a puzzle type

Arguments: $ARGUMENTS

The first argument is the puzzle type name. If there is no type name, ask the author for it.

In this file, `<type>` is the type name and `<dir>` is `src/app/puzzle-types/<type>`.

Obey "Puzzle workflow" in `AGENTS.md` in all steps.

## Step 1: Collect the problems

1. Run `npm run test`. Keep the output of each failed test.
2. Look for a report of the `puzzle-browser-checker` agent in this conversation. Keep each finding with the result "Fail".
3. Search `<dir>` for `// Rule question:` comments. Keep each comment that `rules.md` answers now. The reviewer changes it to a quote of the rule.
4. If no test fails, there are no findings and there are no comments to change, go to step 3.

## Step 2: Start the reviewer

1. Start the `puzzle-reviewer` agent. Give it the type name, the output of the failed tests, the browser findings and the `// Rule question:` comments from step 1.
2. Wait for its report.
3. If the report has questions for the author:
   1. Ask the author each question with the AskUserQuestion tool. Use the options from the report.
   2. Update `<dir>/rules.md` with each answer, in Simplified Technical English. Show the author the changed lines.
   3. Send the answers to the same reviewer agent. Wait for its report.

Do not fix the code or the tests yourself.

## Step 3: Run all checks

1. Run `npm run fix && npm run check`. Show the author the result.
2. If a test fails, do step 2 again. After 3 rounds, stop and ask the author what to do.
3. If a different check fails, show the author the error. Ask the author if the reviewer must fix it.

## Step 4: Summary

Show the author a summary: each problem, its verdict (code, test or rule) and its fix.
