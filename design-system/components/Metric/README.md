One number that drives a decision, always shown with its context: target, delta and what to do.

**Consumer provides:** `label`, `scope` (what it measures, in mono), `value` and `unit`, `delta` (`Trend` props), `target` (limit, budget, goal), `status` (colours the figure only when breaching), `freshness`, `action`/`onAction`, optional `spark`, `state` (`ready` | `loading` | `degraded` | `error`).

- **Not a tile row.** Use a Metric only when the number changes what someone does next. Otherwise put the value in a table.
- Max 4 per page section, 6 on an overview page. Never in equal rows for decoration.
- Figure in the sans face (`figure` style, proportional digits), unit in muted text, delta with its comparison window. The figure stays ink; a breach shows as a status badge, not a red number.
- `degraded`: the data is older than 2× the refresh interval. The figure greys out and the reason is stated. `error`: say what failed and when it retries.
