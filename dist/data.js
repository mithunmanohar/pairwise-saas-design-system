import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from "./icons";
import { cx, StateBlock, Button, Skeleton } from "./core";
import * as React from "react";
import { Fragment } from "react";
const { useState, useRef, useEffect, useMemo } = React;
function useWidth(initial = 0) {
    const ref = useRef(null);
    const [w, setW] = useState(initial);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        setW(el.clientWidth || initial);
        const ro = new ResizeObserver((e) => { const r = e[0]; if (r)
            setW(Math.max(120, Math.floor(r.contentRect.width))); });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, w];
}
const tk = (v) => v.toLocaleString("en", { maximumFractionDigits: 2 });
const fmt = (v, d = 0) => (v == null || isNaN(v) ? "–" : v.toLocaleString("en", { maximumFractionDigits: d, minimumFractionDigits: d }));
/* ---------- DataTable ---------- */
// Rows are plain objects; columns read `row[column.key]` unless they supply render / sortValue.
const field = (r, k) => r[k];
const asNode = (v) => v == null || typeof v === "boolean" ? null : typeof v === "string" || typeof v === "number" || React.isValidElement(v) ? v : String(v);
// Same ordering as the relational operators for strings, numbers and dates; mixed or missing values compare equal.
const compare = (x, y) => {
    const a = x instanceof Date ? x.getTime() : x, b = y instanceof Date ? y.getTime() : y;
    if (typeof a === "string" && typeof b === "string")
        return a > b ? 1 : a < b ? -1 : 0;
    const na = typeof a === "boolean" ? +a : a, nb = typeof b === "boolean" ? +b : b;
    if (typeof na === "number" && typeof nb === "number")
        return na > nb ? 1 : na < nb ? -1 : 0;
    return 0;
};
export function DataTable({ columns, rows, rowKey = "id", defaultSort, renderExpanded, pageSize = 0, onRowClick, rowTone, state = "ready", emptyTitle, emptyBody, errorDetail, onRetry, caption, density, selectedKey, stickyHeader }) {
    const [sort, setSort] = useState(defaultSort || null);
    const [open, setOpen] = useState({});
    const [page, setPage] = useState(0);
    const sorted = useMemo(() => {
        if (!sort)
            return rows;
        const col = columns.find((c) => c.key === sort.key);
        if (!col)
            return rows;
        const get = col.sortValue || ((r) => field(r, col.key));
        return [...rows].sort((a, b) => compare(get(a), get(b)) * (sort.dir === "asc" ? 1 : -1));
    }, [rows, sort]);
    const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
    const view = pageSize ? sorted.slice(page * pageSize, page * pageSize + pageSize) : sorted;
    const ncol = columns.length + (renderExpanded ? 1 : 0);
    const toggleSort = (c) => { if (!c.sortable)
        return; setSort(!sort || sort.key !== c.key ? { key: c.key, dir: c.defaultDir || "desc" } : { key: c.key, dir: sort.dir === "asc" ? "desc" : "asc" }); };
    return (_jsxs("div", { className: cx("pw-table-wrap", density && "is-" + density), children: [_jsxs("table", { className: cx("pw-table", stickyHeader && "is-sticky"), children: [caption ? _jsx("caption", { className: "pw-sr", children: caption }) : null, _jsx("thead", { children: _jsxs("tr", { children: [renderExpanded ? _jsx("th", { className: "pw-table__x", "aria-label": "Expand" }) : null, columns.map((c) => {
                                    const s = sort && sort.key === c.key ? sort.dir : null;
                                    return (_jsx("th", { scope: "col", style: { width: c.width, textAlign: c.align }, "aria-sort": s ? (s === "asc" ? "ascending" : "descending") : undefined, children: c.sortable ? _jsxs("button", { type: "button", className: cx("pw-th-sort", s && "is-on"), onClick: () => toggleSort(c), children: [c.header, _jsx(Icon, { name: s === "asc" ? "arrow-up" : s === "desc" ? "arrow-down" : "sort", size: 12 })] }) : c.header }, c.key));
                                })] }) }), _jsx("tbody", { children: state === "loading" ? Array.from({ length: 5 }).map((_, i) => (_jsxs("tr", { className: "is-skel", children: [renderExpanded ? _jsx("td", {}) : null, columns.map((c, j) => _jsx("td", { children: _jsx(Skeleton, { w: j === 0 ? "70%" : "45%" }) }, j))] }, i))) : state === "error" ? (_jsx("tr", { children: _jsx("td", { colSpan: ncol, className: "pw-table__state", children: _jsx(StateBlock, { kind: "error", inline: true, title: "Couldn\u2019t load rows", body: "The data source didn\u2019t respond. Other panels on this page are unaffected.", detail: errorDetail, action: onRetry ? "Retry" : undefined, onAction: onRetry }) }) })) : !view.length ? (_jsx("tr", { children: _jsx("td", { colSpan: ncol, className: "pw-table__state", children: _jsx(StateBlock, { kind: "empty", inline: true, title: emptyTitle || "No rows match", body: emptyBody || "Clear filters or widen the time range." }) }) })) : view.map((r) => {
                            const id = field(r, rowKey);
                            const k = String(id);
                            const isOpen = !!open[k];
                            const tone = rowTone ? rowTone(r) : null;
                            return (_jsxs(Fragment, { children: [_jsxs("tr", { className: cx(tone && "is-" + tone, onRowClick && "is-click", selectedKey === id && "is-selected"), tabIndex: onRowClick ? 0 : undefined, onClick: onRowClick ? () => onRowClick(r) : undefined, onKeyDown: onRowClick ? (e) => { if (e.key === "Enter")
                                            onRowClick(r); } : undefined, children: [renderExpanded ? (_jsx("td", { className: "pw-table__x", children: _jsx("button", { type: "button", className: "pw-xbtn", "aria-expanded": isOpen, "aria-label": (isOpen ? "Collapse " : "Expand ") + k, onClick: (e) => { e.stopPropagation(); setOpen({ ...open, [k]: !isOpen }); }, children: _jsx(Icon, { name: isOpen ? "chevron-down" : "chevron-right", size: 14 }) }) })) : null, columns.map((c) => _jsx("td", { style: { textAlign: c.align }, className: cx(c.mono && "pw-mono", c.num && "is-nowrap", c.nowrap && "is-nowrap", c.className), children: c.render ? c.render(r) : asNode(field(r, c.key)) }, c.key))] }), renderExpanded && isOpen ? _jsxs("tr", { className: "pw-table__exp", children: [_jsx("td", {}), _jsx("td", { colSpan: columns.length, children: renderExpanded(r) })] }) : null] }, k));
                        }) })] }), pageSize && state === "ready" && sorted.length > pageSize ? (_jsxs("div", { className: "pw-pager", children: [_jsxs("span", { className: "pw-caption pw-muted pw-num", children: [page * pageSize + 1, "\u2013", Math.min(sorted.length, (page + 1) * pageSize), " of ", sorted.length] }), _jsx(Button, { size: "sm", variant: "ghost", icon: "chevron-left", "aria-label": "Previous page", disabled: page === 0, onClick: () => setPage(page - 1) }), _jsx(Button, { size: "sm", variant: "ghost", icon: "chevron-right", "aria-label": "Next page", disabled: page >= pages - 1, onClick: () => setPage(page + 1) })] })) : null] }));
}
/* ---------- Time series ---------- */
// series: [{name, points:number[], color?: 'chart-1'|..|'ink', dashed?}], labels: string[] (same length), unit
export function TimeSeriesChart({ series = [], labels = [], unit = "", height = 180, threshold, markers = [], yMax, yMin = 0, onMarker, onBrush, ariaLabel, decimals = 0, band, state = "ready", highlight, table = true, endLabels = true }) {
    const [ref, w] = useWidth();
    const [hover, setHover] = useState(null);
    const [drag, setDrag] = useState(null);
    const [asTable, setAsTable] = useState(false);
    const n = labels.length || (series[0] && series[0].points.length) || 0;
    const all = series.flatMap((s) => s.points).filter((v) => v != null);
    const max = yMax || niceMax(Math.max(...all, threshold ? threshold.value : 0) * 1.08);
    // direct end labels for 2–4 series when they don't collide (dataviz: legend + selective direct labels)
    const lastOf = (s) => { for (let i = s.points.length - 1; i >= 0; i--) {
        const v = s.points[i];
        if (v != null)
            return v;
    } return null; };
    const ih0 = height - 22 - 22;
    const ends = series.flatMap((s, k) => { const v = lastOf(s); return v == null ? [] : [{ k, v, name: s.name, color: s.color }]; })
        .map((e) => ({ ...e, y: 22 + ih0 - ((Math.max(e.v, yMin) - yMin) / (max - yMin)) * ih0 })).sort((a, b) => a.y - b.y);
    const collide = ends.some((e, i) => { const prev = ends[i - 1]; return prev != null && e.y - prev.y < 14; });
    const showEnd = endLabels && series.length >= 2 && series.length <= 4 && !collide && w > 420;
    const pad = { l: 44, r: showEnd ? 112 : 12, t: 22, b: 22 };
    const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
    const sx = (i) => pad.l + (n > 1 ? (i * iw) / (n - 1) : 0);
    const sy = (v) => pad.t + ih - (Math.max(v, yMin) - yMin) / (max - yMin) * ih;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + t * (max - yMin));
    const xt = [0, Math.floor((n - 1) / 2), n - 1];
    const idxAt = (x) => Math.max(0, Math.min(n - 1, Math.round(((x - pad.l) / iw) * (n - 1))));
    if (state !== "ready")
        return _jsx("div", { ref: ref, className: "pw-chart", style: { height }, children: _jsx(ChartState, { state: state, height: height }) });
    if (w < 60)
        return _jsx("div", { ref: ref, className: "pw-chart", style: { height: height + (table ? 22 : 0) } });
    const toneOf = (c) => (c ? "var(--" + c + ")" : "var(--ink)");
    const tbl = (_jsx("div", { className: "pw-chart__table", children: _jsxs("table", { className: "pw-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Time" }), series.map((s) => _jsxs("th", { style: { textAlign: "right" }, children: [s.name, unit ? " (" + unit + ")" : ""] }, s.name))] }) }), _jsx("tbody", { children: labels.map((l, i) => _jsxs("tr", { children: [_jsx("td", { children: l }), series.map((s) => _jsx("td", { style: { textAlign: "right" }, children: fmt(s.points[i], decimals) }, s.name))] }, i)) })] }) }));
    return (_jsxs("div", { ref: ref, className: "pw-chart", children: [table ? _jsx("div", { className: "pw-chart__bar", children: _jsx("button", { type: "button", className: "pw-chart__toggle", "aria-pressed": asTable, onClick: () => setAsTable(!asTable), children: asTable ? "Show chart" : "Show table" }) }) : null, asTable ? tbl : (_jsxs("svg", { width: w, height: height, role: "img", "aria-label": ariaLabel, onMouseLeave: () => { setHover(null); setDrag(null); }, onMouseMove: (e) => { const x = e.clientX - e.currentTarget.getBoundingClientRect().left; const i = idxAt(x); setHover(i); if (drag)
                    setDrag({ ...drag, b: i }); }, onMouseDown: (e) => { if (!onBrush)
                    return; const i = idxAt(e.clientX - e.currentTarget.getBoundingClientRect().left); setDrag({ a: i, b: i }); }, onMouseUp: () => { if (drag && Math.abs(drag.b - drag.a) > 1 && onBrush)
                    onBrush(Math.min(drag.a, drag.b), Math.max(drag.a, drag.b)); setDrag(null); }, children: [ticks.map((t, i) => _jsxs("g", { children: [_jsx("line", { x1: pad.l, x2: w - pad.r, y1: sy(t), y2: sy(t), className: "pw-grid" }), _jsx("text", { x: pad.l - 8, y: sy(t) + 4, className: "pw-tick", textAnchor: "end", children: tk(t) })] }, i)), xt.map((i) => _jsx("text", { x: sx(i), y: height - 5, className: "pw-tick", textAnchor: i === 0 ? "start" : i === n - 1 ? "end" : "middle", children: labels[i] }, i)), _jsx("text", { x: pad.l - 8, y: 10, className: "pw-tick", textAnchor: "end", children: unit }), highlight ? _jsx("rect", { x: sx(highlight[0]), y: pad.t, width: Math.max(2, sx(highlight[1]) - sx(highlight[0])), height: ih, className: "pw-hl" }) : null, band ? _jsx("rect", { x: pad.l, y: sy(band[1]), width: iw, height: sy(band[0]) - sy(band[1]), className: "pw-band" }) : null, threshold ? _jsxs("g", { children: [_jsx("line", { x1: pad.l, x2: w - pad.r, y1: sy(threshold.value), y2: sy(threshold.value), className: "pw-thr" }), _jsx("text", { x: showEnd ? pad.l + 6 : w - pad.r - 4, y: sy(threshold.value) - 6, className: "pw-tick", textAnchor: showEnd ? "start" : "end", children: threshold.label })] }) : null, series.map((s, k) => {
                        let d = "";
                        s.points.forEach((v, i) => { if (v == null)
                            return; d += (d && s.points[i - 1] != null ? "L" : "M") + sx(i).toFixed(1) + "," + sy(v).toFixed(1); });
                        return _jsx("path", { d: d, fill: "none", stroke: toneOf(s.color), strokeWidth: s.dashed ? 1.5 : 2, strokeDasharray: s.dashed ? "4 4" : undefined, strokeLinejoin: "round", strokeLinecap: "round" }, k);
                    }), showEnd ? ends.map((e) => _jsxs("g", { children: [_jsx("circle", { cx: sx(n - 1), cy: e.y, r: "4", fill: toneOf(e.color), stroke: "var(--surface-raised)", strokeWidth: "2" }), _jsx("text", { x: sx(n - 1) + 10, y: e.y + 4, className: "pw-endlab", children: e.name })] }, e.k)) : null, markers.map((m, i) => (_jsxs("g", { className: "pw-marker", tabIndex: 0, role: "button", "aria-label": "Change: " + m.label, onClick: () => onMarker && onMarker(m), onKeyDown: (e) => e.key === "Enter" && onMarker && onMarker(m), children: [_jsx("rect", { x: sx(m.index) - 12, y: pad.t - 14, width: 24, height: ih + 14, fill: "transparent" }), _jsx("line", { x1: sx(m.index), x2: sx(m.index), y1: pad.t, y2: pad.t + ih, className: "pw-marker__l" }), _jsx("path", { d: `M${sx(m.index)},${pad.t - 4} l5,5 l-5,5 l-5,-5z`, className: "pw-marker__g" }), _jsx("text", { x: sx(m.index) + 9, y: pad.t + 5, className: "pw-marker__t", children: m.label })] }, i))), drag ? _jsx("rect", { x: sx(Math.min(drag.a, drag.b)), y: pad.t, width: Math.abs(sx(drag.b) - sx(drag.a)), height: ih, className: "pw-brush" }) : null, hover != null ? _jsx("line", { x1: sx(hover), x2: sx(hover), y1: pad.t, y2: pad.t + ih, className: "pw-cross" }) : null, hover != null ? series.map((s, k) => { const v = s.points[hover]; return v == null ? null : _jsx("circle", { cx: sx(hover), cy: sy(v), r: "4", fill: toneOf(s.color), stroke: "var(--surface-raised)", strokeWidth: "2" }, k); }) : null] })), !asTable && hover != null ? (_jsxs("div", { className: "pw-chart__tip", style: { left: Math.min(sx(hover) + 12, w - 190), top: 24 }, children: [_jsx("div", { className: "pw-caption pw-muted pw-num", children: labels[hover] }), series.map((s, k) => _jsxs("div", { className: "pw-chart__tiprow", children: [_jsx("i", { style: { background: toneOf(s.color) }, className: s.dashed ? "is-dashed" : "" }), _jsx("span", { children: s.name }), _jsxs("b", { children: [fmt(s.points[hover], decimals), " ", unit] })] }, k))] })) : null, !asTable && series.length > 1 ? _jsx(Legend, { line: true, items: series.map((s) => ({ name: s.name, color: s.color, dashed: s.dashed })) }) : null] }));
}
function niceMax(v) { if (v <= 0)
    return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
export function Legend({ items, line }) {
    return _jsx("ul", { className: "pw-legend", children: items.map((it) => _jsxs("li", { children: [_jsx("i", { className: cx(line && "is-line", it.dashed && "is-dashed"), style: { background: it.dashed ? undefined : "var(--" + (it.color || "ink") + ")", borderColor: "var(--" + (it.color || "ink") + ")" } }), it.name] }, it.name)) });
}
function ChartState({ state, height }) {
    if (state === "loading")
        return _jsx("div", { className: "pw-chart__sk", style: { height }, "aria-busy": "true", children: _jsx(Skeleton, { h: height - 24 }) });
    if (state === "empty")
        return _jsx(StateBlock, { kind: "empty", inline: true, title: "No data points in this range", body: "The source reported no samples. Try a wider range." });
    if (state === "no-access")
        return _jsx(StateBlock, { kind: "no-access", inline: true, body: "This metric belongs to example-team. Ask an owner for viewer access." });
    return _jsx(StateBlock, { kind: "error", inline: true, title: "Chart failed to load", body: "Query exceeded 30 s. Narrow the time range or retry." });
}
/* ---------- Bar / stacked bar ---------- */
// categories: string[], series: [{name, values:number[], color, pattern?}]. Patterns render only when `textures` is on (a11y / print).
export function BarChart({ categories = [], series = [], stacked = true, height = 160, unit = "", ariaLabel, onBar, state = "ready", textures = false }) {
    const [ref, w] = useWidth();
    const [hover, setHover] = useState(null);
    const pid = "cap" + String(React.useId()).replace(/[^a-zA-Z0-9]/g, "");
    const pad = { l: 40, r: 8, t: 10, b: 24 };
    const totals = categories.map((_, i) => stacked ? series.reduce((a, s) => a + (s.values[i] || 0), 0) : Math.max(...series.map((s) => s.values[i] || 0)));
    const max = niceMax(Math.max(...totals, 1));
    const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
    const bw = iw / categories.length;
    const sy = (v) => (v / max) * ih;
    if (state !== "ready")
        return _jsx("div", { ref: ref, className: "pw-chart", children: _jsx(ChartState, { state: state, height: height }) });
    if (w < 60)
        return _jsx("div", { ref: ref, className: "pw-chart", style: { height } });
    const every = Math.ceil(categories.length / Math.max(1, Math.floor(iw / 52)));
    const thick = Math.min(24, bw * 0.6);
    const GAP = 2, RAD = 4;
    // rounded data-end at the top, square at the baseline
    const topRounded = (x, y, ww, hh) => { const r = Math.min(RAD, ww / 2, hh); return `M${x},${y + hh}V${y + r}Q${x},${y} ${x + r},${y}H${x + ww - r}Q${x + ww},${y} ${x + ww},${y + r}V${y + hh}Z`; };
    return (_jsxs("div", { ref: ref, className: "pw-chart", children: [_jsxs("svg", { width: w, height: height, role: "img", "aria-label": ariaLabel, onMouseLeave: () => setHover(null), children: [textures ? _jsx("defs", { children: series.map((s, k) => s.pattern ? _jsxs("pattern", { id: pid + k, width: "6", height: "6", patternUnits: "userSpaceOnUse", patternTransform: "rotate(" + (k % 2 ? 135 : 45) + ")", children: [_jsx("rect", { width: "6", height: "6", fill: "var(--" + s.color + ")" }), _jsx("line", { x1: "0", y1: "0", x2: "0", y2: "6", stroke: "var(--surface-raised)", strokeWidth: "1.4" })] }, k) : null) }) : null, [0, 0.5, 1].map((t, i) => _jsxs("g", { children: [_jsx("line", { x1: pad.l, x2: w - pad.r, y1: pad.t + ih - t * ih, y2: pad.t + ih - t * ih, className: "pw-grid" }), _jsx("text", { x: pad.l - 8, y: pad.t + ih - t * ih + 4, className: "pw-tick", textAnchor: "end", children: tk(t * max) })] }, i)), categories.map((c, i) => {
                        let acc = 0;
                        const x0 = pad.l + i * bw + (bw - thick) / 2;
                        const segs = series.map((s, k) => ({ s, k, v: s.values[i] || 0 })).filter((x) => x.v > 0);
                        return (_jsxs("g", { onMouseEnter: () => setHover(i), onClick: () => onBar && onBar(c, i), className: cx(onBar && "is-click"), children: [_jsx("rect", { x: pad.l + i * bw, y: pad.t, width: bw, height: ih, fill: "transparent" }), segs.map((g, j) => {
                                    const hgt = sy(g.v);
                                    const isTop = stacked ? j === segs.length - 1 : true;
                                    const y = pad.t + ih - (stacked ? acc : 0) - hgt;
                                    if (stacked)
                                        acc += hgt;
                                    const x = stacked ? x0 : x0 + (thick / series.length) * g.k;
                                    const ww = stacked ? thick : thick / series.length - GAP;
                                    const hh = Math.max(1, hgt - (stacked && j > 0 ? GAP : 0));
                                    const fill = textures && g.s.pattern ? "url(#" + pid + g.k + ")" : "var(--" + g.s.color + ")";
                                    return isTop ? _jsx("path", { d: topRounded(x, y, Math.max(1, ww), hh), fill: fill, opacity: hover != null && hover !== i ? 0.5 : 1 }, g.k)
                                        : _jsx("rect", { x: x, y: y, width: Math.max(1, ww), height: hh, fill: fill, opacity: hover != null && hover !== i ? 0.5 : 1 }, g.k);
                                }), i % every === 0 ? _jsx("text", { x: pad.l + i * bw + bw / 2, y: height - 6, className: "pw-tick", textAnchor: "middle", children: c }) : null] }, i));
                    })] }), hover != null ? (_jsxs("div", { className: "pw-chart__tip", style: { left: Math.min(pad.l + hover * bw + bw, w - 190), top: 6 }, children: [_jsx("div", { className: "pw-caption pw-muted", children: categories[hover] }), series.map((s, k) => _jsxs("div", { className: "pw-chart__tiprow", children: [_jsx("i", { style: { background: "var(--" + s.color + ")", height: 8, width: 8 } }), _jsx("span", { children: s.name }), _jsxs("b", { children: [fmt(s.values[hover] || 0, unit.includes("k") ? 1 : 0), " ", unit] })] }, k)), stacked && series.length > 1 ? _jsxs("div", { className: "pw-chart__tiprow", children: [_jsx("i", {}), _jsx("span", { className: "pw-muted", children: "Total" }), _jsxs("b", { children: [fmt(totals[hover], unit.includes("k") ? 1 : 0), " ", unit] })] }) : null] })) : null, series.length > 1 ? _jsx(Legend, { items: series.map((s) => ({ name: s.name, color: s.color })) }) : null] }));
}
/* ---------- Run strip: last N runs inline in a table cell ---------- */
export function RunStrip({ runs = [], labels = [], name = "" }) {
    const word = { critical: "failed", warning: "succeeded after retry", healthy: "succeeded", info: "running", unknown: "skipped" };
    const glyph = { critical: "✕", warning: "↻", healthy: "", info: "", unknown: "" };
    const fails = runs.filter((r) => r === "critical").length;
    return (_jsx("span", { className: "pw-runs", role: "img", "aria-label": `${name} last ${runs.length} runs: ${fails} failed. ` + runs.map((r, i) => (labels[i] || "run " + (i + 1)) + " " + word[r]).join(", "), children: runs.map((r, i) => _jsx("span", { className: cx("pw-run", "is-" + r), title: (labels[i] || "") + " " + word[r], children: glyph[r] }, i)) }));
}
/* ---------- Heatmap (sequential: one hue, light to dark) ---------- */
export function Heatmap({ rows = [], cols = [], values = [], unit = "", ariaLabel, max }) {
    const m = max || Math.max(...values.flat().filter((v) => v != null), 1);
    const [hover, setHover] = useState(null);
    return (_jsxs("div", { className: "pw-heat", role: "img", "aria-label": ariaLabel, children: [_jsxs("div", { className: "pw-heat__grid", style: { gridTemplateColumns: `120px repeat(${cols.length}, minmax(10px, 1fr))` }, children: [rows.map((r, i) => (_jsxs(Fragment, { children: [_jsx("span", { className: "pw-caption pw-mono pw-heat__r", children: r }), cols.map((c, j) => {
                                const v = values[i]?.[j];
                                return _jsx("span", { className: "pw-heat__c", onMouseEnter: () => setHover({ r, c, v }), onMouseLeave: () => setHover(null), style: { opacity: v == null ? 1 : 0.08 + 0.92 * (v / m) }, "data-null": v == null ? "1" : undefined }, j);
                            })] }, r))), _jsx("span", {}), cols.map((c, j) => _jsx("span", { className: "pw-tick pw-heat__x", children: j % 4 === 0 ? c : "" }, j))] }), _jsxs("div", { className: "pw-heat__f pw-caption pw-muted", children: [hover ? _jsxs("span", { className: "pw-num", children: [hover.r, " \u00B7 ", hover.c, ": ", _jsx("b", { children: hover.v == null ? "no data" : fmt(hover.v, 1) + " " + unit })] }) : _jsx("span", { children: "Darker = higher. Hatched = no data." }), _jsxs("span", { className: "pw-heat__scale", children: [_jsx("span", { children: "0" }), _jsx("i", {}), _jsxs("span", { className: "pw-num", children: [fmt(m, 0), " ", unit] })] })] })] }));
}
/* ---------- Status grid (e.g. DAG × runs) ---------- */
export function StatusGrid({ rows = [], cols = [], cells = [], onCell, ariaLabel, rowLabelWidth = 200 }) {
    const glyph = { critical: "✕", warning: "↻", healthy: "", unknown: "–", info: "•" };
    return (_jsxs("div", { className: "pw-sgrid", role: "grid", "aria-label": ariaLabel, children: [_jsxs("div", { className: "pw-sgrid__row pw-sgrid__head", role: "row", style: { gridTemplateColumns: `${rowLabelWidth}px repeat(${cols.length}, 18px)` }, children: [_jsx("span", { role: "columnheader", className: "pw-caption pw-muted", children: "" }), cols.map((c, j) => _jsx("span", { role: "columnheader", className: "pw-tick pw-sgrid__ch", children: j % 2 === 0 ? c : "" }, j))] }), rows.map((r, i) => (_jsxs("div", { className: "pw-sgrid__row", role: "row", style: { gridTemplateColumns: `${rowLabelWidth}px repeat(${cols.length}, 18px)` }, children: [_jsx("span", { role: "rowheader", className: "pw-mono pw-sgrid__rh", children: r.label }), cols.map((c, j) => {
                        const s = cells[i]?.[j];
                        return _jsx("button", { type: "button", role: "gridcell", className: cx("pw-sgrid__c", "is-" + s), "aria-label": `${r.label}, ${c}: ${s === "critical" ? "failed" : s === "warning" ? "succeeded after retry" : s === "healthy" ? "succeeded" : s === "info" ? "running" : "skipped"}`, onClick: () => onCell && s && onCell(r, c, s), children: s ? glyph[s] : null }, j);
                    })] }, r.key))), _jsxs("div", { className: "pw-sgrid__key pw-caption pw-muted", children: [_jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-healthy" }), "Succeeded"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-warning", children: "\u21BB" }), "Succeeded after retry"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-critical", children: "\u2715" }), "Failed"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-info", children: "\u2022" }), "Running"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-unknown", children: "\u2013" }), "Skipped"] })] })] }));
}
/* ---------- Bullet bar: used vs requested vs limit ---------- */
export function BulletBar({ used, requested, limit, unit = "", warnAt = 0.8, critAt = 0.92, label }) {
    const p = (v) => Math.min(100, (v / limit) * 100) + "%";
    const ratio = used / limit;
    const tone = ratio >= critAt ? "critical" : ratio >= warnAt ? "warning" : "ink";
    return (_jsxs("div", { className: "pw-bullet", role: "img", "aria-label": `${label || ""} ${fmt(used, 1)} of ${fmt(limit, 1)} ${unit} used, ${fmt(requested, 1)} requested`, children: [_jsxs("div", { className: "pw-bullet__track", children: [_jsx("span", { className: "pw-bullet__req", style: { width: p(requested) } }), _jsx("span", { className: cx("pw-bullet__used", "pw-fill--" + tone), style: { width: p(used) } }), _jsx("span", { className: "pw-bullet__lim", style: { left: "calc(100% - 1px)" } })] }), _jsxs("span", { className: cx("pw-num pw-caption", tone !== "ink" && "pw-tone--" + tone), children: [Math.round(ratio * 100), "%"] })] }));
}
/* ---------- Timeline / event feed ---------- */
const EV_ICON = { alert: "critical", warn: "warning", deploy: "changes", config: "settings", ack: "check", comment: "comment", scale: "scale", resolve: "healthy", page: "bell", ticket: "ticket", info: "info" };
export function Timeline({ events = [], onEvent, dense }) {
    return (_jsx("ol", { className: cx("pw-timeline", dense && "is-dense"), children: events.map((e, i) => (_jsxs("li", { className: cx("pw-tl", "pw-tl--" + e.kind, e.highlight && "is-hl"), children: [_jsx("time", { className: "pw-caption pw-muted pw-tl__t", children: e.time }), _jsx("span", { className: cx("pw-tl__i", (e.kind === "alert") && "pw-tone--critical", e.kind === "warn" && "pw-tone--warning", e.kind === "resolve" && "pw-tone--healthy"), children: _jsx(Icon, { name: EV_ICON[e.kind] || "info", size: 14 }) }), _jsxs("div", { className: "pw-tl__b", children: [_jsxs("div", { children: [onEvent && e.link ? _jsx("button", { type: "button", className: "pw-tl__link", onClick: () => onEvent(e), children: e.title }) : _jsx("span", { className: "pw-body-strong", children: e.title }), e.tag ? _jsx("span", { className: "pw-tag", children: e.tag }) : null] }), e.body ? _jsx("div", { className: "pw-muted", children: e.body }) : null, e.actor ? _jsx("div", { className: "pw-caption pw-muted", children: e.actor }) : null] })] }, i))) }));
}
//# sourceMappingURL=data.js.map