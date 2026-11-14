# Skardela - Puzzle WebApp

Skardela is a website of free daily puzzles. Each day, each puzzle type has an easy, a medium and a hard puzzle.
All players get the same puzzles on the same date. The puzzles change at midnight, local time.

The site has no server, no accounts and no database. All code runs in the browser. The browser saves the stats
of the player. The player can export and import them.

## Puzzle types

Each puzzle type has its rules in `rules.md` in its folder.

| Puzzle type   | Rules                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------ |
| Colour Binary | [src/app/puzzle-types/colour-binary/rules.md](src/app/puzzle-types/colour-binary/rules.md) |
| Guzzle        | [src/app/puzzle-types/guzzle/rules.md](src/app/puzzle-types/guzzle/rules.md)               |
| Latics        | [src/app/puzzle-types/latics/rules.md](src/app/puzzle-types/latics/rules.md)               |
| Numpuz        | [src/app/puzzle-types/numpuz/rules.md](src/app/puzzle-types/numpuz/rules.md)               |
| Orbital       | [src/app/puzzle-types/orbital/rules.md](src/app/puzzle-types/orbital/rules.md)             |
| Tilt          | [src/app/puzzle-types/tilt/rules.md](src/app/puzzle-types/tilt/rules.md)                   |

The puzzles are in `puzzles/`, one JSON file for each puzzle type. Each puzzle has the license CC-BY-4.0.

## How to run

1. Use the Node.js version in `.nvmrc`.
2. Clone the repository and go into the project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5173` in your browser.

## Checks

Run `npm run fix && npm run check` before you open a pull request. CI runs the same checks: format, lint, types,
build, unit tests and the puzzle data. "Scripts" in [CONTRIBUTING.md](CONTRIBUTING.md) tells each script.

## Contributing

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before you make a change. It tells the project structure and how to add
  a puzzle type.
- AI agents must also read [AGENTS.md](AGENTS.md). The workflows for AI agents are in `.claude/skills/` and
  `.agents/skills/`.

## Tech

React, TypeScript and Vite. Zustand keeps the saved data. Vitest and Testing Library run the tests. oxlint and
oxfmt check the code.

## Live Site

[skardela.netlify.app](https://skardela.netlify.app/)
