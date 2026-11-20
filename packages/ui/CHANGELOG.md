# Changelog

All notable changes to `@pairwise/ui`. Versions follow semver:
**patch** (1.0.x) = fixes, **minor** (1.x.0) = new components or props, **major** (x.0.0) = changes that may need edits in your project.

## 1.0.1 (2026-11-20)

Phone layout. CSS only; no prop or API changes, and desktop rendering is unchanged (all 168 card captures, both themes
and densities, are pixel-identical to 1.0.0).

- **≤ 640 px viewport:** TopBar wraps to two rows (search and time range on the second); PageHeader stacks its
  actions under the title and hides their leading icons; Tabs scroll sideways; AlertBanner wraps its action below the
  text; the TimeRangePicker popover and toasts span the screen; Panel, DataTable and Modal tighten their side padding;
  Heatmap scrolls sideways instead of being clipped.
- **All widths:** PageHeader actions, Panel header actions and Modal/Drawer footers wrap instead of overflowing, and
  a Metric's sparkline drops below the value when the tile is too narrow for both.

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
