// The player can select the system theme, the light theme or the dark theme.
// "system" follows the setting of the device.
// The browser keeps the selected theme in the saved data. See "store.ts".
export const themes = ["system", "light", "dark"] as const;

export type Theme = (typeof themes)[number];

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme);
}

// This sets the theme on the page. The CSS reads "data-theme" on <html>. See "src/index.css".
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}
