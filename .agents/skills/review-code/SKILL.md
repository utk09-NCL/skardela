---
name: review-code
description: Senior code review of a Skardela change, from a pull request, a branch or the local changes. The code-reviewer agent examines correctness, the project rules, simple code, modern CSS, accessibility and tests. Use when the author asks for a review.
argument-hint: "[PR number or branch]"
---

# Review a change

Arguments: $ARGUMENTS

## Step 1: Find the change

- A PR number: run `gh pr view <number>` and `gh pr checks <number>`. Use `gh pr diff <number>` to get the change.
- A branch name: the change is `git diff main...<branch>`.
- No argument: the change is the local changes. Use `git status` and `git diff HEAD`. Include the new files that git does not track yet.

Find the purpose of the change in the PR text or in its issue. If you cannot find it, ask the author.

## Step 2: Start the reviewer

Start the `code-reviewer` agent. Give it:

- The command that gets the change, from step 1.
- The purpose of the change.
- For a pull request, the CI result from `gh pr checks`.

## Step 3: Report

Show the author the verdict and the findings of the reviewer, with the most important finding first. Do not add findings of your own that you did not prove.

## Step 4: Next step

Ask the author what to do next:

- Local changes: fix the "Must fix" findings, fix all findings, or do nothing. After a fix, run `npm run fix && npm run check`.
- A pull request: write the review text for the author, post it with `gh pr review <number> --comment`, or do nothing.

Do not post a review, push or change a pull request without the approval of the author.
