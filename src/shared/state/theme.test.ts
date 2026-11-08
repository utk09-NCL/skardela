import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, isTheme } from "./theme";

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe("theme", () => {
  it("knows the three themes", () => {
    expect(["system", "light", "dark"].every((value) => isTheme(value))).toBe(true);
    expect([undefined, null, "purple", 1].some((value) => isTheme(value))).toBe(false);
  });

  it("sets data-theme on the page, and removes it for the system theme", () => {
    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    applyTheme("system");
    expect(Object.hasOwn(document.documentElement.dataset, "theme")).toBe(false);
  });
});
