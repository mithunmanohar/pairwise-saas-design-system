Add files by dropping them or choosing them, see each upload's progress, and retry or remove it. You own the upload: the component handles choosing, checking and showing files.

**Consumer provides:** `label`, `onFiles(files)` (the accepted files), and `files`: your uploads as `{id, name, size, status, progress?, error?}`, where `status` is `queued`, `uploading`, `done` or `error`. Also `onRemove(id)` and `onRetry(id)`. Optional `accept` (e.g. `".json,.txt"` or `"image/*"`), `maxSize` (bytes), `multiple` (default true), `maxFiles`, `hint`, `error`, `required`, `disabled`.

- "Choose files" is the keyboard path; the drop zone is for the mouse. Dropping highlights the zone.
- Files are checked for type, size and count before `onFiles`. Rejected files are listed with the reason ("Larger than 5 MB.") until dismissed.
- Each file shows its name (mono), size, a `ProgressBar` while uploading, and Retry after an error. Remove and Dismiss are named after the file.
- A polite status message announces what happened ("2 files added. photo.png: not an accepted type").

**As a button (2.2).** `variant="button"` replaces the drop zone with a paperclip button named by `label`, for tight places like the assistant's composer. The checks, the file rows and the status message are the same. Its parts join the parent's layout (`display: contents`), so a composer can place the button in its toolbar and the files above the input.
