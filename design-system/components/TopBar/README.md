Global controls, left to right: scope, search, time range, notifications, account.

**Consumer provides:** `scope`/`scopeOptions`/`onScope`, `time`/`onTime`, `refresh`/`onRefresh`, `searchItems`/`onSearch`, `alerts` (count of items needing you), `onAlerts`, `onCopyRange`, `user` (avatar initials), `accountLabel` (its accessible name, e.g. "Account: Dev A") and `account` (`{name, email?, role?, org?, items?}`).

- With `account`, the avatar opens the account menu: who is signed in, their role in the current organization, then `items` (an `ActionMenu` list): switching organization (`{heading}` + `checked` items with the role as `meta`), personal preferences (font, theme, density), sign out.

- Everything here is global and URL-backed. Page-specific controls never go in the top bar.
- The count is what needs a person (pending approvals, failed runs you own), not raw events.

**Ownership and runtime scope (2.1).** Pass a `ScopePicker` as `ownership`: the ownership scope, shown once, as a chip with the current node and its kind. Pass `runtime` (dimensions for `ScopeSwitcher`) for where things run. The 1.x `scope` + `scopeOptions` still work. The two groups sit side by side with a divider and change independently.

