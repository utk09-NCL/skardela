import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "../../../shared/store";
import { text } from "../../../text/en";
import { Board } from "./Board";
import example from "./examples/numpuz-0000.json";
import type { NumpuzPuzzle } from "./puzzle";
import type { Operator } from "./rules-check";

const words = text.numpuz;
// The example is the rules.md example: 6 _ 3 _ 2, target 7.
const puzzle = example as NumpuzPuzzle;

// This helper finds a blank by its position, so the test does not depend on the label end.
function blank(position: number): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^Blank ${position},`, "u") });
}

// This helper finds the key of an operator.
function key(operator: Operator): HTMLElement {
  return screen.getByRole("button", { name: words.key(words.operatorNames[operator]) });
}

function checkButton(): HTMLElement {
  return screen.getByRole("button", { name: words.checkButton });
}

describe("numpuz board example", () => {
  it("follows the steps of the rules.md example", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(words.status.start);
    expect(blank(1)).toHaveAccessibleName("Blank 1, empty");
    expect(blank(1)).toHaveTextContent(words.symbols.empty);

    // Select blank 1. It gets the "selected" style.
    await user.click(blank(1));
    expect(blank(1)).toHaveAttribute("aria-pressed", "true");
    expect(blank(1)).toHaveAttribute("data-selected", "true");
    expect(blank(1)).toHaveAttribute("data-filled", "false");

    // Step 1: 6 + 3 × 2 = 12. A filled blank gets the "filled" style, and blank 2 is selected next.
    await user.click(key("+"));
    expect(blank(1)).toHaveAccessibleName("Blank 1, plus");
    expect(blank(1)).toHaveAttribute("data-filled", "true");
    expect(blank(2)).toHaveAttribute("data-selected", "true");
    await user.click(key("×"));
    expect(blank(2)).toHaveTextContent(words.symbols.operators["×"]);
    await user.click(checkButton());
    expect(status).toHaveTextContent(words.status.wrong(1));
    expect(status).toHaveAttribute("data-wrong", "true");
    // The same wrong guess cannot be checked again.
    expect(checkButton()).toBeDisabled();

    // Step 2: 6 + 3 − 2 = 7. The puzzle is solved.
    await user.click(blank(2));
    await user.click(key("-"));
    expect(status).toHaveTextContent(words.status.start);
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    await user.click(checkButton());
    expect(status).toHaveTextContent(words.status.solved(1));
    expect(screen.getByTestId("confetti")).toBeInTheDocument();

    // The play session saves the solve with one mistake. "Random puzzle" skips a solved puzzle.
    const { solved, results } = useAppStore.getState();
    expect(solved).toEqual([puzzle.id]);
    expect(results.at(-1)?.mistakes).toBe(1);

    // After the solve, the blanks, the keys and the Check button do not work.
    expect(blank(1)).toHaveAttribute("aria-disabled", "true");
    expect(key("+")).toHaveAttribute("aria-disabled", "true");
    expect(checkButton()).toBeDisabled();
  });
});

describe("numpuz board mistakes", () => {
  it("does not add a mistake for a check with an empty blank", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(checkButton());
    expect(screen.getByRole("status")).toHaveTextContent(words.status.incomplete);

    await user.click(blank(1));
    await user.click(key("+"));
    await user.click(key("-"));
    await user.click(checkButton());
    expect(screen.getByRole("status")).toHaveTextContent(words.status.solved(0));
    expect(useAppStore.getState().results.at(-1)?.mistakes).toBe(0);
  });
});

describe("numpuz board keys", () => {
  it("does not change a blank until the player selects one", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    expect(key("+")).toHaveAttribute("aria-disabled", "true");
    await user.click(key("+"));
    expect(blank(1)).toHaveAccessibleName("Blank 1, empty");
    expect(blank(2)).toHaveAccessibleName("Blank 2, empty");
  });

  it("puts a typed operator in the focused blank and moves the focus to the next empty blank", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.click(blank(1));
    await user.keyboard("+");
    expect(blank(1)).toHaveAccessibleName("Blank 1, plus");
    expect(blank(2)).toHaveFocus();

    // "*" gives ×. A letter that is not an operator key does nothing.
    await user.keyboard("a");
    expect(blank(2)).toHaveAccessibleName("Blank 2, empty");
    await user.keyboard("*");
    expect(blank(2)).toHaveAccessibleName("Blank 2, times");
  });
});
