import { describe, expect, it } from "vitest";
import { operatorOfKey } from "./keys";

describe("numpuz operator keys", () => {
  it("gives the operator of each operator key", () => {
    expect(operatorOfKey("+")).toBe("+");
    expect(operatorOfKey("-")).toBe("-");
    expect(operatorOfKey("*")).toBe("×");
    expect(operatorOfKey("/")).toBe("÷");
    expect(operatorOfKey("×")).toBe("×");
    expect(operatorOfKey("÷")).toBe("÷");
  });

  it("reads the letter x with and without Shift", () => {
    expect(operatorOfKey("x")).toBe("×");
    expect(operatorOfKey("X")).toBe("×");
  });

  it("gives undefined for a key that is not an operator key", () => {
    for (const key of ["a", "1", "=", " ", "Enter", "ArrowRight"]) {
      expect(operatorOfKey(key)).toBeUndefined();
    }
  });
});
