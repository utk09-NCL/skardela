import { configure, getLogger as createLogger } from "@utk09/ui-observability";

// Keep one local export so callers use this module for setup and logger access.
export const getLogger = createLogger;

// The type of a logger, for a function that gets a logger as a parameter.
export type Log = ReturnType<typeof getLogger>;

const isTest = import.meta.env.MODE === "test";
const level = isTest ? "WARN" : import.meta.env.DEV ? "DEBUG" : "WARN";

configure({
  endpoint: null,
  serviceName: "skardela",
  storage: "none",
  identity: "memory",
  bus: { mode: "off" },
  minLevel: level,
  // Use the object form so level and styles can change independently in later configure calls.
  console: { level },
  // The library sends nothing ("endpoint: null"), thus a captured uncaught error goes only to the console.
  // The browser already prints each uncaught error, so the capture prints it a second time.
  // With the capture off, the library also does not load its error capture code.
  capture: { errors: false, rejections: false },
});
