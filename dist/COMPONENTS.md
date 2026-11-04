# @pairwise/ui components

Generated from the component cards. Use these components for all UI; don't build your own buttons, inputs, tables, menus, modals or toasts, and don't add another UI library.

Setup: import `@pairwise/ui/fonts.css`, `@pairwise/ui/tokens.css` and `@pairwise/ui/styles.css` once; set `data-theme` (light | dark) and `data-density` (compact | comfortable) on `<html>`; wrap the app in `<PairwiseProvider>`; render `<Toaster />` once if you use `toast()`.

Styling your own layout: use the CSS variables from tokens.css (`var(--surface-raised)`, `var(--border)`, `var(--ink-muted)`, `var(--space-4)`, `var(--radius-md)`), never raw colours. Status is always icon + label + colour (`StatusBadge`); `status-critical` is the only colour that asks for action. Sentence case, no emoji.

## Icon
_Foundations_

One 16 px line icon set, drawn for this system, plus five filled status glyphs whose shape alone tells the states apart.

**Use** an icon only where it speeds up scanning: nav items, status, trace event kinds, icon-only buttons. Don't decorate headings or panels with icons.

**Consumer provides:** `name` (see the card), optional `size` (12/14/16/20) and `title`. With a `title` the icon is announced; without one it is `aria-hidden`, so the adjacent text must carry the meaning.

- Status glyphs: critical = octagon with `!`, warning = triangle with `!`, healthy = check circle, unknown = dashed circle with `?`, info = open ring. Never swap shapes between states.
- Icons inherit `currentColor`. Colour them only through a status tone class, never with a decorative hue.
- No emoji, ever.

```ts
export interface IconProps { name: string; size?: 12 | 14 | 16 | 20; title?: string; className?: string }
```

## ActionMenu
_Actions_

A "⋯" menu of actions on a row, card or page, built on Radix DropdownMenu.

**Consumer provides:** `items`: `{label, icon?, onSelect, disabled?, tone?: 'critical', shortcut?}` or `'separator'`. Optional `label` (accessible name of the default ⋯ button; name the object, e.g. "Actions for run_8f3k2"), `trigger` (your own button), `align`.

- Keyboard: Enter, Space or ↓ opens; arrows move; typing jumps; Enter runs; Esc closes and returns focus.
- Put the most common action first and destructive ones last, after a separator, with `tone: 'critical'`. Confirm destructive actions in a `Modal`.
- Use it for actions. To choose a value, use `Select` or `MenuSelect`.

```ts
export interface ActionMenuProps { items: ActionMenuEntry[]; /** accessible name of the default "⋯" button (default "More actions") */ label?: string; /** your own trigger, e.g. <Button>Actions</Button>; must forward a ref */ trigger?: React.ReactElement; align?: 'start' | 'end'; /** preview only: render the menu open */ forceOpen?: boolean }
```

## Button
_Actions_

Buttons trigger actions. Hierarchy comes from fill, not colour.

**Variants**
- `primary` (ink fill): the one action the page exists for (Approve changes, Start run). **At most one per view.**
- `secondary` (outlined): supporting actions (View diff, Export).
- `ghost`: low-emphasis and icon-only actions in toolbars.
- `danger` (critical outline): destructive or irreversible actions (Stop run, Discard changes). Always confirm with a `Modal`.
- Link button (`.pw-linkbtn`): navigation-like actions inside text and panel footers.

**Consumer provides:** children (a verb plus an object: "Revert to a1b2c3d", not "Submit"), `variant`, `icon`, `loading`, `disabled`, `onClick`. Icon-only buttons require `aria-label`.

**States:** hover (surface-hover), focus (2 px ink ring, offset 2), active (surface-selected), disabled (ink-disabled on surface-sunken), loading (spinner replaces the icon; the button keeps its width and sets `aria-busy`).

Put generous space (`space-6`) above a page's primary action. Never place two primary buttons side by side.

```ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm'; icon?: string; iconRight?: string; loading?: boolean; forceState?: 'hover' | 'active' }
```

## CopyButton
_Actions_

Copies a value to the clipboard: run ids, commit hashes, links, commands.

**Consumer provides:** `value`. Either `children` (shown as monospace text with a copy icon; use for identifiers) or nothing plus `label` (an icon-only ghost button, e.g. "Copy run link"). Optional `onCopy`.

- The icon turns into a check for 1.5 s, and screen readers hear "Copied".
- Show a shortened id if you like (`4f9c2e1`), but copy the full value.

```ts
export interface CopyButtonProps { /** the text that is copied */ value: string; /** accessible name for the icon-only form, e.g. "Copy run id" (default "Copy") */ label?: string; /** shown as the button text (e.g. the id itself); omit for an icon-only button */ children?: React.ReactNode; onCopy?: (value: string) => void }
```

