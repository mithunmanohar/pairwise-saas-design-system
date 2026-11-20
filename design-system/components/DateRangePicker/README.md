A start and an end date, with presets. Use it in filter toolbars and reports. For the global time range of an ops view, use `TimeRangePicker`.

**Consumer provides:** `label`, and `value` + `onChange` (or `defaultValue`), as `{from, to}` (`"YYYY-MM-DD"`) or `null`. Optional `presets` (default: last 7 and 30 days, this and last month; `[]` for none), `min`, `max`, `maxDays`, `isDateDisabled`, `placeholder`, `hint`, `error`, `required`, `disabled`.

- A preset applies at once. A range picked on the calendar is a draft: Apply commits it, and Cancel or Esc discards it. Focus returns to the trigger either way.
- The footer states the range and its length ("2026-11-03 to 2026-11-12, 10 days"), or what's needed next. A range longer than `maxDays` can't be applied, and the footer says why.
- Two months side by side; one month on phones, with the presets above it.
- Keyboard: the same as `DatePicker`, then Tab reaches Cancel and Apply.
