Switch between views of the same object. Detail pages of the same kind always use the same tabs in the same order (for a run: Trace, Diff, Checks, Logs, Usage).

**Consumer provides:** `tabs` `[{value, label, count?, tone?, disabled?}]`, `value`, `onChange`, optional `label` (the tab list's name). Optionally the panels as children: `<Tabs …><TabPanel value="trace">…</TabPanel></Tabs>` links each tab to its panel.

- Active tab: ink, weight 600 and a 2 px ink underline. Hierarchy through weight, not colour.
- Every tab reserves the width of its bold label, so switching tabs never moves the others.
- A tab count turns critical only when it counts failures ("2 failing").
- Built on Radix Tabs. Arrow keys move and select (wrapping), Home/End jump, disabled tabs are skipped; only the active tab is in the Tab order.
- Without `TabPanel` children (as in `PageHeader`) the tabs switch the page's content and don't point at a panel.
- The selected tab is part of the URL.
