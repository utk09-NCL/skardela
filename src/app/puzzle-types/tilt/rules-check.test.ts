/* oxlint-disable max-lines -- one file holds all rule tests of this module. */
import { describe, expect, it } from "vitest";
import example from "./examples/tilt-0000.json";
import { findPuzzleProblems, type TiltPuzzle } from "./puzzle";
import {
  allInHoles,
  readBoard,
  tiltBoard,
  type Ball,
  type Board,
  type Direction,
} from "./rules-check";

// The example is the rules.md example. The level is medium.
const medium = example as TiltPuzzle;

// This helper makes a puzzle from a board and a level.
function puzzleOf(difficulty: TiltPuzzle["difficulty"], board: readonly string[]): TiltPuzzle {
  return { ...medium, difficulty, board };
}

// A valid easy board: one red ball and one red hole.
const easyBoard = ["R....", ".....", ".....", ".....", "....r"];

// A valid hard board: three coloured balls, their holes and one grey ball.
const hardBoard = ["R......", "B......", "Y......", "G......", ".......", ".......", "rby...."];

// This helper reads rows and tilts them once.
function tiltRows(rows: readonly string[], direction: Direction) {
  const board = readBoard(rows);
  return tiltBoard(board.layout, board.balls, direction);
}

// This helper gets the ball of one colour. It throws when the board has no such ball.
function ballOf(balls: readonly Ball[], colour: Ball["colour"]): Ball {
  const found = balls.find((ball) => ball.colour === colour);
  if (found === undefined) throw new Error(`No ${colour} ball`);
  return found;
}

// This helper moves one ball of a board to a square, as a game state can have it.
function withBall(board: Board, colour: Ball["colour"], index: number, isInHole: boolean) {
  return board.balls.map((ball) => (ball.colour === colour ? { ...ball, index, isInHole } : ball));
}

describe("tilt readBoard", () => {
  // Rule: "Each row of `board` has one character for each square" (Puzzle data table).
  it("reads the size, the walls and the hole of a board", () => {
    const board = readBoard(["R#.", "..r", "..."]);
    expect(board.layout.size).toBe(3);
    expect(board.layout.walls.indexOf(true)).toBe(1);
    expect(board.layout.walls.filter(Boolean)).toHaveLength(1);
    expect(board.layout.holes).toEqual({ red: 5 });
  });

  // Rule: "The balls are in the order of ballColours" (contract): red, blue, yellow, then grey.
  it("lists the balls in the order red, blue, yellow, grey, with no ball in a hole", () => {
    const board = readBoard(["YBR", "G..", "..."]);
    expect(board.balls.map((ball) => [ball.colour, ball.index, ball.isInHole])).toEqual([
      ["red", 2, false],
      ["blue", 1, false],
      ["yellow", 0, false],
      ["grey", 3, false],
    ]);
  });

  // Rule: "It has only the balls of the board" (contract).
  it("lists only the balls of the board", () => {
    const board = readBoard(["R.r", "...", "..."]);
    expect(board.balls).toHaveLength(1);
    expect(board.layout.holes).toEqual({ red: 2 });
  });
});

describe("tilt readBoard example", () => {
  // Rule: "Row 3, column 2 in rules.md is index (3 - 1) x size + (2 - 1)" (contract).
  it("finds the holes of the example at the indexes of rules.md", () => {
    const board = readBoard(medium.board);
    expect(board.layout.size).toBe(6);
    expect(board.layout.holes).toEqual({ red: (3 - 1) * 6 + (2 - 1), blue: (6 - 1) * 6 + (4 - 1) });
    expect(ballOf(board.balls, "red").index).toBe((5 - 1) * 6 + (6 - 1));
    expect(ballOf(board.balls, "blue").index).toBe((2 - 1) * 6 + (2 - 1));
    expect(board.layout.walls[(2 - 1) * 6 + (1 - 1)]).toBe(true);
    expect(board.layout.walls[(2 - 1) * 6 + (3 - 1)]).toBe(true);
  });
});

describe("tilt tiltBoard rolling", () => {
  // Rule: "Tilt the board up, down, left or right."
  it("rolls a ball one square in each direction on a 3 x 3 board", () => {
    const rows = ["...", ".R.", "..."];
    const expected: Record<Direction, number> = { up: 1, down: 7, left: 3, right: 5 };
    for (const direction of ["up", "down", "left", "right"] as const) {
      const result = tiltRows(rows, direction);
      expect(ballOf(result.balls, "red").index).toBe(expected[direction]);
      expect(result.moves).toEqual([
        { colour: "red", from: 4, to: expected[direction], squares: 1, fallsIn: false },
      ]);
    }
  });

  // Rule: "The edge of the board stops a ball, as a wall does."
  it("rolls a ball to the edge of the board", () => {
    const result = tiltRows(["R..", "...", "..."], "right");
    expect(result.moves).toEqual([{ colour: "red", from: 0, to: 2, squares: 2, fallsIn: false }]);
  });
});

