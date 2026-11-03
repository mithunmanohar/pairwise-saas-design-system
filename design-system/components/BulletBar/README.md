A value against its limit in one line: used vs reserved vs allowed. Replaces gauges.

**Consumer provides:** `used`, `requested`, `limit` (allowed), `unit`, `label`, optional `warnAt` (default 0.8) and `critAt` (0.92).

- Track = the limit. Light band = reserved or committed. Solid bar = used, which turns warning or critical by ratio. Tick = limit.
- The percentage is printed, and it is coloured only when past a threshold.
- Use in tables (one row per repository, team or budget), not as standalone dials.
