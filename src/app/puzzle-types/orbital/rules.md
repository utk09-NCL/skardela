# Orbital

## Goal

Launch the probe into the ring. Make the fewest misses.

## Board

| Level  | Planets | Ring   |
| ------ | ------- | ------ |
| Easy   | 1       | Large  |
| Medium | 2       | Medium |
| Hard   | 3       | Small  |

- The board is an empty canvas. It has no grid.
- A planet is small, medium or big. Each size has a fixed radius and a fixed pull. See "## Edge cases".
- Medium and hard: at least one planet touches the straight line from the launch point to the centre of the ring.
- On all levels, a launch at the angle straight to the centre of the ring does not reach the ring at any power.
- On all levels, the launch at the start values of the sliders (0° and power 5) does not reach the ring.
- At the start, the board shows the probe at the launch point, the ring, the planets and "Misses: 0."
- Before a launch, an arrow from the probe shows the angle. The length of the arrow shows the power.
- After a launch, its path stays on the board as a faint line. The board shows the paths of all earlier launches.
- The probe is a small diamond. The ring is a dashed circle outline. Each planet is a full circle, with the radius of its size.
- A big or a medium planet is blue. A small planet is grey. A soft halo around each planet shows its pull: a bigger planet has a bigger halo.
- The path of the current flight is a dotted line. The paths of earlier launches are faint dashed lines.

## Rules

- Set the angle and the power, then launch.
- The angle is a whole number of degrees from 0° to 359°. 0° points right, 90° points up, 180° points left and 270° points down.
- The planets pull the probe. A big planet pulls more than a medium planet, and a medium planet pulls more than a small planet.
- Each launch starts from the launch point.
- The probe reaches the ring when the centre of the probe goes into the circle of the ring. The puzzle is then solved.
- The flight stops when the probe reaches the ring, hits a planet, goes off the board or flies for the maximum time.
- A launch that does not reach the ring is a miss.

## Controls

- Two sliders set the angle and the power. A Launch button launches the probe.
- Keyboard: Tab moves between the sliders and the Launch button. The arrow keys change a slider by 1. Enter or Space on the Launch button launches.
- Mouse and touch: a drag back from the probe aims it, as a slingshot. The release launches the probe.
- During the drag, the arrow and the sliders show the angle and the power of the drag.
- Restart removes the paths of all earlier launches and sets the misses to 0.

## Motion

- After a launch, the probe flies along its path in real time. 1 s of game time shows in 1 s. The longest flight shows in 4 s.
- During the flight, the game ignores the sliders, the drag and the Launch button.
- During the flight, the sliders and the Launch button keep the keyboard focus. They do nothing until the flight stops.
- The status and the misses change at the end of the flight.
- When "reduce motion" is on, the full path shows at once, with no flight.
- When the browser cannot tell if "reduce motion" is on, the full path shows at once, with no flight.

## Screen reader

- The screen reader tells the position of each item in coordinates. x is 0 at the left edge and 100 at the right edge. y is 0 at the bottom edge and 100 at the top edge.
- The board has a list of its items, for example "Probe at x 12, y 40.", "Ring at x 82, y 30." and "Big planet at x 50, y 45."
- The sliders have the names "Angle" and "Power". The screen reader tells their values, for example "40°" and "6".
- At the end of each flight, the screen reader tells the angle, the power, why the flight stopped, how near the probe came to the ring and the misses.
  For example: "Angle 40°, power 6. The probe hit the big planet at x 50, y 45. Closest to the ring: 8 units. Misses: 2."
- The other reasons for the stop are "The probe went off the board." and "The probe flew for 4 s and stopped."

## End

- The puzzle is solved when the probe reaches the ring.
- After the solve, the game ignores all inputs.
- The status first tells the last launch and then the solve, so the screen reader tells both.
  For example: "Angle 35°, power 7. The probe reached the ring. You solved the puzzle with 2 misses."

## Score

- Score: each launch that does not reach the ring. 0 is a perfect solve: a solve with the first launch.
- The board shows the misses, for example "Misses: 2." At the start, it shows "Misses: 0."

## Edge cases

### Board and items

- The board is a square of 100 × 100 units. x is 0 at the left edge and 100 at the right edge. y is 0 at the bottom edge and 100 at the top edge.
- The probe is a point. Only its centre counts for the rules.
- The ring is a circle. Its radius is 6 units on easy, 5 units on medium and 4 units on hard.
- A planet is a circle. Each size has a radius and a pull:

| Size   | Radius  | Pull |
| ------ | ------- | ---- |
| Small  | 4 units | 1    |
| Medium | 6 units | 2.25 |
| Big    | 8 units | 4    |

### Flight