describe("tilt tiltBoard walls", () => {
  // Rule: "Each ball rolls in the direction of the tilt until it hits a wall."
  it("stops a ball before a wall", () => {
    const result = tiltRows(["R.#.", "....", "....", "...."], "right");
    expect(result.moves).toEqual([{ colour: "red", from: 0, to: 1, squares: 1, fallsIn: false }]);
  });

  // Rule: "A tilt that moves no ball does not change the board and does not count."
  it("gives the same balls and no moves when no ball can move", () => {
    const board = readBoard(["R#.", "#..", "..."]);
    for (const direction of ["up", "left", "right", "down"] as const) {
      // The red ball is in the corner, with a wall on its right and a wall below it.
      const result = tiltBoard(board.layout, board.balls, direction);
      expect(result.moves).toEqual([]);
      expect(result.balls).toEqual(board.balls);
    }
  });

  // Rule: "The edge of the board stops a ball, as a wall does."
  it("gives no moves when the only ball is at the edge", () => {
    const board = readBoard(["R...", "....", "....", "...."]);
    const result = tiltBoard(board.layout, board.balls, "up");
    expect(result.moves).toEqual([]);
    expect(result.balls).toEqual(board.balls);
  });

  // Rule: "Each ball rolls ... until it hits ... another ball."
  it("does not move two balls that touch in the direction of the tilt", () => {
    const result = tiltRows(["..RB", "....", "....", "...."], "right");
    expect(result.moves).toEqual([]);
  });
});

describe("tilt tiltBoard holes", () => {
  // Rule: "A coloured ball that rolls over the hole of its colour falls in and stops there."
  it("makes a ball fall into the hole of its colour and stop there", () => {
    const result = tiltRows(["R.r.", "....", "....", "...."], "right");
    expect(result.moves).toEqual([{ colour: "red", from: 0, to: 2, squares: 2, fallsIn: true }]);
    const red = ballOf(result.balls, "red");
    expect(red.index).toBe(2);
    expect(red.isInHole).toBe(true);
    expect(allInHoles(result.balls)).toBe(true);
  });

  // Rule: "A coloured ball rolls over an empty hole of a different colour."
  it("rolls a coloured ball over an empty hole of a different colour", () => {
    const result = tiltRows(["R.b.", "....", "....", "B..."], "right");
    expect(result.moves).toEqual([
      { colour: "red", from: 0, to: 3, squares: 3, fallsIn: false },
      { colour: "blue", from: 12, to: 15, squares: 3, fallsIn: false },
    ]);
    expect(ballOf(result.balls, "red").isInHole).toBe(false);
  });

  // Rule: "A coloured ball with no hole on the board never falls in" (contract).
  it("does not let a coloured ball with no hole fall in", () => {
    const result = tiltRows(["R.b.", "....", "....", "B..."], "right");
    expect(result.balls.every((ball) => !ball.isInHole)).toBe(true);
    expect(allInHoles(result.balls)).toBe(false);
  });

  // Rule: "Hard: the grey ball has no hole. It rolls over all empty holes."
  it("rolls the grey ball over an empty hole and does not let it fall in", () => {
    const result = tiltRows(["G.r.", "....", "....", "R..."], "right");
    expect(result.moves).toEqual([
      { colour: "red", from: 12, to: 15, squares: 3, fallsIn: false },
      { colour: "grey", from: 0, to: 3, squares: 3, fallsIn: false },
    ]);
    expect(ballOf(result.balls, "grey").isInHole).toBe(false);
  });
});

