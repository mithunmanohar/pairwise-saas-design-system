# @pairwise/ui components

Generated from the component cards. Use these components for all UI; don't build your own buttons, inputs, tables, menus, modals or toasts, and don't add another UI library.

Setup: import `@pairwise/ui/fonts.css`, `@pairwise/ui/tokens.css` and `@pairwise/ui/styles.css` once; set `data-theme` (light | dark), `data-density` (compact | comfortable) and optionally `data-font` (atkinson | inter | plex | system) on `<html>`; wrap the app in `<PairwiseProvider>`; render `<Toaster />` once if you use `toast()`.

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
export interface IconProps { name: IconName; size?: 12 | 14 | 16 | 20; title?: string; className?: string }
```

## ActionMenu
_Actions_

A "⋯" menu of actions on a row, card or page, built on Radix DropdownMenu.

**Consumer provides:** `items`: `{label, icon?, onSelect, disabled?, tone?: 'critical', shortcut?, meta?, checked?}`, `{heading}` or `'separator'`. Optional `label` (accessible name of the default ⋯ button; name the object, e.g. "Actions for run_8f3k2"), `trigger` (your own button), `align`, `header` (non-interactive content above the items, e.g. who is signed in).

- `{heading: "Switch organization"}` labels the group below it. `checked` marks the current choice in such a group: a tick, announced as checked. `meta` is muted text on the right (a role, a count).

- Keyboard: Enter, Space or ↓ opens; arrows move; typing jumps; Enter runs; Esc closes and returns focus.
- Put the most common action first and destructive ones last, after a separator, with `tone: 'critical'`. Confirm destructive actions in a `Modal`.
- Use it for actions. To choose a value, use `Select` or `MenuSelect`.

```ts
export interface ActionMenuProps { items: ActionMenuEntry[]; /** accessible name of the default "⋯" button (default "More actions") */ label?: string; /** your own trigger, e.g. <Button>Actions</Button>; must forward a ref */ trigger?: React.ReactElement; align?: 'start' | 'end'; /** non-interactive content above the items, e.g. who is signed in */ header?: React.ReactNode; /** preview only: render the menu open */ forceOpen?: boolean }
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
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm'; icon?: IconName; iconRight?: IconName; loading?: boolean; forceState?: 'hover' | 'active'; /** render the single child (e.g. a router <a>) with button styling instead of a <button> */ asChild?: boolean }
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
export interface CheckboxProps extends FieldProps { /** "indeterminate" shows a dash: some, not all, are selected */ checked?: boolean | 'indeterminate'; defaultChecked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean; required?: boolean; name?: string; value?: string; id?: string }
```

## Combobox
_Forms_

Pick one, or several with `multiple`, from a list that is long enough to search. It is the Select you can type into, and the tag input. Built on Radix Popover + cmdk (the shadcn/ui pattern), styled as Signal.

**Consumer provides:** `label`, `options` (strings or `{value, label, meta, description, keywords, disabled}`), and `value` + `onChange` (or `defaultValue`). With `multiple`, the value is a string array.

**Optional:**
- `placeholder`, `searchPlaceholder`, `emptyText`.
- `clearable` (single, default true).
- `creatable` + `onCreate` ("Create “x”").
- For server search: `onQueryChange`, `filter={false}` and `loading`.
- `name` (hidden inputs), `hint`, `error`, `required`, `disabled`.

- The trigger is a combobox button. Enter, Space or ↓ opens it, and typing a letter opens it with that letter in the search. In the list, arrows, Home/End and Enter work, and the highlighted option is announced. Esc closes and returns focus.
- Single: a pick closes the list; the clear button empties it. Multiple: the list stays open and picks show as removable tags; Backspace on the trigger removes the last one.
- Matching: every word must appear in the label, meta, description or keywords; labels that start with the query rank first.
- Use `Select` for short fixed lists (under about 10 options) and `MenuSelect` in toolbars.

## DatePicker
_Forms_

One date, typed as `YYYY-MM-DD` or picked from a calendar. The calendar is react-day-picker in a Radix Popover (the shadcn/ui pattern), styled as Signal.

**Consumer provides:** `label`, and `value` + `onChange` (or `defaultValue`), as a `"YYYY-MM-DD"` string or `null`. Optional `min`, `max`, `isDateDisabled(iso)`, `clearable` (default true), `hint`, `error`, `required`, `disabled`, `name`.

- Dates are local calendar dates with no time zone, so they never shift by a day. Use `toISODate` and `parseISODate` to convert.
- Typing is checked on blur or Enter, with a specific message for each problem: the format, before `min`, after `max`, or an unavailable date.
- The calendar opens on the chosen date (or today), with focus on it. Arrows move by day and week, PageUp/PageDown by month (Shift: by year), Home/End to the ends of the week, and Enter picks. Month and year menus jump further. The week starts on the locale's first day.
- Disabled dates are struck through and skipped by the keyboard.

```ts
export interface DatePickerProps extends FieldProps { value?: ISODate | null; defaultValue?: ISODate | null; onChange?: (v: ISODate | null) => void; /** earliest allowed */ min?: ISODate; /** latest allowed */ max?: ISODate; isDateDisabled?: (d: ISODate) => boolean; /** a clear button (default true) */ clearable?: boolean; disabled?: boolean; name?: string; id?: string; placeholder?: string }
```

## DateRangePicker
_Forms_

A start and an end date, with presets. Use it in filter toolbars and reports. For the global time range of an ops view, use `TimeRangePicker`.

**Consumer provides:** `label`, and `value` + `onChange` (or `defaultValue`), as `{from, to}` (`"YYYY-MM-DD"`) or `null`. Optional `presets` (default: last 7 and 30 days, this and last month; `[]` for none), `min`, `max`, `maxDays`, `isDateDisabled`, `placeholder`, `hint`, `error`, `required`, `disabled`.

- A preset applies at once. A range picked on the calendar is a draft: Apply commits it, and Cancel or Esc discards it. Focus returns to the trigger either way.
- The footer states the range and its length ("2026-11-03 to 2026-11-12, 10 days"), or what's needed next. A range longer than `maxDays` can't be applied, and the footer says why.
- Two months side by side; one month on phones, with the presets above it.
- Keyboard: the same as `DatePicker`, then Tab reaches Cancel and Apply.

```ts
export interface DateRangePickerProps extends FieldProps { value?: DateRangeValue | null; defaultValue?: DateRangeValue | null; onChange?: (v: DateRangeValue | null) => void; min?: ISODate; max?: ISODate; /** longest allowed range, in days */ maxDays?: number; isDateDisabled?: (d: ISODate) => boolean; /** default: last 7 and 30 days, this and last month; [] for none */ presets?: DateRangePreset[]; placeholder?: string; disabled?: boolean; id?: string; /** preview only */ forceOpen?: boolean }
```

## Field
_Forms_

The label, hint, error and "Required" marker that every form control shares. TextInput, Textarea, Select, Checkbox and Switch are built on it; use it directly to put any other control into a form.

**Consumer provides:** `label` and a render function as children, which receives the props to spread on the focusable element: `id`, `aria-describedby`, `aria-invalid` and `aria-required`. Optional `hint`, `error`, `required`, `hideLabel` and `id`.

```tsx
<Field label="Retention" hint="Days to keep run logs." error={err}>
  {(p) => <input className="pw-input" type="number" {...p} />}
