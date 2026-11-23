An identifier inside text or a row: the kind's icon and the name in mono on a neutral tint. It reads as a thing you can open, apart from the words that describe it ("`INC-2041` p95 latency above SLO").

**Consumer provides:** `label`, `kind` (an `EntityKind`) or `icon` + `kindLabel` for other things (an incident, a cost workspace), and `href` or `onOpen`. `mono` defaults to true.

- The tint is `surface-selected`, a neutral. Never a colour: colour means status.
- The kind is read before the name ("Incident INC-2041"). As a link, it underlines on hover.
- `Markdown` and `AssistantAnswer` take `entities` and turn every matching identifier in model text into one, so answers stay scannable without the model doing anything special.
- Pass only real identifiers to `entities` (`INC-2041`, `checkout-api`). An ordinary word ("training") would turn every use of the word into a chip.
