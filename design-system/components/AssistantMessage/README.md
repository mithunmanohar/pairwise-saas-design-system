One turn of a conversation. The assistant's and agents' turns carry an icon or the agent's initials and their name; the person's turns sit on the right in a bordered box. A list item: `AssistantPanel` puts them in a list.

**Consumer provides:** `author` (`name`, `kind`: assistant, agent or person, optional `description`), `status` (streaming, done, stopped, error), `time`, children (Markdown, CodeBlock, DataTable, Metric, charts, ResourceCard…), `sources` + `onSource`, `statusText`, `onRetry`, `followUps` + `onFollowUp`, `feedback` + `onFeedback`, `onReport`, `copyText`, `onRegenerate`, `provenance`.

- Marked as AI by the icon, the name and the layout, never by colour, gradient or a sparkle. Agents use neutral avatars with initials.
- Streaming: the body is `aria-busy` and an indeterminate bar reads "Responding…". Nothing is announced per word; the panel announces the finished answer once.
- Stopped shows a "Stopped" badge and Regenerate. An error shows the reason in critical with Retry.
- Feedback is icon + label ("Helpful", "Not helpful"), as toggle buttons. Report opens a dialog with a reason. "About" shows when it was generated, the model, the context and tools it used.
- Follow-ups appear only after a finished answer.
