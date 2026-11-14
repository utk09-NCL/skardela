# Colour Binary

## Rules

Make each square red or blue. Each row and each column has the same number of red squares and blue squares. Three squares of the same colour must not be next to each other in a row or a column.

- Each puzzle has exactly one answer. Thus you can find each square by reason. You never need to guess.
- A square with a colour at the start is given. It has a white dot. You cannot change it. A tap on it makes it shake.
- A tap changes a square from empty to red, from red to blue, and from blue to empty.
- Undo removes your last change. Each Undo removes one more change.
- Hint shows one empty square that the rules decide, its colour and the reason. When the rules decide no square, Hint tells this.
- While a hint shows, Hint does nothing. Your next change hides the hint, and then Hint works again.
- The puzzle is solved when the full board obeys the rules. After the solve, the board does not change.

## Controls

- Mouse and touch: tap a square.
- Keyboard: the board is one Tab stop. The arrow keys move between the squares. R makes the square red, B makes it blue and Space makes it empty.

## Score

- Score: each hint that shows a square. A hint that finds no square does not count. 0 is a perfect solve.

## Example

```text
Start      Answer
. . B .    R B B R
. R . .    B R R B
R R . .    R R B B
. . . .    B B R R
```

R is red, B is blue and . is an empty square.

1. Row 3 has two red squares. Thus its two empty squares are blue.
2. Column 2 has two red squares. Thus its top square and its bottom square are blue.
3. Row 1 has two blue squares. Thus its two empty squares are red.
4. Column 1 has two red squares. Thus its two empty squares are blue.
5. Row 4 has two blue squares. Thus its two empty squares are red.
6. Column 3 has two blue squares. Thus its empty square is red. The last square of row 2 is blue.

`examples/colour-binary-0000.json` has this example as a puzzle file.
