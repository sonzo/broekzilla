# Brøkzilla

A small, single-page web app that helps kids practice fraction ("brøk") math.

## Project status

Implemented: `index.html`, `style.css`, and `js/` (fractions.js, generators.js, score.js, app.js).

## Deployment

The site's live URL is `https://broekzilla.notation.dk/`. This exact URL is baked into several SEO-related files — `index.html` (canonical link, Open Graph/Twitter meta, JSON-LD), `robots.txt`, and `sitemap.xml`. If the domain ever changes, update it in all of those places.

## Language

- UI-facing text (labels, buttons, feedback messages, instructions shown to the kid) is in **Danish**.
- Code, comments, commit messages, and all documentation (including this file) are in **English**.

## Tech constraints

- Plain HTML and JavaScript only. No JS frameworks, no build step, no bundler.
- Styling uses [Pico CSS](https://picocss.com/) (classless/minimal CSS framework) as the base, with small custom overrides only where needed. Vendor the Pico CSS file locally in the repo rather than linking a CDN, so the app still works offline.
- No backend, no server, no database. Everything runs client-side in the browser.
- No other external dependencies/CDNs unless explicitly requested — keep it self-contained so it works offline.
- Must be fully usable on both phone (touch, small screen) and PC (mouse/keyboard, larger screen) — responsive layout, touch-friendly tap targets, no hover-only interactions.
- Follow HTML/JS best practices: semantic HTML elements (`<main>`, `<fieldset>`, `<label>`, etc.) over generic `<div>` soup, proper `<label for>`/form associations for inputs, `const`/`let` (no `var`), strict equality, event listeners over inline `on*` attributes, and JS split into logical files loaded in dependency order rather than one large inline script.
- Do **not** use ES modules (`<script type="module">` / `import`/`export`). Browsers block module `import` under CORS when a page is opened directly as a `file://` path (no server), which is exactly how this app is meant to be opened (double-click `index.html`, or open it from local storage on a phone). Use plain classic `<script>` tags that share the global scope instead.

## Core features

### 1. Options screen

Before starting, the user picks which fraction math rules to practice via a multi-select dropdown (a native `<details class="dropdown">`/`<summary>` disclosure with a checkbox per item inside, per Pico CSS's built-in dropdown pattern — not a plain checkbox list, and not a native `<select multiple>`, which is poor on touch), one checkbox per assignment type plus a "select all" checkbox. Assignment types (rules):

- Addition of fractions
- Subtraction of fractions
- Multiplication of fractions
- Division of fractions
- Simplifying a fraction
- Finding a common denominator
- Comparing two fractions (<, >, =)
- Converting between mixed numbers and improper fractions
- Converting between fractions, decimals, and percentages (e.g. 1/4 → 0,25 → 25%, in a randomly chosen direction between any two of the three forms)

If **all** checkboxes are checked, assignments are drawn from **all** types, mixed together (not run as separate blocks per type). If only some are checked, only those types are used. At least one type must be selected to start. The dropdown's summary label reflects the current selection (e.g. "3 opgavetyper valgt" / "Alle opgavetyper valgt"). The "Start træning" button lives *inside* the dropdown itself (the last row, pinned to the bottom of the scrollable list) rather than below it, so the kid can tick types and start training without first having to close the dropdown to reach the button.

### 2. Assignment screen

- Shows one fraction math problem at a time, generated according to one of the selected rule types.
- Kid enters an answer (e.g. numerator/denominator input fields for fraction answers, or a simple value for comparisons).
- On submit, give immediate right/wrong feedback, then move to the next generated problem. The feedback always explains the solution steps (e.g. how a common denominator was found, or how the numerators/denominators were combined) — not just when the answer is wrong, but also when it's right, so the kid keeps seeing how to get there. Each step is shown on its own line.
- Fraction values are always displayed as real stacked fractions (numerator over denominator, visually), never as plain `num/den` text — this applies everywhere a fraction appears: problem prompts, answer feedback, and solution-step explanations alike.
- Feedback has a distinct visual structure in both outcomes: a bold title line ("Rigtigt!" in green, or "FORKERT!!!" in red — wrong-answer feedback also gets a line stating the correct answer with the value itself highlighted in green), then the solution-step explanation below in the normal body text color, never colored red or green — only the title (and, for wrong answers, the highlighted correct-answer value) carries color; the explanation always reads as neutral instructional text. Every color used here must stay legible in both light and dark color schemes (this app has no manual theme toggle — it follows the OS/browser's `prefers-color-scheme`, same as Pico CSS's own automatic light/dark theming). Note: Pico CSS sets `color` explicitly on `<p>` (among other elements), which defeats simple color inheritance — color rules for feedback text must target `.feedback-title`/`.feedback-explain` directly rather than relying on inheriting from a parent's color.
- Numbers generated should be age-appropriate (small denominators/numerators, avoid absurdly large or unsimplifiable results) — keep this tunable rather than hardcoded deep in logic.
- For the fraction/decimal/percentage conversion type, keep decimals to at most two decimal places and percentages as whole numbers, and only generate fractions that convert cleanly to one of those forms (e.g. denominators like 2, 4, 5, 10, 20, 25, 50, 100) so a kid isn't asked to produce a repeating decimal.
- The running total for this session (correct/wrong count, summed across all types) is shown live on the assignment screen itself, updating after every answer, so the kid doesn't have to leave training to see how they're doing.
- The header's "Statistik" button is hidden while training is in progress (it would otherwise sit right above the problem, competing for attention). A second "Statistik" button lives at the bottom of the assignment screen instead, alongside "Skift opgavetyper", so stats are still reachable without cluttering the top of the screen.
- "Skift opgavetyper" doesn't just return to the options screen — it clears every checked assignment type (including "select all") and re-opens the type dropdown, so the kid lands straight in a fresh, empty selection ready to pick new types, rather than having to first notice and clear out the old ones.

### 3. Score tracking

- Track correct vs. wrong counts **per assignment type**, plus an overall total.
- Two separate score scopes, both shown to the kid/parent:
  - **This session**: resets to zero each time the page/session starts fresh; lives in memory only.
  - **Overall**: cumulative across all sessions, persisted in `localStorage` so it survives page reloads and browser restarts.
- Both scopes are broken down per assignment type, not just an aggregate.
- For each scope, the summed correct/wrong totals (across all types) are shown in their own small table, visually distinct from — and with noticeably larger numbers than — the per-type breakdown table below it, so the headline numbers are the first thing that stands out.
- Every correct/wrong number shown anywhere in the stats (both the totals tables and the per-type breakdown) is colored green for correct and red for wrong, using the same color scheme as the rest of the site (the same `--pico-ins-color`/`--pico-del-color` pair the assignment feedback uses), so the color meaning stays consistent across the whole app.
- The statistics are not a separate screen to navigate to — they expand inline, appearing *below* whichever screen is currently showing (options or assignment), rather than replacing it. A "Statistik" toggle button does this: in the header when on the options screen, and — per the point above — a second copy at the bottom of the assignment screen while training. Clicking it expands the stats section below the current content and relabels the button "Skjul statistik"; clicking again collapses it back. Switching between the options and assignment screens (starting training, or "Skift opgavetyper") collapses stats automatically, so it doesn't linger stale across an unrelated screen change. While expanded, the header button goes full-width so it reads as an obvious, prominent way to collapse it again.

## Conventions for this codebase

- Keep it simple: this is a small app for kids, not a platform. Avoid premature abstraction (e.g. don't build a generic "plugin system" for assignment types unless the app actually grows to need it — a straightforward set of generator functions keyed by type is enough).
- Keep problem-generation logic separate from UI/DOM logic so new fraction rule types can be added without touching rendering code.
- Prefer clear, large, touch-friendly UI elements (buttons, inputs) given the target audience is kids on phones and PCs.
- No comments explaining *what* code does — only where a non-obvious math or UX decision needs explaining (e.g. why a denominator range is capped).
