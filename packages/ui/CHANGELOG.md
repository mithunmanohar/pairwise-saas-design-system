# Changelog

All notable changes to `@pairwise/ui`. Versions follow semver:
**patch** (1.0.x) = fixes, **minor** (1.x.0) = new components or props, **major** (x.0.0) = changes that may need edits in your project.

## 1.1.0 (2026-11-20)

Font presets, a stable layout and a phone layout. 1.0.1 was never tagged; its changes ship here.

- **Font presets (new).**
  - Set `data-font` on `<html>` to `atkinson` (default), `inter` (Inter with IBM Plex Mono), `plex` (IBM Plex Sans
    and Mono) or `system` (the device font). An app sets it for everyone; a person can choose their own the same way.
  - `data-font` on any element scopes a preset to that subtree, so a picker can preview each font in its own face.
  - The presets live in `tokens.json` (`type.fontPresets`). `tokens.fonts` lists them with labels and usage, and the
    `FontPreset` type names them.
  - `fonts.css` now declares every preset, self-hosted from @fontsource (all OFL-1.1). Browsers download only the
    family in use, so an app on the default font fetches nothing extra.
  - New dependencies: `@fontsource/inter`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`.
- **Account menu (new):** TopBar `account` (`{name, email, role, org, items}`) makes the avatar open a menu with who is
  signed in, their role in the current organization, and your items (switch organization, preferences, sign out).
- **ActionMenu (new props):**
  - `header`: non-interactive content above the items.
  - `{heading}` entries label a group.
  - `checked` marks the current choice (a tick, announced as checked).
  - `meta` shows muted text on the right.
- **Timeline alignment fix:**
  - Time and title now share a baseline in every font. Before, the title sat 1 px low, or 5 px low on a highlighted
    event.
  - The icon is centred on the connector (was 2.5 px off).
  - The connector stops 4 px short of each icon, above and below. Before, the gaps were uneven, and in the dense
    variant the connector touched the next icon.

- **Stable layout: switching never moves the chrome.**
  - Tabs and the auto-refresh segments reserve the width of their bold, selected label, so switching never slides the
    tabs after them.
  - MenuSelect (scope switcher, filters) keeps the width of its widest option, so `prod` → `staging` no longer pushes
    the search box.
  - TimeRangePicker keeps the width of its widest range. Its auto-refresh slot is always shown: a pause icon and "off"
    when refresh is off.
  - FilterBar shows "Clear" to the left of the result count, so the count stays at the right edge.
  - AppShell's content area reserves a stable scrollbar gutter, so pages and tabs of different lengths no longer
    shift sideways by a scrollbar's width on Windows, Linux or a Mac with a mouse.
  - Metric figures use tabular digits (were proportional), so live values don't jitter.
  - Visible change: those controls are slightly wider when showing a short value; inactive tabs gain 1–3 px of
    spacing.
- **Phone layout (≤ 640 px viewport):**
  - TopBar wraps to two rows, with search and the time range on the second.
  - PageHeader stacks its actions under the title and hides their leading icons.
  - Tabs scroll sideways.
  - AlertBanner wraps its action below the text.
  - The TimeRangePicker popover and toasts span the screen.
  - Panel, DataTable and Modal tighten their side padding.
  - Heatmap scrolls sideways instead of being clipped.
- **All widths:**
  - PageHeader actions, Panel header actions and Modal and Drawer footers wrap instead of overflowing.
  - A Metric's sparkline drops below the value when the tile is too narrow for both.

## 1.0.0 (2026-11-04)

First release.

- **Foundations:** design tokens for colour, spacing, radius and type in light and dark themes and two densities
  (`tokens.css`, typed names in `@pairwise/ui/tokens`); self-hosted Atkinson Hyperlegible Next and Mono (`fonts.css`);
  component styles (`styles.css`); `PairwiseProvider` and locale-aware formatters (`@pairwise/ui/format`).
- **Actions and status:** Button, ActionMenu, CopyButton, StatusBadge, StatusDot, SeverityMark, Trend, Tag, Icon.
- **Forms:** TextInput, Textarea, Select, Checkbox, Switch, MenuSelect, FilterBar, TimeRangePicker.
- **Navigation and layout:** AppShell, SideNav, TopBar, PageHeader, Breadcrumbs, Tabs, Panel, GlobalSearch, ScopeSwitcher.
- **Feedback and overlays:** `toast()` + Toaster, Toast, AlertBanner, StateBlock, Skeleton, Tooltip, Modal, Drawer.
- **Data and charts:** DataTable (typed rows), Metric, Timeline, RunStrip, StatusGrid, BulletBar, CodeBlock,
  TimeSeriesChart, BarChart, Sparkline, Heatmap, Legend.
- Overlays, menus and form controls use Radix primitives for keyboard and focus handling.
- `dist/COMPONENTS.md`: every component's usage notes and props in one file.
