Page-level filters that sit directly above the table or chart they filter.

**Consumer provides:** `filters` `[{key, label, options}]`, `values`, `onChange`, optional free-text `query`/`onQuery`, `count` ("7 of 212 runs"), `onClear`.

- Filters are page-local and live in the URL, so back navigation restores them.
- Always show the result count. When filters hide everything, the table's empty state names the active filters.
- Scope (organisation / repository / branch) and time are global and never repeated here.
