One date, typed as `YYYY-MM-DD` or picked from a calendar. The calendar is react-day-picker in a Radix Popover (the shadcn/ui pattern), styled as Signal.

**Consumer provides:** `label`, and `value` + `onChange` (or `defaultValue`), as a `"YYYY-MM-DD"` string or `null`. Optional `min`, `max`, `isDateDisabled(iso)`, `clearable` (default true), `hint`, `error`, `required`, `disabled`, `name`.

- Dates are local calendar dates with no time zone, so they never shift by a day. Use `toISODate` and `parseISODate` to convert.
- Typing is checked on blur or Enter, with a specific message for each problem: the format, before `min`, after `max`, or an unavailable date.
- The calendar opens on the chosen date (or today), with focus on it. Arrows move by day and week, PageUp/PageDown by month (Shift: by year), Home/End to the ends of the week, and Enter picks. Month and year menus jump further. The week starts on the locale's first day.
- Disabled dates are struck through and skipped by the keyboard.
