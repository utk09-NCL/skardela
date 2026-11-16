import { describe, expect, it } from "vitest";
import { cosineOf, sineOf } from "./trig";

const degrees = Array.from({ length: 360 }, (_, angle) => angle);

describe("orbital sine and cosine", () => {
  it("are exact at 0°, 90°, 180° and 270°", () => {
    expect([0, 90, 180, 270].map((angle) => sineOf(angle))).toEqual([0, 1, 0, -1]);
    expect([0, 90, 180, 270].map((angle) => cosineOf(angle))).toEqual([1, 0, -1, 0]);
  });

  it("are the same as Math.sin and Math.cos to 1e-15, for each whole degree", () => {
    for (const angle of degrees) {
      const radians = (angle * Math.PI) / 180;
      expect(Math.abs(sineOf(angle) - Math.sin(radians))).toBeLessThan(1e-15);
      expect(Math.abs(cosineOf(angle) - Math.cos(radians))).toBeLessThan(1e-15);
    }
  });

  it("have the symmetry of the circle", () => {
    for (const angle of degrees) {
      expect(sineOf((angle + 180) % 360)).toBe(0 - sineOf(angle));
      expect(cosineOf((360 - angle) % 360)).toBe(cosineOf(angle));
    }
  });
});
