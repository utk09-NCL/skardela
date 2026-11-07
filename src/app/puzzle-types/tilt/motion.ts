import { useSyncExternalStore } from "react";

// The slide of the balls after a tilt. See "## Motion" in "rules.md":
// "After a tilt, the balls slide to their new squares in 180 ms."

// The time of the slide, in milliseconds. The CSS uses the same time. See "Grid.tsx".
export const slideTime = 180;

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

// "true" when the balls move at once, with no slide: "reduce motion" is on, or the browser cannot tell.
function isReduced(): boolean {
  return motionQuery()?.matches ?? true;
}

// The time of the slide now: "slideTime", or 0 when "reduce motion" is on.
// It changes when the player changes the setting of the system.
export function useSlideTime(): number {
  const reduced = useSyncExternalStore(subscribe, isReduced, () => true);
  return reduced ? 0 : slideTime;
}