</Field>
```

- `required` shows a muted "Required" after the label and sets `aria-required`. The visible word is hidden from screen readers, which already announce "required".
- `error` is shown in `status-critical` with an icon. It sets `aria-invalid` and is read after the hint.
- `readOnly` inputs get the sunken surface and stay focusable and copyable. Use `disabled` only when the value doesn't apply.
- Every control forwards its ref to the focusable element, so form libraries (for example react-hook-form `register` or `Controller`) can focus the first invalid field.
- Checkbox takes `checked="indeterminate"` for a select-all that covers some, not all, rows.

```ts
export interface FieldProps { label: string; /** keep the label for screen readers only */ hideLabel?: boolean; hint?: string; /** shown in status-critical with an icon; sets aria-invalid */ error?: string; /** shows a muted "Required" after the label and sets aria-required */ required?: boolean }
```

## FileUpload
_Forms_

Add files by dropping them or choosing them, see each upload's progress, and retry or remove it. You own the upload: the component handles choosing, checking and showing files.

**Consumer provides:** `label`, `onFiles(files)` (the accepted files), and `files`: your uploads as `{id, name, size, status, progress?, error?}`, where `status` is `queued`, `uploading`, `done` or `error`. Also `onRemove(id)` and `onRetry(id)`. Optional `accept` (e.g. `".json,.txt"` or `"image/*"`), `maxSize` (bytes), `multiple` (default true), `maxFiles`, `hint`, `error`, `required`, `disabled`.

- "Choose files" is the keyboard path; the drop zone is for the mouse. Dropping highlights the zone.
- Files are checked for type, size and count before `onFiles`. Rejected files are listed with the reason ("Larger than 5 MB.") until dismissed.
- Each file shows its name (mono), size, a `ProgressBar` while uploading, and Retry after an error. Remove and Dismiss are named after the file.
- A polite status message announces what happened ("2 files added. photo.png: not an accepted type").

```ts
export interface FileUploadProps { label: string; hint?: string; error?: string; required?: boolean; /** e.g. ".json,.txt" or "image/*" */ accept?: string; /** bytes */ maxSize?: number; multiple?: boolean; maxFiles?: number; /** your uploads and their state */ files?: UploadItem[]; /** accepted files to upload */ onFiles?: (files: File[]) => void; onRemove?: (id: string) => void; onRetry?: (id: string) => void; disabled?: boolean; id?: string }
```

## InlineEdit
_Forms_

A value that you edit where it is shown, such as a details field or a description. Use it inside `KeyValueList`, panels and page headers.

**Consumer provides:** `label` (names the value), `value`, `onSave(value)`. `onSave` may return a promise. Optional `validate(value)` (return a message to block saving), `multiline`, `mono`, `placeholder`, `emptyText` (default "Not set"), `disabled`.

- Click it, or press Enter on it, to edit. The field opens focused with the text selected.
- Saving: Enter in a single-line field, Ctrl/⌘+Enter in a multiline one, or the Save button.
- Cancelling: Esc or the Cancel button restores the value.
- While saving, the field stays focused and read-only and the button says "Saving…". If `onSave` rejects, the field stays open with the error's message. When editing ends, focus returns to the value.
- The view is a button named "Description: … , edit". The pencil appears on hover and focus.
- Use a form with a Save button when several fields change together.

```ts
export interface InlineEditProps { value: string; /** may return a promise; a rejection keeps the field open with its message */ onSave: (v: string) => void | Promise<void>; /** names the value ("Description") */ label: string; placeholder?: string; /** shown when empty (default "Not set") */ emptyText?: string; /** return a message to block saving */ validate?: (v: string) => string | null; multiline?: boolean; mono?: boolean; disabled?: boolean; /** show the label above the field while editing (default hidden) */ hideLabel?: boolean }
```

## RadioGroup
_Forms_

One choice from a few options that should all be visible at once, each with an optional description. Built on Radix RadioGroup.

**Consumer provides:** `label`, `options` (strings or `{value, label, description, disabled}`), and `value` + `onChange` (or `defaultValue`). Optional `orientation` (`vertical` | `horizontal`), `hint`, `error`, `required`, `disabled`, `name`.

- Keyboard: Tab enters at the selected option; arrows move and select; disabled options are skipped.
- The group is named by its visible label and described by the hint and error. Each option is described by its description.
- Use RadioGroup for 2 to 5 options whose differences need words. For more options use `Select` or `Combobox`; for view switches use `SegmentedControl`.

```ts
export interface RadioGroupProps extends FieldProps { options: (string | RadioOption)[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; orientation?: 'vertical' | 'horizontal'; disabled?: boolean; name?: string; id?: string }
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
export interface SwitchProps extends Omit<FieldProps, 'hideLabel' | 'required'> { checked?: boolean; defaultChecked?: boolean; onChange?: (on: boolean) => void; disabled?: boolean; name?: string; id?: string }
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

**Consumer provides:** `items` `[{label, href?, mono?, icon?}]` (last item is the current page), `onNavigate`, optional `maxItems`.

- Follow the real hierarchy, outermost first: organisation → repository → branch → run → step.
- Set identifiers in mono (`mono: true`): `sample-repo`, `feature/add-retry`, `run_8f3k2`. Truncate hashes in the middle, never the end.
- Links carry the current URL state (time, scope, filters).
- **Ownership paths:** set `maxItems` so the levels above the current scope fold into a "…" menu. The current page always shows. Never spell out Company › Function › Squad on every page; the ownership scope in the top bar already says where you are.
- Use `icon: entityIcon[kind]` to mark each level's kind with its line icon, and never with colour.
- The "…" button is named "Show 3 more levels" and opens a menu of the hidden levels: arrows to move, Enter to go, Esc to close.

```ts
export interface BreadcrumbsProps { items: BreadcrumbItem[]; onNavigate?: (item: BreadcrumbItem) => void; /** show at most this many; the earlier levels fold into a "…" menu (the current page always shows) */ maxItems?: number }
```

## FilterBar
_Inputs & navigation_

Page-level filters that sit directly above the table or chart they filter.

**Consumer provides:** `filters` `[{key, label, options}]`, `values`, `onChange`, optional free-text `query`/`onQuery`, `count` ("7 of 212 runs"), `onClear`.

- Filters are page-local and live in the URL, so back navigation restores them.
- Always show the result count. It sits at the right edge; "Clear" appears to its left, so the count never moves.
- Each filter keeps the width of its widest option, so choosing a value never moves the filters after it.
- When filters hide everything, the table's empty state names the active filters.
- Scope (organisation / repository / branch) and time are global and never repeated here.

```ts
export interface FilterBarProps { filters: { key: string; label: string; options: (string | Option)[] }[]; values: Record<string, string>; onChange?: (v: Record<string, string>) => void; query?: string; onQuery?: (q: string) => void; queryPlaceholder?: string; count?: string; onClear?: () => void; /** extra controls rendered after the filters */ children?: React.ReactNode }
```

## GlobalSearch
_Inputs & navigation_

Find anything by name and run commands: repository, branch, session, run, file, pull request, "Go to incidents", "Toggle theme". Ctrl+K (⌘K on Apple devices) focuses it from anywhere. It is the command palette too: there is no separate one.

**Consumer provides:** `items` and `onSelect`. An item is `{label, kind?, status?, group?, description?, keywords?, shortcut?, icon?, id?, onRun?}`: `onRun` makes it a command, `group` sections the results ("Commands", "Runs"), `keywords` add synonyms. Optional `recent` (shown when the box is focused and empty), `limit` (default 7), `emptyHint`. For server search: `onQueryChange(q)`, `filter={false}` (show items as given) and `loading`.

- Results show status, so search doubles as "is X OK?".
- Matching covers partial SHAs and run IDs (`run_8f3k2`), and IDs from connected tools such as your issue tracker.
- No match: say what to try, not just "No results". Pass it as `emptyHint` (e.g. "Try a run id or branch name.").
- Built on cmdk: a combobox with a listbox of results. The highlighted result is announced (`aria-activedescendant`). Arrows move, Enter opens or runs, Esc closes the list, then clears, then leaves.
- Local matching: every word must appear in the label, kind, description or keywords; labels that start with the query rank first.
- Only the most recently mounted search owns the shortcut, and the hint shows the right keys for the platform. Turn it off with `shortcut={false}`.

```ts
export interface GlobalSearchProps { items?: SearchItem[]; onSelect?: (i: SearchItem) => void; placeholder?: string; /** preview only: start with this query and the results open */ forceQuery?: string; /** extra text after "No match for …", e.g. what can be searched */ emptyHint?: string; /** shown under "Recent" when the box is focused and empty */ recent?: SearchItem[]; /** shows "Searching…" (while you fetch results for onQueryChange) */ loading?: boolean; /** called on every keystroke, e.g. to fetch results */ onQueryChange?: (q: string) => void; /** filter items locally (default true); false shows items as given */ filter?: boolean; /** most results shown (default 7) */ limit?: number; /** Ctrl+K / ⌘K focuses this box (default true) */ shortcut?: boolean; /** accessible name (default "Search") */ label?: string }
```

## MenuSelect
_Inputs & navigation_

A compact single-select used in the scope switcher and filter bars.

**Consumer provides:** `label` (accessible name), `value`, `options` (strings or `{value, label, meta, disabled}`), `onChange`, optional `prefix` (the visible field name, e.g. "Branch") and `icon`.

- The visible text is always "prefix + current value", so a collapsed filter still says what it filters.
- The trigger keeps the width of its widest option, so choosing a value never moves the controls next to it.
- Built on Radix DropdownMenu as a menu of radio items: Enter, Space or ↓ opens it on the current value; arrows, Home/End and typing a letter move; Enter selects; Esc closes. Focus returns to the trigger. The menu renders in a portal, so it is never clipped.
- Its accessible name is its visible text: the prefix (or a hidden "Label:") and the value, so speech-input users can say what they see.
- More than about 12 options: use `GlobalSearch`-style type-ahead instead of a long list.

```ts
export interface MenuSelectProps { label: string; value: string; options: (string | Option)[]; onChange?: (v: string) => void; prefix?: string; icon?: IconName; disabled?: boolean; width?: number; quiet?: boolean; /** preview only: render the menu open */ forceOpen?: boolean }
```

## ScopePicker
_Inputs & navigation_

The ownership scope, shown once, in the top bar. The chip names the current node and its kind ("AI transformation · Initiative") and never the levels above it. It opens search across the organisation, "Up to <parent>", "Whole organisation" and the tree around the current node.

**Consumer provides:** `nodes` (the same tree as the explorer), `value` (a node id, or `null` for the whole organisation) and `onChange(id | null)`. Optional `label` (default "Ownership scope"), `wholeLabel` and `loadChildren`.

- Put it in `TopBar`'s `ownership` slot. The runtime scope (environment, region…) stays separate, in `ScopeSwitcher`.
- Search (cmdk) matches names, kinds and keywords. Each result shows its path as a muted line, the one place outside the explorer where the path appears. The highlighted result is announced.
- Choosing a node closes the popover and returns focus to the chip. Keep the scope in the URL so every page, link and back button keeps it.
- The chip's hover title shows the full path.

```ts
export interface ScopePickerProps {
```

## ScopeSwitcher
_Inputs & navigation_

The **runtime scope**: where things run (environment, region, cluster, namespace). It sits in the top bar and its value is part of every link.

**Consumer provides:** `dimensions` `[{key, label, value, options, onChange}]` in order, or the 1.x `scope` + `options` + `onChange` (environment / cloud / cluster). Optional `compact` (only the first two) and `label` (the group's name, default "Environment").

- Runtime scope is not ownership. Who owns something (company, function, squad, initiative, project) is the ownership scope, chosen in the Resource Explorer or the scope picker. The two change independently: switching `prod` to `staging` keeps the same initiative in view.
- Changing scope keeps the current page and re-queries it. It never navigates home.
- Each field keeps the width of its widest option, so switching (`prod` to `staging`) never moves the search box.
- Unavailable options appear with a reason ("(no access)") rather than disappearing.

```ts
export interface ScopeSwitcherProps { scope?: Scope; options?: ScopeOptions; onChange?: (s: Scope) => void; /** any runtime dimensions, in order; replaces scope / options */ dimensions?: ScopeDimension[]; /** show only the first two dimensions (narrow top bars) */ compact?: boolean; /** accessible name of the group (default "Environment") */ label?: string }
```

## SegmentedControl
_Inputs & navigation_

Two to five mutually exclusive options shown side by side, such as a view mode, an auto-refresh interval or a chart range. Built on Radix ToggleGroup as a radio group.

**Consumer provides:** `label` (the group's accessible name), `options` (strings or `{value, label, disabled}`), and `value` + `onChange` (or `defaultValue`). Optional `size="sm"` and `disabled`.

- Keyboard: Tab enters at the selected option; arrows move; Space or Enter selects. Disabled options are skipped.
- Selected labels reserve their bold width, so switching never moves the options.
- It always has a value. For more than five options, or options that need explaining, use `Select` or `RadioGroup`.

```ts
export interface SegmentedControlProps { /** accessible name of the group, e.g. "Auto-refresh" */ label: string; options: (string | Option)[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; disabled?: boolean; size?: 'sm' }
```

## Tabs
_Inputs & navigation_

Switch between views of the same object. Detail pages of the same kind always use the same tabs in the same order (for a run: Trace, Diff, Checks, Logs, Usage).

**Consumer provides:** `tabs` `[{value, label, count?, tone?, disabled?}]`, `value`, `onChange`, optional `label` (the tab list's name). Optionally the panels as children: `<Tabs …><TabPanel value="trace">…</TabPanel></Tabs>` links each tab to its panel.

- Active tab: ink, weight 600 and a 2 px ink underline. Hierarchy through weight, not colour.
- Every tab reserves the width of its bold label, so switching tabs never moves the others.
- A tab count turns critical only when it counts failures ("2 failing").
- Built on Radix Tabs. Arrow keys move and select (wrapping), Home/End jump, disabled tabs are skipped; only the active tab is in the Tab order.
- Without `TabPanel` children (as in `PageHeader`) the tabs switch the page's content and don't point at a panel.
- The selected tab is part of the URL.

```ts
export interface TabsProps { tabs: { value: string; label: string; count?: number | string; tone?: 'critical'; disabled?: boolean }[]; value: string; onChange?: (v: string) => void; size?: 'sm'; /** accessible name of the tab list */ label?: string; /** <TabPanel> elements; links each tab to its panel */ children?: React.ReactNode }
```

## TimeRangePicker
_Inputs & navigation_

The one global time control. It lives in the top bar and its value travels in the URL through every drill-down.

**Consumer provides:** `value` (a relative key such as `1h`, or `absolute` text), `onChange`, `refresh` and `onRefreshChange` (`off` | `30s` | `1m` | `5m`), `onCopy` (copies a shareable range), optional `ranges` to restrict per page (a usage report might offer month to date, 6 months and year only). For custom ranges: `onAbsoluteChange({from, to})` and, optionally, `defaultAbsolute` (otherwise the last hour); show the chosen range with `absolute`.

- The button keeps the width of its widest range, and the auto-refresh slot always shows (a pause icon and "off" when off), so changing either never resizes it.
- Times show in the user’s time zone with the zone stated (from the locale settings). Absolute fields accept `YYYY-MM-DD HH:mm`; Apply (or Enter) checks the format and that From is before To, and shows an error otherwise.
- When auto-refresh is on, the field shows the interval. Pause refresh while a drawer or modal is open, and when the tab is hidden.
- "Copy range" copies an absolute range so a pasted link shows exactly what you saw. With an absolute range set, `onCopy` receives it.
- Built on Radix Popover. It opens on the current range, with focus on it. The relative ranges are a radio group: arrows move without applying, Enter or Space applies and closes. Auto-refresh is a `SegmentedControl`. Esc closes and returns focus to the button.
- Brushing a chart sets an absolute range and shows an undo chip. Never change the range silently.

```ts
export interface TimeRangePickerProps { value?: string; refresh?: 'off' | '30s' | '1m' | '5m'; onChange?: (v: string) => void; onRefreshChange?: (v: string) => void; onCopy?: (v: string) => void; ranges?: Option[]; absolute?: string; disabled?: boolean; /** preview only: render the popover open */ forceOpen?: boolean; /** initial "YYYY-MM-DD HH:mm" values for the absolute range (default: the last hour) */ defaultAbsolute?: AbsoluteRange; /** called with a validated absolute range when the user presses Apply */ onAbsoluteChange?: (r: AbsoluteRange) => void }
```

## Tooltip
_Inputs & navigation_

A short, non-interactive explanation on hover or keyboard focus.

**Consumer provides:** `content` (one line of plain text), a focusable child that forwards its ref (Button, a link), optional `side` (`top` | `right` | `bottom` | `left`).

- Never put the only copy of important information in a tooltip. It explains, it doesn't hold data.
- Never put links or buttons inside; use a popover or drawer.
- Built on Radix Tooltip. It opens after 400 ms on hover, at once on keyboard focus, and Esc dismisses it. The child gets `aria-describedby`.
- It renders in a portal on top of everything (`z-tooltip`) and flips or shifts to stay on screen, so a scroll area can't clip it.
- Tooltips inside one `TooltipProvider` share a skip delay: moving along a row of icons opens each at once. `AppShell` provides one; wrap other areas in `<TooltipProvider>` if they have many tooltips.

```ts
export interface TooltipProps { content: React.ReactNode; side?: 'top' | 'right' | 'bottom' | 'left'; /** the trigger; must forward a ref and be focusable */ children: React.ReactElement; forceOpen?: boolean }
```

## TreeView
_Inputs & navigation_

The ownership tree: company, business function, squad, initiative, project, and groups of resources under them. Built on React Aria's Tree (a `treegrid`).

**Consumer provides:** `nodes` (`{id, kind, label, status?, statusCount?, meta?, children?, hasChildren?, noAccess?, keywords?}`), `label`, and usually `selectedId` + `onSelect`. Optional `expandedIds` / `defaultExpandedIds` / `onExpandedChange`, `loadChildren(node)` for nodes with `hasChildren`, `filter`, `state` (`ready` | `loading` | `error`) and `emptyText`.

- **Keyboard:** ↑↓ move, → expands (or goes to the first child), ← collapses (or goes to the parent), Home/End, and typing a name jumps to it. Enter, Space or a click selects. Arrows never change the selection on their own, so moving through the tree doesn't change the scope.
- **Each row** shows the kind's line icon and the name. On the right is the worst status below that node with a count, or a muted count. Healthy and no-data show nothing (healthy is quiet). Kinds are told apart by icon and label, never by colour.
- **Resources** sit under their owner in groups by type (`kind: "resources"`, "Pipelines 3"), loaded on expand, so thousands of assets never become tree leaves.
- **`filter`** keeps matches and their ancestors, expanded. **`noAccess`** nodes show greyed with a lock, as context.
- **Use it in exactly two places:** the Resource Explorer (in a `SplitView`) and inside `ScopePicker`. Other pages show the scope as a chip, not a tree.

```ts
export interface TreeViewProps {
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

## ProgressBar
_Feedback_

How far along a task is: a rollout, an upload, an index build. Built on Radix Progress.

**Consumer provides:** `label` and `value` (0..`max`, or `null` while the amount is unknown). Optional `max` (default 100), `valueText` (what is shown and read instead of "42 %", e.g. "3 of 12 replicas"), `tone`, `hint`, `hideLabel`, `showValue`.

- `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and `aria-valuetext`, named by its visible label.
- The fill is neutral ink. Use `tone="warning"` or `"critical"` only when the task itself is at risk or failing, never to decorate. Healthy stays quiet.
- Indeterminate progress slides; with reduced motion it is a still, half-tone bar.
- For used-versus-limit (a quota, not a task), use `BulletBar`.

```ts
export interface ProgressBarProps { /** 0..max, or null for indeterminate */ value: number | null; max?: number; label: string; hideLabel?: boolean; /** what is read and shown instead of "42 %", e.g. "3 of 12 replicas" */ valueText?: string; /** ink (default); warning or critical when the progress itself is at risk */ tone?: 'ink' | 'warning' | 'critical'; hint?: string; /** show the value text (default true) */ showValue?: boolean }
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
- They hide after 6 s. Critical ones stay until closed. Hovering or focusing a toast, or leaving the window, pauses the timer.
- Built on Radix Toast. The notification region is always in the page, so the first toast is announced too. Critical toasts are announced assertively, others politely. F8 moves focus to the toasts; on touch screens a toast can be swiped away.
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

**Consumer provides:** `open`, `title` (a question naming the object), children (exactly what will happen, with names in mono), `actions` (secondary Cancel + the specific action), `tone="critical"` for destructive actions.

- Only for confirmations and short forms. Investigations belong in drawers or pages.
- The confirm button repeats the verb and object ("Merge into main", "Stop run_8f3k2"), never "OK".
- Built on Radix Dialog: focus is trapped, the rest of the page is hidden from screen readers, and Esc, a click outside or Cancel close it and return focus to whatever opened it. `contained` renders it non-modal inside its parent (for demos).
- `tone="critical"` makes it an `alertdialog`: its body is read as the description when it opens, and a click outside doesn't dismiss it (Esc, Close and the actions still do).
- Fades in (dialog moves 8 px). Off with reduced motion.

```ts
export interface ModalProps { open: boolean; title: string; onClose: () => void; actions?: React.ReactNode; tone?: 'critical'; contained?: boolean; children?: React.ReactNode }
```

## Popover
_Overlays_

A small, non-modal floating panel: filters, a details preview, a short form. Built on Radix Popover.

**Consumer provides:** `trigger` (an element that forwards a ref, such as `Button`), `label` (the popover's accessible name), and the content as children. Optional `open` + `onOpenChange` (controlled) or `defaultOpen`, `side` (`top` | `right` | `bottom` | `left`, default `bottom`), `align` (`start` | `center` | `end`, default `start`) and `width`.

- Wrap a button inside in `PopoverClose` to close the popover when it's pressed (Apply, Cancel, Done).
- Keyboard: Enter or Space on the trigger opens it and moves focus inside; Tab moves through its content; Esc closes and returns focus to the trigger. Clicking outside closes it.
- It renders in a portal above modals and drawers (`z-popover`), flips or shifts to stay on screen, and fades in 4 px from its trigger. Reduced motion turns that off.
- Use `Modal` for decisions that must block the page, `ActionMenu` for a list of commands, and `Tooltip` for a short, non-interactive hint.

```ts
export interface PopoverProps {
```

## Avatar
_Data display_

A person or team: their image, or their initials on a neutral fill. `AvatarGroup` overlaps several, with "+N" for the rest. Built on Radix Avatar, which shows the initials until the image loads, or if it fails.

**Consumer provides:** `name`. Optional `src`, `size` (20, 28 default, 32 or 36), `status` (a small status mark), `initials` (to override them) and `decorative` (when the name is already written next to it). AvatarGroup: `people` `[{name, src?}]`, `max` (default 4), `size`, `label` (e.g. "Reviewers").

- No colour per person: Signal keeps colour for status. Tell people apart by name and image.
- An avatar is an image named after the person ("Dev F, critical"). A group is named "Reviewers: Dev A, Dev B, Dev C and 3 others".
- Avatars aren't buttons. Wrap one in a button or link only when it opens the person, and name that.

```ts
export interface AvatarProps { /** the person or team; used for the initials and the accessible name */ name: string; src?: string; size?: 20 | 28 | 32 | 36; /** a small status mark in the corner */ status?: Status; /** hide from screen readers when the name is written next to it */ decorative?: boolean; /** override the derived initials */ initials?: string }
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

**Consumer provides:** `columns` `[{key, header, sortable?, sortValue?, align?, mono? (identifiers), num? (numbers, tabular), render?, width?, hidden?, hideable?, pin?}]`, `rows`, `rowKey`, optional `defaultSort`, `renderExpanded`, `onRowClick`, `rowTone` (critical rows get a tint), `pageSize`, `state` (`ready` | `loading` | `error` | `empty`), `emptyTitle`/`emptyBody`, `errorDetail`/`onRetry`, `density` (`compact` 28 px rows | `comfortable` 36 px).

**Also:**
- **Sorting:** `sort` + `onSortChange` (controlled).
- **Paging:** `page` (1-based) + `onPageChange`, and `pageSizeOptions` + `onPageSizeChange`. The pager is `Pagination`.
- **Server data:** `manual` with `totalRows`. Rows arrive sorted and paged; handle the sort and page callbacks.
- **Selection:**
  - `selection="multiple"` with `selectedKeys` / `defaultSelectedKeys` and `onSelectionChange`.
  - `bulkActions(keys, rows)` for the bar shown while rows are selected.
- **Row menu:** `rowActions(row)` for a trailing "⋯" menu. `rowLabel(row)` names a row in labels.
- **Visible columns:** `hiddenColumns`, with `ColumnsMenu` for the people using the table.

- **Sort worst-first by default** (status order: critical, warning, unknown, info, healthy).
- Numbers right-aligned with tabular figures in the sans face. Only identifiers (run IDs, SHAs, paths, branches) use mono.
- Rows are never tinted; the status badge carries the state. Put the kind or owner as a muted second line under the name instead of adding columns.
- Rows that open something are focusable and open on Enter. The expand button is separate and labelled.
- Empty states name the active filters; error states say which source failed and leave the rest of the page working.
- Selection: a checkbox column whose select-all covers the visible page and shows a dash when only some are selected. Each checkbox is named after its row ("Select run_8f3k2"). While rows are selected, a bar above the table says "N selected" (announced) and holds your bulk actions and "Clear selection".
- When filtering leaves fewer pages, the table stays on the last page that exists, never on an empty one.
- `pin: "start"` keeps the first column in place while a wide table scrolls sideways.
- No virtualisation or column resizing: page or filter long lists (use `pageSize`), and keep to 4 to 6 columns.

**List and Tree views (2.1).** Pass `getPath(row)`: the row's ownership path *below the current scope*, or `[]` when the scope owns it directly. The table then gets a "List | Tree" switch (`view` / `defaultView` / `onViewChange`; keep the choice in the URL).
- **List:** one row per item. Under its name is a muted path from the scope down ("Forecasting platform › forecast-models"); rows the scope owns directly read `directLabel`. Paths longer than three levels fold their middle into "…".
- **Tree:** the same rows grouped by path. Each collapsed row shows its kind, a count (`itemNoun`) and each column's `rollup`:
  - `'sum'`, shown with the column's `format`;
  - `'latest'`;
  - `{status}`, the worst status with how many ("1 failed");
  - a function;
  - nothing, which shows "–".
- The path and the group label go in the row's name column: the first column without a `rollup`. A leading Status column keeps its rollup.
- "Expand all" opens every level down to the items. Paging applies to List only.
- Put a `ScopeNote` in `toolbar` to say what the table covers.

## KeyValueList
_Data display_

Labelled facts about one object, such as a run's details in a drawer, a settings summary or a page header's fields. It renders a `<dl>`.

**Consumer provides:** `items` `[{label, value, mono?, copy?}]`. Optional `layout`, `columns` (grid only, default 2) and `loading` (skeleton values). `label` names the list.

**Layouts:**
- `rows` (default): label left, value right, with a hairline between rows. For details.
- `grid`: the label above the value, in columns. For summaries.
- `inline`: a wrapping line. Used by `PageHeader`.

- Values can be anything: text, a `StatusBadge`, an `InlineEdit`. Use `mono` only for identifiers.
- A missing value shows "–", read as "None". Never leave a value blank.
- `copy` adds a copy button named after the label ("Copy run").
- On phones, rows and grids stack into one column.

```ts
export interface KeyValueListProps { items: KeyValueItem[]; /** "rows" (default): label left, value right; "grid": label above value in columns; "inline": a wrapping line, as in PageHeader */ layout?: 'rows' | 'grid' | 'inline'; /** grid only (default 2); one column on phones */ columns?: 1 | 2 | 3 | 4; /** skeleton values */ loading?: boolean; /** accessible name for the list */ label?: string; className?: string }
```

## Metric
_Data display_

One number that drives a decision, always shown with its context: target, delta and what to do.

**Consumer provides:** `label`, `scope` (what it measures, in mono), `value` and `unit`, `delta` (`Trend` props), `target` (limit, budget, goal), `status` (colours the figure only when breaching), `freshness`, `action`/`onAction`, optional `spark`, `state` (`ready` | `loading` | `degraded` | `error`).

- **Not a tile row.** Use a Metric only when the number changes what someone does next. Otherwise put the value in a table.
- Max 4 per page section, 6 on an overview page. Never in equal rows for decoration.
- Figure in the sans face (`figure` style, tabular digits so a live value never jitters), unit in muted text, delta with its comparison window. The figure stays ink; a breach shows as a status badge, not a red number.
- `degraded`: the data is older than 2× the refresh interval. The figure greys out and the reason is stated. `error`: say what failed and when it retries.

```ts
export interface MetricProps { label?: string; scope?: string; value?: string; unit?: string; delta?: TrendProps; target?: string; status?: Status; statusLabel?: string; freshness?: string; action?: string; onAction?: () => void; spark?: { points: number[]; threshold?: number }; state?: 'ready' | 'loading' | 'degraded' | 'error'; compact?: boolean }
```

## Pagination
_Data display_

Moves through pages of a long list. DataTable uses it for `pageSize`; use it on its own for lists that aren't tables.

**Consumer provides:** `page` (1-based), `pageSize`, `total` (rows), `onPageChange`. Optional `pageSizeOptions` + `onPageSizeChange` (a "Rows" menu), `firstLast` (first/last buttons and "Page x of y", default on) and `label` (default "Pagination").

- A `nav` landmark. The range ("26–50 of 312") is a polite live region, so changing page is announced.
- Buttons at the ends are disabled, not hidden, so nothing moves.
- Prefer filtering to paging: people look for a run, not for page 7. Keep the page in the URL.

```ts
export interface PaginationProps { /** 1-based */ page: number; pageSize: number; /** total rows */ total: number; onPageChange?: (page: number) => void; pageSizeOptions?: number[]; onPageSizeChange?: (size: number) => void; /** first/last buttons and "Page x of y" (default true) */ firstLast?: boolean; /** accessible name (default "Pagination") */ label?: string }
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
- `highlight` marks the suspected cause (e.g. the edit that preceded the failing test). The highlight grows outward, so its text stays aligned with the other events.
- Time and title share a text baseline in every font preset; the icon is centred on the title's first line and on the connector, which stops 4 px short of each icon.
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
- "Show table" gives every value without hovering (`table={false}` hides it). With `onBar`, each bar is a keyboard button named with its values ("Tue: Passed 9, Failed 3") that also shows the tooltip on focus.
- Without `ariaLabel`, the chart is named from its series, unit and range. Prefer an `ariaLabel` that states the takeaway.

```ts
export interface BarChartProps { categories: string[]; series: { name: string; values: number[]; color: ColorToken; pattern?: 'hatch' | 'dots' }[]; stacked?: boolean; height?: number; unit?: string; ariaLabel?: string; onBar?: (c: string, i: number) => void; state?: ViewState; /** opt-in hatch textures for print / forced colours */ textures?: boolean; /** 'Show table' toggle, default true */ table?: boolean }
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
- "Show table" lists every value, with "no data" for gaps (`table={false}` hides it).

```ts
export interface HeatmapProps { rows: string[]; cols: string[]; values: (number | null)[][]; unit?: string; max?: number; ariaLabel: string; /** 'Show table' toggle, default true */ table?: boolean }
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
- With `onCell` the grid is interactive: one Tab stop, arrow keys move between cells, Home/End jump within a row (Ctrl+Home/End to the corners), and Enter, Space or a click opens the cell. Each cell has a full spoken label ("daily_ingest, 22: failed"). Interactive cells keep their 18 px look inside a 24 px target (WCAG 2.5.8), so the columns sit 24 px apart.
- Without `onCell` it is a plain table: no tab stops.
- "Show table" lists every cell in words (`table={false}` hides it).
- A key sits under every grid.

```ts
export interface StatusGridProps { rows: StatusGridRow[]; cols: string[]; cells: Status[][]; /** makes cells keyboard-navigable targets */ onCell?: (row: StatusGridRow, col: string, s: Status) => void; ariaLabel: string; rowLabelWidth?: number; /** 'Show table' toggle, default true */ table?: boolean }
```

## TimeSeriesChart
_Charts_

Metrics over time. The workhorse chart.

**Consumer provides:** `series` `[{name, points, color?, dashed?}]` (`color` is a token name: `chart-1`…`chart-5`, `chart-other`; default ink), `labels`, `unit`, optional `threshold` `{value, label}`, `markers` `[{index, label}]` (changes), `onMarker`, `onBrush(from, to)`, `highlight` `[from, to]`, `state`, and an `ariaLabel` sentence that states the takeaway.

- **One series: ink**, no legend (the title names it). Comparison = `chart-other` dashed. Up to 5 categorical series (`chart-1`…`chart-5`, in order), then "Other". Prefer 3 or fewer.
- Lines are 2 px with round joins. With 2 to 4 series the legend is always shown and line ends are labelled directly when labels don't collide. Labels use text colours, never the series colour.
- Every chart has a "Show table" toggle so no value is reachable only by hovering.
- **Change markers are on by default** (dashed ink rule + diamond + mono label): merges, deploys, config changes. With `onMarker` they are keyboard buttons ("Change: v2.15.0, 10:20") and clicking one opens the change; without it they are labels only.
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
- **Scrollbar:** the content area reserves a stable scrollbar gutter, so moving between pages or tabs of different lengths never shifts the layout sideways on systems with classic scrollbars.
- **≤ 640 px viewport (phone):** the top bar takes two rows (menu, scope, alerts, account; then search and time range), page headers stack with actions below the title (leading icons on those buttons hide), tabs scroll sideways, banners wrap their action below the text, the time-range popover and toasts span the screen, and panels tighten their padding. Tables scroll inside their panel; the page never scrolls sideways.

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
- **Entity pages** (an initiative, a project) set `kind`: `{label, icon, detail}` renders the eyebrow "Initiative · owned by ML engineering" above the title, so the page says what level it's at without repeating the levels above. Pair it with Breadcrumbs `maxItems`.

```ts
export interface PageHeaderProps { /** what kind of thing this page is about (entity pages) */ kind?: PageHeaderKind; crumbs?: React.ReactNode; back?: React.ReactNode; title: string; titleMono?: boolean; status?: React.ReactNode; /** a short sentence, or labelled fields (preferred) */ meta?: React.ReactNode | PageHeaderField[]; actions?: React.ReactNode; tabs?: React.ReactNode }
```

## ScopeNote
_Shell_

One line under a capability page's header that says what the page covers: "Showing **AI transformation** and its 2 projects, in prod / region-a".

**Consumer provides:** `scope` (the scope's name), optional `summary` (how far it reaches), `runtime` (the runtime scope), `mode` + `onModeChange` for the Direct only / Including descendants switch, and extra controls as children.

- Every capability page (pipelines, web apps, monitoring, alerts, cost) shows one. The ownership scope itself is the chip in the top bar, so the page never repeats the path.
- Include descendants by default; Direct only shows what the scope owns itself. Say which one in every number ("Direct 6 · 38 with projects").
- Put it in DataTable's `toolbar` when the page is mostly one table. The text is a polite live region, so a scope change is announced.

```ts
export interface ScopeNoteProps {
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

## SplitView
_Shell_

The Resource Explorer layout: the ownership tree in a fixed `explorer-width` (320 px) pane, beside the selected node's workspace.

**Consumer provides:** `aside` (a TreeView with its search and tools), `asideLabel` (names the pane and its buttons, e.g. "Organisation"), and the workspace as children. Optional `asideTitle`, `collapsed` / `defaultCollapsed` / `onCollapsedChange`, and `drawerOpen` / `onDrawerOpenChange` to close the narrow-width drawer once a node is picked.

- The pane collapses to a narrow strip ("Hide organisation" / "Show organisation") and never resizes, so the layout stays stable.
- When the available width is under 1024 px, the pane moves into a `Drawer` opened by a "Show organisation" button. Close it when a node is picked, so the workspace shows.
- On phones, the workspace's own child list and its breadcrumb do the drilling down, one level per screen.
- The workspace uses the same tabs for every kind: Overview, Financials, Infrastructure, Delivery, Observability, Resources. Hide tabs that don't apply.

```ts
export interface SplitViewProps {
```

## TopBar
_Shell_

Global controls, left to right: scope, search, time range, notifications, account.

**Consumer provides:** `scope`/`scopeOptions`/`onScope`, `time`/`onTime`, `refresh`/`onRefresh`, `searchItems`/`onSearch`, `alerts` (count of items needing you), `onAlerts`, `onCopyRange`, `user` (avatar initials), `accountLabel` (its accessible name, e.g. "Account: Dev A") and `account` (`{name, email?, role?, org?, items?}`).

- With `account`, the avatar opens the account menu: who is signed in, their role in the current organization, then `items` (an `ActionMenu` list): switching organization (`{heading}` + `checked` items with the role as `meta`), personal preferences (font, theme, density), sign out.

- Everything here is global and URL-backed. Page-specific controls never go in the top bar.
- The count is what needs a person (pending approvals, failed runs you own), not raw events.

**Ownership and runtime scope (2.1).** Pass a `ScopePicker` as `ownership`: the ownership scope, shown once, as a chip with the current node and its kind. Pass `runtime` (dimensions for `ScopeSwitcher`) for where things run. The 1.x `scope` + `scopeOptions` still work. The two groups sit side by side with a divider and change independently.

```ts
export interface TopBarProps { /** the ownership scope, shown once (a ScopePicker) */ ownership?: React.ReactNode; /** runtime dimensions; replaces scope / scopeOptions */ runtime?: ScopeDimension[]; scope?: Scope; scopeOptions?: ScopeOptions; onScope?: (s: Scope) => void; time?: string; onTime?: (t: string) => void; refresh?: TimeRangePickerProps['refresh']; onRefresh?: (r: string) => void; searchItems?: SearchItem[]; /** shown when search is focused and empty */ searchRecent?: SearchItem[]; onSearch?: (i: SearchItem) => void; alerts?: number; onAlerts?: () => void; onCopyRange?: () => void; /** avatar initials */ user?: string; /** accessible name of the account button, e.g. "Account: Dev A" (default "Account") */ accountLabel?: string; /** who is signed in; the account button then opens a menu with this header and `items` (switch organization, preferences, sign out) */ account?: TopBarAccount; /** set by AppShell */ onMenu?: () => void; /** set by AppShell from its width */ mode?: ShellMode }
```
