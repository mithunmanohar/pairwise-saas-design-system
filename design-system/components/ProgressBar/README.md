How far along a task is: a rollout, an upload, an index build. Built on Radix Progress.

**Consumer provides:** `label` and `value` (0..`max`, or `null` while the amount is unknown). Optional `max` (default 100), `valueText` (what is shown and read instead of "42 %", e.g. "3 of 12 replicas"), `tone`, `hint`, `hideLabel`, `showValue`.

- `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and `aria-valuetext`, named by its visible label.
- The fill is neutral ink. Use `tone="warning"` or `"critical"` only when the task itself is at risk or failing, never to decorate. Healthy stays quiet.
- Indeterminate progress slides; with reduced motion it is a still, half-tone bar.
- For used-versus-limit (a quota, not a task), use `BulletBar`.