- The power is a whole number from 1 to 10. At the launch, the speed of the probe is 6 × power units per second, in the direction of the angle.
- The flight has steps of 1/60 s. The maximum time is 4 s, that is 240 steps.
- In each step, the game does these 3 things in this order:
  1. Each planet changes the velocity of the probe. The change points to the centre of the planet. Its size is 400 × pull ÷ d² × 1/60. d is the distance from the probe to the centre of the planet, before the step.
  2. The probe moves by its new velocity × 1/60.
  3. The game checks the new position, in this order:
     - The distance to the centre of the ring is the radius of the ring or less: the probe reaches the ring.
     - The distance to the centre of a planet is the radius of the planet or less: the probe hits that planet.
     - x or y is less than 0 or more than 100: the probe goes off the board.
- After step 240, the flight stops. The probe flew for 4 s.
- A launch with the same angle and power as an earlier launch has the same path. If it misses, it is a miss again.
- After a miss, the probe goes back to the launch point. After the solve, the probe stays at the last position of its path, in the ring.
- The path is the launch point and the position of the probe after each step. The game does not check the positions between two steps.
  Thus a probe that crosses a part of the ring between two steps, and is out of the ring at the end of both steps, does not reach the ring.
- "Closest to the ring" is the smallest distance from a position of the path to the edge of the ring. It is rounded up to a whole unit.
  Thus a miss always has a "closest" of 1 unit or more.
- The angle straight to the centre of the ring is the angle of the line from the launch point to the centre of the ring, rounded to a whole degree. 360° is 0°.

### Sliders and drag

- The angle slider goes from 0° to 359° in steps of 1°. It does not wrap: at 359°, a step up does nothing.
- The power slider goes from 1 to 10 in steps of 1.
- At the start, the angle is 0° and the power is 5.
- After a launch, the sliders keep their values.
- A drag starts only when the pointer goes down 7 units or less from the launch point. A different drag on the board does nothing.
- The angle of a drag is the angle from the pointer to the launch point, rounded to a whole degree. 360° is 0°.
- The power of a drag is its length ÷ 4 units, rounded to a whole number. A half rounds up. A power more than 10 is 10.
- For example, with the launch point at x 30, y 10, a drag to x 26, y 4 has the angle 56° and the power 2.
  The angle from (26, 4) to (30, 10) is 56.3°. The length is 7.2 units, and 7.2 ÷ 4 is 1.8.
- A drag shorter than 2 units has the power 0. Its release does nothing, and the sliders go back to their values from before the drag.
- During a drag with the power 0, the arrow and the sliders show the values from before the drag. When the drag gets a power of 1 or more, they show the angle and the power of the drag.
- When the browser cancels the drag, for example for a system gesture, nothing occurs. The sliders go back to their values from before the drag.
- A drag continues when the pointer goes off the board. The release off the board also launches.
- Restart is the Restart button of the puzzle page. It starts the puzzle again, as at the first visit.

## Puzzle data

A puzzle in `puzzles/orbital.json` has these fields, after the fields of each puzzle (`id`, `difficulty`, `author` and `license`):

- `launch`: the launch point, for example `{ "x": 12, "y": 40 }`.
- `ring`: the centre of the ring, for example `{ "x": 82, "y": 30 }`. The level gives the radius.
- `planets`: one item for each planet, for example `{ "x": 50, "y": 45, "size": "big" }`. `size` is `small`, `medium` or `big`.

Each `x` and `y` is a whole number from 0 to 100, with y up, as in "## Edge cases".

The puzzle has no `answer` field. The game checks each launch with the rules.

The data check refuses a puzzle when:

- An `x` or a `y` is not a whole number from 0 to 100, or a `size` is not `small`, `medium` or `big`.
- The number of planets is not the number of its level.
- The ring or a planet is not fully on the board.
  A circle that touches the edge of the board is fully on the board. Only a circle that goes past the edge is refused.
  For example, a big planet (radius 8) at x 8 is fully on the board. At x 7, it is not.
- The distance from the launch point to the centre of the ring is less than 50 units.
- The edge of a planet is less than 8 units from the launch point.
- The edge of a planet is less than 4 units from the edge of the ring or from the edge of a different planet.
- Medium and hard: no planet touches the straight line from the launch point to the centre of the ring.
  A planet touches the line when the distance from its centre to the line is its radius or less.
- A launch at the angle straight to the centre of the ring reaches the ring at a power from 1 to 10.
- The launch at 0° and power 5 reaches the ring.
- The puzzle has too few good launches. A good launch is an angle and a power that reach the ring.
  The minimum is 20 on easy, 10 on medium and 5 on hard, from the 3,600 possible launches.

### Data check boards

