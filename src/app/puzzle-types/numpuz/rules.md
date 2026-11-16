# Numpuz

## Goal

Fill each blank between the numbers with + − × or ÷ so the equation equals the target.

## Rules

- Each blank takes exactly one operator.
- × and ÷ are worked out before + and −, like in normal maths.
- Operators of the same kind go from left to right. For example, 8 ÷ 4 × 2 is 4, and 8 − 4 + 2 is 6.
- A division can give a fraction, for example 7 ÷ 2 = 3.5. Only the result of the full equation must be equal to the target.
- A division by 0 is not possible. A check of an equation with a division by 0 is a wrong answer.
- Every blank must be filled before the answer can be checked.
- Change an operator before you check again.

## Controls

- Select a blank. Then select an operator to put in it.
- Keyboard: type +, -, * or / on a blank. * gives × and / gives ÷.

## Score

- Score: each check with a wrong answer. 0 is a perfect solve.

## Puzzles

- `generator.ts` makes the puzzle of an ID, for example `numpuz-hard-1049`: the type, the level and a number. The number is the day number of a daily puzzle, or the number of a random puzzle.
- The same ID always gives the same puzzle, in each browser. Each day has one new puzzle for each level.
- Numbers: whole numbers from 1 to 9. Easy has 3 numbers, medium has 4 and hard has 5.
- Operators: random.
- Target: the result of the equation. The generator keeps the puzzle only if the target is a whole number from 1 to 99, and only if the operators are not all the same.
- A check evaluates the equation of the player. Thus a puzzle can have more than one correct answer.
- From 16 November 2026, a daily puzzle does not have the numbers and the target of a daily puzzle of the last 365 days. Easy has only about 3,700 different puzzles. Without this rule, a puzzle comes back after some weeks.

## Example

Numbers: 6 _ 3 _ 2, target: 7

1. Try 6 + 3 × 2. Do 3 × 2 = 6 first, then 6 + 6 = 12. Not 7.
2. Try 6 + 3 − 2. That is 9 − 2 = 7. Solved.
