History at a glance: one row per item, one cell per run. In Pairwise: the checks matrix (check × commit or check × run).

**Consumer provides:** `rows` `[{key, label}]`, `cols` (runs or commits), `cells` (2-D status), `onCell(row, col, status)`.

- Every cell carries a glyph as well as colour: ✕ failed (solid critical), ↻ passed after retry (warning tint), • running, – skipped (dashed). Plain success is a quiet neutral fill.
- Cells are buttons: click opens the run or check drawer. Each has a full spoken label.
- A key sits under every grid.
