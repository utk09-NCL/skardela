/// <reference types="vitest/config" />
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, type Plugin } from "vite";
import { readFileSync } from "node:fs";
// The import has the file extension, because Vite loads the config with native imports.
import { cipherText } from "./src/shared/cipher.ts";

// "words.txt" of Guzzle has each word and its clue as readable text, so contributors can easily read and check it.
// This plugin compresses and ciphers the file when Vite loads it, in the build, the dev server and the tests.
// Thus the browser gets no readable words. "src/shared/cipher.ts" tells how the cipher works.
// "enforce: pre" runs the plugin before the asset plugin of Vite, which gives only the address of a text file.
function cipherWordBank(): Plugin {
  return {
    name: "skardela:cipher-word-bank",
    enforce: "pre",
    load(id) {
      if (!id.endsWith("/guzzle/words.txt")) return null;
      const code = `export default ${JSON.stringify(cipherText(readFileSync(id, "utf8")))};`;
      // The build reads a ".txt" file as text. "moduleType" tells it that this result is JavaScript.
      return { code, moduleType: "js" };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [cipherWordBank(), react(), babel({ presets: [reactCompilerPreset()] })],
  // The worker that makes the puzzles loads the generator of a puzzle type only when it needs it.
  // Only the "es" format can split the code of a worker into such parts.
  // The build makes the worker with its own list of plugins. Without the cipher plugin there,
  // the build gives the worker the address of "words.txt" and puts the readable file in the output.
  worker: { format: "es", plugins: () => [cipherWordBank()] },
  build: {
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/u,
              priority: 20,
            },
            {
              name: "router",
              test: /node_modules[\\/]react-router[\\/]/u,
              priority: 15,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/u,
              tags: ["$initial"],
              priority: 10,
            },
          ],
        },
      },
    },
  },
  test: {
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "validate",
          environment: "node",
          include: ["tools/**/*.test.ts"],
        },
      },
    ],
  },
});
