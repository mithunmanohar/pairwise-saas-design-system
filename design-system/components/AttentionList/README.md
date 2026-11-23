The things an answer asks you to look at, worst first, as rows rather than a paragraph. Each row has the identifier, its status and one action on the first line, and what it is on the second.

**Consumer provides:** `items` (`id`, `ref` (EntityRef props), `title`, optional `meta`, `status` + `statusLabel`, `action` (`label`, `onSelect`)), `title` (a short eyebrow such as "Needs attention"), `max` (rows before "Show N more", default 5).

- Sort worst first. Healthy rows show a quiet badge; only critical asks for action.
- One action per row, named with the identifier for screen readers ("Open INC-2041").
- At most `max` rows show, so an agent that returns 40 items can't bury the panel.
