/* oxlint-disable max-lines -- one file holds all machine tests. */
import { describe, expect, it } from "vitest";
import example from "./examples/tilt-0000.json";
import {
  canTilt,
  extraTilts,
  initialState,
  isSolved,
  transition,
  type GameEvent,
  type GameState,
} from "./machine";
import type { TiltPuzzle } from "./puzzle";
import type { Direction } from "./rules-check";

// The example is the rules.md example. The level is medium. The fewest tilts are 5.
const medium = example as TiltPuzzle;

// A small puzzle: the red ball at index 0 and the red hole at index 2. The fewest tilts are 1 (right).
const small: TiltPuzzle = { ...medium, difficulty: "easy", board: ["R.r", "...", "..."] };

// A small puzzle with a grey ball. A wall stops the red ball, thus a tilt can move only the grey ball.
const withGrey: TiltPuzzle = { ...medium, difficulty: "hard", board: ["R#r", "...", "G.."] };

// A small puzzle that the red ball can solve with one tilt right. The grey ball moves too.
const greyAside: TiltPuzzle = { ...medium, difficulty: "hard", board: ["R.r", "...", "G.."] };

// A puzzle with no solution: the red ball has no way out of its corner.
const stuck: TiltPuzzle = {
  ...medium,
  difficulty: "easy",
  board: ["R#...", "#....", ".....", ".....", "....r"],
};

// The index of a square, from the row and the column of rules.md.
const at = (row: number, column: number, size: number) => (row - 1) * size + (column - 1);

function tilt(direction: Direction): GameEvent {
  return { type: "tilt", direction };
}

// This helper applies the events one after the other, as "useReducer" does.
function play(state: GameState, directions: readonly Direction[]): GameState {
  return directions.reduce((current, direction) => transition(current, tilt(direction)), state);
}

