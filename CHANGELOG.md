# Changelog

All notable changes to `@pairwise/ui`. Versions follow semver:
**patch** (1.0.x) = fixes, **minor** (1.x.0) = new components or props, **major** (x.0.0) = changes that may need edits in your project.

## 2.1.0 (2026-11-21)

Ownership hierarchy and scope: a Resource Explorer, one ownership scope carried across pages, and tables with List
and Tree views. Every API change is additive, so 2.0 code builds unchanged. The rules are in GUIDELINES "Ownership,
scope and hierarchy" and DECISIONS #25–28. The demo has a Resource Explorer (`#/explorer`), the scope in the URL
(`?scope=`), and every list page filtered by it.

- **Entity kinds (new):**
  - `EntityKind` (company, function, squad, initiative, project, repository, pipeline, webapp, infrastructure,
    dataset, model, resources).
  - `entityIcon` and `entityLabel` maps.
  - New icons `building`, `briefcase`, `users`, `flag`, `folder`, `git-repo`, `globe`, `level-up`.
  - Kinds are told apart by icon and word, never by colour.
- **ScopeSwitcher `dimensions` (new):** any runtime dimensions (environment, region, cluster, namespace…), plus a
  `label` for the group. The 1.x `scope` + `options` props still work. `ScopeOptions` and `ScopeDimension` types.
- **Breadcrumbs `maxItems` (new):** the levels above fold into a "…" menu (Radix DropdownMenu) and the current page
  always shows. Items take an `icon`.
- **PageHeader `kind` (new):** the eyebrow above an entity's title, e.g. "Initiative · owned by ML engineering".
- **Token:** `explorer-width` (320 px) for the Resource Explorer's tree pane.
- **New dependency:** `react-aria-components` (Apache-2.0), for trees.
- **TreeView (new):** the ownership tree, built on React Aria `Tree`.
  - Kind icon, label, and a worst-descendant status mark with a count; healthy rows stay quiet.
  - Children load lazily with `loadChildren`, showing a loading row and an error row.
  - `filter` keeps matches and their ancestors.
  - Controlled or uncontrolled `selectedId` / `expandedIds`.
  - Nodes the person can't open show as `noAccess` context.
  - Arrows move focus; Enter, Space or a click selects.
- **ScopePicker (new):** the ownership scope chip.
  - The chip shows the current node only, and the full path appears on hover.
  - The popover holds a search whose results show their path, "Up to {parent}", "Whole organisation", and a
    TreeView of the current branch.
- **SplitView (new):** the explorer layout.
  - A fixed `explorer-width` aside that collapses to a strip.
  - Below 1024 px the aside opens in a Drawer; `drawerOpen` / `onDrawerOpenChange` close it once a node is picked.
- **ScopeNote (new):** one line saying what the page covers ("Showing AI transformation and its 2 projects"), with
  an optional Direct only / Including descendants switch.
- **TopBar `ownership` and `runtime` (new):** two labelled groups, the ownership scope first. `scope` and
  `scopeOptions` are now optional.
- **DataTable List / Tree views (new):**
  - `getPath(row)` gives each row's ownership path below the current scope.
  - Views are controlled with `view`, `defaultView` and `onViewChange`.
  - **List:** shows each row's path as a muted line, with the middle folded when long.
  - **Tree:** groups rows by path. Collapsed group rows show column `rollup`s (`'sum'`, `'latest'`,
    `{status}` worst-first, or a function); other columns show "–". Expand all and Collapse all are available.
  - New `directLabel`, `itemNoun` and `toolbar` props.
  - The path and group label go in the row's name column, the first column without a `rollup`, so a leading
    Status column keeps its rollup.
  - Paging applies to List only.
- **Fix:** PageHeader no longer widens the page on phones when its breadcrumb, kind or fields are long; they wrap.

## 2.0.0 (2026-11-20)

Pairwise 2.0 keeps the same Signal look, with sturdier interaction, accessibility and coverage.

- Every overlay, menu and form primitive now runs on Radix.
- Search and comboboxes run on cmdk; calendars on react-day-picker.
- Thirteen new components.
- Keyboard and axe tests in CI.

Props are backwards compatible. The major version is for the DOM and role changes listed under "Migrating from 1.x".

