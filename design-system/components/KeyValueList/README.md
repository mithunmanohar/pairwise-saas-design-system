Labelled facts about one object, such as a run's details in a drawer, a settings summary or a page header's fields. It renders a `<dl>`.

**Consumer provides:** `items` `[{label, value, mono?, copy?}]`. Optional `layout`, `columns` (grid only, default 2) and `loading` (skeleton values). `label` names the list.

**Layouts:**
- `rows` (default): label left, value right, with a hairline between rows. For details.
- `grid`: the label above the value, in columns. For summaries.
- `inline`: a wrapping line. Used by `PageHeader`.

- Values can be anything: text, a `StatusBadge`, an `InlineEdit`. Use `mono` only for identifiers.
- A missing value shows "–", read as "None". Never leave a value blank.
- `copy` adds a copy button named after the label ("Copy run").
- On phones, rows and grids stack into one column.
