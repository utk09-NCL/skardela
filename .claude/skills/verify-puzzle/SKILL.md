---
name: verify-puzzle
description: Play a new puzzle type in Chrome. The browser checker agent compares the board with rules.md and reports the problems. It does not change files.
argument-hint: <type> [url]
disable-model-invocation: true
---

# Check a puzzle type in a browser

Arguments: $ARGUMENTS

The first argument is the puzzle type name. The second argument is the URL of the dev server. The URL is optional. If there is no type name, ask the author for it.

## Step 1: Make sure that the dev server runs

1. If the author gave a URL, use it.
2. If not, run `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`. If the result is `200`, use `http://localhost:5173`. If on WindowsOS, run appropriate command.
3. If not, run `npm run dev` in the background. Read the local URL from its output.

## Step 2: Start the browser checker

1. Start the `puzzle-browser-checker` agent. Give it the type name and the URL.
2. Wait for its report.
3. Show the author the table from the report.

## Step 3: Tell the next step

- If each check has the result "Pass", tell the author that the browser check is complete.
- If a check has the result "Fail", tell the author to run `/review-puzzle <type>`. The reviewer gets the findings from this conversation.
- Do not fix the problems yourself.
- If you started the dev server, ask the author if you must stop it.
