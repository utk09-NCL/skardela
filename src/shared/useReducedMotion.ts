import { useSyncExternalStore } from "react";

// The "reduce motion" setting of the system. Most animations obey it in CSS. See "src/index.css".
// A puzzle type reads it here only when the game logic needs it, for example the time of a slide.

const reduceMotion = "(prefers-reduced-motion: reduce)";

// The media query of "reduce motion", or "null" when the browser has no "matchMedia", for example jsdom in the tests.
function motionQuery(): MediaQueryList | null {
  return typeof window.matchMedia === "function" ? window.matchMedia(reduceMotion) : null;
}

function subscribe(onChange: () => void): () => void {
  const query = motionQuery();
  query?.addEventListener("change", onChange);
  return () => {
    query?.removeEventListener("change", onChange);
  };
}

// "true" when "reduce motion" is on, or when the browser cannot tell. Then a move shows at once.
function isReduced(): boolean {
  return motionQuery()?.matches ?? true;
}

// "true" when "reduce motion" is on. It changes when the player changes the setting of the system.
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, isReduced, () => true);
}
