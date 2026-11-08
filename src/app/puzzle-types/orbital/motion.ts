import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { stepsPerSecond, type Flight } from "./rules-check";

// The flight of the probe on the screen. See "## Motion" in "rules.md":
// "After a launch, the probe flies along its path in real time. 1 s of game time shows in 1 s."
// "When "reduce motion" is on, the full path shows at once, with no flight."

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

// "true" when the full path shows at once: "reduce motion" is on, or the browser cannot tell.
function isReduced(): boolean {
  return motionQuery()?.matches ?? true;
}

// "true" when the flight shows at once, with no animation. It changes when the player changes the setting
// of the system.
export function useInstantFlight(): boolean {
  return useSyncExternalStore(subscribe, isReduced, () => true);
}

// The step of the flight that the screen shows now: the index of a point of "path".
// The animation frames of the browser move it in real time. At the last step, it calls "onEnd" one time.
// It is 0 when no flight occurs.
export function useFlightStep(flying: Flight | null, onEnd: () => void): number {
  const [shown, setShown] = useState<{ flight: Flight | null; step: number }>({
    flight: null,
    step: 0,
  });
  const end = useEffectEvent(onEnd);
  useEffect(() => {
    if (flying === null) return;
    const last = flying.path.length - 1;
    // The time of the first frame is the start of the flight.
    let start: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      // React Compiler cannot compile "??=", thus this code uses "if".
      if (start === null) start = now;
      const step = Math.min(last, Math.floor(((now - start) * stepsPerSecond) / 1000));
      setShown({ flight: flying, step });
      if (step === last) {
        end();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [flying]);
  // The step of an earlier flight does not apply to a new flight.
  return shown.flight === flying ? shown.step : 0;
}
