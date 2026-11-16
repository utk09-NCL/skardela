import { describe, expect, it } from "vitest";
import { makeRandom, pickOne, seedOf } from "./random";

describe("seedOf", () => {
  // The values of the FNV-1a hash for an empty text and for "a".
  it("gives the FNV-1a hash of a text", () => {
    expect(seedOf("")).toBe(0x81_1c_9d_c5);
    expect(seedOf("a")).toBe(0xe4_0c_29_2c);
  });

  it("gives a different seed for a different text", () => {
    expect(seedOf("tilt-easy-1049")).not.toBe(seedOf("tilt-easy-1050"));
  });
});

describe("pickOne", () => {
  it("gives undefined for an empty list", () => {
    expect(pickOne([], makeRandom(1))).toBeUndefined();
  });

  it("gives each item of the list, and only items of the list", () => {
    const items = ["a", "b", "c"];
    const random = makeRandom(7);
    const picked = new Set(Array.from({ length: 100 }, () => pickOne(items, random)));
    expect(picked).toEqual(new Set(items));
  });

  it("gives the first item for 0 and the last item for a value just under 1", () => {
    expect(pickOne(["a", "b", "c"], () => 0)).toBe("a");
    expect(pickOne(["a", "b", "c"], () => 0.999_999)).toBe("c");
  });
});
