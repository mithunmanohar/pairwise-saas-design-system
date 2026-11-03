# TASKS

Goal: a **workable, minimal** design system that apps share, so every app looks the same
and nobody builds their own components. Build only what a project needs. A component goes into the package once a
second project needs it; until then it can live in the project.

Status: `@pairwise/ui` 1.0.0. What it contains: [`packages/ui/CHANGELOG.md`](packages/ui/CHANGELOG.md).

## Done in 1.0.0
- Tokens (`design-system/tokens.json`) generated into CSS variables and typed names; light and dark themes; two densities.
- 42 components, including form controls (TextInput, Textarea, Select, Checkbox, Switch), overlays on Radix (Modal,
  Drawer, ActionMenu), `toast()` + Toaster, CodeBlock, CopyButton, Tag, and the ops and observability set (charts,
  Heatmap, BulletBar, SeverityMark, StatusGrid, RunStrip, ScopeSwitcher, TimeRangePicker).
- A browsable catalogue (`design-system/catalogue.html`) and `dist/COMPONENTS.md` for people and AI tools.
- CI on every PR, a release workflow (`ui-vX.Y.Z` git tags), and a GitHub Pages site with a live demo.
- A showcase README with three example screens built only from the package.

## Later, only when a project asks
Radio, Combobox, Popover, Pagination, DatePicker; DataTable row selection + bulk actions; key–value details list;
Radix for Tabs / Tooltip / MenuSelect / FilterBar menus (arrow keys); agentic-coding components
(DiffView, LogStream, …); keyboard and axe tests in CI; a charting or table library.

## Reference: decisions already made
- Five categorical chart colours: `chart-4` purple (`#5d1b6a` / `#cea2d7`) and `chart-5` green (`#225924` / `#57db5d`). Worst adjacent ΔE: 14.9 light, 16.2 dark.
- Brand lockup "Pairwise"; collapsed-rail monogram "PW".
- Locale-driven formatting via `Intl`. Indian digit grouping and a dated FX rate are opt-in in `format.ts`.
- Fonts self-hosted via @fontsource.
- Projects are React, so the React components are the shared surface.
- The package is the baseline for several kinds of project, including observability-heavy ops apps, so the ops
  components stay.
- Density is set once on `<html>`; the page density wins.
