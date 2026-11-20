The one global time control. It lives in the top bar and its value travels in the URL through every drill-down.

**Consumer provides:** `value` (a relative key such as `1h`, or `absolute` text), `onChange`, `refresh` and `onRefreshChange` (`off` | `30s` | `1m` | `5m`), `onCopy` (copies a shareable range), optional `ranges` to restrict per page (a usage report might offer month to date, 6 months and year only). For custom ranges: `onAbsoluteChange({from, to})` and, optionally, `defaultAbsolute` (otherwise the last hour); show the chosen range with `absolute`.

- The button keeps the width of its widest range, and the auto-refresh slot always shows (a pause icon and "off" when off), so changing either never resizes it.
- Times show in the user’s time zone with the zone stated (from the locale settings). Absolute fields accept `YYYY-MM-DD HH:mm`; Apply (or Enter) checks the format and that From is before To, and shows an error otherwise.
- When auto-refresh is on, the field shows the interval. Pause refresh while a drawer or modal is open, and when the tab is hidden.
- "Copy range" copies an absolute range so a pasted link shows exactly what you saw. With an absolute range set, `onCopy` receives it.
- Built on Radix Popover. It opens on the current range, with focus on it. The relative ranges are a radio group: arrows move without applying, Enter or Space applies and closes. Auto-refresh is a `SegmentedControl`. Esc closes and returns focus to the button.
- Brushing a chart sets an absolute range and shows an undo chip. Never change the range silently.
