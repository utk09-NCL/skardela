/* oxlint-disable import/max-dependencies -- the tests need the router, the store, the text, the page and an example puzzle. */
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";
import { useAppStore } from "../../../shared/state/store";
import { text } from "../../../text/en";
import tiltExample from "../../puzzle-types/tilt/examples/tilt-0000.json";
import type { TiltPuzzle } from "../../puzzle-types/tilt/puzzle";
import type { LoadedPuzzle } from "../../puzzles";
import { routes } from "../../routes";
import { PuzzlePage } from "./PuzzlePage";

const page = text.puzzlePage;

// The tests play as a returning player, so the analytics notice does not show.
function renderAt(path: string) {
  useAppStore.getState().acknowledgeNotice();
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

// The place of a colour-binary square, for example "Row 1, column 2". The name of each square starts with it.
type Place = string;

// This helper finds a colour-binary square by its place and its colour.
function square(place: Place, colour: string) {
  return screen.findByRole("button", { name: new RegExp(`^${place}: ${colour}`, "u") });
}

// The pages of Tilt puzzles that the test makes: the path "/1" is the puzzle "tilt-medium-1".
// "puzzleOf" gives the puzzle of each number. The page data comes at once, as from the loader of the app.
function renderWith(puzzleOf: (number: string) => Promise<TiltPuzzle>) {
  const router = createMemoryRouter(
    [
      // A route with a loader needs a fallback for the first render, as the routes of the app have.
      // Without it, React Router warns when the first render comes before the loader ends.
      {
        path: "/:number",
        loader: ({ params }): LoadedPuzzle => ({
          type: "tilt",
          id: `tilt-medium-${params.number}`,
          difficulty: "medium",
          author: "skardela",
          today: [],
          puzzle: puzzleOf(params.number ?? ""),
        }),
        hydrateFallbackElement: <p>{page.loading}</p>,
        element: <PuzzlePage />,
      },
    ],
    { initialEntries: ["/1"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

// Puzzle 1 is ready. The worker does not finish the other puzzles.
function onlyFirstReady(number: string): Promise<TiltPuzzle> {
  return number === "1" ? Promise.resolve(tiltExample as TiltPuzzle) : new Promise(() => {});
}

// The board of the Tilt example, or "null" when the page does not show it.
function tiltBoard() {
  return screen.queryByRole("group", { name: text.tilt.boardLabel(6) });
}

// The buttons of the restart question. Their labels tell what each answer does.
function yesButton() {
  return screen.getByRole("button", { name: page.restartYes.label });
}

function noButton() {
  return screen.getByRole("button", { name: page.restartNo.label });
}

function restartButton() {
  return screen.getByRole("button", { name: page.restart });
}

// True when "second" comes after "first" on the page.
function follows(first: Node, second: Node) {
  return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}

// This helper opens a Colour Binary puzzle and makes one move: the first empty square changes to red.
// It gives the place of that square.
async function openAndMove() {
  const user = userEvent.setup();
  renderAt("/puzzles/colour-binary-easy-1");
  const [empty] = await screen.findAllByRole("button", { name: /^Row \d+, column \d+: empty/u });
  const place: Place =
    /^Row \d+, column \d+/u.exec(empty?.getAttribute("aria-label") ?? "")?.[0] ?? "";
  await user.click(await square(place, "empty"));
  expect(await square(place, "red")).toBeInTheDocument();
  return { user, place };
}

describe("puzzle page restart", () => {
  // The actions are in the header, next to the timer, as in the design. Thus they come before the board.
  it("puts the actions next to the timer, above the board", async () => {
    renderAt("/puzzles/colour-binary-easy-1");
    const board = await screen.findByRole("grid", { name: /^Colour Binary, \d+ by \d+$/u });
    expect(follows(screen.getByRole("timer"), restartButton())).toBe(true);
    expect(follows(restartButton(), board)).toBe(true);
  });

  it("asks first, and restarts the board after Yes", async () => {
    const { user, place } = await openAndMove();
    await user.click(restartButton());
    // The question does not change the board. The focus goes to No, the safe answer.
    // A screen reader reads the question with the answer.
    expect(await square(place, "red")).toBeInTheDocument();
    expect(noButton()).toHaveFocus();
    expect(noButton()).toHaveAccessibleDescription(page.restartQuestion);

    await user.click(yesButton());
    expect(await square(place, "empty")).toBeInTheDocument();
    expect(restartButton()).toHaveFocus();
  });

  it("keeps the moves after No, and gives the focus back to Restart", async () => {
    const { user, place } = await openAndMove();
    await user.click(restartButton());
    await user.click(noButton());
    expect(await square(place, "red")).toBeInTheDocument();
    expect(restartButton()).toHaveFocus();
    expect(screen.queryByRole("button", { name: page.restartYes.label })).toBeNull();
  });

  // A second press of Enter selects No, because the focus is on No. Thus two fast presses do not restart.
  it("keeps the moves after two presses of Enter on Restart", async () => {
    const { user, place } = await openAndMove();
    restartButton().focus();
    await user.keyboard("{Enter}{Enter}");
    expect(await square(place, "red")).toBeInTheDocument();
    expect(restartButton()).toHaveFocus();
  });

  it("keeps the moves after the Escape key", async () => {
    const { user, place } = await openAndMove();
    await user.click(restartButton());
    await user.keyboard("{Escape}");
    expect(await square(place, "red")).toBeInTheDocument();
    expect(restartButton()).toHaveFocus();
  });
});

describe("puzzle page random puzzle", () => {
  it("opens the puzzle of a random number of the same type and level, and keeps the focus on the button", async () => {
    const user = userEvent.setup();
    const router = renderAt("/puzzles/guzzle-easy-1");
    // The player sees the first board, then selects "Random puzzle".
    await screen.findByRole("button", { name: text.guzzle.modes.bank });
    await user.click(screen.getByRole("button", { name: page.random }));
    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/puzzles\/guzzle-easy-\d{6}$/u);
    });

    const number = router.state.location.pathname.slice(-6);
    // The page can render the new puzzle a moment after the path changes, thus the test waits for it.
    expect(await screen.findByText(new RegExp(`^#${number} by `, "u"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: page.random })).toHaveFocus();
  });
});

describe("puzzle page board", () => {
  it("shows the page at once, and the board when the puzzle is ready", async () => {
    // The test gives the puzzle later, as the worker does.
    const give: ((puzzle: TiltPuzzle) => void)[] = [];
    renderWith(
      () =>
        new Promise<TiltPuzzle>((resolve) => {
          give.push(resolve);
        }),
    );
    // The name, the details and the actions do not need the puzzle.
    expect(
      await screen.findByRole("heading", { level: 1, name: text.tilt.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^#1 by skardela$/u)).toBeInTheDocument();
    expect(restartButton()).toBeInTheDocument();
    expect(screen.getByText(page.loadingBoard)).toBeInTheDocument();
    expect(tiltBoard()).toBeNull();

    await act(async () => {
      give[0]?.(tiltExample as TiltPuzzle);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(tiltBoard()).toBeInTheDocument();
    });
    expect(screen.queryByText(page.loadingBoard)).toBeNull();
  });

  it("shows a message when the worker cannot make the puzzle", async () => {
    // React and the logger write the error to the console. The test keeps the output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failed = Promise.reject<TiltPuzzle>(new Error("No good puzzle."));
    // The page reads the promise a moment later. Until then, this handler stops a warning about the error.
    failed.catch(() => {});
    renderWith(() => failed);
    expect(await screen.findByRole("alert")).toHaveTextContent(page.boardError);
    expect(screen.getByRole("heading", { level: 1, name: text.tilt.name })).toBeInTheDocument();
  });
});

describe("puzzle page board of a different puzzle", () => {
  // The page of the new puzzle does not wait for its board: the player sees at once that the page changed.
  it("shows the page of a different puzzle at once, with a message in the place of its board", async () => {
    const router = renderWith(onlyFirstReady);
    await waitFor(() => {
      expect(tiltBoard()).toBeInTheDocument();
    });
    await act(async () => {
      await router.navigate("/2");
    });
    expect(await screen.findByText(/^#2 by skardela$/u)).toBeInTheDocument();
    expect(screen.getByText(page.loadingBoard)).toBeInTheDocument();
    expect(tiltBoard()).toBeNull();
  });
});

describe("puzzle page restart question and other puzzles", () => {
  it("hides Random puzzle while the question is open", async () => {
    const { user } = await openAndMove();
    await user.click(restartButton());
    expect(screen.queryByRole("button", { name: page.random })).toBeNull();
    await user.click(screen.getByRole("button", { name: page.restartNo.label }));
    expect(screen.getByRole("button", { name: page.random })).toBeInTheDocument();
  });

  // The question belongs to one puzzle. It stays closed also when the player comes back to that puzzle.
  it("closes the restart question when a different puzzle opens, also after the Back button", async () => {
    const user = userEvent.setup();
    const router = renderAt("/puzzles/colour-binary-easy-1");
    await user.click(await screen.findByRole("button", { name: page.restart }));
    await act(async () => {
      await router.navigate("/puzzles/colour-binary-easy-2");
    });
    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe("/puzzles/colour-binary-easy-1");
    expect(await screen.findByRole("button", { name: page.restart })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: page.restartYes.label })).toBeNull();
  });
});

describe("puzzle page rules", () => {
  it("shows three short rules, and opens More rules on the first visit of a puzzle type", async () => {
    renderAt("/puzzles/guzzle-easy-1");
    const rules = await screen.findByRole("region", { name: page.rulesHeading });
    const [short] = within(rules).getAllByRole("list");
    expect(within(short as HTMLElement).getAllByRole("listitem")).toHaveLength(3);
    expect(within(rules).getByRole("list", { name: page.keyLabel })).toBeInTheDocument();
    const more = within(rules).getByText(text.guzzle.moreRules.label).closest("details");
    expect(more).toHaveAttribute("open");
    // The effect in "PuzzleRules" saves the puzzle type after the render, thus the test waits for the store.
    await waitFor(() => {
      expect(useAppStore.getState().seenRules).toEqual(["guzzle"]);
    });
  });

  it("closes More rules on the next visit of the same puzzle type", async () => {
    useAppStore.getState().seeRules("latics");
    renderAt("/puzzles/latics-easy-1");
    const rules = await screen.findByRole("region", { name: page.rulesHeading });
    const more = within(rules).getByText(text.latics.moreRules.label).closest("details");
    expect(more).not.toHaveAttribute("open");
    // The key of Latics shows the materials.
    const key = within(rules).getByRole("list", { name: page.keyLabel });
    expect(within(key).getAllByRole("listitem")).toHaveLength(text.latics.rulesKey.length);
  });

  // The Latics and the Tilt boards have walls, thus their keys show a wall sample too.
  it.each(["latics-easy-1", "tilt-easy-1"])("shows a wall in the key of %s", async (id) => {
    renderAt(`/puzzles/${id}`);
    const key = await screen.findByRole("list", { name: page.keyLabel });
    expect(key.querySelector('[data-fill="wall"]')).not.toBeNull();
  });
});
