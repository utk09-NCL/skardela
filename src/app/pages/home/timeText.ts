import type { TFunction } from "i18next";

type Time = { hours: number; minutes: number };

// A unit shows only when it is not 0. When the hours are 0, the minutes show, also when they are 0.
// An empty part is removed, and a space goes between the other parts.
function joinUnits(time: Time, hours: string, minutes: string): string {
  return [time.hours > 0 ? hours : "", time.minutes > 0 || time.hours === 0 ? minutes : ""]
    .filter((part) => part !== "")
    .join(" ");
}

// The time to the next midnight on the screen, with units in short form, for example "3 h 57 min".
export function timeShort(t: TFunction, time: Time): string {
  return joinUnits(
    time,
    t(($) => $.home.hero.hoursShort, { count: time.hours }),
    t(($) => $.home.hero.minutesShort, { count: time.minutes }),
  );
}

// The same time in full words for a screen reader, for example "3 hours 57 minutes".
export function timeLong(t: TFunction, time: Time): string {
  return joinUnits(
    time,
    t(($) => $.home.hero.hours, { count: time.hours }),
    t(($) => $.home.hero.minutes, { count: time.minutes }),
  );
}
