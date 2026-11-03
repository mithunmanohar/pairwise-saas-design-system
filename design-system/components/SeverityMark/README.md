Problem severity, separate from status. The number of filled bars (4 → 1) carries the level without colour.

**Consumer provides:** `level` (1–4, 4 = most severe; map your tracker's priorities onto it), optional `count`, `showLabel`.

- Use on problems only (failed checks, blocked approvals, policy violations). Runs have a *status*, problems have a *severity*.
- Aggregates list 3 to 4 levels, most severe first, each with a count that links to the filtered list.
- The top two levels share the critical colour; the bar count tells them apart.