// This helper freezes the state and each object in it. Then a change in place throws an error.
function deepFreeze<Value>(value: Value): Value {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

function indexOfBall(state: GameState, colour: string): number | undefined {
  return state.balls.find((ball) => ball.colour === colour)?.index;
}

describe("tilt machine start", () => {
  // Rule: "At the start, the board shows all walls, balls and holes, and "Tilts: 0. Fewest: 5."."
  it("starts with 0 tilts, no moves and the fewest tilts of the example", () => {
    const state = initialState(medium);
    expect(state.tilts).toBe(0);
    expect(state.moves).toEqual([]);
    expect(state.fewest).toBe(5);
    expect(isSolved(state)).toBe(false);
    expect(extraTilts(state)).toBe(0);
  });

  // Rule: "The red ball is at row 5, column 6 ... The blue ball is at row 2, column 2" (Example).
  it("puts the balls and the holes of the example on their squares", () => {
    const state = initialState(medium);
    expect(state.layout.size).toBe(6);
    expect(state.layout.holes).toEqual({ red: at(3, 2, 6), blue: at(6, 4, 6) });
    expect(indexOfBall(state, "red")).toBe(at(5, 6, 6));
    expect(indexOfBall(state, "blue")).toBe(at(2, 2, 6));
    expect(state.balls.every((ball) => !ball.isInHole)).toBe(true);
  });

  // Rule: "The board shows the fewest tilts from the start. A search in the browser finds it."
  it("finds the fewest tilts of a small board", () => {
    expect(initialState(small).fewest).toBe(1);
  });

  // Contract: "It is null when the search finds no solution."
  it("has a null fewest for a puzzle with no solution", () => {
    expect(initialState(stuck).fewest).toBeNull();
  });
});

describe("tilt machine canTilt", () => {
  // Rule: "A tilt that moves no ball does not change the board and does not count."
  it("tells which tilts move a ball at the start of the example", () => {
    const state = initialState(medium);
    expect(canTilt(state, "up")).toBe(true);
    expect(canTilt(state, "down")).toBe(true);
    expect(canTilt(state, "left")).toBe(true);
    // A wall is on the right of the blue ball, and the red ball is at the right edge.
    expect(canTilt(state, "right")).toBe(false);
  });

  // Rule: "The player tilts up again. No ball can move up." (Example, step 2)
  it("is false for up after the first tilt up", () => {
    const state = play(initialState(medium), ["up"]);
    expect(canTilt(state, "up")).toBe(false);
  });

  // Rule: "After the solve, the game ignores all tilts."
  it("is false for each direction after the solve", () => {
    const state = play(initialState(greyAside), ["right"]);
    expect(isSolved(state)).toBe(true);
    // The grey ball could move left, but the solve is final.
    for (const direction of ["up", "down", "left", "right"] as const) {
      expect(canTilt(state, direction)).toBe(false);
    }
  });
});

describe("tilt machine transition", () => {
  // Rule: "A tilt that moves no ball does not change the board and does not count."
  it("gives the same state object for a tilt that moves no ball", () => {
    const state = initialState(medium);
    expect(transition(state, tilt("right"))).toBe(state);
    const afterUp = play(state, ["up"]);
    expect(transition(afterUp, tilt("up"))).toBe(afterUp);
    expect(afterUp.tilts).toBe(1);
  });

  // Rule: "The player tilts up. The red ball rolls 2 squares ... The blue ball rolls 1 square" (Example, step 1).
  it("moves the balls and adds 1 tilt and one move", () => {
    const next = transition(initialState(medium), tilt("up"));
    expect(next.tilts).toBe(1);
    expect(indexOfBall(next, "red")).toBe(at(3, 6, 6));
    expect(indexOfBall(next, "blue")).toBe(at(1, 2, 6));
    expect(next.moves).toHaveLength(1);
    expect(next.moves[0]).toEqual({
      type: "tilt",
      direction: "up",
      tilts: 1,
      balls: [
        { colour: "red", from: at(5, 6, 6), to: at(3, 6, 6), squares: 2, fallsIn: false },
        { colour: "blue", from: at(2, 2, 6), to: at(1, 2, 6), squares: 1, fallsIn: false },
      ],
    });
  });

  // Rule: "All balls roll at the same time." A tilt that moves only the grey ball still counts.
  it("counts a tilt that moves only the grey ball", () => {
    const state = initialState(withGrey);
    expect(canTilt(state, "right")).toBe(true);
    const next = transition(state, tilt("right"));
    expect(next.tilts).toBe(1);
    expect(next.moves[0]?.balls.map((move) => move.colour)).toEqual(["grey"]);
    expect(indexOfBall(next, "grey")).toBe(8);
    expect(indexOfBall(next, "red")).toBe(0);
  });
});

describe("tilt machine moves", () => {
  // Contract: "A new move goes at the end, and no move changes after that."
  it("keeps the older moves when it adds a new move", () => {
    const first = play(initialState(medium), ["up"]);
    const second = transition(first, tilt("down"));
    expect(second.moves).toHaveLength(2);
    expect(second.moves[0]).toEqual(first.moves[0]);
    expect(second.moves[1]?.direction).toBe("down");
    expect(second.moves[1]?.tilts).toBe(2);
  });

  // Contract: "It is pure."
  it("does not change the old state", () => {
    const state = deepFreeze(initialState(medium));
    expect(() => transition(state, tilt("up"))).not.toThrow();
    expect(state.tilts).toBe(0);
    expect(state.moves).toEqual([]);
  });
});

describe("tilt machine example", () => {
  const start = initialState(medium);

  // Rule: Example, step 1. This tilt is not in a best solution. Tilts: 1.
  it("tilts up in step 1", () => {
    expect(start.tilts).toBe(0);
    expect(start.fewest).toBe(5);
    expect(transition(start, tilt("up")).tilts).toBe(1);
  });

  // Rule: "The player tilts up again. No ball can move up. The board does not change. Tilts: 1." (step 2)
  it("ignores the second tilt up in step 2", () => {
    const state = play(start, ["up"]);
    expect(transition(state, tilt("up"))).toBe(state);
  });

  // Rule: Example, step 3. The blue ball rolls over the red hole and stops at row 6, column 2. Tilts: 2.
  it("tilts down in step 3", () => {
    const state = play(start, ["up", "down"]);
    expect(state.tilts).toBe(2);
    expect(indexOfBall(state, "red")).toBe(at(6, 6, 6));
    expect(indexOfBall(state, "blue")).toBe(at(6, 2, 6));
    expect(state.balls.every((ball) => !ball.isInHole)).toBe(true);
  });

  // Rule: Example, step 4. The red ball rolls over the blue hole and stops next to the blue ball. Tilts: 3.
  it("tilts left in step 4", () => {
    const state = play(start, ["up", "down", "left"]);
    expect(state.tilts).toBe(3);
    expect(indexOfBall(state, "blue")).toBe(at(6, 1, 6));
    expect(indexOfBall(state, "red")).toBe(at(6, 2, 6));
  });
});

describe("tilt machine example end", () => {
  const start = initialState(medium);

  // Rule: Example, step 5. The red ball falls into the red hole. The blue ball stops at row 3, column 1.
  it("tilts up in step 5", () => {
    const state = play(start, ["up", "down", "left", "up"]);
    expect(state.tilts).toBe(4);
    const red = state.balls.find((ball) => ball.colour === "red");
    expect(red).toEqual({ colour: "red", index: at(3, 2, 6), isInHole: true });
    expect(indexOfBall(state, "blue")).toBe(at(3, 1, 6));
    expect(state.moves.at(3)?.balls[0]).toEqual({
      colour: "red",
      from: at(6, 2, 6),
      to: at(3, 2, 6),
      squares: 3,
      fallsIn: true,
    });
    expect(isSolved(state)).toBe(false);
  });

  // Rule: Example, step 6. The blue ball rolls to row 6, column 1. Tilts: 5.
  it("tilts down in step 6", () => {
    const state = play(start, ["up", "down", "left", "up", "down"]);
    expect(state.tilts).toBe(5);
    expect(indexOfBall(state, "blue")).toBe(at(6, 1, 6));
    expect(isSolved(state)).toBe(false);
    expect(extraTilts(state)).toBe(0);
  });

  // Rule: Example, step 7. The puzzle is solved with 6 tilts. The score is 1 extra tilt.
  it("solves the puzzle with tilt right in step 7", () => {
    const state = play(start, ["up", "up", "down", "left", "up", "down", "right"]);
    expect(state.tilts).toBe(6);
    expect(state.moves.at(-1)?.balls).toEqual([
      { colour: "blue", from: at(6, 1, 6), to: at(6, 4, 6), squares: 3, fallsIn: true },
    ]);
    expect(isSolved(state)).toBe(true);
    expect(extraTilts(state)).toBe(1);
    // The tilt that moved no ball is not in the log.
    expect(state.moves).toHaveLength(6);
  });

  // Rule: "0 is a perfect solve." The best solution of the example is down, left, up, down, right.
  it("gives 0 extra tilts for the best solution", () => {
    const state = play(initialState(medium), ["down", "left", "up", "down", "right"]);
    expect(isSolved(state)).toBe(true);
    expect(state.tilts).toBe(5);
    expect(extraTilts(state)).toBe(0);
  });
});

describe("tilt machine end", () => {
  // Rule: "After the solve, the game ignores all tilts."
  it("gives the same state object for each tilt after the solve", () => {
    const solved = play(initialState(greyAside), ["right"]);
    expect(isSolved(solved)).toBe(true);
    for (const direction of ["up", "down", "left", "right"] as const) {
      expect(transition(solved, tilt(direction))).toBe(solved);
    }
    expect(solved.tilts).toBe(1);
  });

  // Rule: "The puzzle is solved when all coloured balls are in their holes." The grey ball does not count.
  it("is solved when the coloured balls are in their holes and the grey ball is elsewhere", () => {
    const solved = play(initialState(greyAside), ["right"]);
    expect(isSolved(solved)).toBe(true);
    expect(indexOfBall(solved, "grey")).toBe(8);
  });

  // Rule: "Each order of tilts that gets all coloured balls into their holes is correct."
  it("is not solved while a coloured ball is not in its hole", () => {
    const state = play(initialState(small), ["down"]);
    expect(isSolved(state)).toBe(false);
  });
});

describe("tilt machine score", () => {
  // Rule: "The score is the extra tilts ..." These tests use the small puzzle.
  // Rule: "The score is the extra tilts: your tilts minus the fewest possible tilts. 0 is a perfect solve."
  it("gives 0 extra tilts for a perfect solve", () => {
    const state = play(initialState(small), ["right"]);
    expect(isSolved(state)).toBe(true);
    expect(extraTilts(state)).toBe(0);
  });

  // Rule: "The score is the extra tilts: your tilts minus the fewest possible tilts."
  it("gives the tilts minus the fewest tilts after a solve with extra tilts", () => {
    const state = play(initialState(small), ["down", "up", "right"]);
    expect(isSolved(state)).toBe(true);
    expect(state.tilts).toBe(3);
    expect(extraTilts(state)).toBe(2);
  });

  // Rule: "Before the solve, the extra tilts are your tilts minus the fewest tilts. They are 0 when your tilts are fewer than the fewest tilts."
  it("gives 0 before the solve while the tilts are fewer than the fewest tilts", () => {
    const state = play(initialState(medium), ["up", "down"]);
    expect(state.tilts).toBe(2);
    expect(state.fewest).toBe(5);
    expect(extraTilts(state)).toBe(0);
  });

  // Rule: "Before the solve, the extra tilts are your tilts minus the fewest tilts."
  it("gives the tilts minus the fewest tilts before the solve when the tilts are more", () => {
    const state = play(initialState(small), ["down", "up"]);
    expect(isSolved(state)).toBe(false);
    expect(extraTilts(state)).toBe(1);
  });

  // Rule: "A tilt that moves no ball does not change the board and does not count."
  it("does not add an extra tilt for a tilt that moves no ball", () => {
    const state = play(initialState(small), ["up", "left", "up", "right"]);
    expect(state.tilts).toBe(1);
    expect(extraTilts(state)).toBe(0);
  });

  // Rule: "After the solve, the game ignores all tilts."
  it("does not add an extra tilt after the solve", () => {
    const solved = play(initialState(greyAside), ["right", "left", "up"]);
    expect(solved.tilts).toBe(1);
    expect(extraTilts(solved)).toBe(0);
  });
});

describe("tilt machine score edge cases", () => {
  // Contract: "The result is 0 when "fewest" is "null"."
  it("gives 0 when the fewest tilts are null", () => {
    const state = initialState(stuck);
    expect(extraTilts(state)).toBe(0);
  });
});
