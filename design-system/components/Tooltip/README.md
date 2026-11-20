A short, non-interactive explanation on hover or keyboard focus.

**Consumer provides:** `content` (one line of plain text), a focusable child that forwards its ref (Button, a link), optional `side` (`top` | `right` | `bottom` | `left`).

- Never put the only copy of important information in a tooltip. It explains, it doesn't hold data.
- Never put links or buttons inside; use a popover or drawer.
- Built on Radix Tooltip. It opens after 400 ms on hover, at once on keyboard focus, and Esc dismisses it. The child gets `aria-describedby`.
- It renders in a portal on top of everything (`z-tooltip`) and flips or shifts to stay on screen, so a scroll area can't clip it.
- Tooltips inside one `TooltipProvider` share a skip delay: moving along a row of icons opens each at once. `AppShell` provides one; wrap other areas in `<TooltipProvider>` if they have many tooltips.
