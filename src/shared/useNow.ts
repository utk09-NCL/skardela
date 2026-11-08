import { useEffect, useState } from "react";
import { dayKey } from "./state/progress";

// The time now, in milliseconds. It changes each "intervalMs" while "isRunning" is true.
// A render must not read the clock, thus a component that shows a time uses this hook.
export function useNow(intervalMs: number, isRunning = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [intervalMs, isRunning]);
  return now;
}

// Today as a day key, for example "2026-11-07". It changes in the first minute after midnight.
// The streak, the stats and the share text use it.
export function useToday(): string {
  return dayKey(new Date(useNow(60_000)));
}
