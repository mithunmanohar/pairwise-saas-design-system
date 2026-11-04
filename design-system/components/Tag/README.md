A small neutral label: a topic, a label selector, an applied filter, a branch name.

**Consumer provides:** `children` (the text). Optional `mono` (identifiers), `onRemove` (adds an × button, e.g. for applied filters) and `removeLabel`.

- Tags are neutral and never carry status. For status use `StatusBadge` (icon + label + colour).
- Keep the text short; long text is truncated with an ellipsis.