describe("tilt tiltBoard full holes", () => {
  // Rule: "A full hole stops the other balls, as a wall does."
  it("stops a ball next to a full hole", () => {
    const board = readBoard(["B.r.", "....", "....", "R..."]);
    const balls = withBall(board, "red", 2, true);
    const result = tiltBoard(board.layout, balls, "right");
    expect(result.moves).toEqual([{ colour: "blue", from: 0, to: 1, squares: 1, fallsIn: false }]);
    expect(ballOf(result.balls, "blue").index).toBe(1);
  });

  // Rule: "A full hole stops the other balls, as a wall does." The grey ball is a ball too.
  it("stops the grey ball next to a full hole", () => {
    const board = readBoard(["G.r.", "....", "....", "R..."]);
    const balls = withBall(board, "red", 2, true);
    const result = tiltBoard(board.layout, balls, "right");
    expect(result.moves).toEqual([{ colour: "grey", from: 0, to: 1, squares: 1, fallsIn: false }]);
  });

  // Rule: "A ball in its hole stays there until the end. It does not move again."
  it("does not move a ball that is in its hole", () => {
    const board = readBoard(["B.r.", "....", "....", "R..."]);
    const balls = withBall(board, "red", 2, true);
    for (const direction of ["up", "down", "left", "right"] as const) {
      const result = tiltBoard(board.layout, balls, direction);
      expect(ballOf(result.balls, "red")).toEqual({ colour: "red", index: 2, isInHole: true });
      expect(result.moves.some((move) => move.colour === "red")).toBe(false);
    }
  });
});

describe("tilt tiltBoard balls on holes", () => {
  // Rule: "A ball can stop on an empty hole of a different colour. It is not in a hole."
  it("lets a ball stop on an empty hole of a different colour", () => {
    const result = tiltRows(["R.b#", "....", "....", "B..."], "right");
    const red = ballOf(result.balls, "red");
    expect(red.index).toBe(2);
    expect(red.isInHole).toBe(false);
  });

  // Rule: "The next tilt can move it."
  it("moves a ball again that stopped on a hole of a different colour", () => {
    const board = readBoard(["R.b#", "....", "....", "B..."]);
    const balls = withBall(board, "red", 2, false);
    const result = tiltBoard(board.layout, balls, "left");
    expect(ballOf(result.balls, "red").index).toBe(0);
  });

  // Rule: "A ball on an empty hole stops the other balls, as at each other square."
  it("stops the ball of a hole when another ball is on that hole", () => {
    const board = readBoard(["R.b#", "....", "....", "..B."]);
    const balls = withBall(board, "red", 2, false);
    const result = tiltBoard(board.layout, balls, "up");
    expect(result.moves).toEqual([{ colour: "blue", from: 14, to: 6, squares: 2, fallsIn: false }]);
    expect(ballOf(result.balls, "blue").isInHole).toBe(false);
  });
});

describe("tilt tiltBoard balls in one line", () => {
  // Rule: "When two balls are in one line, the front ball moves first. The ball behind it stops next to it."
  it("stops the ball behind next to the front ball", () => {
    const result = tiltRows(["R.B.", "....", "....", "...."], "right");
    expect(result.moves).toEqual([
      { colour: "red", from: 0, to: 2, squares: 2, fallsIn: false },
      { colour: "blue", from: 2, to: 3, squares: 1, fallsIn: false },
    ]);
  });

  // Rule: "All balls roll at the same time."
  it("moves three balls in one line, each one square", () => {
    const result = tiltRows(["RBG.", "....", "....", "...."], "right");
    expect(result.balls.map((ball) => [ball.colour, ball.index])).toEqual([
      ["red", 1],
      ["blue", 2],
      ["grey", 3],
    ]);
    expect(result.moves.map((move) => move.squares)).toEqual([1, 1, 1]);
  });

  // Rule: "When the front ball falls into its hole, the ball behind it stops next to that full hole, in the same tilt."
  it("stops the ball behind next to the hole when the front ball falls in", () => {
    const result = tiltRows(["BRr.", "....", "....", "b..."], "right");
    expect(result.moves).toEqual([
      { colour: "red", from: 1, to: 2, squares: 1, fallsIn: true },
      { colour: "blue", from: 0, to: 1, squares: 1, fallsIn: false },
    ]);
    expect(ballOf(result.balls, "red").isInHole).toBe(true);
    expect(ballOf(result.balls, "blue").index).toBe(1);
  });

  // Rule: "A tilt ... All balls after the tilt, in the same order as before the tilt" (contract).
  it("keeps the order of the balls after a tilt", () => {
    const result = tiltRows(["B.R.", "....", "....", "...."], "left");
    expect(result.balls.map((ball) => ball.colour)).toEqual(["red", "blue"]);
  });
});

