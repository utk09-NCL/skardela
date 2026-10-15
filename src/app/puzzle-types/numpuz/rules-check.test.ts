import { describe, expect, it } from "vitest";
import { checkGuess, evaluate } from "./rules-check";

describe("evaluate", () => {
  it("works out × and ÷ before + and −", () => {
    expect(evaluate([2, 3, 4], ["+", "×"])).toBe(14);
    expect(evaluate([10, 2, 3], ["-", "×"])).toBe(4);
    expect(evaluate([8, 2, 1], ["÷", "+"])).toBe(5);
  });

  it("works from left to right for operators of the same level", () => {
    expect(evaluate([10, 3, 2], ["-", "+"])).toBe(9);
    expect(evaluate([6, 4, 2], ["÷", "×"])).toBe(3);
  });

  it("returns null when it cannot be worked out", () => {
    expect(evaluate([4, 0], ["÷"])).toBeNull();
    expect(evaluate([1, 2, 3], ["+"])).toBeNull();
    expect(evaluate([], [])).toBeNull();
  });
});

describe("checkGuess", () => {
  const numbers = [2, 3, 4];

  it("is incomplete while a blank is empty", () => {
    expect(checkGuess(numbers, [null, null], 14)).toBe("incomplete");
    expect(checkGuess(numbers, ["+", null], 14)).toBe("incomplete");
  });

  it("is correct when the equation reaches the target", () => {
    expect(checkGuess(numbers, ["+", "×"], 14)).toBe("correct");
  });

  it("accepts a different answer that reaches the target", () => {
    // 2 × 3 + 4 = 10 and 2 + 3 × 4 = 14 are different, but 2 × 3 × 4 = 24 and 2 + 3 + 4 = 9.
    expect(checkGuess([2, 2, 2], ["+", "+"], 6)).toBe("correct");
    expect(checkGuess([2, 2, 2], ["×", "+"], 6)).toBe("correct");
  });

  it("is wrong when the equation does not reach the target", () => {
    expect(checkGuess(numbers, ["×", "+"], 14)).toBe("wrong");
  });

  it("is wrong when a division by zero happens", () => {
    expect(checkGuess([4, 0], ["÷"], 1)).toBe("wrong");
  });
});
