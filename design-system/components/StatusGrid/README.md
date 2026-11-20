History at a glance: one row per item, one cell per run. In Pairwise: the checks matrix (check × commit or check × run).

**Consumer provides:** `rows` `[{key, label}]`, `cols` (runs or commits), `cells` (2-D status), `onCell(row, col, status)`.

- Every cell carries a glyph as well as colour: ✕ failed (solid critical), ↻ passed after retry (warning tint), • running, – skipped (dashed). Plain success is a quiet neutral fill.
- With `onCell` the grid is interactive: one Tab stop, arrow keys move between cells, Home/End jump within a row (Ctrl+Home/End to the corners), and Enter, Space or a click opens the cell. Each cell has a full spoken label ("daily_ingest, 22: failed"). Interactive cells keep their 18 px look inside a 24 px target (WCAG 2.5.8), so the columns sit 24 px apart.
- Without `onCell` it is a plain table: no tab stops.
- "Show table" lists every cell in words (`table={false}` hides it).
- A key sits under every grid.
