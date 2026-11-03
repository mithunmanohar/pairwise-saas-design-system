Primary navigation, grouped by kind.

**Consumer provides:** `active` (key), `onNavigate(key)`, `badges` `{key: {count, tone?}}`, optional `nav` to reorder or pin per role, `collapsed`.

- The selected item gets a `surface-selected` fill and weight 600. No coloured edge stripe.
- Only problem counts (failing checks, pending approvals past their deadline) are critical; other counts stay muted.
- Role changes which item is Home and the default pins, never what is reachable.
- New object types are added inside an existing group, not as new groups.

The default item list is only a sample. Every project passes its own `nav`.