- **Motion and layer tokens (new).**
  - `tokens.json` gains `motion` (`duration-fast` 120 ms, `duration-base` 160 ms, `duration-slow` 220 ms,
    `duration-spin`, `duration-pulse`, `ease-standard`, `ease-exit`) and `layer` (`z-sticky` … `z-tooltip`).
  - `prefers-reduced-motion` sets every duration to 0 ms in `tokens.css`.
  - `@pairwise/ui/tokens` exports `motion` and `layer`.
  - Component CSS uses only these: the lint now fails on a raw z-index or duration.
- **Motion:** menus, selects and popovers fade in 4 px from their trigger and fade out. Modals fade in and drawers
  slide in from the edge. All of it is off with reduced motion.
- **Field (new):** the label, hint, error and "Required" wrapper shared by every control. It is now public, so any
  control can join a form with the same wiring.
- **Forms:**
  - `required` shows a muted "Required" after the label and sets `aria-required`.
  - Read-only inputs get the sunken surface.
  - Checkbox takes `checked="indeterminate"` and `hideLabel`.
  - Switch takes `error`.
  - Select, Checkbox and Switch forward their ref to the focusable element.
  - Options take `disabled`.
- **TopBar `searchRecent` (new):** recent items for its search.
- **Button `asChild` (new):** styles a single child, such as a router link, as a button.
- **Popover (new):** a non-modal floating panel on Radix Popover, with `PopoverClose`.
- **Icons:**
  - `IconName` is a union of every icon, so a typo is a type error instead of a silent "x".
  - New `minus` icon.

- **Overlays and menus on Radix and cmdk.** Props are unchanged unless listed.
  - **Tooltip:** Radix Tooltip, with an open delay, collision handling and a portal (the collapsed rail no longer clips
    it). Adds `side="left"`. New `TooltipProvider` (AppShell includes one) shares the skip delay.
  - **MenuSelect** (and ScopeSwitcher, FilterBar):
    - A Radix DropdownMenu of radio items, with arrow keys, typeahead, Home/End, a portal and focus return.
    - Its name is its visible text. This fixes axe `label-content-name-mismatch`.
  - **TimeRangePicker:**
    - Radix Popover: focus moves in and returns.
    - The relative ranges are a radio group: arrows move, Enter applies.
    - Auto-refresh is a `SegmentedControl`.
    - Copy passes the absolute range when one is set, and its timer is cleaned up.
  - **GlobalSearch** is the command experience (cmdk):
    - Items can be commands (`onRun`), with `group`, `description`, `keywords`, `shortcut`, `icon` and `id`.
    - New props: `recent`, `loading`, `onQueryChange`, `filter`, `limit`, `shortcut`, `label`.
    - The highlighted result is announced. Ids are unique per instance.
    - Only the newest search owns Ctrl+K / ⌘K, and the hint matches the platform.
  - **Tabs:** Radix Tabs with Home/End and disabled tabs skipped. New `label`, and `TabPanel` children link tabs to
    panels.
  - **Toaster:** Radix Toast.
    - The live region is always present, so the first toast is announced.
    - Critical toasts are assertive.
    - F8 focuses toasts, swipe dismisses, and toasts pause when the window loses focus.
    - `toast()` is unchanged.
  - **Modal `tone="critical"`:** an alertdialog described by its body. Clicking outside no longer dismisses it.
- **SegmentedControl (new):** two to five exclusive options, on Radix ToggleGroup.
- **DataTable:**
  - Controlled `sort` / `onSortChange`.
  - Controlled `page` / `onPageChange` (1-based), `pageSizeOptions` / `onPageSizeChange`, and `manual` + `totalRows`
    for server data.
  - `selection="multiple"` (an indeterminate select-all per page) with `selectedKeys` / `onSelectionChange`.
  - `bulkActions`, `rowActions`, `rowLabel`, `hiddenColumns`, column `hidden` / `hideable` / `pin: "start"`, and
    `state="empty"`.
  - **Fix:** filtering to fewer rows no longer leaves the table on a page that doesn't exist (it showed "No rows match"
    while rows matched).
- **Pagination (new)** and **ColumnsMenu (new).** DataTable's pager is Pagination, and gains first/last when there are
  more than 5 pages.
