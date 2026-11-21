# Guidelines

Rules that apply to every screen. The README has the short version; this file has the reasoning and the tables.

## Rules against information overload

1. **The 5-second rule.** Each page's top band answers its main question without scrolling or hovering. Everything else goes below the fold or behind a tab.
2. **Exceptions first; healthy is quiet.** Healthy states render in neutral ink with a small check icon. Only non-healthy states get filled colour. A wall of green is noise and hides the one red.
3. **Colour budget per view:** status hues + at most 6 categorical series. A 7th series becomes "Other", or the chart becomes a table.
4. **Severity ordering is fixed** everywhere: Critical → Warning → Unknown/No data → Info → Healthy. Lists sort worst-first by default.
5. **Max 8 charts per page** before tabs.
6. **No gauges or pies for operational data.** Use bullet bars (value vs target) and 100 % stacked bars. Gauges spend area on one number, and pies can't be compared across time.
7. **No dead ends.** Every number is a link to the filtered list behind it.
8. **Show freshness.** Each card shows "updated 20 s ago". Data older than 2× the refresh interval switches the card to the degraded state.
9. **Change markers on by default.** Every time series shows the changes in its window (merges, deploys, config changes).
10. **Units and baselines always visible.** No unitless y-axes. Thresholds are drawn as bands, not just colour.

## Status (state of a thing)

| Status | Meaning | Icon / shape | Label | Colour role | Visual weight |
|---|---|---|---|---|---|
| **Critical** | Failing, blocked, breaching a limit | Filled octagon with `!` | "Critical" / "Failed" | `status-critical` | Filled tint + bold label |
| **Warning** | Degraded, at risk, retrying | Triangle with `!` | "Warning" / "Degraded" | `status-warning` | Filled tint |
| **Healthy** | Operating normally | Circle with check | "Healthy" / "Passed" | `status-healthy` | **Outline only**, quiet |
| **Unknown / No data** | No signal, stale, insufficient data | Dashed circle with `?` | "No data" / "Unknown" | `status-unknown` | Outline, dashed |
| **Info** | In progress, queued, scheduled | Circle with `i` (in progress: spinner ring) | "Running" / "Queued" | `status-info` | Outline |

Never colour alone: every badge is **icon + label** (WCAG 1.4.1). In charts, status series also use a decal pattern or dash style.

## Severity (how urgent an issue is)

Severity is separate from status. A run has a *status*; a problem has a *severity*.

| Level | Glyph | Colour |
|---|---|---|
| 4: most severe | ▮▮▮▮ | `status-critical` |
| 3 | ▮▮▮▯ | `status-critical` (lighter weight) |
| 2 | ▮▮▯▯ | `status-warning` |
| 1: least severe | ▮▯▯▯ | `status-unknown` ink |

Bar count, not just colour, carries the level. Aggregates show the levels most severe first, each with a count that links to the filtered list.

## Trend direction

- **Arrow = direction** (▲ up / ▼ down / ▬ flat within ±2 %).
- **Colour = goodness**, set by the metric's declared polarity. For latency, failures and cost, *up is bad*; for pass rate, throughput and adoption, *up is good*.
- Bad → `status-critical` ink when past threshold, otherwise `status-warning`. Good → neutral ink (healthy is quiet). Neutral or unknown polarity → neutral ink.
- Always print the delta and the comparison window: "▲ 38 % vs prev 1 h".

## Chart colour rule

Status hues are **reserved**. Categorical series use a separate colour-blind-safe palette (`chart-1`…`chart-n`) that avoids the status hues. A chart that shows *states* (run outcomes, check results) uses only status colours plus their decals.

## Contrast and colour-blind method

Every colour token is checked in both themes on every surface it can sit on (`surface`, `surface-raised`, `surface-sunken`, `surface-overlay`):

