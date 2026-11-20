# TASKS

Goal: a **workable, minimal** design system that apps share, so every app looks the same
and nobody builds their own components. Build only what a project needs. A component goes into the package once a
second project needs it; until then it can live in the project.

Status: `@pairwise/ui` 2.0.0, committed but not yet tagged or released (interaction on Radix and cmdk, 13 new
components, keyboard and axe tests in CI). What it contains: [`packages/ui/CHANGELOG.md`](packages/ui/CHANGELOG.md).

## Done in 2.0.0
- **Tests:**
  - Playwright behaviour tests in Chromium for every interactive component (keyboard, focus, Escape order, live
    regions), plus integration tests on the demo.
  - axe-core on every card and 9 demo pages, in both themes: no violations.
  - `capture --widths` for tablet and phone diffs.
- **Foundations:**
  - `motion` and `layer` tokens; the lint fails on raw durations and z-index values; reduced motion.
  - Public `Field`, refs on every control, indeterminate Checkbox, `Button asChild`, typed `IconName`.
- **Existing components on proven primitives:**
  - Radix: Tooltip, MenuSelect, TimeRangePicker, Tabs, Toaster and the critical Modal.
  - GlobalSearch on cmdk, with commands, groups, recents and async results.
  - DataTable 2.0: controlled and server modes, selection, bulk and row actions, column visibility, a pinned first
    column, page sizes, and a paging fix.
  - StatusGrid as a keyboard grid; table views for every chart.
- **New components:** Popover, SegmentedControl, Pagination, ColumnsMenu, RadioGroup, Combobox (tags, creatable),
  DatePicker, DateRangePicker, InlineEdit, FileUpload, KeyValueList, Avatar / AvatarGroup, ProgressBar.
- **The demo** uses them: bulk member actions, a topics combobox, code-owner uploads, inline release notes, a report
  period, and a command palette.

## Later, only when a project asks
- TreeView, NotificationCenter, Stepper, FilterBuilder, WorkspaceSwitcher (the account menu covers switching orgs).
- DataTable virtualisation, column resizing and pinning beyond the first column.
- Agentic-coding components (DiffView, LogStream, …).
- A charting or table library (DECISIONS #10, #11).
- Localised month names in the calendar menus.

## Done in 1.1.0
- Font presets (`data-font`: atkinson, inter, plex, system) for an app default or a person's own choice; the demo has
  personal preferences under the account button and an organization default font in Administration.
- Phone layout (≤ 640 px) for the shell, page header, tabs, banners, popovers and toasts.
- Stable layout: tabs, scope, filters, the time range and page changes never move the surrounding chrome.
- The live demo is a complete app: every nav page works (overview, services, incidents, deployments, CI runs,
  repositories, usage and cost, access, administration), with detail pages, working tabs and breadcrumbs.
- README and site screenshots are dark first, with light variants and phone captures.

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
