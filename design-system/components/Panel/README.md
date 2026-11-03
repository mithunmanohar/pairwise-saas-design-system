The data surface that every chart, table and list sits on.

**Consumer provides:** `title`, optional `meta` (a scope or count line), `actions`, `footer`, `flush` (body with no padding for tables), children.

- `radius-md` (6 px) corners, one `border` hairline, **no shadow**. Shadows are only for floating layers. Table cells inside stay square.
- **Never nest panels inside panels.** Group with spacing and headings instead.
- Lay panels out by priority: asymmetric columns (2 : 1, 3 : 2), worst news top-left. Equal-width rows are not the default.
