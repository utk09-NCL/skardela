# Tilt

## Goal

Tilt the board to roll each ball into the hole of its colour. Use the fewest tilts.

## Board

| Level  | Size  | Balls                            | Fewest tilts |
| ------ | ----- | -------------------------------- | ------------ |
| Easy   | 5 × 5 | 1 coloured ball                  | 5 to 8       |
| Medium | 6 × 6 | 2 coloured balls                 | 5 to 10      |
| Hard   | 7 × 7 | 3 coloured balls and 1 grey ball | 6 to 12      |

- A square is empty, a wall, a ball or a hole.
- A wall fills one square.
- At the start, the board shows all walls, balls and holes, and "Tilts: 0. Fewest: 5." with the fewest tilts of the puzzle.
- Each coloured ball has one hole of its colour. Two balls do not have the same colour.
- Each ball is a full circle. Each hole is the outline of a circle.
- Each ball and its hole show the same icon, so colour is not the only signal.

| Colour | Icon       | Levels                |
| ------ | ---------- | --------------------- |
| Red    | ▲ triangle | Easy, medium, hard    |
| Blue   | ■ square   | Medium, hard          |
| Yellow | ★ star     | Hard                  |
| Grey   | No icon    | Hard. It has no hole. |

- A ball on a hole of a different colour shows inside the outline of the hole.
- A hole with its ball shows as a full circle with ✓.

## Rules

- Tilt the board up, down, left or right.
- Each ball rolls in the direction of the tilt until it hits a wall, the edge of the board, another ball or a full hole.
- A coloured ball that rolls over the hole of its colour falls in and stops there. The hole is now full.
- A ball in its hole stays there until the end. It does not move again.
- A full hole stops the other balls, as a wall does.
- A coloured ball rolls over an empty hole of a different colour.
- Hard: the grey ball has no hole. It rolls over all empty holes. It only blocks the other balls.
- The puzzle is solved when all coloured balls are in their holes.
- The game checks the board after each tilt. The player does not select "Check".
- Each order of tilts that gets all coloured balls into their holes is correct.
- Hard: without the grey ball, the puzzle has no solution.

## Controls

- Keyboard: the arrow keys tilt the board up, down, left and right, when the board or an arrow button has the focus.
- A click on the board gives it the focus. The board with the focus shows a ring.
- Above the board, a key hint tells the player to give the focus to the board:
  - When the board and the arrow buttons do not have the focus: "⌨️ Click the board to use the arrow keys."
  - When the board or an arrow button has the focus: "⌨️ The arrow keys tilt the board."
- The key hint shows only with a mouse. A touch screen with no mouse does not show it. After the solve, it does not show.
- Mouse and touch: four arrow buttons tilt the board.
- Touch: a swipe on the board tilts it in the main direction of the swipe. The main direction is the longer of the across part and the up-down part.
- A swipe shorter than 20 px does nothing. The length of a swipe is the straight distance from its start to its end.
- A swipe with an across part and an up-down part of the same length has no main direction. It does nothing.

## Motion

- After a tilt, the balls slide to their new squares in 180 ms.
- The game ignores a tilt during the slide.
- When "reduce motion" is on, the balls move at once, with no slide.
- When the browser cannot tell if "reduce motion" is on, the balls move at once, with no slide.

## Screen reader

- Each square has a name, for example "Row 2, column 3, red ball", "Row 4, column 1, blue hole", "Row 3, column 2, red ball in its hole" or "Row 1, column 5, wall".
- A ball on a hole of a different colour has a name for example "Row 6, column 4, red ball on the blue hole".
- After each tilt, the screen reader tells the tilt, what each ball did and the tilts.
  For example: "Tilt left. The red ball rolls 3 squares. The blue ball falls into its hole. Tilts: 4."
- After a tilt that moves no ball, it says for example "No ball can move left."

## End

- After the solve, the game ignores all tilts.
- The status says for example "You solved the puzzle with 2 extra tilts."
- After the solving tilt, the status first tells the last tilt and then the solve, so the screen reader tells both.
  For example: "Tilt right. The blue ball falls into its hole. Tilts: 6. You solved the puzzle with 1 extra tilt."

## Score

- The score is the extra tilts: your tilts minus the fewest possible tilts. 0 is a perfect solve.
- The board shows your tilts and the fewest possible tilts, for example "Tilts: 7. Fewest: 5."
- Before the solve, the extra tilts are your tilts minus the fewest tilts. They are 0 when your tilts are fewer than the fewest tilts.

## Edge cases

- The edge of the board stops a ball, as a wall does.
- A tilt that moves no ball does not change the board and does not count.
- There is no undo. Restart puts the balls back to the start and sets the tilts to 0.
- All balls roll at the same time. When two balls are in one line, the front ball moves first.
  The ball behind it stops next to it. When the front ball falls into its hole, the ball behind it stops next to that full hole, in the same tilt.
