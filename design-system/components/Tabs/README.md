Switch between views of the same object. Detail pages of the same kind always use the same tabs in the same order (for a run: Trace, Diff, Checks, Logs, Usage).

**Consumer provides:** `tabs` `[{value, label, count?, tone?, disabled?}]`, `value`, `onChange`.

- Active tab: ink, weight 600 and a 2 px ink underline. Hierarchy through weight, not colour.
- A tab count turns critical only when it counts failures ("2 failing").
- Keyboard: arrow keys move between tabs; only the active tab is in the Tab order.
- The selected tab is part of the URL.
