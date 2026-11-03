A short, non-interactive explanation on hover or keyboard focus.

**Consumer provides:** `content` (one line of plain text), a focusable child, optional `side`.

- Never put the only copy of important information in a tooltip. It explains, it doesn't hold data.
- Never put links or buttons inside; use a popover or drawer.
- Esc dismisses. The child gets `aria-describedby`.
