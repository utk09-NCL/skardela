import { useState, type PointerEvent } from "react";
import { boardSize, type Point } from "./puzzle";
import { aimOfDrag, canStartDrag, type Aim } from "./rules-check";
import type { Game } from "./useGame";

// The drag of the Orbital board: a drag back from the probe aims it, as a slingshot. See "## Controls" in "rules.md".
// The rules of the drag are in "rules-check.ts". This file connects them to the pointer events.

// The box of the board on the screen, in px.
type Box = Pick<DOMRect, "left" | "top" | "width" | "height">;

// The point on the board, in units, of a pointer at "clientX" and "clientY" px. The y of the board goes up,
// and the y of the screen goes down. A pointer off the board gives a point off the board.
export function pointOnBoard(clientX: number, clientY: number, box: Box): Point {
  return {
    x: ((clientX - box.left) / box.width) * boardSize,
    y: boardSize - ((clientY - box.top) / box.height) * boardSize,
  };
}

function pointOf(event: PointerEvent<SVGSVGElement>): Point {
  return pointOnBoard(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
}

// The drag that occurs now: the pointer of the drag, and the aim of the drag. "aim" is "null" for the power 0.
type Drag = { readonly pointerId: number; readonly aim: Aim | null };

// The drag state and the pointer handlers of the board.
// "aim" is the aim that the arrow and the sliders show: the aim of the drag during a drag, and the aim of the game
// in each other case. Thus a drag with the power 0, a cancelled drag and the end of a drag show the sliders
// with their values from before the drag.
export function useDrag(game: Game) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const { launch } = game.board;
  return {
    // Rule question: what do the arrow and the sliders show during a drag with the power 0?
    // This code shows the values from before the drag, as after the release of such a drag.
    aim: drag?.aim ?? game.aim,
    isDragging: drag !== null,
    handlers: {
      // A drag starts only near the launch point, and only when the player can launch.
      // The pointer capture keeps the drag when the pointer goes off the board.
      onPointerDown: (event: PointerEvent<SVGSVGElement>) => {
        if (drag !== null || !game.canLaunch || event.button !== 0) return;
        const point = pointOf(event);
        if (!canStartDrag(launch, point)) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDrag({ pointerId: event.pointerId, aim: aimOfDrag(launch, point) });
      },
      onPointerMove: (event: PointerEvent<SVGSVGElement>) => {
        if (drag?.pointerId !== event.pointerId) return;
        setDrag({ pointerId: event.pointerId, aim: aimOfDrag(launch, pointOf(event)) });
      },
      // The release launches with the aim of the release point. A release with the power 0 does nothing.
      onPointerUp: (event: PointerEvent<SVGSVGElement>) => {
        if (drag?.pointerId !== event.pointerId) return;
        setDrag(null);
        const aim = aimOfDrag(launch, pointOf(event));
        if (aim !== null) game.release(aim);
      },
      // When the browser cancels the drag, nothing occurs.
      onPointerCancel: (event: PointerEvent<SVGSVGElement>) => {
        if (drag?.pointerId === event.pointerId) setDrag(null);
      },
    },
  };
}

export type DragState = ReturnType<typeof useDrag>;
