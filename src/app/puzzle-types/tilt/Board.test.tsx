import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { Board } from "./Board";
import example from "./examples/tilt-0000.json";
import { slideTime } from "./motion";
import type { TiltPuzzle } from "./puzzle";
import type { Direction } from "./rules-check";

const words = text.tilt;
// The example is the rules.md example: a medium board with a red ball and a blue ball. The fewest tilts are 5.
const puzzle = example as TiltPuzzle;

afterEach(() => {
  vi.unstubAllGlobals();
});

function board(size = 6): HTMLElement {
  return screen.getByRole("group", { name: words.boardLabel(size) });
}

// This helper finds a square by its full name, for example "Row 2, column 3, red ball".
function square(name: string): HTMLElement {
  return screen.getByRole("img", { name });
}

function arrow(direction: Direction): HTMLElement {
  return screen.getByRole("button", { name: words.tiltButton(direction) });
}

function counts(): HTMLElement {
  return screen.getByText(/^Tilts: \d+\. Fewest: /u);
}

// A swipe on the board, from one point to a point "across" px to the right and "upDown" px down.
function swipe(across: number, upDown: number) {
  fireEvent.touchStart(board(), { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchEnd(board(), {
    changedTouches: [{ clientX: 100 + across, clientY: 100 + upDown }],
  });
}

// Steps 1 to 4 of the example: the arrow keys on the board, a tilt that moves no ball, an arrow button and a swipe.
async function playStepsOneToFour(user: ReturnType<typeof userEvent.setup>, status: HTMLElement) {
  // Step 1: the arrow key on the board tilts it up.
  board().focus();
  await user.keyboard("{ArrowUp}");
  expect(status).toHaveTextContent(
    "Tilt up. The red ball rolls 2 squares. The blue ball rolls 1 square. Tilts: 1.",
  );
  expect(square("Row 3, column 6, red ball")).toBeInTheDocument();
  expect(square("Row 1, column 2, blue ball")).toBeInTheDocument();

  // Step 2: no ball can move up. The tilt does not count.
  await user.keyboard("{ArrowUp}");
  expect(status).toHaveTextContent("No ball can move up.");
  expect(counts()).toHaveTextContent("Tilts: 1. Fewest: 5.");

  // Step 3: the arrow button tilts the board down. The blue ball rolls over the red hole.
  await user.click(arrow("down"));
  expect(status).toHaveTextContent(
    "Tilt down. The red ball rolls 3 squares. The blue ball rolls 5 squares. Tilts: 2.",
  );
  expect(square("Row 3, column 2, red hole")).toBeInTheDocument();
  expect(square("Row 6, column 2, blue ball")).toBeInTheDocument();

  // Step 4: a swipe to the left tilts the board left. The red ball rolls over the blue hole.
  swipe(-80, 12);
  expect(status).toHaveTextContent(
    "Tilt left. The red ball rolls 4 squares. The blue ball rolls 1 square. Tilts: 3.",
  );
  expect(square("Row 6, column 1, blue ball")).toBeInTheDocument();
  expect(square("Row 6, column 2, red ball")).toBeInTheDocument();
  expect(square("Row 6, column 4, blue hole")).toBeInTheDocument();
}

// Steps 5 to 7 of the example: the arrow keys on an arrow button. The balls fall into their holes.
async function playStepsFiveToSeven(user: ReturnType<typeof userEvent.setup>, status: HTMLElement) {
  // Step 5: an arrow key on an arrow button tilts the board too. The red ball falls into its hole.
  arrow("up").focus();
  await user.keyboard("{ArrowUp}");
  expect(status).toHaveTextContent(
    "Tilt up. The red ball falls into its hole. The blue ball rolls 3 squares. Tilts: 4.",
  );
  expect(square("Row 3, column 2, red ball in its hole")).toBeInTheDocument();
  expect(square("Row 3, column 1, blue ball")).toBeInTheDocument();

  // Step 6 and step 7: down, then right. The puzzle is solved with 6 tilts, thus 1 extra tilt.
  await user.keyboard("{ArrowDown}");
  expect(counts()).toHaveTextContent("Tilts: 5. Fewest: 5.");
  expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
  await user.keyboard("{ArrowRight}");
  expect(status).toHaveTextContent(
    "Tilt right. The blue ball falls into its hole. Tilts: 6. You solved the puzzle with 1 extra tilt.",
  );
  expect(status).toHaveAttribute("data-solved", "true");
  expect(counts()).toHaveTextContent("Tilts: 6. Fewest: 5.");
  expect(square("Row 6, column 4, blue ball in its hole")).toBeInTheDocument();
  expect(screen.getByTestId("confetti")).toBeInTheDocument();
}

describe("tilt board example", () => {
  it("shows the walls, the balls, the holes and the tilts at the start", () => {
    render(<Board puzzle={puzzle} />);
    expect(counts()).toHaveTextContent("Tilts: 0. Fewest: 5.");
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
    expect(square("Row 2, column 2, blue ball")).toBeInTheDocument();
    expect(square("Row 5, column 6, red ball")).toBeInTheDocument();
    expect(square("Row 3, column 2, red hole")).toBeInTheDocument();
    expect(square("Row 6, column 4, blue hole")).toBeInTheDocument();
    expect(square("Row 2, column 1, wall")).toBeInTheDocument();
    expect(square("Row 1, column 1, empty")).toBeInTheDocument();
    // The ball and its hole show the same icon, so colour is not the only signal.
    expect(square("Row 3, column 2, red hole")).toHaveTextContent(words.symbols.colours.red);
    expect(square("Row 6, column 4, blue hole")).toHaveTextContent(words.symbols.colours.blue);
  });

  it("follows the steps of the rules.md example", async () => {
    const user = userEvent.setup();
    const { container } = render(<Board puzzle={puzzle} />);
    const status = screen.getByRole("status");
    await playStepsOneToFour(user, status);
    await playStepsFiveToSeven(user, status);
    // A hole with its ball shows ✓.
    expect(container.querySelector('[data-colour="red"][data-in-hole="true"]')).toHaveTextContent(
      words.symbols.full,
    );

    // The play session saves the solve with the extra tilts as the mistakes.
    const { solved, results } = useAppStore.getState();
    expect(solved).toEqual([puzzle.id]);
    expect(results.at(-1)?.mistakes).toBe(1);

    // After the solve, the game ignores all tilts.
    expect(arrow("left")).toHaveAttribute("aria-disabled", "true");
    await user.click(arrow("left"));
    board().focus();
    await user.keyboard("{ArrowUp}");
    swipe(0, 60);
    expect(counts()).toHaveTextContent("Tilts: 6. Fewest: 5.");
    expect(status).toHaveTextContent("You solved the puzzle with 1 extra tilt.");
  });
});

describe("tilt board score", () => {
  it("says a perfect solve for the fewest tilts", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    board().focus();
    await user.keyboard("{ArrowDown}{ArrowLeft}{ArrowUp}{ArrowDown}{ArrowRight}");
    expect(screen.getByRole("status")).toHaveTextContent(words.status.solved(0));
    expect(useAppStore.getState().results.at(-1)?.mistakes).toBe(0);
  });
});

describe("tilt board controls", () => {
  it("does nothing for a short swipe or for a key that is not an arrow key", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    swipe(15, -10);
    board().focus();
    await user.keyboard("a{Enter} ");
    await user.keyboard("{Control>}{ArrowUp}{/Control}");
    expect(counts()).toHaveTextContent("Tilts: 0. Fewest: 5.");
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
  });

  it("gives each arrow button a name and a place in the tab order", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.tab();
    expect(board()).toHaveFocus();
    await user.tab();
    expect(arrow("up")).toHaveFocus();
    await user.tab();
    expect(arrow("down")).toHaveFocus();
    await user.tab();
    expect(arrow("left")).toHaveFocus();
    await user.tab();
    expect(arrow("right")).toHaveFocus();
    expect(arrow("right")).toHaveAttribute("aria-disabled", "false");
  });

  it("names a ball that stops on a hole of a different colour", async () => {
    const user = userEvent.setup();
    const small: TiltPuzzle = { ...puzzle, board: ["R.b", "...", "B.r"] };
    render(<Board puzzle={small} />);
    await user.click(arrow("right"));
    expect(square("Row 1, column 3, red ball on the blue hole")).toBeInTheDocument();
    expect(square("Row 3, column 3, blue ball on the red hole")).toBeInTheDocument();
  });
});

