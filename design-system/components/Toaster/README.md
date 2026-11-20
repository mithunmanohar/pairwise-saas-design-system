Shows toasts from anywhere in the app with one function call.

**Setup:** render `<Toaster />` once near the app root. **Use:** `toast("Link copied")` or `toast({ tone, title, body, action, onAction, duration })`. `toast.dismiss(id)` hides one; `toast.dismiss()` hides all.

- Toasts confirm something that already happened ("Saved", "Run re-queued"). Don't use them for errors the user must fix: show those next to the field or as an `AlertBanner`.
- They hide after 6 s. Critical ones stay until closed. Hovering or focusing a toast, or leaving the window, pauses the timer.
- Built on Radix Toast. The notification region is always in the page, so the first toast is announced too. Critical toasts are announced assertively, others politely. F8 moves focus to the toasts; on touch screens a toast can be swiped away.
- At most 3 show at once (`max`), newest at the bottom.
