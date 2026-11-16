# Guzzle

## Rules

Four words cross at the centre letter: across, down and two diagonals. All words have the same length. An arrow on the first square of each word shows the direction to read the word: → across, ↓ down, ↘ diagonal from the top left, ↗ diagonal from the bottom left. Each word has a clue. Select a square to see the clue for its word.

Before you start, select a mode. The timer starts when you select it. With bank: the letter keys show only the letters that the words still need, and a number on a key shows how many squares need that letter, when more than one square needs it. Without bank: the letter keys show all letters from A to Z, and you use the clues to find the words.

Put a letter in a square. After a green letter, the cursor goes to the next square of the same word, in the direction of the word. Green: the letter is correct. Yellow: this word has the letter in a different square. Red: this word does not have the letter. Make all squares green with the fewest mistakes.

The letter keys show what you know about the selected square. ✗: the letter is not in this square. ↔: the word has the letter.

## Controls

- Mouse and touch: select a square, then select a letter key.
- Keyboard: the board is one Tab stop. The arrow keys move between the squares and go past the gaps. Type a letter to put it in the square with the focus. After a green letter, the focus goes with the cursor to the next square.

## Score

- Score: each wrong letter. A letter that you already know is wrong does not count. 0 is a perfect solve.

## Puzzles

- `generator.ts` makes the puzzle of an ID, for example `guzzle-hard-1049`: the type, the level and a number. The number is the day number of a daily puzzle, or the number of a random puzzle.
- The same ID always gives the same puzzle, in each browser. Each day has one new puzzle for each level.
- `words.txt` is the word bank. Each line has a word in capital letters, a space, then its clue. Easy uses the words of 3 letters, medium the words of 5 letters and hard the words of 7 letters.
- The build ciphers the bank, so the browser does not get readable words.
- A puzzle has four words of the bank with the same middle letter, because the four words cross at the centre square. Each word gets one line at random.
- From 16 November 2026, a word of a daily puzzle comes back only after a gap: 92 days on easy, 270 days on medium and 360 days on hard. Each day, the generator selects four words that the last days of the gap did not use.
- A gap of G days needs 4 × (G − 1) + 79 words of one length. The easy gap is the largest gap that the 3-letter words permit.
- A random puzzle, and a daily puzzle before 16 November 2026, select from all words of the level.
- A change to the list of words gives the days after 16 November 2026 different words: a new line, a deleted line or a different order of the lines. A change to the text of a clue is safe.

## Example

```text
R  B  P
C  A  T
M  G  N
```

Answer: CAT across, BAG down, RAN on the diagonal from the top left, MAP on the diagonal from the bottom left. All diagonals read from left to right.

Clues: across "A small pet that says meow", down "You carry things in it", diagonal from the top left "Moved fast on foot, in the past", diagonal from the bottom left "A drawing that shows roads and places".

1. The board shows only the centre letter A. The player selects "With bank". The bank shows B C G M N P R T.
2. The player puts T in the top-left square. That square is on the diagonal RAN. RAN has no T, so the square shows red ✗. Mistakes: 1.
3. The player puts N in the top-left square. RAN has N in a different square, so the square shows yellow ↔. Mistakes: 2.
4. The player selects the bottom-right square. The N key is yellow ↔, because RAN has N. The T key is crossed out ✗, because RAN has no T. The player puts N in the square. The square shows green ✓. The N stays there.
5. The player continues until all 8 squares are green. The result is "With bank, 2 mistakes".

`examples/guzzle-0000.json` has this example as a puzzle file.
