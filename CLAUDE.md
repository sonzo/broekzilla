# Brøkzilla

A small, single-page web app that helps kids practice fraction ("brøk") math.

## Project status

Greenfield — no code written yet. This file is the spec to build against.

## Language

- UI-facing text (labels, buttons, feedback messages, instructions shown to the kid) is in **Danish**.
- Code, comments, commit messages, and all documentation (including this file) are in **English**.

## Tech constraints

- Plain HTML and JavaScript only. No JS frameworks, no build step, no bundler.
- Styling uses [Pico CSS](https://picocss.com/) (classless/minimal CSS framework) as the base, with small custom overrides only where needed. Vendor the Pico CSS file locally in the repo rather than linking a CDN, so the app still works offline.
- No backend, no server, no database. Everything runs client-side in the browser.
- No other external dependencies/CDNs unless explicitly requested — keep it self-contained so it works offline.
- Must be fully usable on both phone (touch, small screen) and PC (mouse/keyboard, larger screen) — responsive layout, touch-friendly tap targets, no hover-only interactions.
- Follow HTML/JS best practices: semantic HTML elements (`<main>`, `<fieldset>`, `<label>`, etc.) over generic `<div>` soup, proper `<label for>`/form associations for inputs, `const`/`let` (no `var`), strict equality, event listeners over inline `on*` attributes, and JS split into logical modules (e.g. via `<script type="module">`) rather than one large inline script.

## Core features

### 1. Options screen

Before starting, the user picks which fraction math rules to practice via checkboxes, one per assignment type. Assignment types (rules):

- Addition of fractions
- Subtraction of fractions
- Multiplication of fractions
- Division of fractions
- Simplifying a fraction
- Finding a common denominator
- Comparing two fractions (<, >, =)
- Converting between mixed numbers and improper fractions

If **all** checkboxes are checked, assignments are drawn from **all** types, mixed together (not run as separate blocks per type). If only some are checked, only those types are used. At least one type must be selected to start.

### 2. Assignment screen

- Shows one fraction math problem at a time, generated according to one of the selected rule types.
- Kid enters an answer (e.g. numerator/denominator input fields for fraction answers, or a simple value for comparisons).
- On submit, give immediate right/wrong feedback, then move to the next generated problem.
- Numbers generated should be age-appropriate (small denominators/numerators, avoid absurdly large or unsimplifiable results) — keep this tunable rather than hardcoded deep in logic.

### 3. Score tracking

- Track correct vs. wrong counts **per assignment type**, plus an overall total.
- Two separate score scopes, both shown to the kid/parent:
  - **This session**: resets to zero each time the page/session starts fresh; lives in memory only.
  - **Overall**: cumulative across all sessions, persisted in `localStorage` so it survives page reloads and browser restarts.
- Both scopes are broken down per assignment type, not just an aggregate.

## Conventions for this codebase

- Keep it simple: this is a small app for kids, not a platform. Avoid premature abstraction (e.g. don't build a generic "plugin system" for assignment types unless the app actually grows to need it — a straightforward set of generator functions keyed by type is enough).
- Keep problem-generation logic separate from UI/DOM logic so new fraction rule types can be added without touching rendering code.
- Prefer clear, large, touch-friendly UI elements (buttons, inputs) given the target audience is kids on phones and PCs.
- No comments explaining *what* code does — only where a non-obvious math or UX decision needs explaining (e.g. why a denominator range is capped).
