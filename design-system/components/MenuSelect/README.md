A compact single-select used in the scope switcher and filter bars.

**Consumer provides:** `label` (accessible name), `value`, `options` (strings or `{value, label, meta}`), `onChange`, optional `prefix` (the visible field name, e.g. "Branch") and `icon`.

- The visible text is always "prefix + current value", so a collapsed filter still says what it filters.
- Keyboard: Enter or Space opens; Tab moves through options; Enter selects; Esc closes.
- More than about 12 options: use `GlobalSearch`-style type-ahead instead of a long list.
