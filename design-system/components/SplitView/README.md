The Resource Explorer layout: the ownership tree in a fixed `explorer-width` (320 px) pane, beside the selected node's workspace.

**Consumer provides:** `aside` (a TreeView with its search and tools), `asideLabel` (names the pane and its buttons, e.g. "Organisation"), and the workspace as children. Optional `asideTitle`, `collapsed` / `defaultCollapsed` / `onCollapsedChange`.

- The pane collapses to a narrow strip ("Hide organisation" / "Show organisation") and never resizes, so the layout stays stable.
- When the available width is under 1024 px, the pane moves into a `Drawer` opened by a "Show organisation" button.
- On phones, the workspace's own child list and its "up" link do the drilling down, one level per screen.
- The workspace uses the same tabs for every kind: Overview, Financials, Infrastructure, Delivery, Observability, Resources. Hide tabs that don't apply.
