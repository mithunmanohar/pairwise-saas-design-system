Two to five mutually exclusive options shown side by side, such as a view mode, an auto-refresh interval or a chart range. Built on Radix ToggleGroup as a radio group.

**Consumer provides:** `label` (the group's accessible name), `options` (strings or `{value, label, disabled}`), and `value` + `onChange` (or `defaultValue`). Optional `size="sm"` and `disabled`.

- Keyboard: Tab enters at the selected option; arrows move; Space or Enter selects. Disabled options are skipped.
- Selected labels reserve their bold width, so switching never moves the options.
- It always has a value. For more than five options, or options that need explaining, use `Select` or `RadioGroup`.
