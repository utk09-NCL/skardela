// The text of the Orbital puzzle type.
import type { KeyItem, Rule } from "../../shared/RuleList";

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
  score_one: "{{count}} miss",
  score_other: "{{count}} misses",
  scoreWord_one: "miss",
  scoreWord_other: "misses",
  boardLabel: "Orbital board",
  // The list of the items on the board, for a screen reader. "at" is a position, see "at" below.
  itemsLabel: "Items on the board",
  items: {
    probe: "Probe at {{at}}.",
    ring: "Ring at {{at}}.",
    planets: {
      small: "Small planet at {{at}}.",
      medium: "Medium planet at {{at}}.",
      big: "Big planet at {{at}}.",
    },
  },
  // A position on the board in units, for example "x 12, y 40".
  at: "x {{x}}, y {{y}}",
  sizes: { small: "small", medium: "medium", big: "big" },
  // The misses above the board and at the end of the status, for example "Misses: 2."
  misses: "Misses: {{count}}.",
  controlsLabel: "Aim and launch",
  angle: "Angle",
  power: "Power",
  // The value of the angle slider, for example "40°".
  degrees: "{{angle}}°",
  launch: "Launch",
  status: {
    start: "Set the angle and the power, then select Launch. Or drag back from the probe.",
    // The text at the end of a flight, for example
    // "Angle 40°, power 6. The probe hit the big planet at x 50, y 45. Closest to the ring: 8 units. Misses: 2."
    aim: "Angle {{angle}}°, power {{power}}.",
    ends: {
      ring: "The probe reached the ring.",
      planet: "The probe hit the {{size}} planet at {{at}}.",
      edge: "The probe went off the board.",
      time: "The probe flew for {{seconds}} s and stopped.",
    },
    closest_one: "Closest to the ring: {{count}} unit.",
    closest_other: "Closest to the ring: {{count}} units.",
    // "misses" is the score, for example "2 misses".
    solved: "You solved the puzzle with {{misses}}.",
  },
};