- **Text:** contrast ≥ 4.8:1 (above the 4.5:1 AA floor, so rounding and anti-aliasing can't drop it below).
- **Control borders and non-text UI** (`border-strong`, focus ring, chart marks): ≥ 3:1.
- **Categorical chart colours:** each adjacent pair is simulated for protanopia, deuteranopia and tritanopia. The worst-case CIEDE2000 ΔE between adjacent series must be **≥ 11** in light and in dark. The current set (`chart-1`…`chart-5`, then `chart-other`) has a worst case of 14.9 (light) and 16.2 (dark). A new colour is accepted only if it keeps every adjacent pair ≥ 11 and stays clear of the status hues.
- Status is never encoded by colour alone, so a missed hue still leaves the icon and label.

These checks are unit tests on `tokens.json`; a token change that fails them fails CI.

## Forms

- **Every control is a Field:** a visible label (or a hidden one, for a lone search box), an optional hint and an
  optional error. Build custom controls with `<Field>` so they get the same wiring: `aria-describedby` for the hint
  and error, `aria-invalid`, `aria-required`.
- **Required:** mark it with `required`, which shows a muted "Required" and sets `aria-required`. If most fields are
  required, mark the optional ones in the hint instead.
- **Errors:** say what to do ("Use an https:// URL so the payload is encrypted."), in `status-critical`, with an icon
  and under the field. Validate on blur or submit, never on every keystroke. On submit, focus the first invalid field;
  every control forwards its ref for this.
- **Read-only vs disabled:** read-only values stay focusable and copyable. Use disabled only when the field doesn't
  apply, and say why in the hint.
- **Saving:** a form saves with one primary button (verb + object). A single value saves in place with `InlineEdit`.
  Async saves show "Saving…", keep focus where it is, and keep the person's input on failure.
- **Choosing the control:**

| Choice | Use |
|---|---|
| On or off, takes effect now | `Switch` |
| On or off, saved with the form; or select-all | `Checkbox` (`indeterminate` for some) |
| One of 2–5, differences need words | `RadioGroup` |
| One of 2–5 views or intervals, in a toolbar | `SegmentedControl` |
| One of a short fixed list | `Select` |
| One or several of a long list, or free tags | `Combobox` (`multiple`, `creatable`) |
| A filter value in a toolbar | `MenuSelect` / `FilterBar` |
| A date / a date range | `DatePicker` / `DateRangePicker` (`TimeRangePicker` for the global time window) |
| Files | `FileUpload` |

## Overlays and layering

- **One primitive per job.** Decisions that block the page: `Modal`. Investigation next to the list: `Drawer`. A small
  panel anchored to a control: `Popover`. Commands: `ActionMenu`. A choice: `MenuSelect`, `Select` or `Combobox`.
  A hint: `Tooltip`. Feedback after the fact: `toast()`.
- **Floating layers portal to `<body>`** and stack by the `layer` tokens only: `z-overlay` (modal, drawer) <
  `z-popover` (menus, selects, popovers, which also work inside a modal) < `z-toast` < `z-tooltip`.
- **Escape closes one layer at a time**, top first. Focus returns to whatever opened the layer. Clicking outside
  closes non-modal layers; a critical modal ignores outside clicks.
- **Never nest a modal in a modal.** Replace the content, or move the second step into the same dialog.
- **Phones:** popovers flip and shift to stay on screen; the time and date pickers stack their columns.

## Motion

- **Functional only.** Floating layers fade in 4 px from their trigger (`duration-base`, 160 ms). Dialogs fade in and
  drawers slide in from the edge (`duration-slow`, 220 ms). Hover and press feedback uses `duration-fast` (120 ms).
  Nothing bounces, nothing loops except progress.
- **Reduced motion** sets every duration to 0 ms and turns off the overlay animations; indeterminate progress becomes
  a still, half-tone bar.
- **No raw durations or z-index values** in component CSS: the lint fails on them.

## Ownership, scope and hierarchy

For apps whose content is owned in a hierarchy (company → business function → squad → initiative → project, with
repositories, pipelines, services and other resources at any level). **Organise by ownership, navigate by scope,
operate by capability.**

1. **Three independent contexts**, all in the top bar and the URL, kept on every page:
   - **ownership scope:** a node in the hierarchy (`ScopePicker`);
   - **runtime scope:** environment, region, cluster (`ScopeSwitcher` with `dimensions`);
   - **time range** (`TimeRangePicker`).
   Ownership and runtime never mix in one tree or one picker.
2. **The full hierarchy appears in two places only:** the Resource Explorer (`SplitView` + `TreeView`) and the
   scope picker's popover. Everywhere else shows the current node once (icon, name and kind), with the full path on
   hover. Don't repeat the levels above the scope on every page.
3. **The side nav lists capabilities, never entities:** Explore, Build, Operate, Finance, Manage. Every capability
   page reads the ownership scope. A page that stays organisation-wide (a landing overview) says so in its header.
4. **Say what a page covers.** A `ScopeNote` ("Showing AI transformation and its 2 projects, in prod / region-a")
   sits above the scoped table. A figure that stays organisation-wide on a scoped page says so ("whole
   organisation").
5. **Aggregate up, detail down.**
   - Higher levels show rollups; lower levels show the resources.
   - Every count says whether it is direct or includes descendants ("0 direct · 7 with everything below").
   - Scoped pages include descendants by default, with Direct only one click away.
6. **Status rolls up worst-first** with a count ("1 failing below") that leads to the cause; healthy stays quiet.
   It is the status grammar applied to the tree.
7. **Tables of owned items offer List and Tree** (`DataTable getPath`).
   - **List:** each row's path *below the scope* as a muted line; rows the scope owns read "Owned by …".
   - **Tree:** grouped by that path, with rollups on collapsed rows ("–" where a column doesn't add up).
8. **The tree shows ownership only.** Relationships between resources (a repository's pipelines, a service's
   infrastructure) are "Related" lists on the resource's page, not tree edges.
9. **Resources never become tree leaves one by one.** A node ends in "Resources" groups by type (Services 2,
   Repositories 1), loaded when opened.
10. **Kinds are told apart by icon and word, never by colour** (`entityIcon`, `entityLabel`). Signal has no accent
    hue, and the hierarchy doesn't get one.
11. **Access:** people see the nodes they can open. A parent they can't open shows as greyed context with a lock,
    so the shape of the organisation still reads.
12. **Narrow screens:** below 1024 px the tree opens in a drawer that closes once a node is picked; the workspace's
    child list and its breadcrumb drill down from there.

## Principles

1. **Exceptions first; healthy is quiet.** Problems get filled colour and sort to the top.
2. **One time range, one scope, everywhere.** The time range, the ownership scope and the runtime scope live in the top bar and the URL, travel through every drill-down, and survive back navigation and shared links.
3. **Every chart shows what changed.** Change markers appear on every time series by default.
4. **Status is word + shape + colour.** Badges are icon + label, charts use decals, and severity uses bar count.
5. **No dead ends.** Every number links to the list behind it. Every object links to its parent, its changes and its problems.
6. **Same shell, different front door.** Role sets the landing page; permissions, not role, limit what's reachable.

## Visual philosophy

- **Density:** compact by default on working surfaces (32 px rows), comfortable on overview and reporting pages (40 px rows). Users can toggle it. Both use the same tokens; only the spacing set changes.
- **Tone:** calm, precise, engineering-grade. No decorative illustration, gradients or glass. Hairline borders separate surfaces; shadow is only for things that float (menus, drawers, toasts).
- **Theme parity.** Light and dark are both designed and contrast-tested; the default follows the OS.
- **Colour budget:** neutrals carry about 90 % of the pixels. Chroma is reserved for status and data series.
- **Numbers:** tabular figures wherever numbers line up; the mono face for identifiers and code.
