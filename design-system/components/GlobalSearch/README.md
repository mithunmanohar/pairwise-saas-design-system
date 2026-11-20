Find anything by name and run commands: repository, branch, session, run, file, pull request, "Go to incidents", "Toggle theme". Ctrl+K (⌘K on Apple devices) focuses it from anywhere. It is the command palette too: there is no separate one.

**Consumer provides:** `items` and `onSelect`. An item is `{label, kind?, status?, group?, description?, keywords?, shortcut?, icon?, id?, onRun?}`: `onRun` makes it a command, `group` sections the results ("Commands", "Runs"), `keywords` add synonyms. Optional `recent` (shown when the box is focused and empty), `limit` (default 7), `emptyHint`. For server search: `onQueryChange(q)`, `filter={false}` (show items as given) and `loading`.

- Results show status, so search doubles as "is X OK?".
- Matching covers partial SHAs and run IDs (`run_8f3k2`), and IDs from connected tools such as your issue tracker.
- No match: say what to try, not just "No results". Pass it as `emptyHint` (e.g. "Try a run id or branch name.").
- Built on cmdk: a combobox with a listbox of results. The highlighted result is announced (`aria-activedescendant`). Arrows move, Enter opens or runs, Esc closes the list, then clears, then leaves.
- Local matching: every word must appear in the label, kind, description or keywords; labels that start with the query rank first.
- Only the most recently mounted search owns the shortcut, and the hint shows the right keys for the platform. Turn it off with `shortcut={false}`.
