Compare quantities across categories or days; stacked for parts of a whole.

**Consumer provides:** `categories`, `series` `[{name, values, color, pattern?}]`, `stacked` (default true), `unit`, `onBar(category, index)`, `state`, `ariaLabel`.

- **One stacking dimension at a time.** Stack by repository *or* by model, never both.
- Bars that show *states* use status colours; bars that show *categories* use `chart-1`…`chart-5` + `chart-other` (validated for colour-blind separation), never status colours.
- Bars are at most 24 px thick with a 4 px rounded data-end, square at the baseline, and a 2 px surface gap between stacked segments.
- `textures` (hatch at 45°/135°) is opt-in for print, forced-colours or an accessibility setting, never on by default.
- Bars start at zero. Prefer a table over bars for more than about 12 categories.
