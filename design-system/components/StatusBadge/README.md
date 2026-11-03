The status of a thing (session, run, check, approval), always as icon + label.

**Consumer provides:** `status` (`critical` | `warning` | `healthy` | `unknown` | `info`) and an optional domain `label` ("Tests failed", "Retry 2 / 3"). Default labels: Critical, Warning, Healthy, No data, Running.

- Critical and warning sit on their `-surface` tint. Healthy, unknown and info are **icon + text only**, with no box, because healthy is quiet.
- `unknown` is for no data, stale or skipped. Never show missing data as healthy.
- `info` is neutral on purpose: running or queued work needs no attention.
- `StatusDot` (icon only) is allowed only where the row already names the state, or with a tooltip. Its label is still read by screen readers.
- **Trend** (same card): the arrow shows direction, and colour comes from the metric's `polarity` (`up-bad` for latency, failures and cost; `up-good` for pass rate and adoption). It is critical only when `breach` is set, otherwise warning. Good changes stay ink. Always print the delta and the comparison window.
