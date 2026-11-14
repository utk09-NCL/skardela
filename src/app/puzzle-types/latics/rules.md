# Latics

## Rules

Hit each monster with a laser beam. The beam goes in a straight line: across, up and down, or diagonally. It goes through the middle of each square. A board can have more than one laser. All lasers fire at the same time.

A mirror turns the beam. The angle in is the same as the angle out (the law of reflection). A beam that goes along a mirror does not change. A wall stops the beam. The beam also stops when it goes off the board or back into a laser.

Select a mirror to turn it 45° clockwise. Make the fewest misses.

### Materials

Some boards have materials that bend light, as in real optics.

- **Water.** A straight beam goes through water and does not change. A diagonal beam that goes into water turns straight, square to the edge of the water that it crosses: up or down through the top or the bottom edge, left or right through a side edge, and up or down through a corner. When the beam leaves the water, it turns back to its direction from before the water, as light through a glass block. Thus water moves a diagonal beam to the side.
- **Critical angle.** A diagonal beam in water cannot get out. At the edge of the water, it reflects back in. The edge of the board is an edge of the water too. The beam reflects at the corner of the square, thus it goes on in the square next to it. Only a beam from a laser in the water can be diagonal in water, because water has no mirrors.
- **Prism.** A prism bends red light less than blue light. In the game, red light turns 45° to the right and blue light turns 45° to the left. Thus a white beam splits into a red beam and a blue beam. A red beam or a blue beam only turns.
- **Filter.** A red filter lets only red light through, and a blue filter lets only blue light through. A white beam goes through and gets the colour of the filter. A beam of the other colour stops.
- **Colours.** A laser has a white, red or blue beam. The monster with no colour needs a beam of any colour. A red monster needs a red beam, and a blue monster needs a blue beam. A beam of a different colour stops at it.
- **Loop.** A part of the beam that comes back to a square in the same direction and with the same colour goes around in a loop. In water, its direction from before the water must be the same too. It stops there, because the rest of its path is the same.
- **Join.** A part of the beam that comes to a square in the same direction and with the same colour as a different part of the beam stops there. In water, its direction from before the water must be the same too. The rest of its path is the same as the path of the other part.

Prisms and filters do not change. The player cannot put a tray mirror on water. On the board, a red piece has a circle ● and a blue piece has a square ■. The white beam is solid, the red beam has dashes and the blue beam has dots, so colour is not the only signal.

| Level  | Size  | What the player can do                                    | Beam                         |
| ------ | ----- | --------------------------------------------------------- | ---------------------------- |
| Easy   | 5 × 5 | Turn the mirrors.                                         | Shows at all times.          |
| Medium | 7 × 7 | Turn the mirrors. Put 1 or 2 mirrors from the tray.       | Shows when the player fires. |
| Hard   | 9 × 9 | Turn the mirrors and the lasers. Put 1 or 2 tray mirrors. | Shows when the player fires. |

On medium and hard, the player plans the path and then fires the lasers. A shot that does not hit all monsters is a miss. To put a mirror from the tray, select an empty square. A tray mirror goes back to the tray after four turns.

## Controls

- Mouse and touch: select a square to turn its mirror 45° clockwise. On hard, select a laser to turn it 45° clockwise. On medium and hard, select an empty square to put a mirror from the tray there.
- Keyboard: the board is one Tab stop. The arrow keys move between the squares. Enter or Space selects the square with the focus.
- "Path of the beam" under the board tells the path of the beam in words.

## Score

- Score: each shot on medium and hard that does not hit all monsters. 0 is a perfect solve. Easy has no shots, thus its score is always 0.

## Puzzle data

Each row of `board` has one character for each square:

| Character | Piece                                                               |
| --------- | ------------------------------------------------------------------- |
| `.`       | Empty square                                                        |
| `#`       | Wall                                                                |
| `L`       | Laser. `lasers` gives its direction and its colour.                 |
| `M`       | Monster with no colour. A beam of any colour hits it.               |
| `R`       | Red monster. Only a red beam hits it.                               |
| `B`       | Blue monster. Only a blue beam hits it.                             |
| `^`       | Prism                                                               |
| `r`       | Red filter                                                          |
| `b`       | Blue filter                                                         |
| `-`       | Horizontal mirror (0°)                                              |
| `/`       | Mirror from bottom left to top right (45°)                          |
| `\|`      | Vertical mirror (90°)                                               |
| `\`       | Mirror from top left to bottom right (135°). In JSON, write `"\\"`. |

`lasers` has one item for each `L`, in reading order: row by row, and from left to right in a row. Each item has a `direction` and a `colour` (`white`, `red` or `blue`). The directions are `E`, `NE`, `N`, `NW`, `W`, `SW`, `S` and `SE`. `tray` is the number of mirrors in the tray.

`water` is optional. It has the same rows as `board`, with `~` for a square in water and `.` for a square out of the water. Each area of water is a rectangle, and two areas do not touch, also not at a corner. A square in water can only have `.`, `L`, `M`, `R` or `B`.

The data checks make sure that the beam does not hit all monsters at the start, that the puzzle has a solution, that each solution needs all the mirrors in the tray, and that the puzzle needs each of its materials: without its water, its prisms or its filters, it has no solution.

To make new puzzles, run for example `LATICS_PLAN="water:easy:3,prism:hard:2" npm run generate:latics`. The generator makes random boards and keeps only boards that pass the data checks and need 2 changes or more (3 on hard). It adds them to `puzzles/latics.json` with the next free IDs. `LATICS_SEED` gives different puzzles. Play some of the new puzzles before you add them. See `tools/generate-latics.gen.ts`.

## Example

```text
L  .  .  -  .
.  .  .  .  .
.  #  .  .  .
.  .  .  .  .
.  .  .  |  M
```

The laser is at row 1, column 1 and points right. The level is easy, so the beam shows at all times.

1. The beam goes right, along the horizontal mirror at row 1, column 4, and off the board.
2. The player selects the mirror at row 1, column 4. It turns to `\`. The beam now goes down, along the vertical mirror at row 5, column 4, and off the board.
3. The player selects the mirror at row 5, column 4. It turns to `/`. The beam goes left and off the board.
4. The player selects the same mirror again. It turns to `-`. The beam goes up, and the mirror at row 1, column 4 sends it back to the laser.
5. The player selects the same mirror again. It turns to `\`. The beam goes right and hits the monster. The puzzle is solved.

`examples/latics-0000.json` has this example as a puzzle file.
