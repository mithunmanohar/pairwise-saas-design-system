A compact single-select used in the scope switcher and filter bars.

**Consumer provides:** `label` (accessible name), `value`, `options` (strings or `{value, label, meta, disabled}`), `onChange`, optional `prefix` (the visible field name, e.g. "Branch") and `icon`.

- The visible text is always "prefix + current value", so a collapsed filter still says what it filters.
- The trigger keeps the width of its widest option, so choosing a value never moves the controls next to it.
- Built on Radix DropdownMenu as a menu of radio items: Enter, Space or ↓ opens it on the current value; arrows, Home/End and typing a letter move; Enter selects; Esc closes. Focus returns to the trigger. The menu renders in a portal, so it is never clipped.
- Its accessible name is its visible text: the prefix (or a hidden "Label:") and the value, so speech-input users can say what they see.
- More than about 12 options: use `GlobalSearch`-style type-ahead instead of a long list.
