The single application frame: side nav, top bar and content. Every screen uses it.

**Consumer provides:** `nav` (a `SideNav`), `top` (a `TopBar`), children (page header + page), `density` (`compact` | `comfortable`), optional `forceWidth` for documentation.

**Responsive rules** (by container width, desktop-first at 1440):
- **≥ 1360 px:** rail expanded (`rail-expanded` 216 px) with group labels and counts.
- **1024–1359 px (incl. 1280):** rail collapses to `rail-collapsed` 52 px icons with tooltips; problem counts become a critical dot; the scope switcher drops its last field (it moves to page filters).
- **< 1024 px (tablet):** rail hidden behind a menu button and opens as an overlay; the time picker hides its refresh label; panels stack to one column.
- **Scrollbar:** the content area reserves a stable scrollbar gutter, so moving between pages or tabs of different lengths never shifts the layout sideways on systems with classic scrollbars.
- **≤ 640 px viewport (phone):** the top bar takes two rows (menu, scope, alerts, account; then search and time range), page headers stack with actions below the title (leading icons on those buttons hide), tabs scroll sideways, banners wrap their action below the text, the time-range popover and toasts span the screen, and panels tighten their padding. Tables scroll inside their panel; the page never scrolls sideways.

Density: compact on working views (traces, diffs, queues), comfortable on overview and reporting pages (`data-density` on the shell or `<html>`).

**The assistant (2.2).** `assistant` takes an `AssistantPanel`, or a component that renders one. At 1280 px and wider it docks as a column beside the content (`assistant-width` 400 px), below the top bar. Below 1280 px it is a modal drawer, full width on phones. Expanded, it covers the content area, which stays mounted and `inert` so its scroll position survives.
