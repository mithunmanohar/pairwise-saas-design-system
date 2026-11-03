Chronological events: a run's trace, a change feed, an object's history. In Pairwise this becomes the run trace (tool calls, file edits, commands, test results).

**Consumer provides:** `events` `[{time, kind, title, body?, actor?, tag?, link?, highlight?}]` and `onEvent`. Kinds: `alert` `warn` `deploy` `config` `scale` `page` `ack` `ticket` `comment` `resolve` `info` (agentic kinds arrive in Phase 4).

- Time in mono: `HH:mm:ss` in a trace, `DD Mon HH:mm` in feeds, in the user's time zone. Newest last inside a trace (it reads as a story), newest first in feeds.
- Only alert (critical), warn and resolve events are coloured; everything else stays ink.
- `highlight` marks the suspected cause (e.g. the edit that preceded the failing test).
- Every event names its source by role (agent, your CI provider, your Git host) and its actor.