- A ball can stop on an empty hole of a different colour. It is not in a hole. The next tilt can move it.
- A ball on an empty hole stops the other balls, as at each other square. Thus it can stop the ball of that hole.
- A ball cannot stop on a full hole, because a full hole stops it on the square before.
- The grey ball rolls over all empty holes. It never falls into a hole.
- The board shows the fewest tilts from the start. A search in the browser finds it.

## Puzzle data

Each row of `board` has one character for each square:

| Character | Square      |
| --------- | ----------- |
| `.`       | Empty       |
| `#`       | Wall        |
| `R`       | Red ball    |
| `B`       | Blue ball   |
| `Y`       | Yellow ball |
| `G`       | Grey ball   |
| `r`       | Red hole    |
| `b`       | Blue hole   |
| `y`       | Yellow hole |

The puzzle has no `answer` field. The game checks each tilt with the rules.

The data check refuses a puzzle when:

- `board` does not have the size of its level, or its rows have different lengths.
- `board` has a character that is not in the table.
- The colours of the balls are not the colours of its level. See "## Board".
- A colour does not have exactly one ball and exactly one hole.
- The grey ball is not on hard, or hard does not have exactly one grey ball.
- The fewest tilts are not in the range of its level, or the puzzle has no solution.
- Hard: the puzzle has a solution without the grey ball.

### Data check boards

A search found these boards. Each board has the size, the characters and the balls of its level.
Thus only the search checks can find a problem in them.

1. Hard. The fewest tilts are 7. One best solution: up, left, down, left, up, right, down. 7 is in the range 6 to 12.
   Without the grey ball, the puzzle has no solution. The data check finds no problem.
   In the solution, the grey ball stops at row 1, column 1. Then the red, blue and yellow balls stop below it,
   at rows 2, 3 and 4 of column 1.

   ```json
   [".#....#", "R....r.", "....b#.", ".......", ".#.#..y", ".......", "B#.Y..G"]
   ```

2. Hard. The fewest tilts are 6. One best solution: up, left, down, right, down, right. 6 is in the range 6 to 12.
   Without the grey ball, the fewest tilts are also 6. The data check finds one problem:
   the puzzle has a solution without the grey ball.

   ```json
   [".#.#..#", "..#.b..", "Y..#B..", ".....r.", "#......", ".R....y", "G.#...."]
   ```

3. Easy. The fewest tilts are 9. One best solution: up, left, down, left, down, left, up, left, up.
   9 is more than 8, the maximum of easy. The data check finds one problem: the fewest tilts are not in the range.

   ```json
   ["r##..", ".#...", "...#R", ".....", "#..#."]
   ```

## Puzzles

- A generator in `tools/` makes random boards from a seed. It keeps only the boards that pass the data checks.
  It adds them to `puzzles/tilt.json` with the next free IDs.
- Random walls: easy 3 to 6, medium 4 to 8, hard 6 to 10.
- The first `puzzles/tilt.json` has 30 puzzles for each level. Run the generator again for more.
- The app selects one puzzle for each level each day, as for the other puzzle types.

## Example

```text
.  .  .  .  .  .
#  B  #  .  .  #
.  r  .  #  .  .
.  .  .  .  .  .
.  .  .  .  .  R
.  .  .  b  .  .
```

The level is medium. The red ball is at row 5, column 6, and the red hole is at row 3, column 2.
The blue ball is at row 2, column 2, and the blue hole is at row 6, column 4.
The fewest tilts are 5: down, left, up, down, right. The board shows "Tilts: 0. Fewest: 5."

1. The player tilts up. The red ball rolls 2 squares and stops below the wall at row 2, column 6.
   The blue ball rolls 1 square to row 1, column 2, at the edge. Tilts: 1. This tilt is not in a best solution.
2. The player tilts up again. No ball can move up. The board does not change. Tilts: 1.
3. The player tilts down. The red ball rolls to row 6, column 6. The blue ball rolls over the red hole
   at row 3, column 2, and stops at row 6, column 2. Tilts: 2.
4. The player tilts left. The blue ball is the front ball. It rolls to row 6, column 1. The red ball rolls over
   the blue hole at row 6, column 4, and stops next to the blue ball, at row 6, column 2. Tilts: 3.
5. The player tilts up. The red ball rolls 3 squares and falls into the red hole at row 3, column 2.
   The red hole is now full. It stops the blue ball as a wall does.
   The blue ball stops below the wall at row 2, column 1, at row 3, column 1. Tilts: 4.
6. The player tilts down. The blue ball rolls to row 6, column 1. Tilts: 5.
7. The player tilts right. The blue ball rolls 3 squares and falls into the blue hole at row 6, column 4.
   The puzzle is solved with 6 tilts. The fewest tilts are 5, thus the score is 1 extra tilt.

`examples/tilt-0000.json` has this example as a puzzle file.
