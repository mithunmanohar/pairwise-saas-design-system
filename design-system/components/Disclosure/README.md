Details that most people don't need, one click away: how an answer was worked out, a tool's inputs, request headers.

**Consumer provides:** `summary`, optional `meta` (a count, muted), children; `open` + `onOpenChange` to control it, or `defaultOpen`.

- Built on native `<details>` and `<summary>`: the browser gives it the button role, Enter and Space, and the expanded state. No keyboard logic is hand-written.
- The chevron turns when open; with reduced motion it turns without animating.
- Use it for one block of detail. For a list of items with their own details, use DataTable's `renderExpanded`.
