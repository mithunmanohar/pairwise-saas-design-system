Shows where an object sits and lets you climb back up without losing time range or filters.

**Consumer provides:** `items` `[{label, href?, mono?, icon?}]` (last item is the current page), `onNavigate`, optional `maxItems`.

- Follow the real hierarchy, outermost first: organisation → repository → branch → run → step.
- Set identifiers in mono (`mono: true`): `sample-repo`, `feature/add-retry`, `run_8f3k2`. Truncate hashes in the middle, never the end.
- Links carry the current URL state (time, scope, filters).
- **Ownership paths:** set `maxItems` so the levels above the current scope fold into a "…" menu. The current page always shows. Never spell out Company › Function › Squad on every page; the ownership scope in the top bar already says where you are.
- Use `icon: entityIcon[kind]` to mark each level's kind with its line icon, and never with colour.
- The "…" button is named "Show 3 more levels" and opens a menu of the hidden levels: arrows to move, Enter to go, Esc to close.
