A side panel for details without leaving the page: a run, a tool call, a file change.

**Consumer provides:** `open`, `title` (the object's name, mono for identifiers), `subtitle` (kind, scope), children, optional `footer` actions, `onClose`, `width`.

- Opens from the right, `drawer-width` 520 px, on `surface-overlay` with `shadow-overlay` and no border.
- The page behind stays visible and is not dimmed (light scrim), so you keep your place.
- Built on Radix Dialog: focus moves into the drawer, Tab is trapped, Esc or a click outside closes it and returns focus. The open drawer is in the URL so back closes it.
- Footer: the primary action opens the full page.

**Docked (2.2).** `docked` makes it a panel beside the page instead of a floating layer, as the assistant uses it. It renders in place with a border and no shadow or scrim. It is still a non-modal Radix dialog, so focus moves in on open and back on close. Clicking the page keeps it open, and Escape closes it only while focus is inside it. `actions` adds header controls before Close. An element marked `data-autofocus` (e.g. a composer) takes focus on open instead of the first control.
