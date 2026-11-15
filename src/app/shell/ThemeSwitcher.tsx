import { useEffect } from "react";
import { applyTheme } from "../../shared/state/theme";
import { getLogger } from "../../shared/logger";
import { useAppStore } from "../../shared/state/store";
import { useMediaQuery } from "../../shared/useMediaQuery";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./ThemeSwitcher.module.css";

const log = getLogger("ui.theme-switcher");
const choices = ["light", "dark"] as const;

// Two buttons: the light theme and the dark theme. A new player has the "system" theme,
// thus the button of the theme of the device shows as pressed until the player selects a theme.
// "Clear my data" sets the "system" theme again.
export function ThemeSwitcher() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const isSystemDark = useMediaQuery("(prefers-color-scheme: dark)", false);
  const shown = theme === "system" ? (isSystemDark ? "dark" : "light") : theme;

  // The effect sets the theme on the page after each change, also after a change in a different tab.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <fieldset className={styles.switcher}>
      <legend className="visually-hidden">{text.theme.label}</legend>
      {choices.map((choice) => (
        <button
          key={choice}
          type="button"
          className={styles.choice}
          aria-pressed={shown === choice}
          aria-label={text.theme[choice]}
          onClick={() => {
            if (choice === theme) return;
            // This log helps us track user theme changes during a session.
            log.info("Theme changed", { theme: choice });
            setTheme(choice);
          }}
        >
          <span aria-hidden="true">{symbols.theme[choice]}</span>
        </button>
      ))}
    </fieldset>
  );
}
