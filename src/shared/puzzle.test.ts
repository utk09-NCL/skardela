import { describe, expect, it } from "vitest";
import { parsePuzzleId, puzzleIdOf } from "./puzzle";

describe("puzzle ID", () => {
  it("has the type, the level and the number", () => {
    expect(puzzleIdOf("tilt", "hard", 1049)).toBe("tilt-hard-1049");
    expect(puzzleIdOf("colour-binary", "easy", 123_456)).toBe("colour-binary-easy-123456");
  });

  it.each([
    ["tilt-hard-1049", { type: "tilt", level: "hard", number: 1049 }],
    ["colour-binary-easy-0", { type: "colour-binary", level: "easy", number: 0 }],
    ["guzzle-medium-123456", { type: "guzzle", level: "medium", number: 123_456 }],
  ])("gives the parts of %s", (id, parts) => {
    expect(parsePuzzleId(id)).toEqual(parts);
  });

  // An ID from before the daily numbers has no level. A number with a zero before it is a second ID
  // for the same puzzle, thus it is not an ID.
  it.each([
    "tilt-0029",
    "tilt-hard",
    "tilt-expert-12",
    "tilt-hard-012",
    "tilt-hard-1.5",
    "-hard-1",
    "",
  ])("gives null for %j", (id) => {
    expect(parsePuzzleId(id)).toBeNull();
  });
});