// See "## Controls" in "rules.md": the key hint above the board, and the focus after a click on the board.
describe("tilt board key hint", () => {
  it("shows a key hint that tells the player to click the board", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    const idle = `${words.symbols.keyboard} ${words.keyHint.idle}`;
    const active = `${words.symbols.keyboard} ${words.keyHint.active}`;
    // The hint has both texts. The CSS shows one of them, from the focus. The test environment has no CSS.
    // The board has its own help text for a screen reader, thus the hint is hidden from it.
    expect(screen.getByText(idle).closest("p")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(active)).toBeInTheDocument();

    // "A click on the board gives it the focus."
    await user.click(board());
    expect(board()).toHaveFocus();

    // After the solve, the arrow keys do nothing, thus the hint does not show.
    board().focus();
    await user.keyboard("{ArrowDown}{ArrowLeft}{ArrowUp}{ArrowDown}{ArrowRight}");
    expect(screen.getByRole("status")).toHaveTextContent(words.status.solved(0));
    expect(screen.queryByText(active)).not.toBeInTheDocument();
  });
});

describe("tilt board motion", () => {
  it("slides the balls, and ignores a tilt during the slide", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query !== "(prefers-reduced-motion: reduce)",
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const now = vi.spyOn(Date, "now").mockReturnValue(1000);
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    expect(board().style.getPropertyValue("--slide")).toBe(`${slideTime}ms`);
    board().focus();
    await user.keyboard("{ArrowDown}{ArrowLeft}");
    expect(counts()).toHaveTextContent("Tilts: 1. Fewest: 5.");

    now.mockReturnValue(1000 + slideTime);
    await user.keyboard("{ArrowLeft}");
    expect(counts()).toHaveTextContent("Tilts: 2. Fewest: 5.");
  });

  it("moves the balls at once when reduce motion is on", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    expect(board().style.getPropertyValue("--slide")).toBe("0ms");
    board().focus();
    await user.keyboard("{ArrowDown}{ArrowLeft}");
    expect(counts()).toHaveTextContent("Tilts: 2. Fewest: 5.");
  });
});
