import type { KeyItem, Rule } from "../../shared/RuleList";
import { marks, samples } from "../samples";
import { symbols } from "../symbols";

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
    { text: "water bends the beam", sample: samples.latics.water },
    { text: "a prism splits white light", sample: samples.latics.prism },
    { text: "a filter lets only its colour through", sample: samples.latics.filter },
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
          marks.red,
          " lets only red light through, and a blue filter ",
          marks.blue,
          " lets only blue light through. A white beam goes through and gets the colour of the filter.",
        ],
      },
      {
        parts: [
          "A red monster ",
          marks.red,
          " needs a red beam, and a blue monster ",
          marks.blue,
          ` needs a blue beam. The monster ${symbols.latics.monster} with no colour needs a beam of any colour.`,
        ],
      },
      '"Path of the beam" under the board tells the path of the beam in words.',
    ] satisfies Rule[],
  },
  // The score of a solve: the number of misses. A miss is a laser shot that does not hit all monsters.
  // The home page, the board and the result card show it.
  score_one: "{{count}} miss",
  score_other: "{{count}} misses",
  scoreWord_one: "miss",
  scoreWord_other: "misses",
  boardLabel: "Latics board",
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
  // The name of each square of the board. An empty square is "." in the puzzle data.
  // A "." cannot be a key, thus its key is "empty".
  pieces: {
    empty: "empty",
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
  // The name of a laser and of a beam of each colour. A white laser is only "laser", and a white beam is only "beam".
  lasers: { white: "laser", red: "red laser", blue: "blue laser" },
  beams: { white: "beam", red: "red beam", blue: "blue beam" },
  // The parts of the label of a square, for example "Row 2, column 3, laser, points up, hit".
  // The code puts the parts together with ", " between them.
  square: {
    position: "Row {{row}}, column {{column}}",
    fromTray: "{{piece}} from the tray",
    points: "points {{direction}}",
    inWater: "in water",
    hit: "hit",
  },
  controlsLabel: "Laser controls",
  tray: "Mirrors in the tray: {{count}}",
  fire: "Fire the laser",
  pathLabel: "Path of the beam",
  path: {
    // The start of a part of the beam, when the beam has more than one part, for example
    // "The red beam starts at the prism at row 3, column 3."
    start: "The {{beam}} starts at the {{from}} at {{at}}.",
    move_one: "The {{beam}} goes {{direction}} {{count}} square.",
    move_other: "The {{beam}} goes {{direction}} {{count}} squares.",
    // Each reason for a turn. "at" is the square, for example "row 2, column 5".
    turns: {
      mirror: "The mirror at {{at}} turns it {{direction}}.",
      prism: "The prism at {{at}} turns it {{direction}}.",
      waterIn: "The water at {{at}} turns it {{direction}}.",
      waterOut: "It leaves the water after {{at}} and turns {{direction}}.",
      edge: "The edge of the water at {{at}} reflects it {{direction}}.",
    },
  },
  // The end of a part of the beam. "at" is the last square of the part, for example "row 2, column 5".
  ends: {
    monster: "The beam hits the monster.",
    otherMonster: "The monster at {{at}} needs a beam of a different colour. It stops the beam.",
    wall: "A wall at {{at}} stops the beam.",
    laser: "The beam comes back to the laser.",
    edge: "The beam goes off the board after {{at}}.",
    loop: "The beam goes around in a loop.",
    join: "From here, the beam goes along the path of a different beam.",
    filter: "The filter at {{at}} has a different colour. It stops the beam.",
    split: "The prism at {{at}} splits the beam into a red beam and a blue beam.",
    colour: "The filter at {{at}} lets only light of its colour through.",
  },
  at: "row {{row}}, column {{column}}",
  status: {
    // "actions" is a list of "planActions", for example "turn the mirrors and turn the lasers".
    plan: "Plan the path: {{actions, andList}}. Then fire the laser.",
    planActions: {
      mirrors: "turn the mirrors",
      tray: "put mirrors from the tray on empty squares",
      aim: "turn the lasers",
    },
    // On a board with more than one monster, or with a beam that splits, the status tells the number of hits.
    // "count" is the number of monsters.
    hits_one: "The beams hit {{hit}} of {{count}} monster.",
    hits_other: "The beams hit {{hit}} of {{count}} monsters.",
    solved: "You solved the puzzle. The beam hits the monster.",
    solvedAll: "You solved the puzzle. The beams hit all monsters.",
    // "misses" is the score, for example "2 misses".
    solvedWithMisses: "You solved the puzzle with {{misses}}.",
  },
};
