Monospace text with line numbers, a wrap toggle and a copy button: code, build and test logs, config, commands.

**Consumer provides:** `code` (a string; lines split on newlines). Optional `title` (file name or "Build log"), `highlight` (1-based line numbers to mark, e.g. the failing line), `lineNumbers`, `wrap`, `maxHeight` (default 320 px, then it scrolls), `copy`.

- No syntax colouring, on purpose: it keeps the one-accent rule and needs no dependency.
- The block is focusable so keyboard users can scroll it.
- For very long or live logs, show the tail (e.g. the last 500 lines) and link to the full log.

**Diffs (2.2).** `diff` reads a unified diff. `+` and `−` lines get a sign column and a neutral tint, and screen readers hear "Added:" or "Removed:". `@@` and file headers are muted. There is no red or green: red is kept for what needs action, and the sign carries the meaning. Copy copies the diff as given. A `diff` fence in `Markdown` uses it.
