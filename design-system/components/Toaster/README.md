Shows toasts from anywhere in the app with one function call.

**Setup:** render `<Toaster />` once near the app root. **Use:** `toast("Link copied")` or `toast({ tone, title, body, action, onAction, duration })`. `toast.dismiss(id)` hides one; `toast.dismiss()` hides all.

- Toasts confirm something that already happened ("Saved", "Run re-queued"). Don't use them for errors the user must fix: show those next to the field or as an `AlertBanner`.
- They hide after 6 s. Critical ones stay until closed. Hovering or focusing the stack pauses the timer.
- At most 3 show at once (`max`), newest at the bottom.
