The default way to show many things with a status: sessions, runs, checks, approvals, usage lines.

**Consumer provides:** `columns` `[{key, header, sortable?, sortValue?, align?, mono? (identifiers), num? (numbers, tabular), render?, width?}]`, `rows`, `rowKey`, optional `defaultSort`, `renderExpanded`, `onRowClick`, `rowTone` (critical rows get a tint), `pageSize`, `state` (`ready` | `loading` | `error`), `emptyTitle`/`emptyBody`, `errorDetail`/`onRetry`, `density` (`compact` 28 px rows | `comfortable` 36 px).

- **Sort worst-first by default** (status order: critical, warning, unknown, info, healthy).
- Numbers right-aligned with tabular figures in the sans face. Only identifiers (run IDs, SHAs, paths, branches) use mono.
- Rows are never tinted; the status badge carries the state. Put the kind or owner as a muted second line under the name instead of adding columns.
- Rows that open something are focusable and open on Enter. The expand button is separate and labelled.
- Empty states name the active filters; error states say which source failed and leave the rest of the page working.
- No virtualisation: page or filter long lists (use `pageSize`).
