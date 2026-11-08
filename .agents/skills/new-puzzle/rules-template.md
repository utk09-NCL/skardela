# <Puzzle name>

<!--
Copy this file to src/app/puzzle-types/<type>/rules.md.
Replace each line in <>. Write in Simplified Technical English.
Remove the sections that you do not need. "/new-puzzle <type>" asks you about each gap.
See src/app/puzzle-types/tilt/rules.md for a complete example.
-->

## Goal

<One sentence. What must the player do to solve the puzzle?>

## Board

- <The shape and the size of the board for each level: easy, medium and hard.>
- <What the board shows at the start.>
- <How the player sees the difference between the items without colour, for example a symbol or a shape.>

## Rules

- <One rule on each line. Each rule tells one fact that a test can check.>

## Controls

- <Mouse and touch: what the player selects and what the player changes.>
- <Keyboard: each key and what it does.>

## Motion

- <Each animation and its time. What an input does during the animation. What occurs when "reduce motion" is on.>

## Screen reader

- <The name of each square or item. What the screen reader says after each move.>

## End

- <What occurs after the solve. What the status text says.>

## Score

- <What is one mistake. The score is a number to keep low.>

## Edge cases

- <The answers to the questions from the rules check. One case on each line.>

## Puzzle data

- <How `puzzles/<type>.json` keeps one puzzle, for example one character for each square.>
- <If each puzzle has an `answer` field, or if the game checks each move with the rules.>
- <Each problem that the data check refuses.>

## Puzzles

- <How many puzzles each level gets. The app shows one puzzle of each level each day.>
- <Who makes them: the author, the coder or a generator in `tools/`.>

## Example

<A small puzzle.>

1. <A step. Tell what the player does and what the board shows.>
2. <One wrong step, and what the board shows.>
3. <The last step. The puzzle is solved.>
