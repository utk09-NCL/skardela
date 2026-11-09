import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { savedDataKey } from "../../shared/state/saved-data";
import { useAppStore } from "../../shared/state/store";
import { t } from "../../test/i18n";
import { ThemeSwitcher } from "./ThemeSwitcher";

// The saved data in the storage, as an object.
function stored(): unknown {
  return JSON.parse(String(localStorage.getItem(savedDataKey)));
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

const theme = t(($) => $.theme, { returnObjects: true });

describe("theme switcher", () => {
  it("shows the saved theme and sets it on the page", async () => {
    localStorage.setItem(savedDataKey, JSON.stringify({ theme: "dark" }));
    await act(async () => {
      await useAppStore.persist.rehydrate();
    });
    render(<ThemeSwitcher />);
    expect(screen.getByRole("combobox", { name: theme.label })).toHaveValue("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  // Chrome reports a form field without an "id" or a "name".
  it("gives the list a name", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("combobox", { name: theme.label })).toHaveAttribute("name", "theme");
  });

  it("changes and saves the theme, and keeps the other saved data", async () => {
    useAppStore.getState().acknowledgeNotice();
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    const select = screen.getByRole("combobox", { name: theme.label });
    expect(select).toHaveValue("system");

    await user.selectOptions(select, theme.options.light);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(stored()).toMatchObject({ theme: "light", cookieBanner: true });

    await user.selectOptions(select, theme.options.system);
    expect(Object.hasOwn(document.documentElement.dataset, "theme")).toBe(false);
    expect(stored()).toMatchObject({ theme: "system", cookieBanner: true });
  });

  it("follows a theme change in a different tab", async () => {
    render(<ThemeSwitcher />);
    await act(async () => {
      localStorage.setItem(savedDataKey, JSON.stringify({ theme: "dark" }));
      window.dispatchEvent(new StorageEvent("storage", { key: savedDataKey, newValue: "{}" }));
      await Promise.resolve();
    });
    expect(screen.getByRole("combobox", { name: theme.label })).toHaveValue("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
