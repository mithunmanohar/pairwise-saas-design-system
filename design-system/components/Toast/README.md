Brief confirmation of an action the user just took, bottom-right, auto-dismiss after 6 s (errors stay until closed). This is the visual; in apps, show toasts with `toast()` and `<Toaster />` (see the Toaster card), which handle stacking and timing.

**Consumer provides:** `tone`, `title` (past tense, specific: "Approved run_8f3k2"), optional `body`, `action` (often Undo), `onClose`.

- Toasts confirm actions; they never announce new problems. New problems go to the bell, the nav badge and banners.
- Max 3 visible; newest at the bottom.
