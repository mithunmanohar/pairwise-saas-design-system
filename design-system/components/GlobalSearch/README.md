Find anything by name: repository, branch, session, run, file, pull request. ⌘K / Ctrl+K focuses it from anywhere.

**Consumer provides:** `items` `{label, kind, status?}` (or a server-backed equivalent) and `onSelect`.

- Results show status, so search doubles as "is X OK?".
- Matching covers partial SHAs and run IDs (`run_8f3k2`), and IDs from connected tools such as your issue tracker.
- No match: say what to try, not just "No results". Pass it as `emptyHint` (e.g. "Try a run id or branch name.").
- Keyboard: arrows move, Enter opens, Esc clears.
