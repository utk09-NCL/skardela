// The text of the Orbital puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";

// "miss", "misses". The misses are the score of Orbital.
const missWord = (count: number) => (count === 1 ? "miss" : "misses");

// "1 miss", "2 misses".
const missCount = (count: number) => `${count} ${missWord(count)}`;

// "1 unit", "8 units".
const unitCount = (count: number) => `${count} ${count === 1 ? "unit" : "units"}`;

// "Big" from "big", for the start of a sentence.
const capital = (word: string) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

export const orbital = {
  name: "Orbital",
  summary: "Launch the probe past the planets and into the ring.",
  // The three short rules show at all times. The other rules are under "More rules".
  rules: [
    "Set the angle and the power, then launch the probe.",
    "The planets pull the probe. A bigger planet pulls more.",
    "Get the probe into the ring. Make the fewest misses.",
  ] satisfies Rule[],
  rulesKey: [] satisfies KeyItem[],
  moreRules: {
    label: "More rules: the flight, the misses and the controls",
    rules: [
      "0° points right, 90° points up, 180° points left and 270° points down.",
      "The flight stops when the probe reaches the ring, hits a planet, goes off the board or flies for 4 s.",
      "Each launch starts from the launch point. A launch that does not reach the ring is a miss.",
      "The same angle and power always give the same path. The board keeps the paths of your earlier launches.",
      "A launch straight at the ring never gets there. Use the pull of the planets.",
      "Keyboard: the arrow keys change the angle and the power. Then press Enter or Space on Launch.",
      "Mouse and touch: drag back from the probe to aim, as with a slingshot. Let go to launch.",
      "Your score is the misses. 0 is a perfect solve.",
    ] satisfies Rule[],
  },
  // The score of a solve: the number of misses. The home page and the result card show it.
  score: missCount,
  scoreWord: missWord,
  boardLabel: "Orbital board",
  // The list of the items on the board, for a screen reader. "at" is a position, see "at" below.
  itemsLabel: "Items on the board",
  items: {
    probe: (at: string) => `Probe at ${at}.`,
    ring: (at: string) => `Ring at ${at}.`,
    planet: (size: string, at: string) => `${capital(size)} planet at ${at}.`,
  },
  // A position on the board in units, for example "x 12, y 40".
  at: (x: number, y: number) => `x ${x}, y ${y}`,
  sizes: { small: "small", medium: "medium", big: "big" },
  // The misses above the board and at the end of the status, for example "Misses: 2."
  misses: (count: number) => `Misses: ${count}.`,
  controlsLabel: "Aim and launch",
  angle: "Angle",
  power: "Power",
  // The value of the angle slider, for example "40°".
  degrees: (angle: number) => `${angle}°`,
  launch: "Launch",
  status: {
    start: "Set the angle and the power, then select Launch. Or drag back from the probe.",
    // The text at the end of a flight, for example
    // "Angle 40°, power 6. The probe hit the big planet at x 50, y 45. Closest to the ring: 8 units. Misses: 2."
    aim: (angle: number, power: number) => `Angle ${angle}°, power ${power}.`,
    ends: {
      ring: "The probe reached the ring.",
      planet: (size: string, at: string) => `The probe hit the ${size} planet at ${at}.`,
      edge: "The probe went off the board.",
      time: (seconds: number) => `The probe flew for ${seconds} s and stopped.`,
    },
    closest: (units: number) => `Closest to the ring: ${unitCount(units)}.`,
    solved: (count: number) => `You solved the puzzle with ${missCount(count)}.`,
  },
};
