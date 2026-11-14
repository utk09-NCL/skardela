import type { KeyItem, Rule } from "../../shared/RuleList";
import { symbols } from "../symbols";

// "miss", "misses". The misses are the score of Latics.
const missWord = (count: number) => (count === 1 ? "miss" : "misses");

// "1 miss", "2 misses". A miss is a laser shot that does not hit all monsters. More than one text in this file uses it.
const missCount = (count: number) => `${count} ${missWord(count)}`;

// "a", "a and b", "a, b and c".
const listOf = (items: readonly string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

// The colour of a beam in words. A white beam is only "beam", so a board with one white laser reads as before.
const beamName = (colour: "white" | "red" | "blue") =>
  colour === "white" ? "beam" : `${colour} beam`;

const { red, blue } = symbols.latics.colours;

// The red circle and the blue square in the rules show in their colours. See "RuleList".
const redMark = { symbol: red, colour: "red" } as const;
const blueMark = { symbol: blue, colour: "blue" } as const;

// The text of the Latics puzzle type.
export const latics = {
  name: "Latics",
  summary: "Turn the mirrors and send the laser beam to the monster.",
  // The three short rules show at all times. The rules key shows the materials: water, prisms and filters.
  // The other rules are under "More rules". It is open only on the first visit.
  rules: [
    `Hit each monster ${symbols.latics.monster} with a laser beam.`,
    "Select a mirror to turn it. Walls stop the beam.",
    "Medium and hard: plan the path, then fire the laser. Each miss counts.",
  ] satisfies Rule[],
  rulesKey: [
    { text: "water bends the beam", sample: { fill: "water", symbol: "" } },
    {
      text: "a prism splits white light",
      sample: { fill: "empty", symbol: symbols.latics.prism },
    },
    { text: "a filter lets only its colour through", sample: { fill: "red", symbol: red } },
  ] satisfies KeyItem[],
  moreRules: {
    label: "More rules: the tray, the lasers, water, prisms and filters",
    rules: [
      "The beam goes in a straight line: across, up and down, or diagonally.",
      "A mirror turns the beam. The angle in is the same as the angle out. A beam that goes along a mirror does not change.",
      "The beam also stops when it goes off the board or back into a laser.",
      "Each select turns a mirror 45° clockwise.",
      "Easy: the beam shows at all times.",
      "Medium and hard: a shot that does not hit all monsters is a miss. Make the fewest misses.",
      "Medium and hard: select an empty square to put a mirror from the tray there. A tray mirror goes back to the tray after four turns. You cannot put a tray mirror on water.",
      "Hard: select a laser to turn it 45° clockwise.",
      "Water: a diagonal beam that goes into water turns straight, square to the edge of the water. When it leaves the water, it turns back to its first direction. A straight beam does not change.",
      "Critical angle: a diagonal beam from a laser in water cannot get out. At the edge of the water, it reflects back in.",
      "Prism: red light turns 45° to the right, and blue light turns 45° to the left. Thus a white beam splits into a red beam and a blue beam.",
      {
        parts: [
          "Filter: a red filter ",
          redMark,
          " lets only red light through, and a blue filter ",
          blueMark,
          " lets only blue light through. A white beam goes through and gets the colour of the filter.",
        ],
      },
      {
        parts: [
          "A red monster ",
          redMark,
          " needs a red beam, and a blue monster ",
          blueMark,
          ` needs a blue beam. The monster ${symbols.latics.monster} with no colour needs a beam of any colour.`,
        ],
      },
      '"Path of the beam" under the board tells the path of the beam in words.',
    ] satisfies Rule[],
  },
  // The score of a solve: the number of misses. The home page and the result card show it.
  score: missCount,
  scoreWord: missWord,
  boardLabel: "Latics board",
  symbols: symbols.latics,
  // The direction of the beam in words. "The beam goes up and right 3 squares."
  directions: {
    E: "right",
    NE: "up and right",
    N: "up",
    NW: "up and left",
    W: "left",
    SW: "down and left",
    S: "down",
    SE: "down and right",
  },
  colours: { white: "white", red: "red", blue: "blue" },
  pieces: {
    ".": "empty",
    "#": "wall",
    L: "laser",
    M: "monster",
    R: "red monster",
    B: "blue monster",
    "^": "prism",
    r: "red filter",
    b: "blue filter",
    "-": "horizontal mirror",
    "/": "mirror from bottom left to top right",
    "|": "vertical mirror",
    "\\": "mirror from top left to bottom right",
  },
  // The name of a laser. A white laser is only "laser".
  laserName: (colour: "white" | "red" | "blue") =>
    colour === "white" ? "laser" : `${colour} laser`,
  square: (square: {
    row: number;
    column: number;
    piece: string;
    laser: string;
    isFromTray: boolean;
    isHit: boolean;
    isInWater: boolean;
  }) =>
    [
      `Row ${square.row}, column ${square.column}`,
      square.isFromTray ? `${square.piece} from the tray` : square.piece,
      square.laser === "" ? "" : `points ${square.laser}`,
      square.isInWater ? "in water" : "",
      square.isHit ? "hit" : "",
    ]
      .filter((part) => part !== "")
      .join(", "),
  controlsLabel: "Laser controls",
  tray: (count: number) => `Mirrors in the tray: ${count}`,
  fire: "Fire the laser",
  misses: missCount,
  pathLabel: "Path of the beam",
  path: {
    // The start of a part of the beam, when the beam has more than one part, for example
    // "The red beam starts at the prism at row 3, column 3."
    start: (colour: "white" | "red" | "blue", from: string, at: string) =>
      `The ${beamName(colour)} starts at the ${from} at ${at}.`,
    move: (direction: string, squares: number, colour: "white" | "red" | "blue" = "white") =>
      `The ${beamName(colour)} goes ${direction} ${squares} ${squares === 1 ? "square" : "squares"}.`,
    // Each reason for a turn. "at" is the square, for example "row 2, column 5".
    turns: {
      mirror: (at: string, direction: string) => `The mirror at ${at} turns it ${direction}.`,
      prism: (at: string, direction: string) => `The prism at ${at} turns it ${direction}.`,
      waterIn: (at: string, direction: string) => `The water at ${at} turns it ${direction}.`,
      waterOut: (at: string, direction: string) =>
        `It leaves the water after ${at} and turns ${direction}.`,
      edge: (at: string, direction: string) =>
        `The edge of the water at ${at} reflects it ${direction}.`,
    },
  },
  // The end of a part of the beam. "at" is the last square of the part, for example "row 2, column 5".
  ends: {
    monster: () => "The beam hits the monster.",
    otherMonster: (at: string) =>
      `The monster at ${at} needs a beam of a different colour. It stops the beam.`,
    wall: (at: string) => `A wall at ${at} stops the beam.`,
    laser: (at: string) => `A laser at ${at} stops the beam.`,
    edge: (at: string) => `The beam goes off the board after ${at}.`,
    loop: () => "The beam goes around in a loop.",
    join: () => "From here, the beam goes along the path of a different beam.",
    filter: (at: string) => `The filter at ${at} has a different colour. It stops the beam.`,
    split: (at: string) => `The prism at ${at} splits the beam into a red beam and a blue beam.`,
    colour: (at: string) => `The filter at ${at} lets only light of its colour through.`,
  },
  at: (row: number, column: number) => `row ${row}, column ${column}`,
  status: {
    plan: (can: { tray: boolean; aim: boolean }) =>
      `Plan the path: ${listOf([
        "turn the mirrors",
        ...(can.tray ? ["put mirrors from the tray on empty squares"] : []),
        ...(can.aim ? ["turn the lasers"] : []),
      ])}. Then fire the laser.`,
    // On a board with more than one monster, or with a beam that splits, the status tells the number of hits.
    hits: (hit: number, total: number) =>
      `The beams hit ${hit} of ${total} ${total === 1 ? "monster" : "monsters"}.`,
    solved: "You solved the puzzle. The beam hits the monster.",
    solvedAll: "You solved the puzzle. The beams hit all monsters.",
    solvedWithMisses: (count: number) => `You solved the puzzle with ${missCount(count)}.`,
  },
};
