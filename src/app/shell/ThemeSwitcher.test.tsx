import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { savedDataKey } from "../../shared/state/saved-data";
import { useAppStore } from "../../shared/state/store";
import { text } from "../../text/en";
import { ThemeSwitcher } from "./ThemeSwitcher";

// The saved data in the storage, as an object.
function stored(): unknown {
  return JSON.parse(String(localStorage.getItem(savedDataKey)));
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
  vi.unstubAllGlobals();
});

// The two theme buttons, by their names.
function themeButtons() {
  return {
    light: screen.getByRole("button", { name: text.theme.light }),
    dark: screen.getByRole("button", { name: text.theme.dark }),
  };
}

describe("theme switcher", () => {
  it("shows the saved theme and sets it on the page", async () => {
    localStorage.setItem(savedDataKey, JSON.stringify({ theme: "dark" }));
    await act(async () => {
      await useAppStore.persist.rehydrate();
    });
    render(<ThemeSwitcher />);
    expect(themeButtons().dark).toHaveAttribute("aria-pressed", "true");
    expect(themeButtons().light).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  // A new player has the theme of the device. The page then has no "data-theme", and the CSS follows the device.
  it("shows the theme of the device as pressed before the first select", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn<(query: string) => Partial<MediaQueryList>>((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        addEventListener: vi.fn<MediaQueryList["addEventListener"]>(),
        removeEventListener: vi.fn<MediaQueryList["removeEventListener"]>(),
      })),
    );
    render(<ThemeSwitcher />);
    expect(useAppStore.getState().theme).toBe("system");
    expect(themeButtons().dark).toHaveAttribute("aria-pressed", "true");
    expect(Object.hasOwn(document.documentElement.dataset, "theme")).toBe(false);
  });
});

describe("theme switcher changes", () => {
  it("changes and saves the theme, and keeps the other saved data", async () => {
    useAppStore.getState().acknowledgeNotice();
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(themeButtons().dark);
    expect(themeButtons().dark).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(stored()).toMatchObject({ theme: "dark", cookieBanner: true });

    await user.click(themeButtons().light);
    expect(themeButtons().light).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(stored()).toMatchObject({ theme: "light", cookieBanner: true });
  });

  it("follows a theme change in a different tab", async () => {
    render(<ThemeSwitcher />);
    await act(async () => {
      localStorage.setItem(savedDataKey, JSON.stringify({ theme: "dark" }));
      window.dispatchEvent(new StorageEvent("storage", { key: savedDataKey, newValue: "{}" }));
      await Promise.resolve();
    });
    expect(themeButtons().dark).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
