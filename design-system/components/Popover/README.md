A small, non-modal floating panel: filters, a details preview, a short form. Built on Radix Popover.

**Consumer provides:** `trigger` (an element that forwards a ref, such as `Button`), `label` (the popover's accessible name), and the content as children. Optional `open` + `onOpenChange` (controlled) or `defaultOpen`, `side` (`top` | `right` | `bottom` | `left`, default `bottom`), `align` (`start` | `center` | `end`, default `start`) and `width`.

- Wrap a button inside in `PopoverClose` to close the popover when it's pressed (Apply, Cancel, Done).
- Keyboard: Enter or Space on the trigger opens it and moves focus inside; Tab moves through its content; Esc closes and returns focus to the trigger. Clicking outside closes it.
- It renders in a portal above modals and drawers (`z-popover`), flips or shifts to stay on screen, and fades in 4 px from its trigger. Reduced motion turns that off.
- Use `Modal` for decisions that must block the page, `ActionMenu` for a list of commands, and `Tooltip` for a short, non-interactive hint.
