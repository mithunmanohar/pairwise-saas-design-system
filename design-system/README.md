# Pairwise design system

Pairwise is a design system for agentic coding tools: products where developers start, watch, review and approve AI coding agents working on their repositories. It covers sessions, runs, tool calls, file diffs, test and check results, approvals, usage and cost. It's built for long working sessions and fast reviews: dense but calm, and colour appears only where status or data needs a person.

**Direction: Signal.** Flat, neutral chrome with no accent hue. Panels are softened on a grey page, with one hairline per surface and generous spacing. The only colour that asks for action is `status-critical`.

See also: [`GUIDELINES.md`](GUIDELINES.md) (status grammar, overload rules, chart and contrast method) and [`DECISIONS.md`](DECISIONS.md) (why the rules are what they are).

## Content

- Write facts, not feelings. "Failed after 3 / 3 retries: `pnpm test` exited 1", not "Something went wrong".
- Name real objects in mono, and only those: run IDs (`run_8f3k2`), commit SHAs (`a1b2c3d`), file paths (`src/retry.ts`), branch names (`feature/add-retry`), repositories (`example-org/sample-repo`). Truncate hashes in the middle. Numbers, times and labels are never mono.
- Metadata is labelled fields (Repository `sample-repo`, Branch `feature/add-retry`), never a string joined with middle dots.
- Every number has a unit and a comparison: "412 ms, SLO 300 ms", "▲ 38 % vs prev 1 h".
- Times, dates, numbers and currency follow the user's locale and time zone (see `format` in the package). Absolute times always state the zone. Use `HH:mm:ss` inside a run trace and `DD Mon HH:mm` in feeds.
- Money: the account currency by default. Converted figures always show the rate and its date ("€ at 0.92, reference rate 28 Oct 2026").
- Buttons are verb + object: "Approve changes", "Re-run checks", "Stop run". Never "OK" or "Submit".
- Sentence case everywhere. No emoji. No "seamless", "unlock", "supercharge" or "effortless".
- Name the source system on every external fact, using its role: "from your CI provider", "your Git host returned 403", "linked in your issue tracker".

## Colour

- Neutrals carry the interface: `surface` (page), `surface-raised` (panels, nav, top bar), `surface-sunken` (table headers, inputs, logs, code), and `ink` / `ink-muted` for text.
- **The one accent is `status-critical`: needs action now.** Use it for critical badges, critical row tint (`status-critical-surface`), threshold lines and bad trends past threshold. Nothing decorative is ever red.
- `status-warning` is for degraded and at risk. Healthy, running and no data are icon + text with no box, because healthy is quiet; only critical and warning sit on a tint. Table rows are never tinted. `status-unknown` (dashed) is for no or stale data and is never shown as healthy. `status-info` is neutral grey: running or queued work needs no attention.
- Status is always **icon + label + colour**. Shapes: octagon `!`, triangle `!`, check circle, dashed `?`, open ring.
- Severity is separate from status: `SeverityMark` bar count (4 = most severe … 1 = least).
- Trends: the arrow shows direction, and colour comes from the metric's polarity. Good changes stay `ink`.
- Charts: one series = `ink`, no legend. Comparison = `chart-other` dashed. Categories = `chart-1`…`chart-5` in order (validated: worst adjacent ΔE2000 across normal, protan, deutan and tritan vision 14.9 light, 16.2 dark), then "Other". Use 3 or fewer where you can. Never use status colours for categories. Heatmaps use one hue, light to dark. Textures are opt-in (print, forced colours).
- Chart marks: 2 px lines with round joins, bars ≤ 24 px with a 4 px rounded end and 2 px gaps, and 8 px end dots with a 2 px surface ring. Labels and values use text colours, never the series colour. Every chart offers a table view.
- Primary action = `ink` fill with `ink-inverse` text. Links are `ink` with an underline.
- Focus: a 2 px solid `focus-ring` (ink), offset 2 px, on every interactive element.
- Contrast is checked: text ≥ 4.8:1 and control borders (`border-strong`) ≥ 3:1 on every surface, in light and dark.

## Type

- **Atkinson Hyperlegible Next** for interface text. It's designed so that I/l/1 and O/0 can't be confused, which matters when reading SHAs and run IDs at speed. **Atkinson Hyperlegible Mono** for identifiers and code: run IDs, SHAs, paths, branch names, log lines, diffs.
- Scale ratio 1.2 from 14 px: `caption` 12, `body` 14, `subheading` 16, `heading` 20, `title` 24, `figure` 29. Body weight 400; 600 only for emphasis, headings and the active state.
- Big figures use the sans face with proportional digits; tables and axes use tabular figures. Keep running text under about 75 characters per line.
- Hierarchy comes from size, weight and placement, never from extra colour.

## Space, radius, density

- 4 px base: `space-1`…`space-12`. Panels pad `space-5`, pages gutter `space-8`, and sections sit `space-5` apart.
- Radius is semantic: `radius-sm` 4 px for controls and badges, `radius-md` 6 px for containers (panels, drawers, menus, modals), and `radius-0` inside data grids.
- Panels have a `border` and no shadow. Floating layers (menus, popovers, drawers, modals, toasts) use `surface-overlay` + `shadow-overlay` and no border. Never both.
- Density: `compact` (`row-compact` 32 px) for working views such as traces, diffs and queues. `comfortable` (`row-comfortable` 40 px) for overview and reporting pages. Set `data-density` on `<html>` or on `AppShell`.
- Put an object's kind or owner as a muted second line under its name rather than adding a column. Aim for 4 to 6 columns per table.

## Layout

- One shell (`AppShell`): `SideNav` + `TopBar` + page. The rail is expanded at ≥ 1360 px, collapsed to icons at 1024–1359 px, and behind a menu below 1024 px.
- Scope (organisation / repository / branch) and time range are global. They live in the URL and travel through every drill-down. Back navigation restores them, along with page filters.
- **One focal section per page**, full width or in the wide column: the thing the person came for (what needs review, the failing check, the run's diff). Context goes in a narrower right column. Use three to five panels per page and no rows of equal tiles.
- Lists sort worst-first. Every number links to the filtered list behind it. Every time series shows change markers.
- Design all five non-happy states for every panel: loading (skeleton), empty (why + next step), error (which source; the rest still works), degraded (stale values, greyed, with their age), and no access (owner + request path).

## Iconography

- One 16 px line set drawn for this system (`Icon`, see `iconNames`), with a 1.5 stroke and square terminals. Five filled status glyphs.
- Icons only where they aid scanning: nav, status, trace event kinds, and icon-only buttons (with `aria-label`). Never decorate headings.

## Using the components

`components/bundle.js` defines `window.Pairwise` (React 18). Load `tokens.css`, then `components/bundle.css`, then React, then the bundle. Phase 2 replaces this with the `@pairwise/ui` package (ESM + types).

Behaviour comes from Radix primitives styled with the `pw-` classes and tokens. Charts use Apache ECharts behind `ChartCard`, and tables use TanStack Table + Virtual. All dependencies are MIT, Apache-2.0 or OFL.
