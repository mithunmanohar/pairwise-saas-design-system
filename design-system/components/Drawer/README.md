A side panel for details without leaving the page: a run, a tool call, a file change.

**Consumer provides:** `open`, `title` (the object's name, mono for identifiers), `subtitle` (kind, scope), children, optional `footer` actions, `onClose`, `width`.

- Opens from the right, `drawer-width` 520 px, on `surface-overlay` with `shadow-overlay` and no border.
- The page behind stays visible and is not dimmed (light scrim), so you keep your place.
- Built on Radix Dialog: focus moves into the drawer, Tab is trapped, Esc or a click outside closes it and returns focus. The open drawer is in the URL so back closes it.
- Footer: the primary action opens the full page.