describe("tilt allInHoles", () => {
  const redInHole: Ball = { colour: "red", index: 2, isInHole: true };
  const blueOut: Ball = { colour: "blue", index: 5, isInHole: false };
  const blueIn: Ball = { colour: "blue", index: 8, isInHole: true };
  const greyOut: Ball = { colour: "grey", index: 3, isInHole: false };

  // Rule: "The puzzle is solved when all coloured balls are in their holes."
  it("is true when each coloured ball is in its hole", () => {
    expect(allInHoles([redInHole, blueIn])).toBe(true);
  });

  // Rule: "The puzzle is solved when all coloured balls are in their holes."
  it("is false when one coloured ball is not in its hole", () => {
    expect(allInHoles([redInHole, blueOut])).toBe(false);
  });

  // Rule: "Hard: the grey ball has no hole." The grey ball does not count.
  it("does not count the grey ball", () => {
    expect(allInHoles([redInHole, blueIn, greyOut])).toBe(true);
    expect(allInHoles([redInHole, blueOut, greyOut])).toBe(false);
  });
});

describe("tilt findPuzzleProblems", () => {
  // Rule: "Each row of `board` has one character for each square."
  it("accepts the example, an easy board and a hard board", () => {
    expect(findPuzzleProblems(medium)).toEqual([]);
    expect(findPuzzleProblems(puzzleOf("easy", easyBoard))).toEqual([]);
    expect(findPuzzleProblems(puzzleOf("hard", hardBoard))).toEqual([]);
  });

  // Rule: "`board` does not have the size of its level, or its rows have different lengths."
  it("refuses a board with the size of another level", () => {
    expect(findPuzzleProblems(puzzleOf("medium", easyBoard)).length).toBeGreaterThan(0);
    expect(findPuzzleProblems(puzzleOf("easy", medium.board)).length).toBeGreaterThan(0);
  });

  // Rule: "`board` does not have the size of its level, or its rows have different lengths."
  it("refuses a board with a row that is too short", () => {
    const board = [...easyBoard];
    board[2] = "....";
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });

  // Rule: "`board` has a character that is not in the table."
  it("refuses a character that is not a square", () => {
    const board = [...easyBoard];
    board[2] = "..X..";
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });
});

describe("tilt findPuzzleProblems colours and counts", () => {
  // Rule: "The colours of the balls are not the colours of its level."
  it("refuses balls with the wrong colours for the level", () => {
    const board = [...medium.board];
    board[1] = "#Y#..#";
    board[5] = "...y..";
    expect(findPuzzleProblems(puzzleOf("medium", board)).length).toBeGreaterThan(0);
  });

  // Rule: "The colours of the balls are not the colours of its level." Easy has only red.
  it("refuses a blue ball and a blue hole on easy", () => {
    const board = ["R....", "B....", ".....", ".....", "..rb."];
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });

  // Rule: "A colour does not have exactly one ball and exactly one hole."
  it("refuses a colour with no hole", () => {
    const board = ["R....", ".....", ".....", ".....", "....."];
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });

  // Rule: "A colour does not have exactly one ball and exactly one hole."
  it("refuses a colour with no ball", () => {
    const board = [".....", ".....", ".....", ".....", "....r"];
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });

  // Rule: "A colour does not have exactly one ball and exactly one hole."
  it("refuses a colour with two balls", () => {
    const board = ["R...R", ".....", ".....", ".....", "....r"];
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });

  // Rule: "A colour does not have exactly one ball and exactly one hole."
  it("refuses a colour with two holes", () => {
    const board = ["R....", ".....", ".....", ".....", "r...r"];
    expect(findPuzzleProblems(puzzleOf("easy", board)).length).toBeGreaterThan(0);
  });
});

describe("tilt findPuzzleProblems grey ball", () => {
  // Rule: "The grey ball is not on hard, or hard does not have exactly one grey ball."
  it("refuses a grey ball on medium", () => {
    const board = [...medium.board];
    board[0] = "G.....";
    expect(findPuzzleProblems(puzzleOf("medium", board)).length).toBeGreaterThan(0);
  });

  // Rule: "The grey ball is not on hard, or hard does not have exactly one grey ball."
  it("refuses a hard board with no grey ball", () => {
    const board = [...hardBoard];
    board[3] = ".......";
    expect(findPuzzleProblems(puzzleOf("hard", board)).length).toBeGreaterThan(0);
  });

  // Rule: "The grey ball is not on hard, or hard does not have exactly one grey ball."
  it("refuses a hard board with two grey balls", () => {
    const board = [...hardBoard];
    board[4] = "G......";
    expect(findPuzzleProblems(puzzleOf("hard", board)).length).toBeGreaterThan(0);
  });
});
