One 16 px line icon set, drawn for this system, plus five filled status glyphs whose shape alone tells the states apart.

**Use** an icon only where it speeds up scanning: nav items, status, trace event kinds, icon-only buttons. Don't decorate headings or panels with icons.

**Consumer provides:** `name` (see the card), optional `size` (12/14/16/20) and `title`. With a `title` the icon is announced; without one it is `aria-hidden`, so the adjacent text must carry the meaning.

- Status glyphs: critical = octagon with `!`, warning = triangle with `!`, healthy = check circle, unknown = dashed circle with `?`, info = open ring. Never swap shapes between states.
- Icons inherit `currentColor`. Colour them only through a status tone class, never with a decorative hue.
- No emoji, ever.
