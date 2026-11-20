A "⋯" menu of actions on a row, card or page, built on Radix DropdownMenu.

**Consumer provides:** `items`: `{label, icon?, onSelect, disabled?, tone?: 'critical', shortcut?, meta?, checked?}`, `{heading}` or `'separator'`. Optional `label` (accessible name of the default ⋯ button; name the object, e.g. "Actions for run_8f3k2"), `trigger` (your own button), `align`, `header` (non-interactive content above the items, e.g. who is signed in).

- `{heading: "Switch organization"}` labels the group below it. `checked` marks the current choice in such a group: a tick, announced as checked. `meta` is muted text on the right (a role, a count).

- Keyboard: Enter, Space or ↓ opens; arrows move; typing jumps; Enter runs; Esc closes and returns focus.
- Put the most common action first and destructive ones last, after a separator, with `tone: 'critical'`. Confirm destructive actions in a `Modal`.
- Use it for actions. To choose a value, use `Select` or `MenuSelect`.
