The ownership scope, shown once, in the top bar. The chip names the current node and its kind ("AI transformation · Initiative") and never the levels above it. It opens search across the organisation, "Up to <parent>", "Whole organisation" and the tree around the current node.

**Consumer provides:** `nodes` (the same tree as the explorer), `value` (a node id, or `null` for the whole organisation) and `onChange(id | null)`. Optional `label` (default "Ownership scope"), `wholeLabel` and `loadChildren`.

- Put it in `TopBar`'s `ownership` slot. The runtime scope (environment, region…) stays separate, in `ScopeSwitcher`.
- Search (cmdk) matches names, kinds and keywords. Each result shows its path as a muted line, the one place outside the explorer where the path appears. The highlighted result is announced.
- Choosing a node closes the popover and returns focus to the chip. Keep the scope in the URL so every page, link and back button keeps it.
- The chip's hover title shows the full path.
