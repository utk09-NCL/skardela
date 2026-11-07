import { describe, expect, it } from "vitest";
import { directionOfKey, shortestSwipe, swipeDirection } from "./keys";

describe("tilt arrow keys", () => {
  it("gives the tilt of each arrow key", () => {
    expect(directionOfKey("ArrowUp")).toBe("up");
    expect(directionOfKey("ArrowDown")).toBe("down");
    expect(directionOfKey("ArrowLeft")).toBe("left");
    expect(directionOfKey("ArrowRight")).toBe("right");
  });

  it("gives undefined for a key that is not an arrow key", () => {
    for (const key of ["a", "w", " ", "Enter", "Tab", "constructor", "toString"]) {
      expect(directionOfKey(key)).toBeUndefined();
    }
  });
});

describe("tilt swipes", () => {
  it("tilts in the main direction of the swipe", () => {
    expect(swipeDirection(60, 10)).toBe("right");
    expect(swipeDirection(-60, 25)).toBe("left");
    expect(swipeDirection(5, 40)).toBe("down");
    expect(swipeDirection(-30, -45)).toBe("up");
  });

  it("does nothing for a swipe shorter than 20 px", () => {
    expect(shortestSwipe).toBe(20);
    expect(swipeDirection(19, 0)).toBeUndefined();
    expect(swipeDirection(0, -19.9)).toBeUndefined();
    expect(swipeDirection(0, 0)).toBeUndefined();
    expect(swipeDirection(20, 0)).toBe("right");
    expect(swipeDirection(0, -20)).toBe("up");
  });

  it("does nothing for a swipe with no main direction", () => {
    expect(swipeDirection(30, 30)).toBeUndefined();
    expect(swipeDirection(-25, 25)).toBeUndefined();
  });
});
