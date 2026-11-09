/* oxlint-disable max-lines -- one file holds all board tests: the example, the keyboard, the drag and the motion. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "../../../shared/state/store";
import { t } from "../../../test/i18n";
import { Board } from "./Board";
import example from "./examples/orbital-0000.json";
import type { OrbitalPuzzle } from "./puzzle";

const words = t(($) => $.orbital, { returnObjects: true });
// The example is the rules.md example: an easy board with the launch point at x 30, y 10,
// the ring at x 40, y 85 and a big planet at x 40, y 50.
const puzzle = example as OrbitalPuzzle;

afterEach(() => {
  vi.unstubAllGlobals();
});

function slider(name: string): HTMLInputElement {
  return screen.getByRole<HTMLInputElement>("slider", { name });
}

function launchButton(): HTMLElement {
  return screen.getByRole("button", { name: words.launch });
}

function setAngle(angle: number) {
  fireEvent.change(slider(words.angle), { target: { value: String(angle) } });
}

function items(): string[] {
  const list = screen.getByRole("list", { name: words.itemsLabel });
  return within(list)
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

// The drawing of the board. A screen reader does not read it, thus the test finds it by its tag.
// jsdom has no layout and no pointer capture. The drawing gets a box of 100 × 100 px at the top left corner,
// thus a pointer at x px and y px is at x units and 100 - y units on the board.
function scene(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector("svg");
  if (svg === null) throw new Error("The board has no drawing.");
  svg.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 100 });
  svg.setPointerCapture = () => {};
  return svg;
}

// A pointer event at the point x, y of the board, in units.
function at(x: number, y: number) {
  return { clientX: x, clientY: 100 - y, pointerId: 1, button: 0 };
}

function paths(container: HTMLElement, kind: "current" | "earlier"): Element[] {
  return [...container.querySelectorAll(`[data-path="${kind}"]`)];
}

// A stub of the animation frames with "reduce motion" off. The result runs the frames that wait,
// at the time "now" in milliseconds.
function stubFrames(): (now: number) => void {
  let waiting: FrameRequestCallback[] = [];
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query !== "(prefers-reduced-motion: reduce)",
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    waiting.push(callback);
    return waiting.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  return (now: number) => {
    const callbacks = waiting;
    waiting = [];
    act(() => {
      for (const callback of callbacks) callback(now);
    });
  };
}

// Steps 1 to 3 of the example: three misses. jsdom cannot tell if "reduce motion" is on,
// thus each full path shows at once.
async function playMisses(user: ReturnType<typeof userEvent.setup>, container: HTMLElement) {
  const status = screen.getByRole("status");
  await user.click(launchButton());
  expect(status).toHaveTextContent(
    "Angle 0°, power 5. The probe went off the board. Closest to the ring: 69 units. Misses: 1.",
  );
  expect(screen.getByText("Misses: 1.")).toBeInTheDocument();
  expect(paths(container, "earlier")).toHaveLength(1);

  setAngle(82);
  expect(slider("Angle")).toHaveAttribute("aria-valuetext", "82°");
  await user.click(launchButton());
  expect(status).toHaveTextContent(
    "Angle 82°, power 5. The probe hit the big planet at x 40, y 50. Closest to the ring: 36 units. Misses: 2.",
  );

  setAngle(95);
  await user.click(launchButton());
  expect(status).toHaveTextContent(
    "Angle 95°, power 5. The probe went off the board. Closest to the ring: 2 units. Misses: 3.",
  );
  // After a miss, the probe goes back to the launch point. The board keeps the paths of all launches.
  expect(items()[0]).toBe("Probe at x 30, y 10.");
  expect(paths(container, "earlier")).toHaveLength(3);
}

describe("orbital board start", () => {
  it("shows the probe, the ring, the planet, the sliders and the misses", () => {
    const { container } = render(<Board puzzle={puzzle} />);
    expect(screen.getByRole("figure", { name: words.boardLabel })).toBeInTheDocument();
    expect(items()).toEqual([
      "Probe at x 30, y 10.",
      "Ring at x 40, y 85.",
      "Big planet at x 40, y 50.",
    ]);
    expect(screen.getByText("Misses: 0.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
    expect(slider("Angle")).toHaveValue("0");
    expect(slider("Angle")).toHaveAttribute("aria-valuetext", "0°");
    expect(slider("Angle")).toHaveAttribute("max", "359");
    expect(slider("Power")).toHaveValue("5");
    expect(slider("Power")).toHaveAttribute("min", "1");
    expect(slider("Power")).toHaveAttribute("max", "10");
    // Before a launch, the arrow shows the aim.
    const arrow = container.querySelector("[data-angle]");
    expect(arrow).toHaveAttribute("data-angle", "0");
    expect(arrow).toHaveAttribute("data-power", "5");
  });
});

describe("orbital board example", () => {
  it("follows the steps of the rules.md example", async () => {
    const user = userEvent.setup();
    const { container } = render(<Board puzzle={puzzle} />);
    await playMisses(user, container);
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();

    // Step 4: 92° and power 5 reach the ring.
    setAngle(92);
    await user.click(launchButton());
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(
      "Angle 92°, power 5. The probe reached the ring. You solved the puzzle with 3 misses.",
    );
    expect(status).toHaveAttribute("data-solved", "true");
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
    // After the solve, the probe stays in the ring, at x 36.77, y 80.29.
    expect(items()[0]).toBe("Probe at x 37, y 80.");

    // The play session saves the solve with the misses as the mistakes.
    const { solved, results } = useAppStore.getState();
    expect(solved).toEqual([puzzle.id]);
    expect(results.at(-1)?.mistakes).toBe(3);
  });
});

describe("orbital board end", () => {
  it("ignores all inputs after the solve", async () => {
    const user = userEvent.setup();
    const { container } = render(<Board puzzle={puzzle} />);
    setAngle(92);
    await user.click(launchButton());
    expect(screen.getByRole("status")).toHaveTextContent("You solved the puzzle with 0 misses.");
    expect(container.querySelector("[data-angle]")).toBeNull();

    expect(launchButton()).toHaveAttribute("aria-disabled", "true");
    expect(slider("Angle")).toHaveAttribute("aria-disabled", "true");
    await user.click(launchButton());
    setAngle(10);
    expect(slider("Angle")).toHaveValue("92");
    fireEvent.pointerDown(scene(container), at(30, 10));
    fireEvent.pointerUp(scene(container), at(20, 0));
    expect(paths(container, "earlier")).toHaveLength(1);
    expect(screen.getByText("Misses: 0.")).toBeInTheDocument();
  });
});

describe("orbital board keyboard", () => {
  it("moves the focus between the sliders and the Launch button, and launches with Enter or Space", async () => {
    const user = userEvent.setup();
    render(<Board puzzle={puzzle} />);
    await user.tab();
    expect(slider("Angle")).toHaveFocus();
    await user.tab();
    expect(slider("Power")).toHaveFocus();
    await user.tab();
    expect(launchButton()).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByText("Misses: 1.")).toBeInTheDocument();
    await user.keyboard(" ");
    // The same angle and power give the same path. It is a miss again.
    expect(screen.getByText("Misses: 2.")).toBeInTheDocument();
    expect(launchButton()).toHaveFocus();
  });
});

describe("orbital board drag", () => {
  it("aims with a drag back from the probe and launches at the release", () => {
    const { container } = render(<Board puzzle={puzzle} />);
    const svg = scene(container);
    // See "## Edge cases": a drag to x 26, y 4 has the angle 56° and the power 2.
    fireEvent.pointerDown(svg, at(30, 10));
    fireEvent.pointerMove(svg, at(26, 4));
    expect(svg).toHaveAttribute("data-dragging", "true");
    expect(slider("Angle")).toHaveValue("56");
    expect(slider("Power")).toHaveValue("2");
    expect(container.querySelector("[data-angle]")).toHaveAttribute("data-angle", "56");
    fireEvent.pointerUp(svg, at(26, 4));
    expect(screen.getByRole("status")).toHaveTextContent(/^Angle 56°, power 2\. /u);
    // After a launch, the sliders keep their values.
    expect(slider("Angle")).toHaveValue("56");
    expect(slider("Power")).toHaveValue("2");
  });

  it("continues a drag off the board, and launches at a release off the board", () => {
    const { container } = render(<Board puzzle={puzzle} />);
    const svg = scene(container);
    fireEvent.pointerDown(svg, at(30, 10));
    // The pointer is 50 units left of and 50 units below the launch point: 45°, and the power 10 at most.
    fireEvent.pointerMove(svg, at(-20, -40));
    fireEvent.pointerUp(svg, at(-20, -40));
    expect(screen.getByRole("status")).toHaveTextContent(/^Angle 45°, power 10\. /u);
  });
});

describe("orbital board drag that does nothing", () => {
  it("does nothing at the release of a drag shorter than 2 units", () => {
    const { container } = render(<Board puzzle={puzzle} />);
    const svg = scene(container);
    fireEvent.pointerDown(svg, at(30, 10));
    fireEvent.pointerMove(svg, at(31, 10));
    expect(slider("Power")).toHaveValue("5");
    fireEvent.pointerUp(svg, at(31, 10));
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
  });

  it("sets the sliders back when the browser cancels the drag", () => {
    const { container } = render(<Board puzzle={puzzle} />);
    const svg = scene(container);
    fireEvent.pointerDown(svg, at(30, 10));
    fireEvent.pointerMove(svg, at(20, 0));
    expect(slider("Angle")).toHaveValue("45");
    fireEvent.pointerCancel(svg, at(20, 0));
    expect(slider("Angle")).toHaveValue("0");
    expect(svg).toHaveAttribute("data-dragging", "false");
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
  });

  it("does not start a drag more than 7 units from the launch point", () => {
    const { container } = render(<Board puzzle={puzzle} />);
    const svg = scene(container);
    fireEvent.pointerDown(svg, at(30, 18));
    fireEvent.pointerMove(svg, at(20, 0));
    fireEvent.pointerUp(svg, at(20, 0));
    expect(slider("Angle")).toHaveValue("0");
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
  });
});

describe("orbital board motion", () => {
  it("ignores the inputs during the flight, and keeps the focus", async () => {
    stubFrames();
    const user = userEvent.setup();
    const { container } = render(<Board puzzle={puzzle} />);
    setAngle(95);
    launchButton().focus();
    await user.keyboard("{Enter}");

    // Step 3 of the example: during the flight, the player selects Launch. The game ignores it.
    expect(launchButton()).toHaveAttribute("aria-disabled", "true");
    expect(slider("Angle")).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    await user.click(launchButton());
    setAngle(10);
    expect(slider("Angle")).toHaveValue("95");
    expect(launchButton()).toHaveFocus();
    // The status and the misses change only at the end of the flight. The arrow does not show.
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
    expect(screen.getByText("Misses: 0.")).toBeInTheDocument();
    expect(container.querySelector("[data-angle]")).toBeNull();
    expect(paths(container, "current")).toHaveLength(1);
  });

  it("flies the probe in real time and keeps the path at the end", async () => {
    const frame = stubFrames();
    const user = userEvent.setup();
    const { container } = render(<Board puzzle={puzzle} />);
    setAngle(95);
    await user.click(launchButton());

    // 1 s of game time is 60 steps. The current path then has the launch point and 60 more points.
    frame(5000);
    frame(6000);
    const path = paths(container, "current")[0];
    expect(path?.getAttribute("points")?.split(" ")).toHaveLength(61);

    // The flight has 176 steps: 2.93 s. At 2.9 s, it is in the air. At its end, the path stays as a faint path.
    frame(7900);
    expect(screen.getByRole("status")).toHaveTextContent(words.status.start);
    frame(8000);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Angle 95°, power 5. The probe went off the board. Closest to the ring: 2 units. Misses: 1.",
    );
    expect(paths(container, "current")).toHaveLength(0);
    expect(paths(container, "earlier")).toHaveLength(1);
    expect(launchButton()).toHaveAttribute("aria-disabled", "false");
  });
});
