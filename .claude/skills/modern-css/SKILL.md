---
name: modern-css
description: Modern CSS and HTML that replace JavaScript in Skardela, with the browser support rule of the project. Use when you write or review CSS, or a React component that shows, hides, opens, moves or lays out content.
user-invocable: false
---

# Modern CSS before JavaScript

HTML and CSS can now do many jobs that needed JavaScript in the past. When they can do the job, use them. They need no state, no effect and no event handler. The browser makes them fast, and native elements get keyboard and screen reader support.

[modern-css.com](https://modern-css.com) shows the old way and the modern way of each feature, with its browser support.

## Browser support

The build target is Baseline "widely available". This is the default of Vite.

- Use a "widely available" feature.
- Use a "newly available" feature only as progressive enhancement: the page must work and be clear without it. Put it in `@supports` when a part of it can apply alone.
- Do not use a feature with "limited availability" for a thing that the player needs. A small visual improvement is permitted, for example `text-wrap: pretty`.
- Before you use a feature that is not in this file, find its Baseline status on MDN or on modern-css.com.

## Skardela uses these now

| Job                               | HTML or CSS                                                       | Example                                        |
| --------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Show a state                      | React sets a `data-*` or `aria-*` attribute. CSS gives the style. | `data-solved` in `src/shared/Board.module.css` |
| Light and dark theme              | `color-scheme` and `light-dark()` tokens                          | `src/index.css`                                |
| A darker edge colour              | `color-mix(in srgb, var(--red) 75%, #000000)`                     | `--red-edge` in `src/index.css`                |
| Size from the container           | `container-type: inline-size`, `cqi` units and `clamp()`          | `.square` in `src/shared/Board.module.css`     |
| Style when the focus is in a part | `:focus-within`                                                   | `.keyHint` in `tilt/Board.module.css`          |
| Style for a mouse only            | `@media (hover: hover) and (pointer: fine)`                       | `.keyHint` in `tilt/Board.module.css`          |
| Modal window                      | `<dialog>` with `showModal()`                                     | `src/app/AnalyticsNotice.tsx`                  |
| Open and close a part             | `<details>` and `<summary>`                                       | `home/Faq.tsx`, `puzzle/PuzzleRules.tsx`       |
| Status for a screen reader        | `<output>`                                                        | `Board.tsx` of each puzzle type                |
| Less motion                       | `@media (prefers-reduced-motion: reduce)`                         | `src/index.css`                                |
| Balanced headings                 | `text-wrap: balance`                                              | `src/index.css`                                |

## Use CSS in place of JavaScript

All features in this table are widely available.

| Old way with JavaScript                               | Modern way                                                                    |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| A class on a parent for the state of a child          | `:has()`, for example `.row:has(:focus-visible)`                              |
| `matchMedia` only to change the look                  | `@media` with `hover`, `pointer`, `prefers-reduced-motion` or `forced-colors` |
| A resize listener, or code that measures an element   | `@container`, `clamp()`, `min()` and `repeat(auto-fit, minmax(…))`            |
| A focus listener that changes a style                 | `:focus-within` and `:focus-visible`                                          |
| A focus trap and Esc key code for a modal             | `<dialog>` with `showModal()` and `::backdrop`                                |
| Code that opens and closes a section                  | `<details>` and `<summary>`                                                   |
| A height animation from a measured height             | `grid-template-rows` from `0fr` to `1fr`, with a transition                   |
| A "touched" class on a form field                     | `:user-invalid`                                                               |
| Scroll code that keeps a target below a sticky header | `scroll-margin-block-start`                                                   |
| `transform` text that code puts together              | the `translate`, `rotate` and `scale` properties                              |

## Use modern CSS in place of old CSS

All features in this table are widely available.

| Old CSS                                        | Modern CSS                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `!important`                                   | `:where()` for a low specificity, or `@layer`                    |
| `100vh` on a phone                             | `100dvh`                                                         |
| A media query with `min-width` and `max-width` | the range syntax, for example `@media (width >= 40rem)`          |
| Padding hacks for a square                     | `aspect-ratio: 1`                                                |
| `margin-left` and `margin-right`               | `margin-inline` and the other logical properties                 |
| Media queries for a font size                  | `clamp()` with `rem`, so that the text still grows with the zoom |

## Newly available: progressive enhancement only

| Feature                                                     | Use                                                      | Without it                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| `@starting-style` and `transition-behavior: allow-discrete` | An animation when a `<dialog>` opens or closes           | The dialog shows at once.                                        |
| View transitions                                            | An animation between two states of a page                | The page changes at once.                                        |
| `@property`                                                 | An animation of a custom property                        | No animation.                                                    |
| `popover` and `popovertarget`                               | A menu or a tip that closes after a click outside or Esc | The content shows in the page. Ask the author before you use it. |

Do not use these yet. Their availability is limited: `interpolate-size`, `calc-size()`, `if()`, `@function`, `display: grid-lanes`, `reading-flow` and `appearance: base-select`.

## When JavaScript is correct

- The game logic needs the value. For example, Tilt ignores a tilt during the slide. Thus `tilt/motion.ts` reads "reduce motion" in JavaScript.
- The value changes what the code does, not only the look. For example, `src/shared/share.ts` reads `(pointer: coarse)` to select the share menu or the copy.
- A screen reader must read the text, or the text comes from `src/text/en/`. Put text in the DOM, not in CSS `content`.
- The CSS feature is not available in enough browsers, and no fallback works.

## Tests

The unit tests use jsdom. jsdom does not apply CSS. Thus:

- Put each state in an attribute, for example `data-selected="true"`. Test the attribute in the unit test.
- Check the look in a real browser with the `ui-checker` agent.
