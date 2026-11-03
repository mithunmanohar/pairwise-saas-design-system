Shows where an object sits and lets you climb back up without losing time range or filters.

**Consumer provides:** `items` `[{label, href?, mono?}]` (last item is the current page), `onNavigate`.

- Follow the real hierarchy, outermost first: organisation → repository → branch → run → step.
- Set identifiers in mono (`mono: true`): `sample-repo`, `feature/add-retry`, `run_8f3k2`. Truncate hashes in the middle, never the end.
- Links carry the current URL state (time, scope, filters).