- **StatusGrid:**
  - With `onCell`: an ARIA grid with one Tab stop, arrow/Home/End navigation and 24 px targets (WCAG 2.5.8).
  - Without `onCell`: a plain table.
  - New "Show table".
- **BarChart and Heatmap:** "Show table", as every chart should have (`table` prop). BarChart bars are keyboard
  buttons with `onBar`.
- **Charts are always named:** without `ariaLabel`, a name is built from the series, unit and range. TimeSeriesChart
  markers are buttons only with `onMarker`, which fixes axe `nested-interactive`.
- **Accessibility:** axe now reports no violations on any catalogue card in either theme. It found six component
  defects; all are fixed.

- **New components:**
  - **RadioGroup** (Radix): options with descriptions, horizontal or vertical.
  - **Combobox** (Radix Popover + cmdk):
    - Single or `multiple`. Multiple shows removable tags and is the tag input.
    - Local or server search, `loading`, `creatable`, clearable.
    - The highlighted option is announced.
  - **DatePicker** and **DateRangePicker** (react-day-picker in a Radix Popover):
    - Typed `YYYY-MM-DD`, checked with specific messages.
    - `min`, `max`, `isDateDisabled`.
    - Ranges have presets, a draft that you Apply, and `maxDays`.
    - Day names include the visible number (WCAG 2.5.3).
  - **InlineEdit:** edit a value in place, with validation and async save. Focus stays in the field while saving and
    returns to the value afterwards.
  - **FileUpload:**
    - A drop zone with "Choose files".
    - Type, size and count checks, listing rejected files with the reason.
    - Per-file progress, Retry and Remove, announced in a live region.
  - **KeyValueList:** labelled facts in `rows`, `grid` or `inline` layouts, with copy, loading and "–" for missing
    values.
  - **Avatar** and **AvatarGroup** (Radix Avatar): initials fallback, sizes, a status mark, and "+N" with a full
    accessible name.
  - **ProgressBar** (Radix Progress): determinate or indeterminate, `valueText`, `ink` / `warning` / `critical`.
- **PageHeader** renders its fields with KeyValueList (pixel-identical).
- **Icons:** `edit`, `upload`, `calendar`, `plus`, `file`.
- `toISODate`, `parseISODate` and `DEFAULT_RANGE_PRESETS` are exported.
- **New dependencies** (MIT): `@radix-ui/react-popover`, `-tooltip`, `-tabs`, `-toast`, `-radio-group`,
  `-toggle-group`, `-progress`, `-avatar`, `-slot`; `cmdk`; `react-day-picker` with `date-fns`.

### Migrating from 1.x
- `Icon name`, `Button icon`, `NavItem.icon` and `ActionMenuItem.icon` are now `IconName`, not `string`. If you pass
  an icon from a variable typed `string`, type it as `IconName`.
- Stacking order: tooltips are now above popovers and menus, and toasts are above dialogs (`layer` tokens). If you
  set your own `z-index` on Pairwise classes, use the tokens.
- Menus, tooltips and the time picker render in portals at the end of `<body>`. CSS that styled them as descendants of
  your layout (e.g. `.my-toolbar .pw-pop`) no longer applies. The old `.pw-tip` / `.pw-tipwrap` classes are gone;
  the tooltip is `.pw-tooltip`.
- MenuSelect options are now `menuitemradio` in a `menu` (were `option` in a `listbox`), and TimeRangePicker's ranges
  are radios. Update tests that query them by role.
- GlobalSearch shows "Ctrl K" on non-Apple platforms (was always "⌘K").
- TopBar's account button is named by hidden text after its initials instead of `aria-label`; query it by the same
  name as before ("Account: Dev A").
- `rowActions` returning `[]` renders no menu for that row.
- The DataTable expand column's header is now a visually hidden "Details" (was an empty cell with `aria-label`).
- BarChart, Heatmap and StatusGrid show a "Show table" toggle by default; pass `table={false}` to hide it.
- An interactive StatusGrid (with `onCell`) spaces its cells 24 px apart (was 21 px) for the touch-target minimum.
- Modal `tone="critical"` no longer closes on an outside click.
- `ToastRegion` is no longer a live region (it is a labelled region). Prefer `<Toaster />`, which announces reliably.

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
