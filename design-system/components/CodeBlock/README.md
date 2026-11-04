Monospace text with line numbers, a wrap toggle and a copy button: code, build and test logs, config, commands.

**Consumer provides:** `code` (a string; lines split on newlines). Optional `title` (file name or "Build log"), `highlight` (1-based line numbers to mark, e.g. the failing line), `lineNumbers`, `wrap`, `maxHeight` (default 320 px, then it scrolls), `copy`.

- No syntax colouring, on purpose: it keeps the one-accent rule and needs no dependency.
- The block is focusable so keyboard users can scroll it.
- For very long or live logs, show the tail (e.g. the last 500 lines) and link to the full log.
