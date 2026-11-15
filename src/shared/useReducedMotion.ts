import { useMediaQuery } from "./useMediaQuery";

// The "reduce motion" setting of the system. Most animations obey it in CSS. See "src/index.css".
// A puzzle type reads it here only when the game logic needs it, for example the time of a slide.
// When the browser cannot tell, the result is "true". Then a move shows at once.
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}
