import { describe, expect, it } from "vitest";
import { parsePuzzleId } from "../../../shared/puzzle";
import { makeRandom } from "../../../shared/random";
import { randomNumbers } from "../../daily";
import { randomPuzzleId } from "./randomPuzzle";

describe("randomPuzzleId", () => {
  it("gives a puzzle of the same type and level, with a number in the range of the random puzzles", () => {
    const random = makeRandom(11);
    for (let count = 0; count < 100; count += 1) {
      const parts = parsePuzzleId(randomPuzzleId("colour-binary", "hard", random));
      expect(parts).toMatchObject({ type: "colour-binary", level: "hard" });
      expect(parts?.number).toBeGreaterThanOrEqual(randomNumbers.min);
      expect(parts?.number).toBeLessThanOrEqual(randomNumbers.max);
    }
  });

  it("gives the first and the last number of the range", () => {
    expect(randomPuzzleId("tilt", "easy", () => 0)).toBe("tilt-easy-100000");
    expect(randomPuzzleId("tilt", "easy", () => 0.999_999_9)).toBe("tilt-easy-999999");
  });
});
