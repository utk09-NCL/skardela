import { describe, expect, it } from "vitest";
import { colourOfKey } from "./keys";

describe("colour-binary keys", () => {
  it("gives the colour of R, B and Space, with and without Shift", () => {
    expect(colourOfKey("r")).toBe("R");
    expect(colourOfKey("B")).toBe("B");
    expect(colourOfKey(" ")).toBe(".");
    expect(colourOfKey("x")).toBeUndefined();
  });
});
