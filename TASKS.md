# TASKS

Goal: a **workable, minimal** design system that apps share, so every app looks the same
and nobody builds their own components. Build only what a project needs. A component goes into the package once a
second project needs it; until then it can live in the project.

Status: `@pairwise/ui` 2.1.0 is released (tag `ui-v2.1.0`; the ownership hierarchy: TreeView, ScopePicker,
SplitView, ScopeNote, DataTable List / Tree views). What it contains:
[`packages/ui/CHANGELOG.md`](packages/ui/CHANGELOG.md). Next: the assistant (2.2.0), at the Phase 1 gate.

## Next: 2.2.0, the assistant (Phase 1 done; waiting for approval)
- **Why:** apps built on Pairwise (developer portals, platform and cloud tools, admin and analytics) need a
  contextual assistant that reads as Pairwise, not a separate chat product.
- **Proposal:** [DECISIONS #29](design-system/DECISIONS.md#29--the-assistant-phase-1-audit-and-proposal-proposed-awaiting-approval).
  It holds the audit, the gap analysis, the Priority 1 contracts, the dependencies and the deferred list.
- **Phase 1 (done):** audit of the existing components, gap analysis, Priority 1 proposal.
- **Gate (open):**
  - the Markdown dependency (`markdown-to-jsx`, MIT, 31.6 kB min + gzip);
  - the Ctrl+I / ⌘I shortcut;
  - regenerating the README screenshots for the new top-bar launcher;
  - `AssistantProvider` in the package.
- **Priority 1, after approval, in order:**
  1. **Foundations:** the new icons and the `assistant-width` token. Then the additive props: TopBar `assistant`,
     AppShell `assistant`, Drawer `docked`, FileUpload `variant`, CodeBlock `diff`, Avatar `icon`.
  2. **Content parts:**
     - `Markdown`;
     - `Citation` and `SourceList`;
     - `ResourceCard`;
     - `Disclosure`.
  3. **The assistant itself:**
     - `ContextBar`;
     - `PromptComposer` (with `@` and `/` on cmdk, templates and attachments);
     - `AssistantMessage` (feedback, copy, regenerate, report, provenance);
     - `AssistantPanel` (history, states, live region);
     - `AssistantProvider`.
  4. **Demo:** scripted, seeded answers in the style of `vary.ts`, with no model calls.
     - Ask on Overview and on Usage and cost.
     - Explore on the Resource Explorer.
     - Investigate on an incident.
     - Ask in row menus and the command palette.
  5. **Done means, for each part:**
     - a card + README (with a group);
     - a fixture with keyboard tests;
     - axe clean in both themes;
     - GUIDELINES gets an "Assistant and AI content" section;
     - CHANGELOG 2.2.0, `pnpm run ci` and `pnpm check:generated`, and a draft PR with its preview link.

## Done in 2.1.0
- **Why:** an ML platform organises everything by ownership (company → business function → squad → initiative →
  project → repositories and other resources). That made it the second project that needed a tree (DECISIONS #24).
- **Rules:** GUIDELINES "Ownership, scope and hierarchy"; DECISIONS #25–28 (ownership vs runtime scope, React Aria for
  trees, the hierarchy in full only in two places, direct vs rolled-up numbers).
- **Foundations:** entity kinds and icons, ScopeSwitcher `dimensions`, Breadcrumbs `maxItems`, PageHeader `kind`, the
  `explorer-width` token, `react-aria-components` (Apache-2.0).
- **New components:** TreeView, ScopePicker, SplitView, ScopeNote; TopBar `ownership` / `runtime`; DataTable
  `getPath` with List and Tree views and column rollups.
- **The demo:** a Resource Explorer, the ownership scope in the top bar and the URL, every list page scoped (with
  Direct only and List / Tree), and the side nav grouped by capability.
- **Tests:** keyboard and lazy loading for the tree, the picker, List / Tree, scope across demo pages, the phone
  drawer, and axe on 14 demo routes.

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
- NotificationCenter, Stepper, FilterBuilder, WorkspaceSwitcher (the account menu covers switching orgs).
- A dependency graph between resources (repository → pipeline → service → infrastructure); "Related" lists cover it.
- A phone drill-down list for the explorer (today the tree opens in a drawer).
- DataTable virtualisation, column resizing and pinning beyond the first column.
- Agentic-coding components (DiffView, LogStream, …). `CodeBlock diff` (2.2, proposed) covers diff previews.
- The assistant's Priority 2 and 3 (DECISIONS #29.5; candidates, not commitments):
  - Priority 2: agent status and timeline, tool-call cards, plan with risk, approval card, before and after, result
    summary.
  - Priority 3: agent tasks, pause / resume / cancel / retry, input-needed notifications, multi-agent handoff,
    generated forms, share and save.
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
