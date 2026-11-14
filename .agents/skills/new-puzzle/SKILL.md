---
name: new-puzzle
description: Make a new puzzle type from the rules.md of the author. Checks the rules with the author, writes the contract, then starts the coder agent and after it the test writer agent.
argument-hint: "[type]"
disable-model-invocation: true
---

# New puzzle type

Arguments: $ARGUMENTS

The first argument is the puzzle type name, for example `tilt`. Use only lowercase letters and `-`. If there is no puzzle type name, ask the author for it.

In this file, `<type>` is the type name and `<dir>` is `src/app/puzzle-types/<type>`.

Obey "Puzzle workflow" in `AGENTS.md` in all steps.

You do steps 1 and 2, because they need the author. Agents do steps 3 and 4. Do not do the work of an agent yourself.

## Step 1: Check the rules with the author

1. Read `<dir>/rules.md`. If the file does not exist, tell the author to copy `.claude/skills/new-puzzle/rules-template.md` to `<dir>/rules.md`. Then stop.
2. Read `src/app/puzzle-types/tilt/rules.md`. It is the model for the style and the sections. This workflow made it.
3. Examine the rules with the checklist below. Find the gaps, the contradictions and the words that a test cannot check, for example "near", "some" or "usually".
4. Ask the author about each problem with the AskUserQuestion tool. Ask at most 4 questions at one time. Give 2 to 4 options for each question. Put your recommended option first and mark it (recommended).
5. After each answer, update `rules.md` immediately. Put the rules for the player in "## Rules". Put the details that only the code and the tests need in "## Edge cases". Show the author the changed lines.
6. Do steps 3 to 5 again until you have no more questions and you are 95% sure of the requirements.
7. Make sure that the example in "## Example" agrees with the rules. Calculate each step of the example again. If the example has no wrong step, ask the author for one. If the rules have a search or a calculation, for example the fewest moves, check the example with a small script in your scratchpad directory. Do not put the script in the project.
8. Show the author the full `rules.md`. Ask: "Lock the rules?" Do not continue until the author says "yes".

Write `rules.md` in ASD-STE100 Simplified Technical English. Keep each rule short. Each rule tells one fact that a test can check.

### Checklist

- Goal: What makes the puzzle solved? Is there only one answer, or is each answer that obeys the rules correct?
- Board: What is the shape and the size for each level ("easy", "medium" and "hard")? What does the board show at the start?
- Actions: What can the player select, change, clear or undo?
- Rules: Is each rule clear? Can two rules disagree?
- Check: Does the game check the answer automatically, or does the player select Check? What does the player see after a wrong answer?
- Score: What is one mistake? The score is a number to keep low, for example the mistakes or the misses.
- End: What occurs after the solve? Can the player change the board after the solve?
- Controls: How does the player play with a mouse or with touch? What does a diagonal swipe or a very short swipe do? Which keys does the player use?
- Motion: Is there an animation? What does an input do during the animation?
- Look: Can the player see the difference between each kind of item without colour? For example, a ball and its hole. What does the board show when two items are on one square?
- Accessibility: Can the player play with only the keyboard? What does a screen reader say for each item, and after each move?
- Edge cases: An empty input, the same action two times, an action that is not possible, Restart.
- Puzzle data: How does `puzzles/<type>.json` keep one puzzle? For example, one character for each square. Does each puzzle have an `answer`, or does the game check each move with the rules?
- Data check: Which puzzle data does the check refuse? For example, unknown characters, rows of different lengths, extra items and items without their pair.
- Puzzles: How many puzzles does each level get? Does the author, the coder or a generator make them? The app shows one puzzle of each level each day, so a small number repeats soon.
- First draft: Does each sentence of the first draft still agree with the final design? Change or remove each sentence that is not true now.
- Example: Is there a small example with all its steps? Does it have one wrong step?

## Step 2: Write the contract

The contract is the set of exported types and function signatures. The coder and the test writer both use it. Thus the tests and the code use the same names.

1. Read `src/app/puzzle-types/numpuz/puzzle.ts`, `rules-check.ts` and `machine.ts`. Use the same structure.
2. Write `<dir>/examples/<type>-0000.json`. It is the example from `rules.md` as puzzle data.
3. Write the contract in these files:
   - `<dir>/puzzle.ts`: the puzzle data type (`PuzzleBase & { readonly type: "<type>"; ... }`) and `findPuzzleProblems`.
   - `<dir>/rules-check.ts`: the types and the pure functions of the rules.
   - `<dir>/machine.ts`: `GameState` (with its list of moves, for example `moves`), `GameEvent`, `Move`, `initialState(puzzle)`, `transition`, `isSolved`, `scoreOf` and the other query functions. Each puzzle type has these names. See `latics/machine.ts`.
   - `<dir>/solver.ts`, only if the data check or a generator needs a search. Use `tilt/solver.ts` as the model. If the puzzle has no `answer` field, the search gives the steps of one best solution, not only their number. The browser checker plays these steps.
4. Write each function as `export declare function name(...): Type;`, with no body. The coder adds the bodies. A constant that the rules fix, for example the board size for each level, can have its value.
5. Give each type and each function a comment in Simplified Technical English. The comment tells what the function does, its result for each case, and the rule from `rules.md` that it applies.
6. Run `npm run typecheck`. Correct each error in the contract.
7. Copy the contract files to your scratchpad directory. The coder adds the bodies to these files in step 3. The test writer gets this copy in step 4, so it does not see the code.
8. Show the author a short list of the contract: the types and the function names. Ask the author to approve it.

Do not write function bodies, React components, puzzle data or tests in this step.

## Step 3: Start the coder

1. Start the `puzzle-coder` agent. Give it the type name. Tell it that the rules are locked and that the contract is in `puzzle.ts`, `rules-check.ts`, `machine.ts` and, if it exists, `solver.ts`.
2. Wait for its report. Show the author a short summary.
3. If the report has rule questions, ask the author. Update `rules.md` with the answers. Do not change the code. The tests and the reviewer find the code that disagrees.

## Step 4: Start the test writer

1. Start the `puzzle-test-writer` agent. Give it the type name and the full text of the contract copy from step 2.
2. Do not tell it about the code or about the report of the coder. It must use only `rules.md` and the contract.
3. Wait for its report. Show the author a short summary: the tests for each rule, and the open questions.
4. If the report has rule questions, ask the author and update `rules.md`. Then send the answers to the same test writer agent, so that it can update its tests.

## Step 5: Stop

Do not run the rule tests. The author runs them. Tell the author the next steps:

1. Run the tests: `npm run test`
2. If a test fails, run `/review-puzzle <type>`.
3. Check the puzzle in a browser with `/verify-puzzle <type>`.
