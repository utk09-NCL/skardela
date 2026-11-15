import { useSyncExternalStore } from "react";

// The media query, or "null" when the browser has no "matchMedia", for example jsdom in the tests.
function mediaQuery(query: string): MediaQueryList | null {
  return typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
}

// "true" when a CSS media query matches, for example "(prefers-color-scheme: dark)".
// It changes when the player changes the setting of the system.
// "fallback" is the result when the browser cannot tell.
export function useMediaQuery(query: string, fallback: boolean): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = mediaQuery(query);
      list?.addEventListener("change", onChange);
      return () => {
        list?.removeEventListener("change", onChange);
      };
    },
    () => mediaQuery(query)?.matches ?? fallback,
    () => fallback,
  );
}
