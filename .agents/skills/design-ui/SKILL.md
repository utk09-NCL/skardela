---
name: design-ui
description: Design and build a change to the look or the layout of Skardela with the design tokens, modern CSS and accessibility rules of the project. Checks the result in a browser, in the light and the dark theme and at phone width. Use when the task changes colours, space, type, layout, animation or a component.
argument-hint: "[task]"
---

# Design the UI

Arguments: $ARGUMENTS

Skardela looks like warm paper with dark ink and orange. It uses the fonts Funnel Display and Ubuntu Sans Mono. A change must look like the rest of the app in the light and the dark theme, on a phone and on a computer.

## Step 1: Understand the request

1. Write what changes, on which page, and the problem of the player that it solves.
2. If the look is not clear, ask the author for a screenshot, a sketch or an example. You can also show 2 or 3 options as small text drawings, with your recommendation.

## Step 2: See the current page

1. If the dev server does not run, run `npm run dev` in the background. Read the URL from its output.
2. Open the page in the browser. Take screenshots at 1280 × 800 and at 320 × 640, in the light and in the dark theme. Keep them for step 6.
3. If you have no browser tools, ask the author for screenshots.

## Step 3: Read the design system

- `src/index.css`: the tokens for colour, radius, shadow, font and space. Each colour token has a light value and a dark value.
- `src/shared/Board.module.css`: the board, the squares, the status box and the buttons.
- The `.module.css` file of the component, and the file of a similar component.
- `.claude/skills/modern-css/SKILL.md`: the CSS to use in place of JavaScript, and the browser support rule.

## Step 4: Plan

Write a short plan: the files, the tokens and the components that you use, and the changes at phone width. If the change is large, or if it changes the layout of a page, show the plan to the author. Wait for the approval.

## Step 5: Build

Obey these rules:

- Use the tokens in `src/index.css`. Do not write a new colour value in a component file. Add a new colour as a token in `src/index.css`, with `light-dark()` and a comment that gives its contrast.
- Text has a contrast of 4.5:1 or more on its background. Large text, icons and the edges of controls have 3:1 or more.
- Each control shows a clear focus ring with `:focus-visible`. Use `--ring` on a board and `--accent` on a page, as the current code does.
- Make each touch target 44 × 44 px or more when there is space. It must never be smaller than 24 × 24 px.
- The page has no horizontal scroll at 320 px width.
- Use `rem` for type. Use `clamp()` for type that changes with the screen size. The text must fit at 200% zoom.
- Keep each animation short: 200 ms or less for feedback. `src/index.css` stops the CSS animations when "reduce motion" is on. A JavaScript animation must obey "reduce motion" too: use `useReducedMotion` in `src/shared/useReducedMotion.ts`, as `tilt/motion.ts` does.
- Show a state with a `data-*` or an `aria-*` attribute, and give it a style in CSS. Then a unit test can check the attribute.
- Do not use colour as the only signal. Add a symbol, a shape or a text.
- Put text in `src/text/en/` and emoji symbols in `src/text/symbols.ts`.

## Step 6: Check

1. Run `npm run fix && npm run check`.
2. Start the `ui-checker` agent. Give it the URL, the changed pages, what changed and what the author expects.
3. Fix each "Fail". Then start the `ui-checker` agent again.
4. Show the author the screenshots from step 2 and the new screenshots. Ask if the result is correct.

## Step 7: Review

1. Start the `code-reviewer` agent. Tell it the request and the plan.
2. Fix each "Must fix" finding. Ask the author about the other findings. After each fix, run the checks again.
3. Tell the author what changed and the result of each check. Then tell the author that `/open-pr` can commit the change and open a pull request.
