import { useReducedMotion } from "../../../shared/useReducedMotion";

// The slide of the balls after a tilt. See "## Motion" in "rules.md":
// "After a tilt, the balls slide to their new squares in 180 ms."

// The time of the slide, in milliseconds. The CSS uses the same time. See "Grid.tsx".
export const slideTime = 180;

// The time of the slide now: "slideTime", or 0 when "reduce motion" is on.
// It changes when the player changes the setting of the system.
export function useSlideTime(): number {
  return useReducedMotion() ? 0 : slideTime;
}
