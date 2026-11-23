Where people ask. A multiline input with suggestions, templates, attachments, @mentions and slash commands, and Send that becomes Stop while an answer streams.

**Consumer provides:** `onSubmit`, `value` + `onChange` (or `defaultValue`), `busy` + `onStop`, `suggestions` + `onSuggestion`, `templates`, `mentions` (+ `onMentionQuery`, `mentionsLoading`), `commands`, `attachments` (FileUpload's `files`, `onFiles`, `onRemove`, `accept`, `maxSize`), `context` (a ContextBar), `maxLength`, `disabled` + `disabledReason`, `hint`, `error`.

- Enter sends and Shift+Enter adds a line. An empty prompt shows "Type a question first."; over `maxLength`, the count turns critical and Send waits.
- Typing "@" lists `mentions` and "/" at the start lists `commands`. cmdk owns the list's arrows and Enter while it is open; Escape closes only the list. The textarea is labelled and points at the highlighted option.
- Templates insert text with the caret at the first "…", so people fill in the blank. Suggestions send at once.
- Attachments reuse FileUpload's rules and rows behind a paperclip button (`variant="button"`).
- Grows with its content up to eight lines, then scrolls.
