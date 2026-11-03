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

## Principles

1. **Exceptions first; healthy is quiet.** Problems get filled colour and sort to the top.
2. **One time range, one scope, everywhere.** They live in the top bar and the URL, travel through every drill-down, and survive back navigation and shared links.
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
