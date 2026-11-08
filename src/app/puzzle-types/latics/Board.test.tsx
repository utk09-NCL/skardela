import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import { Board } from "./Board";
import example from "./examples/latics-0000.json";
import type { LaticsPuzzle } from "./puzzle";

const words = text.latics;
const easy = example as LaticsPuzzle;

// A medium board: the beam goes right along row 1. A tray mirror at row 1, column 7 sends it down to the monster.
const medium: LaticsPuzzle = {
  ...easy,
  id: "latics-0100",
  difficulty: "medium",
  board: ["L......", ".......", ".......", ".......", ".......", ".......", "......M"],
  tray: 1,
};

// A hard board: the player can turn the laser to point at the monster on the diagonal.
const hard: LaticsPuzzle = {
  ...easy,
  id: "latics-0200",
  difficulty: "hard",
  board: ["L........", ...Array.from({ length: 7 }, () => "........."), "........M"],
  tray: 1,
};

// This helper finds a square by its row and column, so the test does not depend on the label end.
function square(row: number, column: number): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^Row ${row}, column ${column},`, "u") });
}

// This helper selects one square a number of times, one select after the other.
async function selectTimes(
  user: ReturnType<typeof userEvent.setup>,
  target: HTMLElement,
  times: number,
) {
  for (let count = 0; count < times; count += 1) {
    // oxlint-disable-next-line no-await-in-loop -- the selects must happen one after the other.
    await user.click(target);
  }
}

describe("latics board on easy", () => {
  it("follows the steps of the rules.md example", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={easy} />);
    const status = screen.getByRole("status");

    // Step 1: the beam goes along the horizontal mirror and off the board.
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, laser, points right");
    expect(square(1, 4)).toHaveAccessibleName("Row 1, column 4, horizontal mirror");
    expect(status).toHaveTextContent(words.ends.edge(words.at(1, 5)));

    // Step 2: the first mirror sends the beam down, along the vertical mirror and off the board.
    await user.click(square(1, 4));
    expect(square(1, 4)).toHaveAccessibleName(
      "Row 1, column 4, mirror from top left to bottom right",
    );
    expect(status).toHaveTextContent(words.ends.edge(words.at(5, 4)));

    // Steps 3 and 4: the second mirror sends the beam left, then up and back to the laser.
    await user.click(square(5, 4));
    expect(status).toHaveTextContent(words.ends.edge(words.at(5, 1)));
    await user.click(square(5, 4));
    expect(status).toHaveTextContent(words.ends.laser());

    // Step 5: the beam hits the monster.
    await user.click(square(5, 4));
    expect(status).toHaveTextContent(words.status.solved);
    expect(square(5, 5)).toHaveAccessibleName("Row 5, column 5, monster, hit");
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  it("does not let the player change a wall, an empty square or the laser", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={easy} />);
    for (const target of [square(3, 2), square(2, 2), square(1, 1)]) {
      expect(target).toHaveAttribute("aria-disabled", "true");
    }
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, laser, points right");
    expect(screen.queryByRole("button", { name: words.fire })).not.toBeInTheDocument();
  });

  it("gives the path of the beam in words", () => {
    render(<Board puzzle={easy} />);
    const path = screen.getByText(words.pathLabel).closest("details");
    expect(path).toHaveTextContent(words.path.move(words.directions.E, 4));
    expect(path).toHaveTextContent(words.ends.edge(words.at(1, 5)));
  });
});

describe("latics board on medium", () => {
  it("counts a miss for each shot that does not hit the monster", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={medium} />);
    const fire = screen.getByRole("button", { name: words.fire });
    expect(screen.getByText(words.status.plan({ tray: true, aim: false }))).toBeInTheDocument();

    // A shot shows the beam and adds a miss. The same shot again is not possible.
    await user.click(fire);
    expect(screen.getByText(words.misses(1))).toBeInTheDocument();
    // The end of the beam shows in the status and in the path, thus the query looks only at the status.
    expect(
      screen.getByText(words.ends.edge(words.at(1, 7)), { selector: "output" }),
    ).toBeInTheDocument();
    expect(fire).toBeDisabled();

    // A tray mirror goes on the empty square. Two turns make it send the beam down.
    await user.click(square(1, 7));
    expect(screen.getByText(words.tray(0))).toBeInTheDocument();
    expect(fire).toBeEnabled();
    await selectTimes(user, square(1, 7), 2);
    await user.click(fire);
    expect(screen.getByText(words.status.solvedWithMisses(1))).toBeInTheDocument();
  });

  it("puts a tray mirror back in the tray after four turns", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={medium} />);
    await user.click(square(1, 7));
    expect(square(1, 7)).toHaveAccessibleName(
      "Row 1, column 7, mirror from bottom left to top right from the tray",
    );
    // The tray is empty, thus the player cannot put a mirror on a different empty square.
    expect(square(2, 2)).toHaveAttribute("aria-disabled", "true");
    await selectTimes(user, square(1, 7), 4);
    expect(square(1, 7)).toHaveAccessibleName("Row 1, column 7, empty");
    expect(screen.getByText(words.tray(1))).toBeInTheDocument();
  });
});

describe("latics board on hard", () => {
  it("lets the player turn the laser", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={hard} />);
    expect(screen.getByText(words.status.plan({ tray: true, aim: true }))).toBeInTheDocument();
    await user.click(square(1, 1));
    expect(square(1, 1)).toHaveAccessibleName("Row 1, column 1, laser, points down and right");
    await user.click(screen.getByRole("button", { name: words.fire }));
    expect(screen.getByText(words.status.solvedWithMisses(0))).toBeInTheDocument();
  });
});

// "Random puzzle" skips a solved puzzle. The clicks are the steps of the rules.md example.
describe("latics board and the list of solved puzzles", () => {
  it("adds the puzzle to the list when the beam hits the monster", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={easy} />);
    expect(useAppStore.getState().solved).toEqual([]);
    await user.click(square(1, 4));
    await user.click(square(5, 4));
    await user.click(square(5, 4));
    await user.click(square(5, 4));
    expect(screen.getByRole("status")).toHaveTextContent(words.status.solved);
    expect(useAppStore.getState().solved).toEqual([easy.id]);
  });
});
