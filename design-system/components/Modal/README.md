Blocking confirmation for consequential or irreversible actions. Rare.

**Consumer provides:** `open`, `title` (a question naming the object), children (exactly what will happen, with names in mono), `actions` (secondary Cancel + the specific action), `tone="critical"` for destructive actions.

- Only for confirmations and short forms. Investigations belong in drawers or pages.
- The confirm button repeats the verb and object ("Merge into main", "Stop run_8f3k2"), never "OK".
- Built on Radix Dialog: focus is trapped, the rest of the page is hidden from screen readers, and Esc, a click outside or Cancel close it and return focus to whatever opened it. `contained` renders it non-modal inside its parent (for demos).
- `tone="critical"` makes it an `alertdialog`: its body is read as the description when it opens, and a click outside doesn't dismiss it (Esc, Close and the actions still do).
- Fades in (dialog moves 8 px). Off with reduced motion.
