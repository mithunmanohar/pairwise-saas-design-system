A single-select form field built on Radix Select.

**Consumer provides:** `label`, `options` (strings or `{value, label, meta}`), and `value` + `onChange` (or `defaultValue`). Optional `placeholder`, `hint`, `error`, `disabled`, `required`, `name` (submits with a form).

- Keyboard: Enter, Space or arrows open the list; arrows move; typing jumps to a match; Enter selects; Esc closes.
- The list renders in a portal at the end of `<body>`, so it is never clipped and still follows `data-theme` on `<html>`.
- Use `MenuSelect` for compact filter menus in toolbars; use `Select` in forms.
