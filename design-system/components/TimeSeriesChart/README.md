Metrics over time. The workhorse chart.

**Consumer provides:** `series` `[{name, points, color?, dashed?}]` (`color` is a token name: `chart-1`…`chart-5`, `chart-other`; default ink), `labels`, `unit`, optional `threshold` `{value, label}`, `markers` `[{index, label}]` (changes), `onMarker`, `onBrush(from, to)`, `highlight` `[from, to]`, `state`, and an `ariaLabel` sentence that states the takeaway.

- **One series: ink**, no legend (the title names it). Comparison = `chart-other` dashed. Up to 5 categorical series (`chart-1`…`chart-5`, in order), then "Other". Prefer 3 or fewer.
- Lines are 2 px with round joins. With 2 to 4 series the legend is always shown and line ends are labelled directly when labels don't collide. Labels use text colours, never the series colour.
- Every chart has a "Show table" toggle so no value is reachable only by hovering.
- **Change markers are on by default** (dashed ink rule + diamond + mono label): merges, deploys, config changes. Clicking one opens the change.
- Thresholds are dashed `status-critical` lines with a muted text label. Never colour the series itself red.
- Y axis starts at 0 for rates and counts. Always label units. Horizontal gridlines only.
- Hover shows a crosshair with all values; brushing sets the global time range (with undo).
