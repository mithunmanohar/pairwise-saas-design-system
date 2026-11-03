Global controls, left to right: scope, search, time range, notifications, account.

**Consumer provides:** `scope`/`scopeOptions`/`onScope`, `time`/`onTime`, `refresh`/`onRefresh`, `searchItems`/`onSearch`, `alerts` (count of items needing you), `onAlerts`, `onCopyRange`, `user` (avatar initials) and `accountLabel` (its accessible name, e.g. "Account: Dev A").

- Everything here is global and URL-backed. Page-specific controls never go in the top bar.
- The count is what needs a person (pending approvals, failed runs you own), not raw events.
