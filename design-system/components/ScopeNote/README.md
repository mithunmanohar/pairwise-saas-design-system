One line under a capability page's header that says what the page covers: "Showing **AI transformation** and its 2 projects, in prod / region-a".

**Consumer provides:** `scope` (the scope's name), optional `summary` (how far it reaches), `runtime` (the runtime scope), `mode` + `onModeChange` for the Direct only / Including descendants switch, and extra controls as children.

- Every capability page (pipelines, web apps, monitoring, alerts, cost) shows one. The ownership scope itself is the chip in the top bar, so the page never repeats the path.
- Include descendants by default; Direct only shows what the scope owns itself. Say which one in every number ("Direct 6 · 38 with projects").
- Put it in DataTable's `toolbar` when the page is mostly one table. The text is a polite live region, so a scope change is announced.
