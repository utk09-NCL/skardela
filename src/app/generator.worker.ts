import type { GeneratorReply, GeneratorRequest } from "./generator";
import { makePuzzle } from "./puzzle-types/registry";

// The worker of "generator.ts". It makes one puzzle for each request, and sends it through the port of the request.
self.addEventListener("message", (event: MessageEvent<GeneratorRequest>) => {
  const { type, level, number } = event.data;
  const [port] = event.ports;
  const reply = (message: GeneratorReply) => {
    port?.postMessage(message);
  };
  makePuzzle(type, level, number).then(
    (puzzle) => {
      reply({ puzzle });
    },
    (error: unknown) => {
      reply({ error: error instanceof Error ? error.message : String(error) });
    },
  );
});
