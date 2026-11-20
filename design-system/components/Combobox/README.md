Pick one, or several with `multiple`, from a list that is long enough to search. It is the Select you can type into, and the tag input. Built on Radix Popover + cmdk (the shadcn/ui pattern), styled as Signal.

**Consumer provides:** `label`, `options` (strings or `{value, label, meta, description, keywords, disabled}`), and `value` + `onChange` (or `defaultValue`). With `multiple`, the value is a string array.

**Optional:**
- `placeholder`, `searchPlaceholder`, `emptyText`.
- `clearable` (single, default true).
- `creatable` + `onCreate` ("Create “x”").
- For server search: `onQueryChange`, `filter={false}` and `loading`.
- `name` (hidden inputs), `hint`, `error`, `required`, `disabled`.

- The trigger is a combobox button. Enter, Space or ↓ opens it, and typing a letter opens it with that letter in the search. In the list, arrows, Home/End and Enter work, and the highlighted option is announced. Esc closes and returns focus.
- Single: a pick closes the list; the clear button empties it. Multiple: the list stays open and picks show as removable tags; Backspace on the trigger removes the last one.
- Matching: every word must appear in the label, meta, description or keywords; labels that start with the query rank first.
- Use `Select` for short fixed lists (under about 10 options) and `MenuSelect` in toolbars.
