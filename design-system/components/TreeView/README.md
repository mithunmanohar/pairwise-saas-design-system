The ownership tree: company, business function, squad, initiative, project, and groups of resources under them. Built on React Aria's Tree (a `treegrid`).

**Consumer provides:** `nodes` (`{id, kind, label, status?, statusCount?, meta?, children?, hasChildren?, noAccess?, keywords?}`), `label`, and usually `selectedId` + `onSelect`. Optional `expandedIds` / `defaultExpandedIds` / `onExpandedChange`, `loadChildren(node)` for nodes with `hasChildren`, `filter`, `state` (`ready` | `loading` | `error`) and `emptyText`.

- **Keyboard:** ↑↓ move, → expands (or goes to the first child), ← collapses (or goes to the parent), Home/End, and typing a name jumps to it. Enter, Space or a click selects. Arrows never change the selection on their own, so moving through the tree doesn't change the scope.
- **Each row** shows the kind's line icon and the name. On the right is the worst status below that node with a count, or a muted count. Healthy and no-data show nothing (healthy is quiet). Kinds are told apart by icon and label, never by colour.
- **Resources** sit under their owner in groups by type (`kind: "resources"`, "Pipelines 3"), loaded on expand, so thousands of assets never become tree leaves.
- **`filter`** keeps matches and their ancestors, expanded. **`noAccess`** nodes show greyed with a lock, as context.
- **Use it in exactly two places:** the Resource Explorer (in a `SplitView`) and inside `ScopePicker`. Other pages show the scope as a chip, not a tree.