## SeverityMark
_Status_

Problem severity, separate from status. The number of filled bars (4 → 1) carries the level without colour.

**Consumer provides:** `level` (1–4, 4 = most severe; map your tracker's priorities onto it), optional `count`, `showLabel`.

- Use on problems only (failed checks, blocked approvals, policy violations). Runs have a *status*, problems have a *severity*.
- Aggregates list 3 to 4 levels, most severe first, each with a count that links to the filtered list.
- The top two levels share the critical colour; the bar count tells them apart.

```ts
export interface SeverityMarkProps { level: 1 | 2 | 3 | 4; showLabel?: boolean; count?: number }
```

## StatusBadge
_Status_

The status of a thing (session, run, check, approval), always as icon + label.

**Consumer provides:** `status` (`critical` | `warning` | `healthy` | `unknown` | `info`) and an optional domain `label` ("Tests failed", "Retry 2 / 3"). Default labels: Critical, Warning, Healthy, No data, Running.

- Critical and warning sit on their `-surface` tint. Healthy, unknown and info are **icon + text only**, with no box, because healthy is quiet.
- `unknown` is for no data, stale or skipped. Never show missing data as healthy.
- `info` is neutral on purpose: running or queued work needs no attention.
- `StatusDot` (icon only) is allowed only where the row already names the state, or with a tooltip. Its label is still read by screen readers.
- **Trend** (same card): the arrow shows direction, and colour comes from the metric's `polarity` (`up-bad` for latency, failures and cost; `up-good` for pass rate and adoption). It is critical only when `breach` is set, otherwise warning. Good changes stay ink. Always print the delta and the comparison window.

```ts
export interface StatusBadgeProps { status: Status; label?: string; emphasis?: boolean; size?: 'sm'; className?: string }
```

## Tag
_Status_

A small neutral label: a topic, a label selector, an applied filter, a branch name.

**Consumer provides:** `children` (the text). Optional `mono` (identifiers), `onRemove` (adds an × button, e.g. for applied filters) and `removeLabel`.

- Tags are neutral and never carry status. For status use `StatusBadge` (icon + label + colour).
- Keep the text short; long text is truncated with an ellipsis.

```ts
export interface TagProps { children: React.ReactNode; /** identifiers: branch, commit, label selector */ mono?: boolean; /** shows a remove (×) button */ onRemove?: () => void; /** accessible name of the remove button (default "Remove <text>") */ removeLabel?: string }
```

## Checkbox
_Forms_

A checkbox with its label, built on Radix Checkbox.

**Consumer provides:** `label`, and `checked` + `onChange(checked: boolean)` (or `defaultChecked`). Optional `hint`, `error`, `disabled`, `required`, `name`, `value`.

- Use for independent on/off choices inside a form that is submitted. For a setting that applies immediately, use `Switch`.
- The whole label is clickable. Space toggles.

```ts
export interface CheckboxProps extends Omit<FieldProps, 'hideLabel'> { checked?: boolean; defaultChecked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean; required?: boolean; name?: string; value?: string; id?: string }
```

## Select
_Forms_

A single-select form field built on Radix Select.

**Consumer provides:** `label`, `options` (strings or `{value, label, meta}`), and `value` + `onChange` (or `defaultValue`). Optional `placeholder`, `hint`, `error`, `disabled`, `required`, `name` (submits with a form).

- Keyboard: Enter, Space or arrows open the list; arrows move; typing jumps to a match; Enter selects; Esc closes.
- The list renders in a portal at the end of `<body>`, so it is never clipped and still follows `data-theme` on `<html>`.
- Use `MenuSelect` for compact filter menus in toolbars; use `Select` in forms.

```ts
export interface SelectProps extends FieldProps { options: (string | Option)[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; placeholder?: string; disabled?: boolean; required?: boolean; name?: string; id?: string; className?: string }
```

## Switch
_Forms_

An on/off toggle for settings that apply immediately, built on Radix Switch.

**Consumer provides:** `label`, and `checked` + `onChange(on: boolean)` (or `defaultChecked`). Optional `hint`, `disabled`, `name`.

- The label names the setting, not the state ("Auto-merge", not "Turn on auto-merge"). The track fills with ink when on.
- Inside a form that is submitted later, use `Checkbox` instead.

```ts
export interface SwitchProps extends Omit<FieldProps, 'hideLabel' | 'error'> { checked?: boolean; defaultChecked?: boolean; onChange?: (on: boolean) => void; disabled?: boolean; name?: string; id?: string }
```

## Textarea
_Forms_

Multi-line text field. Same props as `TextInput` (native `<textarea>` props plus `label`, `hint`, `error`, `hideLabel`). Default `rows` is 4; the user can resize it vertically.

```ts
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}
```

## TextInput
_Forms_

Single-line text field with a visible label.

**Consumer provides:** `label`, plus any native `<input>` props (`value`, `onChange`, `type`, `placeholder`, `required`…). Optional `hint`, `error`, `hideLabel`. The ref goes to the `<input>`.

- Always give a label. Use `hideLabel` only where the purpose is obvious from context (a search box with a placeholder).
- `error` shows in `status-critical` with an icon and text, and sets `aria-invalid` and `aria-describedby`. Say what's wrong and how to fix it.
- Width follows the container; put fields in a grid or set the parent width.

```ts
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldProps {}
```

## Breadcrumbs
_Inputs & navigation_

Shows where an object sits and lets you climb back up without losing time range or filters.

**Consumer provides:** `items` `[{label, href?, mono?}]` (last item is the current page), `onNavigate`.

- Follow the real hierarchy, outermost first: organisation → repository → branch → run → step.
- Set identifiers in mono (`mono: true`): `sample-repo`, `feature/add-retry`, `run_8f3k2`. Truncate hashes in the middle, never the end.
- Links carry the current URL state (time, scope, filters).

```ts
export interface BreadcrumbsProps { items: { label: string; href?: string; mono?: boolean }[]; onNavigate?: (item: { label: string; href?: string; mono?: boolean }) => void }
```

## FilterBar
_Inputs & navigation_

Page-level filters that sit directly above the table or chart they filter.

**Consumer provides:** `filters` `[{key, label, options}]`, `values`, `onChange`, optional free-text `query`/`onQuery`, `count` ("7 of 212 runs"), `onClear`.

- Filters are page-local and live in the URL, so back navigation restores them.
- Always show the result count. When filters hide everything, the table's empty state names the active filters.
- Scope (organisation / repository / branch) and time are global and never repeated here.

```ts
export interface FilterBarProps { filters: { key: string; label: string; options: (string | Option)[] }[]; values: Record<string, string>; onChange?: (v: Record<string, string>) => void; query?: string; onQuery?: (q: string) => void; queryPlaceholder?: string; count?: string; onClear?: () => void; /** extra controls rendered after the filters */ children?: React.ReactNode }
```

## GlobalSearch
_Inputs & navigation_

Find anything by name: repository, branch, session, run, file, pull request. ⌘K / Ctrl+K focuses it from anywhere.

**Consumer provides:** `items` `{label, kind, status?}` (or a server-backed equivalent) and `onSelect`.

- Results show status, so search doubles as "is X OK?".
- Matching covers partial SHAs and run IDs (`run_8f3k2`), and IDs from connected tools such as your issue tracker.
- No match: say what to try, not just "No results". Pass it as `emptyHint` (e.g. "Try a run id or branch name.").
- Keyboard: arrows move, Enter opens, Esc clears.

```ts
export interface GlobalSearchProps { items?: SearchItem[]; onSelect?: (i: SearchItem) => void; placeholder?: string; /** preview only: start with this query and the results open */ forceQuery?: string; /** extra text after "No match for …", e.g. what can be searched */ emptyHint?: string }
```

## MenuSelect
_Inputs & navigation_

A compact single-select used in the scope switcher and filter bars.

**Consumer provides:** `label` (accessible name), `value`, `options` (strings or `{value, label, meta}`), `onChange`, optional `prefix` (the visible field name, e.g. "Branch") and `icon`.

- The visible text is always "prefix + current value", so a collapsed filter still says what it filters.
- Keyboard: Enter or Space opens; Tab moves through options; Enter selects; Esc closes.
- More than about 12 options: use `GlobalSearch`-style type-ahead instead of a long list.

```ts
export interface MenuSelectProps { label: string; value: string; options: (string | Option)[]; onChange?: (v: string) => void; prefix?: string; icon?: string; disabled?: boolean; width?: number; quiet?: boolean; /** preview only: render the menu open */ forceOpen?: boolean }
```

## ScopeSwitcher
_Inputs & navigation_

Organisation / repository / branch scope. It sits at the left of the top bar and its value is part of every link.

**Consumer provides:** `scope` (one value per dimension), `options` per dimension, `onChange`.

- Each dimension narrows the next: an organisation lists its repositories, a repository its branches.
- Changing scope keeps the current page and re-queries it. It never navigates home.
- Unavailable options appear with a reason ("(no access)") rather than disappearing.

The three levels are named `env`, `cloud` and `cluster`; pass whatever options your project uses.

```ts
export interface ScopeSwitcherProps { scope: Scope; options: { env: Option[]; cloud: Option[]; cluster: Option[] }; onChange?: (s: Scope) => void; compact?: boolean }
```

## Tabs
_Inputs & navigation_

Switch between views of the same object. Detail pages of the same kind always use the same tabs in the same order (for a run: Trace, Diff, Checks, Logs, Usage).

**Consumer provides:** `tabs` `[{value, label, count?, tone?, disabled?}]`, `value`, `onChange`.

- Active tab: ink, weight 600 and a 2 px ink underline. Hierarchy through weight, not colour.
- A tab count turns critical only when it counts failures ("2 failing").
- Keyboard: arrow keys move between tabs; only the active tab is in the Tab order.
- The selected tab is part of the URL.

```ts
export interface TabsProps { tabs: { value: string; label: string; count?: number | string; tone?: 'critical'; disabled?: boolean }[]; value: string; onChange?: (v: string) => void; size?: 'sm' }
```

## TimeRangePicker
_Inputs & navigation_

The one global time control. It lives in the top bar and its value travels in the URL through every drill-down.

**Consumer provides:** `value` (a relative key such as `1h`, or `absolute` text), `onChange`, `refresh` and `onRefreshChange` (`off` | `30s` | `1m` | `5m`), `onCopy` (copies a shareable range), optional `ranges` to restrict per page (a usage report might offer month to date, 6 months and year only). For custom ranges: `onAbsoluteChange({from, to})` and, optionally, `defaultAbsolute` (otherwise the last hour); show the chosen range with `absolute`.

- Times show in the user’s time zone with the zone stated (from the locale settings). Absolute fields accept `YYYY-MM-DD HH:mm`; Apply (or Enter) checks the format and that From is before To, and shows an error otherwise.
- When auto-refresh is on, the field shows the interval. Pause refresh while a drawer or modal is open, and when the tab is hidden.
- "Copy range" copies an absolute range so a pasted link shows exactly what you saw.
- Brushing a chart sets an absolute range and shows an undo chip. Never change the range silently.

```ts
export interface TimeRangePickerProps { value?: string; refresh?: 'off' | '30s' | '1m' | '5m'; onChange?: (v: string) => void; onRefreshChange?: (v: string) => void; onCopy?: (v: string) => void; ranges?: Option[]; absolute?: string; disabled?: boolean; /** preview only: render the popover open */ forceOpen?: boolean; /** initial "YYYY-MM-DD HH:mm" values for the absolute range (default: the last hour) */ defaultAbsolute?: AbsoluteRange; /** called with a validated absolute range when the user presses Apply */ onAbsoluteChange?: (r: AbsoluteRange) => void }
```

## Tooltip
_Inputs & navigation_

A short, non-interactive explanation on hover or keyboard focus.

**Consumer provides:** `content` (one line of plain text), a focusable child, optional `side`.

- Never put the only copy of important information in a tooltip. It explains, it doesn't hold data.
- Never put links or buttons inside; use a popover or drawer.
- Esc dismisses. The child gets `aria-describedby`.

```ts
export interface TooltipProps { content: React.ReactNode; side?: 'top' | 'right' | 'bottom'; children: React.ReactElement; forceOpen?: boolean }
```

## AlertBanner
_Feedback_

Page- or app-level messages that persist until the condition ends.

**Consumer provides:** `tone` (`critical` | `warning` | `info` | `healthy`), `title` (the fact, in one sentence), optional children, `meta` (source and age), `action`/`onAction`, `onDismiss`.

- At most one banner per page, the most severe. Critical banners can't be dismissed while the condition lasts.
- Say the fact and the consequence: "Check results after 14:46 may be stale", not "Something went wrong".
- `healthy` only to confirm a recovery, then auto-dismiss after 60 s.

```ts
export interface AlertBannerProps { tone: 'critical' | 'warning' | 'info' | 'healthy'; title: string; children?: React.ReactNode; meta?: string; action?: string; onAction?: () => void; onDismiss?: () => void }
```

## StateBlock
_Feedback_

Templates for loading, empty, error, no-access and degraded-data states at page, panel or table level.

**Consumer provides:** `kind`, `title` (defaults per kind), `body` (what happened and its scope), optional `detail` (a technical line: request ID, status code), `action`/`secondary`, `inline` for panels.

- **Loading:** skeleton rows shaped like the content. No spinners on whole pages.
- **Empty:** say *why* it's empty (paused, filtered, nothing ran) and the next step.
- **Error:** name the failing source ("your CI provider returned 503") and confirm what still works. Fail per panel, never the whole page.
- **No access:** say who owns it and offer a request path. Never show a blank panel.
- **Degraded:** data is stale or partial. Show last-known values greyed with their age.

```ts
export interface StateBlockProps { kind: 'loading' | 'empty' | 'error' | 'no-access' | 'degraded'; title?: string; body?: React.ReactNode; detail?: string; action?: string; onAction?: () => void; secondary?: string; onSecondary?: () => void; inline?: boolean; rows?: number }
```

## Toast
_Feedback_

Brief confirmation of an action the user just took, bottom-right, auto-dismiss after 6 s (errors stay until closed). This is the visual; in apps, show toasts with `toast()` and `<Toaster />` (see the Toaster card), which handle stacking and timing.

**Consumer provides:** `tone`, `title` (past tense, specific: "Approved run_8f3k2"), optional `body`, `action` (often Undo), `onClose`.

- Toasts confirm actions; they never announce new problems. New problems go to the bell, the nav badge and banners.
- Max 3 visible; newest at the bottom.

```ts
export interface ToastProps { tone?: Status; title: string; body?: string; action?: string; onAction?: () => void; onClose?: () => void }
```

## Toaster
_Feedback_

Shows toasts from anywhere in the app with one function call.

**Setup:** render `<Toaster />` once near the app root. **Use:** `toast("Link copied")` or `toast({ tone, title, body, action, onAction, duration })`. `toast.dismiss(id)` hides one; `toast.dismiss()` hides all.

- Toasts confirm something that already happened ("Saved", "Run re-queued"). Don't use them for errors the user must fix: show those next to the field or as an `AlertBanner`.
- They hide after 6 s. Critical ones stay until closed. Hovering or focusing the stack pauses the timer.
- At most 3 show at once (`max`), newest at the bottom.

```ts
export interface ToasterProps { /** most toasts shown at once (default 3) */ max?: number; /** position inside the nearest positioned parent instead of the window (demos) */ contained?: boolean }
```

## Drawer
_Overlays_

A side panel for details without leaving the page: a run, a tool call, a file change.

**Consumer provides:** `open`, `title` (the object's name, mono for identifiers), `subtitle` (kind, scope), children, optional `footer` actions, `onClose`, `width`.

- Opens from the right, `drawer-width` 520 px, on `surface-overlay` with `shadow-overlay` and no border.
- The page behind stays visible and is not dimmed (light scrim), so you keep your place.
- Built on Radix Dialog: focus moves into the drawer, Tab is trapped, Esc or a click outside closes it and returns focus. The open drawer is in the URL so back closes it.
- Footer: the primary action opens the full page.

```ts
export interface DrawerProps { open: boolean; title: string; subtitle?: string; onClose: () => void; footer?: React.ReactNode; width?: number; contained?: boolean; children?: React.ReactNode }
```

## Modal
_Overlays_

Blocking confirmation for consequential or irreversible actions. Rare.

**Consumer provides:** `open`, `title` (a question naming the object), children (exactly what will happen, with names in mono), `actions` (secondary Cancel + the specific action), `tone="critical"` for destructive actions (uses `alertdialog`).

- Only for confirmations and short forms. Investigations belong in drawers or pages.
- The confirm button repeats the verb and object ("Merge into main", "Stop run_8f3k2"), never "OK".
- Built on Radix Dialog: focus is trapped, the rest of the page is hidden from screen readers, and Esc, a click outside or Cancel close it and return focus to whatever opened it. `contained` renders it non-modal inside its parent (for demos).

```ts
export interface ModalProps { open: boolean; title: string; onClose: () => void; actions?: React.ReactNode; tone?: 'critical'; contained?: boolean; children?: React.ReactNode }
```

## CodeBlock
_Data display_

Monospace text with line numbers, a wrap toggle and a copy button: code, build and test logs, config, commands.

**Consumer provides:** `code` (a string; lines split on newlines). Optional `title` (file name or "Build log"), `highlight` (1-based line numbers to mark, e.g. the failing line), `lineNumbers`, `wrap`, `maxHeight` (default 320 px, then it scrolls), `copy`.

- No syntax colouring, on purpose: it keeps the one-accent rule and needs no dependency.
- The block is focusable so keyboard users can scroll it.
- For very long or live logs, show the tail (e.g. the last 500 lines) and link to the full log.

```ts
export interface CodeBlockProps { code: string; /** shown in the header bar, e.g. a file name or "Build log" */ title?: string; /** default: on when there is more than one line */ lineNumbers?: boolean; /** start with long lines wrapped (a toggle is always shown) */ wrap?: boolean; /** px; the block scrolls beyond it (default 320) */ maxHeight?: number; /** 1-based line numbers to highlight */ highlight?: number[]; /** show a copy button (default true) */ copy?: boolean }
```

## DataTable
_Data display_

The default way to show many things with a status: sessions, runs, checks, approvals, usage lines.

**Consumer provides:** `columns` `[{key, header, sortable?, sortValue?, align?, mono? (identifiers), num? (numbers, tabular), render?, width?}]`, `rows`, `rowKey`, optional `defaultSort`, `renderExpanded`, `onRowClick`, `rowTone` (critical rows get a tint), `pageSize`, `state` (`ready` | `loading` | `error`), `emptyTitle`/`emptyBody`, `errorDetail`/`onRetry`, `density` (`compact` 28 px rows | `comfortable` 36 px).

- **Sort worst-first by default** (status order: critical, warning, unknown, info, healthy).
- Numbers right-aligned with tabular figures in the sans face. Only identifiers (run IDs, SHAs, paths, branches) use mono.
- Rows are never tinted; the status badge carries the state. Put the kind or owner as a muted second line under the name instead of adding columns.
- Rows that open something are focusable and open on Enter. The expand button is separate and labelled.
- Empty states name the active filters; error states say which source failed and leave the rest of the page working.
- No virtualisation: page or filter long lists (use `pageSize`).

## Metric
_Data display_

One number that drives a decision, always shown with its context: target, delta and what to do.

**Consumer provides:** `label`, `scope` (what it measures, in mono), `value` and `unit`, `delta` (`Trend` props), `target` (limit, budget, goal), `status` (colours the figure only when breaching), `freshness`, `action`/`onAction`, optional `spark`, `state` (`ready` | `loading` | `degraded` | `error`).

- **Not a tile row.** Use a Metric only when the number changes what someone does next. Otherwise put the value in a table.
- Max 4 per page section, 6 on an overview page. Never in equal rows for decoration.
- Figure in the sans face (`figure` style, proportional digits), unit in muted text, delta with its comparison window. The figure stays ink; a breach shows as a status badge, not a red number.
- `degraded`: the data is older than 2× the refresh interval. The figure greys out and the reason is stated. `error`: say what failed and when it retries.

```ts
export interface MetricProps { label?: string; scope?: string; value?: string; unit?: string; delta?: TrendProps; target?: string; status?: Status; statusLabel?: string; freshness?: string; action?: string; onAction?: () => void; spark?: { points: number[]; threshold?: number }; state?: 'ready' | 'loading' | 'degraded' | 'error'; compact?: boolean }
```

## Panel
_Data display_

The data surface that every chart, table and list sits on.

**Consumer provides:** `title`, optional `meta` (a scope or count line), `actions`, `footer`, `flush` (body with no padding for tables), children.

- `radius-md` (6 px) corners, one `border` hairline, **no shadow**. Shadows are only for floating layers. Table cells inside stay square.
- **Never nest panels inside panels.** Group with spacing and headings instead.
- Lay panels out by priority: asymmetric columns (2 : 1, 3 : 2), worst news top-left. Equal-width rows are not the default.

```ts
export interface PanelProps { title?: string; meta?: React.ReactNode; actions?: React.ReactNode; footer?: React.ReactNode; flush?: boolean; className?: string; /** id for the title; the panel is labelled by it */ id?: string; children?: React.ReactNode }
```

## Timeline
_Data display_

Chronological events: a run's trace, a change feed, an object's history. In Pairwise this becomes the run trace (tool calls, file edits, commands, test results).

**Consumer provides:** `events` `[{time, kind, title, body?, actor?, tag?, link?, highlight?}]` and `onEvent`. Kinds: `alert` `warn` `deploy` `config` `scale` `page` `ack` `ticket` `comment` `resolve` `info` (agentic kinds arrive in Phase 4).

- Time in mono: `HH:mm:ss` in a trace, `DD Mon HH:mm` in feeds, in the user's time zone. Newest last inside a trace (it reads as a story), newest first in feeds.
- Only alert (critical), warn and resolve events are coloured; everything else stays ink.
- `highlight` marks the suspected cause (e.g. the edit that preceded the failing test).
- Every event names its source by role (agent, your CI provider, your Git host) and its actor.

```ts
export interface TimelineProps { events: TimelineEvent[]; onEvent?: (e: TimelineEvent) => void; dense?: boolean }
```

## BarChart
_Charts_

Compare quantities across categories or days; stacked for parts of a whole.

**Consumer provides:** `categories`, `series` `[{name, values, color, pattern?}]`, `stacked` (default true), `unit`, `onBar(category, index)`, `state`, `ariaLabel`.

- **One stacking dimension at a time.** Stack by repository *or* by model, never both.
- Bars that show *states* use status colours; bars that show *categories* use `chart-1`…`chart-5` + `chart-other` (validated for colour-blind separation), never status colours.
- Bars are at most 24 px thick with a 4 px rounded data-end, square at the baseline, and a 2 px surface gap between stacked segments.
- `textures` (hatch at 45°/135°) is opt-in for print, forced-colours or an accessibility setting, never on by default.
- Bars start at zero. Prefer a table over bars for more than about 12 categories.

```ts
export interface BarChartProps { categories: string[]; series: { name: string; values: number[]; color: ColorToken; pattern?: 'hatch' | 'dots' }[]; stacked?: boolean; height?: number; unit?: string; ariaLabel?: string; onBar?: (c: string, i: number) => void; state?: ViewState; /** opt-in hatch textures for print / forced colours */ textures?: boolean }
```

## BulletBar
_Charts_

A value against its limit in one line: used vs reserved vs allowed. Replaces gauges.

**Consumer provides:** `used`, `requested`, `limit` (allowed), `unit`, `label`, optional `warnAt` (default 0.8) and `critAt` (0.92).

- Track = the limit. Light band = reserved or committed. Solid bar = used, which turns warning or critical by ratio. Tick = limit.
- The percentage is printed, and it is coloured only when past a threshold.
- Use in tables (one row per repository, team or budget), not as standalone dials.

```ts
export interface BulletBarProps { used: number; requested: number; limit: number; unit?: string; warnAt?: number; critAt?: number; label?: string }
```

## Heatmap
_Charts_

Intensity across two dimensions: repository × hour, check × day, agent × minute.

**Consumer provides:** `rows`, `cols`, `values` (2-D, `null` = no data), `unit`, optional `max`, `ariaLabel`.

- **One hue (`chart-1`), light to dark.** Darker means more. Never a rainbow, never a status colour.
- No-data cells are hatched, never blank or zero.
- Put the takeaway in `ariaLabel` and the panel title ("1 repository at 94 % of its token limit").

```ts
export interface HeatmapProps { rows: string[]; cols: string[]; values: (number | null)[][]; unit?: string; max?: number; ariaLabel: string }
```

## RunStrip
_Charts_

Recent outcomes inline in a table row, so history doesn't need its own panel. In Pairwise: the steps of a run, or the last runs of a session.

**Consumer provides:** `runs` (oldest first: `healthy` | `warning` (passed after retry) | `critical` (failed) | `info` (running) | `unknown` (skipped)), `labels` (step names or run dates), `name` (for the spoken summary).

- Failed items are solid critical with ✕; retried items are warning-tinted with ↻; success is a quiet neutral cell.
- The strip is one image to screen readers, with a sentence that counts failures and lists each item.
- Use `StatusGrid` instead when the grid itself is the page's subject.

```ts
export interface RunStripProps { runs: Status[]; labels?: string[]; name?: string }
```

## Sparkline
_Charts_

Trend shape in a table cell or a Metric. No axes, so never the only place a value appears.

**Consumer provides:** `points`, optional `threshold`, `tone` (colours only the end dot), `width`/`height`, `label`.

```ts
export interface SparklineProps { points: number[]; width?: number; height?: number; threshold?: number; tone?: Status; label?: string }
```

## StatusGrid
_Charts_

History at a glance: one row per item, one cell per run. In Pairwise: the checks matrix (check × commit or check × run).

**Consumer provides:** `rows` `[{key, label}]`, `cols` (runs or commits), `cells` (2-D status), `onCell(row, col, status)`.

- Every cell carries a glyph as well as colour: ✕ failed (solid critical), ↻ passed after retry (warning tint), • running, – skipped (dashed). Plain success is a quiet neutral fill.
- Cells are buttons: click opens the run or check drawer. Each has a full spoken label.
- A key sits under every grid.

```ts
export interface StatusGridProps { rows: StatusGridRow[]; cols: string[]; cells: Status[][]; onCell?: (row: StatusGridRow, col: string, s: Status) => void; ariaLabel: string; rowLabelWidth?: number }
```

## TimeSeriesChart
_Charts_

Metrics over time. The workhorse chart.

**Consumer provides:** `series` `[{name, points, color?, dashed?}]` (`color` is a token name: `chart-1`…`chart-5`, `chart-other`; default ink), `labels`, `unit`, optional `threshold` `{value, label}`, `markers` `[{index, label}]` (changes), `onMarker`, `onBrush(from, to)`, `highlight` `[from, to]`, `state`, and an `ariaLabel` sentence that states the takeaway.

- **One series: ink**, no legend (the title names it). Comparison = `chart-other` dashed. Up to 5 categorical series (`chart-1`…`chart-5`, in order), then "Other". Prefer 3 or fewer.
- Lines are 2 px with round joins. With 2 to 4 series the legend is always shown and line ends are labelled directly when labels don't collide. Labels use text colours, never the series colour.
- Every chart has a "Show table" toggle so no value is reachable only by hovering.
- **Change markers are on by default** (dashed ink rule + diamond + mono label): merges, deploys, config changes. Clicking one opens the change.
- Thresholds are dashed `status-critical` lines with a muted text label. Never colour the series itself red.
- Y axis starts at 0 for rates and counts. Always label units. Horizontal gridlines only.
- Hover shows a crosshair with all values; brushing sets the global time range (with undo).

```ts
export interface TimeSeriesChartProps { series: { name: string; points: (number | null)[]; color?: ColorToken; dashed?: boolean }[]; labels: string[]; unit?: string; height?: number; threshold?: { value: number; label: string }; markers?: ChartMarker[]; yMax?: number; yMin?: number; onMarker?: (m: ChartMarker) => void; onBrush?: (from: number, to: number) => void; highlight?: [number, number]; /** shaded y band [from, to], e.g. a normal range */ band?: [number, number]; ariaLabel: string; decimals?: number; state?: ViewState; /** 'Show table' toggle, default true */ table?: boolean; /** direct end labels for 2–4 series when they don't collide, default true */ endLabels?: boolean }
```

## AppShell
_Shell_

The single application frame: side nav, top bar and content. Every screen uses it.

**Consumer provides:** `nav` (a `SideNav`), `top` (a `TopBar`), children (page header + page), `density` (`compact` | `comfortable`), optional `forceWidth` for documentation.

**Responsive rules** (by container width, desktop-first at 1440):
- **≥ 1360 px:** rail expanded (`rail-expanded` 216 px) with group labels and counts.
- **1024–1359 px (incl. 1280):** rail collapses to `rail-collapsed` 52 px icons with tooltips; problem counts become a critical dot; the scope switcher drops its last field (it moves to page filters).
- **< 1024 px (tablet):** rail hidden behind a menu button and opens as an overlay; the time picker hides its refresh label; panels stack to one column.

Density: compact on working views (traces, diffs, queues), comfortable on overview and reporting pages (`data-density` on the shell or `<html>`).

```ts
export interface AppShellProps { nav: React.ReactElement<SideNavProps>; top: React.ReactElement<TopBarProps>; density?: Density; forceWidth?: number; children?: React.ReactNode }
```

## PageHeader
_Shell_

Top of every page: where you are, what this is, its state, and what you can do.

**Consumer provides:** `crumbs`, optional `back` (a ghost button naming where it returns to, with time and filters kept), `title` (`titleMono` for identifiers), `status`, `meta` (repository, branch, commit, owner), `actions` (max one primary), `tabs`.

- Left-aligned. The title is the object's real name (`run_8f3k2`, `feature/add-retry`), not "Run details".
- `back` appears when the user arrived by drill-down, and names the origin page.

```ts
export interface PageHeaderProps { crumbs?: React.ReactNode; back?: React.ReactNode; title: string; titleMono?: boolean; status?: React.ReactNode; /** a short sentence, or labelled fields (preferred) */ meta?: React.ReactNode | PageHeaderField[]; actions?: React.ReactNode; tabs?: React.ReactNode }
```

## SideNav
_Shell_

Primary navigation, grouped by kind.

**Consumer provides:** `active` (key), `onNavigate(key)`, `badges` `{key: {count, tone?}}`, optional `nav` to reorder or pin per role, `collapsed`.

- The selected item gets a `surface-selected` fill and weight 600. No coloured edge stripe.
- Only problem counts (failing checks, pending approvals past their deadline) are critical; other counts stay muted.
- Role changes which item is Home and the default pins, never what is reachable.
- New object types are added inside an existing group, not as new groups.

The default item list is only a sample. Every project passes its own `nav`.

```ts
export interface SideNavProps { active: string; onNavigate?: (key: string) => void; collapsed?: boolean; badges?: Record<string, { count: number; tone?: 'critical' }>; nav?: NavGroup[]; /** set by AppShell below 1024 px */ overlay?: boolean; onClose?: () => void }
```

## TopBar
_Shell_

Global controls, left to right: scope, search, time range, notifications, account.

**Consumer provides:** `scope`/`scopeOptions`/`onScope`, `time`/`onTime`, `refresh`/`onRefresh`, `searchItems`/`onSearch`, `alerts` (count of items needing you), `onAlerts`, `onCopyRange`, `user` (avatar initials) and `accountLabel` (its accessible name, e.g. "Account: Dev A").

- Everything here is global and URL-backed. Page-specific controls never go in the top bar.
- The count is what needs a person (pending approvals, failed runs you own), not raw events.

```ts
export interface TopBarProps { scope: Scope; scopeOptions: ScopeSwitcherProps['options']; onScope?: (s: Scope) => void; time?: string; onTime?: (t: string) => void; refresh?: TimeRangePickerProps['refresh']; onRefresh?: (r: string) => void; searchItems?: SearchItem[]; onSearch?: (i: SearchItem) => void; alerts?: number; onAlerts?: () => void; onCopyRange?: () => void; /** avatar initials */ user?: string; /** accessible name of the account button, e.g. "Account: Dev A" (default "Account") */ accountLabel?: string; /** set by AppShell */ onMenu?: () => void; /** set by AppShell from its width */ mode?: ShellMode }
```
