The assistant's panel. Inside `AppShell`'s `assistant` slot it docks beside the content at 1280 px and wider, and is a modal drawer below that; `expanded` gives it the whole content area. Header: new conversation, history, expand, close.

**Consumer provides:** `open`, `onClose`, `composer` (a PromptComposer), messages as children (`AssistantMessage`), `conversations` + `activeId` + `onSelectConversation`, `onNewConversation`, `expanded` + `onExpandedChange`, `state` (ready, loading, empty, error, no-access) with `errorDetail` + `onRetry`, `empty` (what it can help with here), `announcement`.

- Opened from the top bar's launcher (`TopBar assistant`, Ctrl+I / ⌘I), "Ask the assistant" items in page and row menus, and a command in the palette. No floating button: it would cover rows and the toasts.
- Docked, it is a non-modal Radix dialog with a border and no shadow: the page stays usable, clicking the page keeps it open, and Escape closes it only from inside. Focus moves to the composer on open and back to the launcher on close.
- One polite live region reads `announcement` once per answer ("Assistant replied: …", "Response stopped"), never each streamed word. The newest words stay in view unless the person scrolls up.
- `AssistantProvider` holds open, expanded and the page's context; `useAssistant().ask(prompt, extraContext)` opens it from anywhere; `useAssistantContext(items)` declares what a page shows. It makes no model calls: `onAsk` hands the prompt and context to your app.
