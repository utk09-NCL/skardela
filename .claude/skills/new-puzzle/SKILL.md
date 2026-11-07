---
name: new-puzzle
description: Make a new puzzle type from the rules.md of the author. Checks the rules with the author, writes the contract, then starts the coder agent and after it the test writer agent.
argument-hint: <type>
---

# New puzzzle type

Arguments: $ARGUMENTS

The first argument is the puzzle type name, for example `tilt`. Use only lowercase and `-`. If there is no puzzle type name, ask the author for it.

In this file, `<type>` is the type name, and `<dir>` is `src/app/puzzle-types/<type>`.

Read "Puzzle workflow" in `AGENTS.md` before you start. Obey it in all the steps.

You do steps 1 and 2, because they need the author. Agents do steps 3 and 4. Do not do the work of an agent yourself.

## Step 1: Check the rules with the author

1. Read `<dir>/rules.md`. If the file does not exist, tell the author to copy `.claude/skills/new-puzzle/rules-template.md` to `<dir>/rules.md`. Then stop.
2. Read `src/app/puzzle-types/numpuz/rules.md`, `src/app/puzzle-types/latics/rules.md` and `src/app/puzzle-types/guzzle/rules.md` for the style.
3. Examine the rules with the checklist below. Find the gaps, the contradictions and the words that a test cannot check, for example "near", "some", "usually".
4. Ask the author about each problem with the AskUserQuestion tool. Ask at most 4 question at one time. Give 2 tp 4 options for each question. Put the recommended option first and mark it (recommended).
5. After each answer, update `rules.md` immediately. Put the rules for the player in "## Rules". Put the details that only the code and tests need in "## Edge cases". Show the author the changed lines.
6. Do steps 3 to 5 again until you have no more questions and you are 95% sure of the requirements.
7. Make sure that the example in "## Example" agrees with the rules. Calculate each step of the example again. If the example has no wrong step, ask the author for one. If the rules have a search or a calculation, for example the fewest moves, check the example with a small script in your scratchpad directory. Do not put the script in the project.
8. Show the author the full `rules.md`. Ask: "Lock the rules?". Do not continue until the author says "yes".

Write `rules.md` in ASD-STE100 Simplified Technical English. Keep each rule short. Each rule tells one fact that a test can check.

#### Checklist

- Goal: What makes the puzzle solved? Is there only one answer, or is each answer that obeys the rules correct?
- Board: What is the shape and the size for each level ("eazy", "medium" and "hard")? What does the board show at the start?
- Actions: Whar can the player select, change, clear or undo?
- Rules: Is each rule clear? Can two rules disagree?
- Check: Does the game check the answer automatically, or does the player select check? What does the player see after a wrong answer?
- Score: What is one mistake? The score is a number to keep low, for example the mistakes or the misses.
- End: What occurs after the solve? Can the player change the board after the solve?
- Controls: How does the player play with a mouse or with touch? What does a diagonal swipe or a very short swipe do? Which keys does the player use?
- Motion: Is there an animation? What does an input do during the animation?
- Look: Can the player see the difference between each kind of item without colour? For example, a ball and its hole. What does the board show when two items are on one square?
- Accessibility: Can the player play wiht only the keyboard? What does a screen reader say for each item, and after each move?
- Edge cases: An empty input, the same action two times, an action that is not possible, Restart.
- Data check: Which puzzle data does the check refuse? For example, unknown characters, rows of different length, extra items and items without their pair.
- First draft: Does each sentence of the first draft still agree with the final design? Change or remove each sentence that is not true now.
- Example: Is there a small example with all its steps? Does it have one wrong step?

## Step 2: Write the contract

## Step 3: Start the coder

## Step 4: Start the test writer

## Step 5: Stop
