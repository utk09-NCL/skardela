---
name: open-pr
description: Commit the current change and open a pull request in Skardela, with a Conventional Commits title and the PR template filled in. Use only when the author asks for it.
argument-hint: "[issue number]"
disable-model-invocation: true
---

# Open a pull request

Arguments: $ARGUMENTS

The argument is the number of the issue that the change closes. It is optional.

## Step 1: Check the change

1. Run `git status` and `git diff`. Make sure that each changed file is part of the task. If a file is not part of the task, ask the author.
2. Run `npm run fix && npm run check`. If a check fails, stop. Show the author the error.

## Step 2: Make a branch

If the current branch is `main`, make a new branch: `git switch -c <type>/<short-name>`, for example `fix/tilt-full-hole`.

## Step 3: Commit

1. Add only the files of the task with `git add <files>`. Do not use `git add -A`.
2. Write the commit message in Conventional Commits and Simplified Technical English: `<type>(<scope>): <summary>`. The scope is the puzzle type or the part of the app. For example: `fix(tilt): stop the ball at a full hole`.
3. Commit. Show the author the message and the files.

## Step 4: Push and open the pull request

1. Run `git push -u origin HEAD`.
2. Write the PR text with the sections of `.github/pull_request_template.md`:
   - What changed: a short list.
   - Why: the reason. Add `Closes #<number>` when there is an issue.
   - How it was tested: the commands and their results. For a UI change, ask the author to add screenshots.
   - AI tool used: the name of the tool and of the model.
   - Checklist: mark an item only when it is true.
3. Put the PR text in a file in your scratchpad directory. Run `gh pr create --title "<commit message>" --body-file <file>`.
4. Give the author the URL of the pull request.
