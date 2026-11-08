import { useEffect } from "react";
import { applyTheme, isTheme, themes } from "../../shared/state/theme";
import { getLogger } from "../../shared/logger";
import { useAppStore } from "../../shared/state/store";
import { text } from "../../text/en";
import styles from "./ThemeSwitcher.module.css";

// This list lets the player select the system theme, the light theme or the dark theme.
// A native <select> works with a keyboard and a screen reader without more code.
export function ThemeSwitcher() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const log = getLogger("ui.theme-switcher");

  // The effect sets the theme on the page after each change, also after a change in a different tab.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <label className={styles.switcher}>
      <span className="visually-hidden">{text.theme.label}</span>
      {/* The name lets the browser identify the field, for example for autofill. */}
      <select
        name="theme"
        className={styles.select}
        value={theme}
        onChange={(event) => {
          const selected = event.target.value;
          if (!isTheme(selected)) return;
          // This log helps us track user theme changes during a session.
          log.info("Theme changed", { theme: selected });
          setTheme(selected);
        }}
      >
        {themes.map((option) => (
          <option key={option} value={option}>
            {text.theme.options[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
