A value that you edit where it is shown, such as a details field or a description. Use it inside `KeyValueList`, panels and page headers.

**Consumer provides:** `label` (names the value), `value`, `onSave(value)`. `onSave` may return a promise. Optional `validate(value)` (return a message to block saving), `multiline`, `mono`, `placeholder`, `emptyText` (default "Not set"), `disabled`.

- Click it, or press Enter on it, to edit. The field opens focused with the text selected.
- Saving: Enter in a single-line field, Ctrl/⌘+Enter in a multiline one, or the Save button.
- Cancelling: Esc or the Cancel button restores the value.
- While saving, the field stays focused and read-only and the button says "Saving…". If `onSave` rejects, the field stays open with the error's message. When editing ends, focus returns to the value.
- The view is a button named "Description: … , edit". The pencil appears on hover and focus.
- Use a form with a Save button when several fields change together.
