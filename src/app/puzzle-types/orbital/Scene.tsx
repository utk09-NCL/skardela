import { text } from "../../../text/en";
import styles from "./Board.module.css";
import type { DragState } from "./input";
import { useFlightStep } from "./motion";
import { boardSize, sizeRules, type Point } from "./puzzle";
import { dragStartDistance, type Aim, type Board } from "./rules-check";
import { itemTexts } from "./status";
import type { Game } from "./useGame";

const words = text.orbital;

// The sizes of the drawings, in units. The rules use only the centre of the probe.
// Half the width of the probe diamond.
const probeSize = 1.8;
// The arrow grows by this length for each power. The head of the arrow has this length too.
const arrowPerPower = 2.5;
const arrowHead = 2.5;

// The points of a polyline or a polygon, for example "30,10 31.2,12.5".
function pointsText(points: readonly Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

// The probe is a small diamond. See "## Board" in "rules.md".
function Probe({ at }: { at: Point }) {
  const corners = [
    { x: at.x, y: at.y + probeSize },
    { x: at.x + probeSize, y: at.y },
    { x: at.x, y: at.y - probeSize },
    { x: at.x - probeSize, y: at.y },
  ];
  return <polygon className={styles.probe} points={pointsText(corners)} />;
}

// The arrow from the probe. Its direction is the angle, and its length shows the power.
function Arrow({ from, aim }: { from: Point; aim: Aim }) {
  const radians = (aim.angle * Math.PI) / 180;
  const length = probeSize + aim.power * arrowPerPower;
  const tip = { x: from.x + Math.cos(radians) * length, y: from.y + Math.sin(radians) * length };
  // A corner of the head: back from the tip, a little to one side.
  const corner = (turn: number) => ({
    x: tip.x - Math.cos(radians + turn) * arrowHead,
    y: tip.y - Math.sin(radians + turn) * arrowHead,
  });
  return (
    <g className={styles.arrow} data-angle={aim.angle} data-power={aim.power}>
      <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} />
      <polygon points={pointsText([tip, corner(0.45), corner(-0.45)])} />
    </g>
  );
}

// The ring is a thick circle outline. Each planet is a full circle with the radius of its size.
function Targets({ board }: { board: Board }) {
  return (
    <>
      <circle className={styles.ring} cx={board.ring.x} cy={board.ring.y} r={board.ringRadius} />
      {board.planets.map((planet, index) => (
        <circle
          // oxlint-disable-next-line react/no-array-index-key -- the planets never move.
          key={index}
          className={styles.planet}
          data-size={planet.size}
          cx={planet.x}
          cy={planet.y}
          r={sizeRules[planet.size].radius}
        />
      ))}
    </>
  );
}

// The list of the items on the board, for a screen reader. See "## Screen reader" in "rules.md".
function ItemList({ game }: { game: Game }) {
  return (
    <ul aria-label={words.itemsLabel} className="visually-hidden">
      {itemTexts(game.board, game.probe).map((item, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the items never move in the list.
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// The drawing of the board: the paths of the earlier launches, the ring, the planets, the flight in the air,
// the arrow and the probe. A screen reader does not read the drawing. The list of the items gives the same
// information, and the status tells each flight. A drag on the drawing aims the probe. See "input.ts".
// During a flight, the probe moves along its path. The animation sends "land" at the end. See "motion.ts".
export function Scene({ game, drag }: { game: Game; drag: DragState }) {
  const { board, flying } = game;
  const step = useFlightStep(flying, game.land);
  const probe = flying === null ? game.probe : (flying.path[step] ?? board.launch);
  return (
    <figure className={styles.board} aria-label={words.boardLabel}>
      <svg
        className={styles.scene}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        data-dragging={drag.isDragging}
        aria-hidden="true"
        {...drag.handlers}
      >
        {/* The y of the board goes up, and the y of the SVG goes down. This group turns the y of the drawing. */}
        <g transform={`matrix(1 0 0 -1 0 ${boardSize})`}>
          {game.flights.map((flight, index) => (
            <polyline
              // oxlint-disable-next-line react/no-array-index-key -- a flight never moves in the list.
              key={index}
              className={styles.path}
              data-path="earlier"
              points={pointsText(flight.path)}
            />
          ))}
          <Targets board={board} />
          {flying !== null && (
            <polyline
              className={styles.path}
              data-path="current"
              points={pointsText(flying.path.slice(0, step + 1))}
            />
          )}
          {/* The grip shows where a drag can start. The arrow shows the aim. Both show only before a launch. */}
          {game.canLaunch && (
            <circle
              className={styles.grip}
              cx={board.launch.x}
              cy={board.launch.y}
              r={dragStartDistance}
            />
          )}
          {game.canLaunch && <Arrow from={board.launch} aim={drag.aim} />}
          <Probe at={probe} />
        </g>
      </svg>
      <ItemList game={game} />
    </figure>
  );
}
