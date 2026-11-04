Copies a value to the clipboard: run ids, commit hashes, links, commands.

**Consumer provides:** `value`. Either `children` (shown as monospace text with a copy icon; use for identifiers) or nothing plus `label` (an icon-only ghost button, e.g. "Copy run link"). Optional `onCopy`.

- The icon turns into a check for 1.5 s, and screen readers hear "Copied".
- Show a shortened id if you like (`4f9c2e1`), but copy the full value.
