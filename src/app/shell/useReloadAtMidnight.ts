import { useEffect } from "react";
import { useRevalidator } from "react-router";
import { dayKey } from "../../shared/state/progress";

// The time between two checks of the day, in milliseconds.
const checkTime = 60_000;

// The puzzles of the day change at local midnight. React Router runs a loader only on a navigation,
// thus a page that stays open all night keeps the puzzles of yesterday. This hook runs the loaders
// of the page again when the day changes. The timer is a system outside React, thus it is in an effect.
// The hook checks the day each minute. One long timer to midnight fires late after a computer sleeps,
// because the timers stop during the sleep, but the clock does not.
export function useReloadAtMidnight(): void {
  const { revalidate } = useRevalidator();
  useEffect(() => {
    let day = dayKey(new Date());
    const timer = setInterval(() => {
      const today = dayKey(new Date());
      if (today === day) return;
      day = today;
      void revalidate();
    }, checkTime);
    return () => {
      clearInterval(timer);
    };
  }, [revalidate]);
}
