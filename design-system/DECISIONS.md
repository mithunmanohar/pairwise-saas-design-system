# Decision record

The decisions behind Pairwise, in the order they were made. Each entry keeps the decision and its reason.

| # | Decision | Why |
|---|---|---|
| 1 | **One shell for every role**; role picks the landing page, permissions limit reach | Separate tools for each role drift apart. A shared shell keeps navigation, scope and time consistent, and role-based landing pages still give each person a fast front door. |
| 2 | **Signal direction**: neutral chrome, no accent hue; `status-critical` is the only colour that asks for action | When the chrome has no colour, any colour on screen is a signal. It makes "exceptions first" structural rather than a convention. |
| 3 | **Status grammar**: icon + label + colour; healthy is quiet | Meets WCAG 1.4.1 without relying on colour, and keeps the one red visible on busy screens. |
| 4 | **Severity separate from status**, shown by bar count | Status says what state a thing is in; severity says how urgent a problem is. Mixing them overloads one colour scale. |
| 5 | **Theme parity**, default follows the OS | Long sessions and night work want dark; reports and screenshots want light. Both are tested from day one. |
| 6 | **Two densities from one token set** | Working views need 32 px rows; overview pages read better at 40 px. Swapping only the spacing set keeps components identical. |
| 7 | **Atkinson Hyperlegible Next + Mono** (OFL) | Unambiguous I/l/1 and O/0 for SHAs and IDs. Open licence, self-hostable. |
| 8 | **Contrast floors**: text ≥ 4.8:1, non-text ≥ 3:1, categorical ΔE ≥ 11 | A margin above AA so rendering differences can't fail it; the ΔE floor keeps adjacent series apart for common colour-vision deficiencies. |
| 9 | **Behaviour from Radix primitives**, styled with our own classes and tokens | Accessible keyboard and focus behaviour without inheriting another system's look. Radix ships no styles and is MIT. |
| 10 | **Charts stay lightweight SVG** with a table view (was: ECharts) | Operational dashboards don't need canvas performance; no dependency to upgrade. Revisit if a project needs it. |
| 11 | **DataTable is our own** (was: TanStack Table + Virtual) | Sorting, expansion and paging cover the current projects. Revisit if a project needs virtualisation. |
| 12 | **Permissive licences only** (MIT, Apache-2.0, OFL) | No commercial or source-available dependencies in a design system that others build on. |
| 13 | **Locale-driven formatting** via `Intl`, browser locale and time zone by default | No hard-coded zone, currency or digit grouping. Indian digit grouping and a fixed FX rate with its date remain available as explicit options. |
| 14 | **Five categorical chart colours**, used in order | Two were added (purple `chart-4`, green `chart-5`) after a search that kept every adjacent pair ≥ 11 ΔE under all four vision types and kept clear of the status hues. Green is never used for status; healthy is teal and stays icon + text. |
| 15 | **No gauges or pies** for operational data | They spend area on one number and can't be compared over time; bullet bars and stacked bars can. |
| 16 | **Fonts self-hosted** from @fontsource (OFL), never a CDN | No third-party request at runtime, works offline and behind strict CSP. Glyphs render marginally differently from the CDN build (≤ 0.71 % of pixels on any card, no layout shift); accepted in Phase 2. |
| 17 | **Stable layout: switching never moves the chrome** | Changing a tab, a scope or filter value, the time range or a page must not move anything else. Selected labels reserve their bold width, menus and the time picker keep the width of their widest option, the content area reserves a stable scrollbar gutter, and figures use tabular digits (was: proportional) so live values don't jitter. Checked by measuring every switch in the demo at 1440, 1024 and 390 px, with and without classic scrollbars. |
| 18 | **Font presets, chosen by the app or the person** (`data-font`: atkinson, inter, plex, system) | Apps want their own voice and people have reading preferences. A small, tested set keeps every screen consistent: each preset swaps only `--font-sans` and `--font-mono`, all are OFL and self-hosted, and only the chosen one downloads. Atkinson stays the default for its legibility. Every demo page was checked in each preset at 1440, 1024, 390 and 360 px. |
| 19 | **Behaviour and accessibility tests in real Chromium** (`@playwright/test`, Apache-2.0) with **axe-core** (MPL-2.0) as a dev-only exception to #12 | Keyboard, focus and screen-reader semantics can only be trusted in a real browser. axe-core is the reference WCAG rules engine; it is a devDependency, never bundled or published, so consumers don't inherit its licence. Every catalogue card and e2e fixture is checked in light and dark. Existing violations are a shrinking ledger (`test/e2e/a11y-known.json`), never an allow-list. |
| 20 | **Pairwise 2.0: interaction on Radix, cmdk and react-day-picker (all MIT); the look stays ours** | Hand-rolled popovers, listboxes and tooltips had no arrow keys, focus return, typeahead or portals. Radix now covers every overlay, menu, tab, toast and form primitive. cmdk covers search, commands and comboboxes. react-day-picker covers the calendar grid. None ships styles, so Signal is unchanged; a pixel diff reviewed every visible change. |
| 21 | **shadcn/ui as patterns, not code** | Its components assume Tailwind and class-variance-authority, which would break the tokens-only CSS rule (#9) and add a second styling system. Pairwise adopts its compositions (Popover + cmdk = Combobox, Popover + DayPicker = DatePicker, `asChild` via Radix Slot) on its own classes and tokens. |
| 22 | **Motion and layer tokens** (`motion`, `layer` in tokens.json) | Durations and stacking were magic numbers spread across components, with tooltips below popovers. As tokens, they're one scale, the lint enforces them, and reduced motion is a single token override. |
| 23 | **GlobalSearch is the command palette** | One box for finding and doing (Ctrl+K). A separate palette would compete for the same shortcut and duplicate the matching and keyboard model. Commands are search items with `onRun`. |
| 24 | **Evidence-led scope for 2.0** | New components were added where the demo already hand-built them (avatars, details lists, tag input, pagination) or where common SaaS forms need them (radio, combobox, dates, inline edit, upload). TreeView, NotificationCenter, Stepper, FilterBuilder and WorkspaceSwitcher wait for a project that needs them; the account menu already switches organizations. |

## Known limits

- Charts are lightweight SVG with a table view. Swap to a charting library only if a project needs dense or interactive series.
- DataTable has no virtualisation or column resizing; keep it to a few hundred rows per page (or use `manual` paging),
  and only the first column can be pinned.
- Calendars are Gregorian and their labels follow the browser's locale; month names in the menus are English.
- Radix Select focuses its option one frame before it can catch Escape; tests wait that frame (people can't press
  that fast).
- Density is inherited from `<html data-density>`; a nested `data-density="compact"` (which AppShell sets by default) does not switch a comfortable page back to compact. Kept on purpose: set density once, on `<html>`.
