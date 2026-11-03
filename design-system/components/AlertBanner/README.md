Page- or app-level messages that persist until the condition ends.

**Consumer provides:** `tone` (`critical` | `warning` | `info` | `healthy`), `title` (the fact, in one sentence), optional children, `meta` (source and age), `action`/`onAction`, `onDismiss`.

- At most one banner per page, the most severe. Critical banners can't be dismissed while the condition lasts.
- Say the fact and the consequence: "Check results after 14:46 may be stale", not "Something went wrong".
- `healthy` only to confirm a recovery, then auto-dismiss after 60 s.
