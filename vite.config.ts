/// <reference types="vitest/config" />
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, type Plugin } from "vite";
// The import has the file extension, because Vite loads the config with native imports.
import { cipherAnswer } from "./src/shared/cipher.ts";

// The files in "puzzles/" have readable answers, so contributors can easily write and check puzzles.
// This plugin ciphers each answer when Vite loads a puzzle file, in the build, the dev server and the tests.
// Thus the browser gets no readable answers. "src/shared/cipher.ts" tells how the cipher works.
// A puzzle without an "answer" does not change. For example, a Latics puzzle has no answer, because the game
// checks the moves of the player with the rules.
// "enforce: pre" runs the plugin before the JSON plugin of Vite, so the plugin gets the JSON text.
function cipherPuzzleAnswers(): Plugin {
  return {
    name: "skardela:cipher-puzzle-answers",
    enforce: "pre",
    transform(code, id) {
      if (!/\/puzzles\/[a-z-]+\.json$/u.test(id)) return null;
      const puzzles = JSON.parse(code) as { id: string; answer?: string[] }[];
      const ciphered = puzzles.map(({ answer, ...puzzle }) =>
        answer === undefined ? puzzle : cipherAnswer({ ...puzzle, answer }),
      );
      return { code: JSON.stringify(ciphered), map: null };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [cipherPuzzleAnswers(), react(), babel({ presets: [reactCompilerPreset()] })],
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
      // The puzzle generators. They change the puzzle files, thus only the "generate:<type>" scripts run them.
      // Each script gives the file of its generator, so one script does not run the generators of other types.
      {
        extends: true,
        test: {
          name: "generate",
          environment: "node",
          include: ["tools/**/*.gen.ts"],
        },
      },
    ],
  },
});
