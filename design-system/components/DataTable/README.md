The default way to show many things with a status: sessions, runs, checks, approvals, usage lines.

**Consumer provides:** `columns` `[{key, header, sortable?, sortValue?, align?, mono? (identifiers), num? (numbers, tabular), render?, width?, hidden?, hideable?, pin?}]`, `rows`, `rowKey`, optional `defaultSort`, `renderExpanded`, `onRowClick`, `rowTone` (critical rows get a tint), `pageSize`, `state` (`ready` | `loading` | `error` | `empty`), `emptyTitle`/`emptyBody`, `errorDetail`/`onRetry`, `density` (`compact` 28 px rows | `comfortable` 36 px).

**Also:**
- **Sorting:** `sort` + `onSortChange` (controlled).
- **Paging:** `page` (1-based) + `onPageChange`, and `pageSizeOptions` + `onPageSizeChange`. The pager is `Pagination`.
- **Server data:** `manual` with `totalRows`. Rows arrive sorted and paged; handle the sort and page callbacks.
- **Selection:**
  - `selection="multiple"` with `selectedKeys` / `defaultSelectedKeys` and `onSelectionChange`.
  - `bulkActions(keys, rows)` for the bar shown while rows are selected.
- **Row menu:** `rowActions(row)` for a trailing "⋯" menu. `rowLabel(row)` names a row in labels.
- **Visible columns:** `hiddenColumns`, with `ColumnsMenu` for the people using the table.

- **Sort worst-first by default** (status order: critical, warning, unknown, info, healthy).
- Numbers right-aligned with tabular figures in the sans face. Only identifiers (run IDs, SHAs, paths, branches) use mono.
- Rows are never tinted; the status badge carries the state. Put the kind or owner as a muted second line under the name instead of adding columns.
- Rows that open something are focusable and open on Enter. The expand button is separate and labelled.
- Empty states name the active filters; error states say which source failed and leave the rest of the page working.
- Selection: a checkbox column whose select-all covers the visible page and shows a dash when only some are selected. Each checkbox is named after its row ("Select run_8f3k2"). While rows are selected, a bar above the table says "N selected" (announced) and holds your bulk actions and "Clear selection".
- When filtering leaves fewer pages, the table stays on the last page that exists, never on an empty one.
- `pin: "start"` keeps the first column in place while a wide table scrolls sideways.
- No virtualisation or column resizing: page or filter long lists (use `pageSize`), and keep to 4 to 6 columns.

**List and Tree views (2.1).** Pass `getPath(row)`: the row's ownership path *below the current scope*, or `[]` when the scope owns it directly. The table then gets a "List | Tree" switch (`view` / `defaultView` / `onViewChange`; keep the choice in the URL).
- **List:** one row per item. Under its name is a muted path from the scope down ("Forecasting platform › forecast-models"); rows the scope owns directly read `directLabel`. Paths longer than three levels fold their middle into "…".
- **Tree:** the same rows grouped by path. Each collapsed row shows its kind, a count (`itemNoun`) and each column's `rollup`:
  - `'sum'`, shown with the column's `format`;
  - `'latest'`;
  - `{status}`, the worst status with how many ("1 failed");
  - a function;
  - nothing, which shows "–".
- The path and the group label go in the row's name column: the first column without a `rollup`. A leading Status column keeps its rollup.
- "Expand all" opens every level down to the items. Paging applies to List only.
- Put a `ScopeNote` in `toolbar` to say what the table covers.
