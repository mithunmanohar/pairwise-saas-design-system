# Changelog

All notable changes to `@pairwise/ui`. Versions follow semver:
**patch** (1.0.x) = fixes, **minor** (1.x.0) = new components or props, **major** (x.0.0) = changes that may need edits in your project.

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
