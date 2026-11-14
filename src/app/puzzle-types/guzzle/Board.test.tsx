import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { usePlaySession } from "../../../shared/state/playSession";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { puzzleTypes } from "../registry";
import { Board } from "./Board";
import example from "./examples/guzzle-0000.json";
import type { GuzzlePuzzle } from "./puzzle";

const words = text.guzzle;
const puzzle = example as GuzzlePuzzle;

// This helper finds a square by its row and column, so the test does not depend on the label end.
function square(row: number, column: number): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^Row ${row}, column ${column},`, "u") });
}

// This helper selects each square and types its letter on the keyboard.
async function typeLetters(
  user: ReturnType<typeof userEvent.setup>,
  moves: readonly [row: number, column: number, letter: string][],
) {
  for (const [row, column, letter] of moves) {
    // oxlint-disable-next-line no-await-in-loop -- the moves must happen one after the other.
    await user.click(square(row, column));
    // oxlint-disable-next-line no-await-in-loop -- the moves must happen one after the other.
    await user.keyboard(letter.toLowerCase());
  }
}

describe("guzzle board feedback", () => {
  it("shows red, yellow and green as in the rules.md example", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);

    // Step 1: the board shows only the center letter. The player selects "With bank".
    expect(square(2, 2)).toHaveAccessibleName("Row 2, column 2, A, fixed");
    await user.click(screen.getByRole("button", { name: words.modes.bank }));
    const bank = screen.getByRole("group", { name: words.bankLabel });
    expect(bank).toHaveTextContent("BCGMNPRT");

    // Step 2: T in the top-left square is red.
    await user.click(square(1, 1));
    await user.click(screen.getByRole("button", { name: words.key("T", 1) }));
    expect(square(1, 1)).toHaveAttribute("data-mark", "absent");
    expect(screen.getByText(words.mistakes(1))).toBeInTheDocument();

    // Step 3: N in the top-left square is yellow.
    await user.click(screen.getByRole("button", { name: words.key("N", 1) }));
    expect(square(1, 1)).toHaveAttribute("data-mark", "present");
    expect(screen.getByText(words.mistakes(2))).toBeInTheDocument();

    // Step 4: N in the bottom-right square is green. The bank does not show N now.
    // Before the move, the N key has the "inWord" hint, because N was yellow in the same word.
    await user.click(square(3, 3));
    await user.click(screen.getByRole("button", { name: words.key("N", 1, "inWord") }));
    expect(square(3, 3)).toHaveAttribute("data-mark", "correct");
    expect(bank).toHaveTextContent("BCGMPRT");
  });
});

describe("guzzle board result", () => {
  it("shows the result of the example from rules.md", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.bank }));
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();

    // Steps 2 to 5: two mistakes in the top-left square, then all correct letters.
    await typeLetters(user, [
      [1, 1, "T"],
      [1, 1, "N"],
      [3, 3, "N"],
      [1, 1, "R"],
      [1, 2, "B"],
      [1, 3, "P"],
      [2, 1, "C"],
      [2, 3, "T"],
      [3, 1, "M"],
      [3, 2, "G"],
    ]);

    expect(screen.getByText("You solved the puzzle. With bank, 2 mistakes.")).toBeInTheDocument();
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
    // "Random puzzle" skips a solved puzzle.
    expect(useAppStore.getState().solved).toEqual([puzzle.id]);
  });

  it("does not add a mistake for the same wrong letter two times", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));
    await user.click(square(1, 1));
    await user.keyboard("t");
    await user.keyboard("t");
    expect(screen.getByText(words.mistakes(1))).toBeInTheDocument();
    expect(
      screen.getByText(words.status.absent("T", words.lines.diagonalDown)),
    ).toBeInTheDocument();
  });
});

describe("guzzle board direction and clues", () => {
  it("shows an arrow on the first square of each word", () => {
    render(<Board puzzle={puzzle} />);
    expect(square(1, 1)).toHaveAccessibleName(
      `Row 1, column 1, empty, ${words.start(words.lines.diagonalDown)}`,
    );
    expect(square(3, 1)).toHaveTextContent(words.symbols.arrows.diagonalUp);
    expect(square(3, 3)).toHaveAccessibleName("Row 3, column 3, empty");
  });

  it("marks the clue and the squares of the selected word", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));
    await user.click(square(1, 3));

    // The top-right square is the last letter of MAP, the diagonal from the bottom left.
    const clues = screen.getByRole("list", { name: words.cluesLabel });
    const current = clues.querySelector('[aria-current="true"]');
    expect(current).toHaveTextContent(words.clueLines.diagonalUp);
    expect(current).toHaveTextContent(words.position(3, 3));
    expect(current).toHaveTextContent(puzzle.clues.diagonalUp);
    expect(square(3, 1)).toHaveAttribute("data-in-word", "true");
    expect(square(1, 1)).toHaveAttribute("data-in-word", "false");
  });
});

describe("guzzle board key hints", () => {
  it("marks the keys and adds no mistake for a letter that is known to be wrong", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));

    // T is red and N is yellow in the top-left square. Then the bottom-right square is selected.
    await typeLetters(user, [
      [1, 1, "T"],
      [1, 1, "N"],
    ]);
    await user.click(square(3, 3));
    expect(screen.getByRole("button", { name: words.key("T", undefined, "wrong") })).toBeVisible();
    expect(screen.getByRole("button", { name: words.key("N", undefined, "inWord") })).toBeVisible();

    // T in the bottom-right square is red, but the player already knew that. The mistakes stay at 2.
    await user.keyboard("t");
    expect(square(3, 3)).toHaveAttribute("data-mark", "absent");
    expect(screen.getByText(words.mistakes(2))).toBeInTheDocument();
  });
});

describe("guzzle board keyboard", () => {
  it("puts a typed letter in the focused square, also when a different square is selected", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));
    // Row 1, column 1 is selected. The right arrow key moves the focus to row 1, column 2, but not the selection.
    await user.click(square(1, 1));
    await user.keyboard("{ArrowRight}");
    expect(square(1, 2)).toHaveFocus();
    await user.keyboard("b");
    expect(square(1, 2)).toHaveAttribute("data-mark", "correct");
    expect(square(1, 1)).toHaveAttribute("data-mark", "none");
    expect(screen.getByText(words.mistakes(0))).toBeInTheDocument();
  });

  it("moves the focus to the next open square after a correct letter", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));
    await user.click(square(1, 1));
    await user.keyboard("r");
    // R is correct in row 1, column 1, on the diagonal from the top left. The cursor follows the diagonal:
    // the center square is fixed, thus the next open square is row 3, column 3.
    expect(square(3, 3)).toHaveFocus();
    expect(square(3, 3)).toHaveAttribute("aria-pressed", "true");
  });
});

describe("guzzle board focus", () => {
  // rules.md: "Keyboard: the board is one Tab stop. The arrow keys move between the squares."
  it("has one Tab stop, and the arrow keys move the focus between the squares", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const grid = screen.getByRole("grid", { name: words.boardLabel });
    const tabStops = [...grid.querySelectorAll("button")].filter((button) => button.tabIndex === 0);
    expect(tabStops).toEqual([square(1, 1)]);
    await user.tab();
    expect(square(1, 1)).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowRight}");
    expect(square(2, 2)).toHaveFocus();
  });

  // The mode buttons go away after the choice. The focus must not go to the start of the page.
  it("moves the focus to the selected square after the player selects a mode with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    screen.getByRole("button", { name: words.modes.bank }).focus();
    await user.keyboard("{Enter}");
    const selected = screen.getAllByRole("button", { pressed: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveFocus();
  });

  // A key of the bank goes away when its letter is green. The focus goes to the key that is now at its place.
  it("keeps the focus in the bank when the key with the focus goes away", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.bank }));
    await user.click(square(3, 3));
    screen.getByRole("button", { name: words.key("N", 1) }).focus();
    await user.keyboard("{Enter}");
    const bank = screen.getByRole("group", { name: words.bankLabel });
    expect(bank).toHaveTextContent("BCGMPRT");
    expect(within(bank).getByRole("button", { name: /^Put P in/u })).toHaveFocus();
  });
});

describe("guzzle board timer", () => {
  // rules.md: "Before you start, select a mode. The timer starts when you select it."
  it("starts the timer when the player selects a mode, and not before", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    expect(usePlaySession.getState()).toMatchObject({ puzzleId: puzzle.id, startedAt: null });
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));
    expect(usePlaySession.getState().startedAt).not.toBeNull();
  });
});

describe("guzzle board focus after a letter", () => {
  // rules.md: "After a green letter, the focus goes with the cursor to the next square."
  // The next square can be selected already. The focus goes to it too.
  it("moves the focus to the next square after a green letter, also when that square is selected", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.noBank }));
    await user.click(square(3, 3));
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowLeft}{ArrowLeft}");
    expect(square(1, 1)).toHaveFocus();
    await user.keyboard("r");
    expect(square(1, 1)).toHaveAttribute("data-mark", "correct");
    expect(square(3, 3)).toHaveFocus();
  });

  // After a letter key, the focus stays on the key. The Tab stop of the board goes to the new selected square,
  // so Shift+Tab back to the board lands there.
  it("moves the Tab stop to the new selected square after a letter key", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.modes.bank }));
    await user.click(square(1, 1));
    await user.click(screen.getByRole("button", { name: /^Put R in/u }));
    const selected = screen.getAllByRole("button", { pressed: true });
    expect(selected).toHaveLength(1);
    expect(selected[0]).not.toBe(square(1, 1));
    expect(selected[0]).toHaveAttribute("tabindex", "0");
  });

  // rules.md: "The arrow keys move between the squares and go past the gaps."
  it("goes past the gaps of a 5 by 5 board with the arrow keys", async () => {
    const all = await puzzleTypes.guzzle.loadPuzzles();
    const medium = all.find((item) => item.difficulty === "medium");
    expect(medium).toBeDefined();
    const user = userEvent.setup();
    render(<Board puzzle={medium as GuzzlePuzzle} />);
    await user.tab();
    expect(square(1, 1)).toHaveFocus();
    // Row 1, column 2 is a gap. The right arrow key goes to row 1, column 3.
    await user.keyboard("{ArrowRight}");
    expect(square(1, 3)).toHaveFocus();
  });
});
