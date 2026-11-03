Templates for loading, empty, error, no-access and degraded-data states at page, panel or table level.

**Consumer provides:** `kind`, `title` (defaults per kind), `body` (what happened and its scope), optional `detail` (a technical line: request ID, status code), `action`/`secondary`, `inline` for panels.

- **Loading:** skeleton rows shaped like the content. No spinners on whole pages.
- **Empty:** say *why* it's empty (paused, filtered, nothing ran) and the next step.
- **Error:** name the failing source ("your CI provider returned 503") and confirm what still works. Fail per panel, never the whole page.
- **No access:** say who owns it and offer a request path. Never show a blank panel.
- **Degraded:** data is stale or partial. Show last-known values greyed with their age.
