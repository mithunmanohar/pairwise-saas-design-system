Recent outcomes inline in a table row, so history doesn't need its own panel. In Pairwise: the steps of a run, or the last runs of a session.

**Consumer provides:** `runs` (oldest first: `healthy` | `warning` (passed after retry) | `critical` (failed) | `info` (running) | `unknown` (skipped)), `labels` (step names or run dates), `name` (for the spoken summary).

- Failed items are solid critical with ✕; retried items are warning-tinted with ↻; success is a quiet neutral cell.
- The strip is one image to screen readers, with a sentence that counts failures and lists each item.
- Use `StatusGrid` instead when the grid itself is the page's subject.
