The single application frame: side nav, top bar and content. Every screen uses it.

**Consumer provides:** `nav` (a `SideNav`), `top` (a `TopBar`), children (page header + page), `density` (`compact` | `comfortable`), optional `forceWidth` for documentation.

**Responsive rules** (by container width, desktop-first at 1440):
- **≥ 1360 px:** rail expanded (`rail-expanded` 216 px) with group labels and counts.
- **1024–1359 px (incl. 1280):** rail collapses to `rail-collapsed` 52 px icons with tooltips; problem counts become a critical dot; the scope switcher drops its last field (it moves to page filters).
- **< 1024 px (tablet):** rail hidden behind a menu button and opens as an overlay; the time picker hides its refresh label; panels stack to one column.

Density: compact on working views (traces, diffs, queues), comfortable on overview and reporting pages (`data-density` on the shell or `<html>`).
