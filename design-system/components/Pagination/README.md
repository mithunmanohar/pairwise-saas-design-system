Moves through pages of a long list. DataTable uses it for `pageSize`; use it on its own for lists that aren't tables.

**Consumer provides:** `page` (1-based), `pageSize`, `total` (rows), `onPageChange`. Optional `pageSizeOptions` + `onPageSizeChange` (a "Rows" menu), `firstLast` (first/last buttons and "Page x of y", default on) and `label` (default "Pagination").

- A `nav` landmark. The range ("26–50 of 312") is a polite live region, so changing page is announced.
- Buttons at the ends are disabled, not hidden, so nothing moves.
- Prefer filtering to paging: people look for a run, not for page 7. Keep the page in the URL.
