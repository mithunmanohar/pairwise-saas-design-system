A numbered reference from a sentence to the source it came from. It is read as "Source 1: checkout-api latency".

**Consumer provides:** `n` (1-based, matching the message's sources), `title`, and `href` or `onOpen`. Without either, it is a plain note.

- Grounded answers cite every claim that came from a source. The numbers match the `SourceList` under the answer.
- `Markdown` with `sources` turns "[1]" in model text into citations, so you rarely place them by hand.
- A bordered number in the text colour, never a colour of its own.