A script of the rules above found these boards. Each board passes the checks that need no flight.
Thus only the flight checks can find a problem in them. A different order of the same calculation gives the same good launches.

1. Medium. 15 good launches, for example 207° and power 4. The angle straight to the ring is 213°.
   At 213°, power 1 and 2 fly for 4 s, and power 3 to 10 hit a planet. The data check finds no problem.

   ```json
   {
     "launch": { "x": 92, "y": 67 },
     "ring": { "x": 22, "y": 21 },
     "planets": [
       { "x": 30, "y": 68, "size": "small" },
       { "x": 44, "y": 37, "size": "small" }
     ]
   }
   ```

2. Hard. 6 good launches: 76° and 77° and 78° with power 3, 79° and 80° with power 4, and 81° with power 5.
   6 is more than 5, the minimum of hard. The data check finds no problem.

   ```json
   {
     "launch": { "x": 69, "y": 11 },
     "ring": { "x": 69, "y": 81 },
     "planets": [
       { "x": 69, "y": 61, "size": "medium" },
       { "x": 54, "y": 63, "size": "small" },
       { "x": 36, "y": 60, "size": "medium" }
     ]
   }
   ```

3. Hard. Only 1 good launch: 40° and power 4. 1 is less than 5, the minimum of hard.
   The data check finds one problem: too few good launches.

   ```json
   {
     "launch": { "x": 9, "y": 23 },
     "ring": { "x": 83, "y": 76 },
     "planets": [
       { "x": 30, "y": 55, "size": "medium" },
       { "x": 47, "y": 48, "size": "medium" },
       { "x": 61, "y": 47, "size": "small" }
     ]
   }
   ```

4. Easy. 80 good launches. The angle straight to the ring is 269°. At 269°, power 1 and 2 fly for 4 s,
   and power 3 to 10 reach the ring. The data check finds one problem: the straight launch reaches the ring.

   ```json
   {
     "launch": { "x": 65, "y": 82 },
     "ring": { "x": 64, "y": 14 },
     "planets": [{ "x": 28, "y": 41, "size": "small" }]
   }
   ```

5. Medium. 36 good launches. The launch at 0° and power 5 reaches the ring.
   The data check finds one problem: the start launch reaches the ring.

   ```json
   {
     "launch": { "x": 12, "y": 23 },
     "ring": { "x": 89, "y": 30 },
     "planets": [
       { "x": 72, "y": 72, "size": "medium" },
       { "x": 70, "y": 32, "size": "small" }
     ]
   }
   ```

## Puzzles

- A generator in `tools/` makes random boards from a seed. It keeps only the boards that pass the data checks.
  It adds them to `puzzles/orbital.json` with the next free IDs.
- The generator puts the launch point near a random edge of the board, and the ring near the opposite edge.
- The first `puzzles/orbital.json` has 30 puzzles for each level. Run the generator again for more.
- The app selects one puzzle for each level each day, as for the other puzzle types.

## Example

The level is easy. The ring has the radius 6. The board has 33 good launches.

```json
{
  "launch": { "x": 30, "y": 10 },
  "ring": { "x": 40, "y": 85 },
  "planets": [{ "x": 40, "y": 50, "size": "big" }]
}
```

The launch point is near the bottom edge. The ring is near the top edge. The big planet is between them.
The angle straight to the centre of the ring is 82°. At the start, the sliders show 0° and power 5. The board shows "Misses: 0."

1. The player selects Launch. The probe flies right. After 141 steps (2.35 s), it is at x 100.02, y 12.19, off the board.
   The status says "Angle 0°, power 5. The probe went off the board. Closest to the ring: 69 units. Misses: 1."
2. The player sets the angle to 82°, straight at the ring, and selects Launch.
   The big planet pulls the probe. After 66 steps (1.10 s), the probe hits the big planet.
   The status says "Angle 82°, power 5. The probe hit the big planet at x 40, y 50. Closest to the ring: 36 units. Misses: 2."
3. The player sets the angle to 95° and selects Launch. The probe flies up, to the left of the planet, and the planet pulls it to the right.
   During the flight, the player selects Launch. The game ignores it.
   After 176 steps (2.93 s), the probe goes off the top edge at x 35.16, y 100.46. It passed 1.4 units from the edge of the ring.
   The status says "Angle 95°, power 5. The probe went off the board. Closest to the ring: 2 units. Misses: 3."
4. The player sets the angle to 92° and selects Launch. After 135 steps (2.25 s), the probe is at x 36.77, y 80.29.
   This is 5.71 units from the centre of the ring, thus in the ring.
   The status says "Angle 92°, power 5. The probe reached the ring. You solved the puzzle with 3 misses."

`examples/orbital-0000.json` has this example as a puzzle file.
