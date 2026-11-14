import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { Board } from "./Board";
import example from "./examples/colour-binary-0000.json";
import type { ColourBinaryPuzzle } from "./puzzle";

const words = text["colour-binary"];
const puzzle = example as ColourBinaryPuzzle;

// This helper finds a square by its row and column, so the test does not depend on the label end.
function square(row: number, column: number): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^Row ${row}, column ${column}:`, "u") });
}

// jsdom has no "AnimationEvent". Then React listens to the event with the old name "webkitAnimationEnd".
// This helper sends both names, as the end of an animation in a browser.
function endAnimation(element: HTMLElement) {
  act(() => {
    for (const name of ["animationend", "webkitAnimationEnd"]) {
      element.dispatchEvent(new Event(name, { bubbles: true }));
    }
  });
}

// This helper taps each empty square until it has the colour of the answer.
// One tap makes a square red. Two taps make it blue.
async function fillAnswer(user: ReturnType<typeof userEvent.setup>) {
  for (const [row, line] of puzzle.answer.entries()) {
    for (const [column, colour] of [...line].entries()) {
      if (puzzle.start[row]?.[column] !== ".") continue;
      const taps = colour === "R" ? 1 : 2;
      for (let tap = 0; tap < taps; tap += 1) {
        // oxlint-disable-next-line no-await-in-loop -- the taps must happen one after the other.
        await user.click(square(row + 1, column + 1));
      }
    }
  }
}

describe("colour-binary board", () => {
  it("is a grid with one row for each line of squares", () => {
    render(<Board puzzle={puzzle} />);
    const grid = screen.getByRole("grid", { name: words.boardLabel(4) });
    expect(within(grid).getAllByRole("row")).toHaveLength(4);
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(16);
  });

  it("changes an empty square to red, to blue, and back to empty", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1: red");
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1: blue");
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1: empty");
  });

  it("does not change a given square, and shakes it", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(square(1, 3));
    expect(square(1, 3)).toHaveAccessibleName("Row 1, column 3: blue, given");
    expect(square(1, 3)).toHaveAttribute("aria-disabled", "true");
    expect(square(1, 3)).toHaveAttribute("data-given", "true");
    expect(square(1, 3)).toHaveAttribute("data-shake", "true");
    // The shake stops at the end of its animation.
    endAnimation(square(1, 3));
    expect(square(1, 3)).toHaveAttribute("data-shake", "false");
    // A square of the player has no dot.
    expect(square(1, 1)).toHaveAttribute("data-given", "false");
  });
});

describe("colour-binary board undo and keys", () => {
  it("removes the last change with Undo", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const undo = screen.getByRole("button", { name: words.undoButton });
    expect(undo).toHaveAttribute("aria-disabled", "true");
    await user.click(square(1, 1));
    await user.click(square(1, 1));
    await user.click(square(1, 2));
    await user.click(undo);
    expect(square(1, 2)).toHaveAccessibleName("Row 1, column 2: empty");
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1: blue");
    await user.click(undo);
    await user.click(undo);
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1: empty");
    expect(undo).toHaveAttribute("aria-disabled", "true");
    // The last Undo keeps the focus on Undo, so a keyboard user does not lose the place.
    expect(undo).toHaveFocus();
  });

  it("moves with the arrow keys, and sets a colour with R, B and Space", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    // Only one square is a Tab stop. The Tab key goes to it.
    await user.tab();
    expect(square(1, 1)).toHaveFocus();
    await user.keyboard("r");
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1: red");

    await user.keyboard("{ArrowRight}B");
    expect(square(1, 2)).toHaveFocus();
    expect(square(1, 2)).toHaveAttribute("tabindex", "0");
    expect(square(1, 1)).toHaveAttribute("tabindex", "-1");
    expect(square(1, 2)).toHaveAccessibleName("Row 1, column 2: blue");

    // Space makes the square empty. It does not also click the square.
    await user.keyboard(" ");
    expect(square(1, 2)).toHaveAccessibleName("Row 1, column 2: empty");

    // A given square does not change. At the edge of the board, the focus stays.
    await user.keyboard("{ArrowRight}r");
    expect(square(1, 3)).toHaveAccessibleName("Row 1, column 3: blue, given");
    await user.keyboard("{ArrowUp}");
    expect(square(1, 3)).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(square(2, 3)).toHaveFocus();
  });
});

describe("colour-binary board messages", () => {
  it("tells the rule that a change breaks", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    // Row 3 starts with two red squares. A third red square is more than half of the row.
    await user.click(square(3, 3));
    expect(screen.getByRole("status")).toHaveTextContent(
      words.broken({ reason: "half", line: "row", number: 3, colour: "red", half: 2 }),
    );
    // The next change in a different square without a broken rule shows the start text again.
    await user.click(square(4, 4));
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
  });

  it("tells when three squares of one colour are next to each other", async () => {
    const user = userEvent.setup();
    const wide: ColourBinaryPuzzle = {
      ...puzzle,
      difficulty: "medium",
      start: ["RR....", "......", "......", "......", "......", "......"],
      answer: ["RRBRBB", "BBRBRR", "RRBBRB", "BBRRBR", "RBRBRB", "BRBRBR"],
    };
    render(<Board puzzle={wide} />);
    await user.click(square(1, 3));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Row 1 has three red squares next to each other.",
    );
  });

  it("shows a hint", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(screen.getByRole("button", { name: words.hintButton }));
    expect(screen.getByRole("status")).toHaveTextContent(/^Row 1, column 2: Column 2/u);
    expect(square(1, 2)).toHaveAttribute("data-hint", "true");
  });
});

describe("colour-binary board solve", () => {
  it("shows that the puzzle is solved, and saves the hints as the mistakes", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: words.hintButton }));
    await fillAnswer(user);
    expect(screen.getByRole("status")).toHaveTextContent(words.status.solved);
    expect(screen.getByRole("button", { name: words.hintButton })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: words.undoButton })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
    // "Random puzzle" skips a solved puzzle.
    expect(useAppStore.getState().solved).toEqual([puzzle.id]);
    expect(useAppStore.getState().results[0]?.mistakes).toBe(1);
  });
});

describe("colour-binary board hint", () => {
  // rules.md: "While a hint shows, Hint does nothing." The button keeps the focus, so a keyboard user can go on.
  it("keeps the focus on Hint while a hint shows", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const hint = screen.getByRole("button", { name: words.hintButton });
    hint.focus();
    await user.keyboard("{Enter}");
    expect(hint).toHaveAttribute("aria-disabled", "true");
    expect(hint).toHaveFocus();
    await user.keyboard("{Enter}");
    // The second Hint does not count. Thus the solve saves 1 hint.
    await fillAnswer(user);
    expect(useAppStore.getState().results[0]?.mistakes).toBe(1);
  });
});
