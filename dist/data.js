import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Icon, entityIcon, entityLabel } from "./icons";
import { cx, StateBlock, StatusBadge, Button, Skeleton, MenuSelect, SegmentedControl } from "./core";
import { Checkbox } from "./forms";
import { ActionMenu } from "./actions";
import * as DM from "@radix-ui/react-dropdown-menu";
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
// Groups rows by their path below the scope, keeping the sorted order: a group sits where its first row would.
function buildGroups(rows, getPath) {
    const root = [];
    const byKey = new Map();
    for (const r of rows) {
        let level = root, key = "";
        for (const seg of getPath(r)) {
            key += "/" + seg.id;
            let g = byKey.get(key);
            if (!g) {
                g = { key, seg, entries: [], all: [] };
                byKey.set(key, g);
                level.push({ type: "group", group: g });
            }
            g.all.push(r);
            level = g.entries;
        }
        level.push({ type: "row", row: r });
    }
    return root;
}
const allGroupKeys = (entries) => entries.flatMap((e) => (e.type === "group" ? [e.group.key, ...allGroupKeys(e.group.entries)] : []));
const STATUS_ORDER = ["critical", "warning", "unknown", "info", "healthy"];
const STATUS_WORD = { critical: "Critical", warning: "Warning", healthy: "Healthy", unknown: "No data", info: "Running" };
const numOf = (c, r) => { const v = c.sortValue ? c.sortValue(r) : r[c.key]; return typeof v === "number" ? v : Number(v) || 0; };
function rollupCell(c, rows) {
    const r = c.rollup;
    if (!r)
        return _jsx("span", { className: "pw-muted", "aria-label": "Not totalled", children: "\u2013" });
    if (typeof r === "function")
        return r(rows);
    if (r === "sum") {
        const n = rows.reduce((a, x) => a + numOf(c, x), 0);
        return c.format ? c.format(n) : n.toLocaleString();
    }
    if (r === "latest") {
        const top = [...rows].sort((a, b) => numOf(c, b) - numOf(c, a))[0];
        return top ? (c.render ? c.render(top) : asNode(top[c.key])) : null;
    }
    const sts = rows.map(r.status);
    const worst = STATUS_ORDER.find((s) => sts.includes(s)) ?? "unknown";
    const word = (s) => (r.word ? r.word(s) : STATUS_WORD[s]).toLowerCase();
    const n = sts.filter((s) => s === worst).length;
    return _jsx(StatusBadge, { status: worst, label: worst === "healthy" ? "All " + word("healthy") : n + " " + word(worst) });
}
// The path line under a row's name in List view: the levels below the scope, folded in the middle when long.
function PathLine({ path, direct }) {
    if (!path.length)
        return _jsx("span", { className: "pw-path", children: direct });
    const parts = path.length > 3 ? [path[0].label, "…", ...path.slice(-2).map((p) => p.label)] : path.map((p) => p.label);
    return (_jsx("span", { className: "pw-path", title: path.map((p) => p.label).join(" › "), children: parts.map((p, i) => _jsxs(Fragment, { children: [i ? _jsx("span", { className: "pw-path__sep", "aria-hidden": "true", children: "\u203A" }) : null, _jsx("span", { children: p })] }, i)) }));
}
/* ---------- Pagination ---------- */
// Pages are 1-based. The range ("26–50 of 312") is a polite live region, so a page change is announced.
export function Pagination({ page, pageSize, total, onPageChange, pageSizeOptions, onPageSizeChange, firstLast = true, label = "Pagination" }) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const cur = Math.min(Math.max(1, page), pages);
    const from = total ? (cur - 1) * pageSize + 1 : 0, to = Math.min(total, cur * pageSize);
    const go = (p) => onPageChange && onPageChange(Math.min(Math.max(1, p), pages));
    return (_jsxs("nav", { className: "pw-pager", "aria-label": label, children: [pageSizeOptions && onPageSizeChange ? (_jsx("span", { className: "pw-pager__size", children: _jsx(MenuSelect, { quiet: true, label: "Rows per page", prefix: "Rows", value: String(pageSize), options: pageSizeOptions.map(String), onChange: (v) => onPageSizeChange(Number(v)) }) })) : null, _jsxs("span", { className: "pw-caption pw-muted pw-num", role: "status", children: [from.toLocaleString(), "\u2013", to.toLocaleString(), " of ", total.toLocaleString()] }), firstLast ? _jsx(Button, { size: "sm", variant: "ghost", icon: "chevrons-left", "aria-label": "First page", disabled: cur <= 1, onClick: () => go(1) }) : null, _jsx(Button, { size: "sm", variant: "ghost", icon: "chevron-left", "aria-label": "Previous page", disabled: cur <= 1, onClick: () => go(cur - 1) }), firstLast ? _jsxs("span", { className: "pw-caption pw-num pw-pager__pages", children: ["Page ", cur, " of ", pages] }) : null, _jsx(Button, { size: "sm", variant: "ghost", icon: "chevron-right", "aria-label": "Next page", disabled: cur >= pages, onClick: () => go(cur + 1) }), firstLast ? _jsx(Button, { size: "sm", variant: "ghost", icon: "chevrons-right", "aria-label": "Last page", disabled: cur >= pages, onClick: () => go(pages) }) : null] }));
}
/* ---------- Columns menu (column visibility) ---------- */
// A "Columns" menu of checkbox items for DataTable's hiddenColumns. Columns marked `hideable: false` stay on.
export function ColumnsMenu({ columns, hidden, onChange, label = "Columns" }) {
    return (_jsxs(DM.Root, { children: [_jsx(DM.Trigger, { asChild: true, children: _jsx(Button, { icon: "columns", children: label }) }), _jsx(DM.Portal, { children: _jsx(DM.Content, { className: "pw-menu", align: "end", sideOffset: 4, loop: true, "aria-label": label, children: columns.map((c) => (_jsxs(DM.CheckboxItem, { className: "pw-list__item", checked: !hidden.includes(c.key), disabled: c.hideable === false, onSelect: (e) => e.preventDefault(), onCheckedChange: (on) => onChange(on ? hidden.filter((k) => k !== c.key) : [...hidden, c.key]), children: [_jsx("span", { className: "pw-list__check", children: _jsx(DM.ItemIndicator, { children: _jsx(Icon, { name: "check", size: 14 }) }) }), _jsx("span", { children: c.header })] }, c.key))) }) })] }));
}
/* ---------- DataTable ---------- */
// Sorting, paging and selection are uncontrolled by default and controlled when you pass the value (sort, page,
// selectedKeys). With `manual`, rows arrive already sorted and paged by your server: pass `totalRows` and handle
// onSortChange / onPageChange. Selection adds a checkbox column (select-all covers the visible page and shows a dash
// when only some are selected) and, with `bulkActions`, a bar of actions for the selected rows.
export function DataTable(props) {
    const { columns: allColumns, rows, rowKey = "id", defaultSort, renderExpanded, pageSize: pageSizeProp = 0, onRowClick, rowTone, state = "ready", emptyTitle, emptyBody, errorDetail, onRetry, caption, density, selectedKey, stickyHeader, sort: sortProp, onSortChange, manual, page: pageProp, onPageChange, totalRows, pageSizeOptions, onPageSizeChange, selection, selectedKeys, defaultSelectedKeys, onSelectionChange, bulkActions, rowActions, rowLabel, hiddenColumns = [], getPath, view: viewProp, defaultView = "list", onViewChange, directLabel = "Owned directly", itemNoun = ["item", "items"], toolbar } = props;
    const [viewInner, setViewInner] = useState(defaultView);
    const mode = getPath ? viewProp ?? viewInner : "list";
    const setMode = (v) => { setViewInner(v); onViewChange && onViewChange(v); };
    const [openGroups, setOpenGroups] = useState(new Set());
    const columns = allColumns.filter((c) => !c.hidden && !hiddenColumns.includes(c.key));
    const [sortInner, setSortInner] = useState(defaultSort || null);
    const sort = sortProp !== undefined ? sortProp : sortInner;
    const [open, setOpen] = useState({});
    const [pageInner, setPageInner] = useState(1);
    const [sizeInner, setSizeInner] = useState(pageSizeProp);
    // Page size is yours (the prop) unless you offer pageSizeOptions without handling onPageSizeChange.
    const pageSize = pageSizeOptions && !onPageSizeChange ? sizeInner : pageSizeProp;
    const [selInner, setSelInner] = useState(defaultSelectedKeys || []);
    const sel = selectedKeys !== undefined ? selectedKeys : selInner;
    const setSel = (keys) => { setSelInner(keys); onSelectionChange && onSelectionChange(keys); };
    const keyOf = (r) => String(field(r, rowKey));
    const nameOf = (r) => (rowLabel ? rowLabel(r) : keyOf(r));
    const sorted = useMemo(() => {
        if (!sort || manual)
            return rows;
        const col = allColumns.find((c) => c.key === sort.key);
        if (!col)
            return rows;
        const get = col.sortValue || ((r) => field(r, col.key));
        return [...rows].sort((a, b) => compare(get(a), get(b)) * (sort.dir === "asc" ? 1 : -1));
    }, [rows, sort, allColumns, manual]);
    const total = manual ? totalRows ?? rows.length : sorted.length;
    const pages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    // Clamp: when filtering shrinks the rows, stay on the last page that exists instead of showing an empty one.
    const page = Math.min(pageProp ?? pageInner, pages);
    const setPage = (p) => { setPageInner(p); onPageChange && onPageChange(p); };
    const isTree = mode === "tree";
    const view = pageSize && !manual && !isTree ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;
    const tree = useMemo(() => (isTree && getPath ? buildGroups(sorted, getPath) : null), [isTree, sorted, getPath]);
    const viewKeys = view.map(keyOf);
    const selectedHere = viewKeys.filter((k) => sel.includes(k)).length;
    const ncol = columns.length + (renderExpanded ? 1 : 0) + (selection ? 1 : 0) + (rowActions ? 1 : 0);
    const toggleSort = (c) => {
        if (!c.sortable)
            return;
        const next = !sort || sort.key !== c.key ? { key: c.key, dir: c.defaultDir || "desc" } : { key: c.key, dir: sort.dir === "asc" ? "desc" : "asc" };
        setSortInner(next);
        onSortChange && onSortChange(next);
    };
    const showPager = !isTree && !!pageSize && state === "ready" && (total > pageSize || !!pageSizeOptions);
    const noun = (n) => n + " " + (n === 1 ? itemNoun[0] : itemNoun[1]);
    // The row's name column: it carries the path (List) and the group label (Tree). With paths, that is the first column
    // without a rollup, so a leading Status column keeps its worst-first rollup on group rows.
    const first = (getPath ? columns.find((c) => !c.rollup) ?? columns[0] : columns[0])?.key;
    const cellBody = (c, r) => (c.render ? c.render(r) : asNode(field(r, c.key)));
    // One leaf row. In List view the first column carries the path below the scope; in Tree view it is indented.
    const renderRow = (r, level) => {
        const id = field(r, rowKey);
        const k = String(id);
        const isOpen = !!open[k];
        const tone = rowTone ? rowTone(r) : null;
        const picked = sel.includes(k);
        const firstCell = (c) => {
            if (level != null)
                return _jsxs("span", { className: "pw-treecell", style: { ["--lvl"]: level }, children: [_jsx("span", { className: "pw-treecell__leaf" }), cellBody(c, r)] });
            if (!getPath)
                return cellBody(c, r);
            return _jsxs("span", { className: "pw-pathcell", children: [_jsx("span", { children: cellBody(c, r) }), _jsx(PathLine, { path: getPath(r), direct: directLabel })] });
        };
        return (_jsxs(Fragment, { children: [_jsxs("tr", { className: cx(tone && "is-" + tone, onRowClick && "is-click", (selectedKey === id || picked) && "is-selected"), tabIndex: onRowClick ? 0 : undefined, onClick: onRowClick ? () => onRowClick(r) : undefined, onKeyDown: onRowClick ? (e) => { if (e.key === "Enter" && e.target === e.currentTarget)
                        onRowClick(r); } : undefined, children: [selection ? (_jsx("td", { className: "pw-table__sel", onClick: (e) => e.stopPropagation(), children: _jsx(Checkbox, { label: "Select " + nameOf(r), hideLabel: true, checked: picked, onChange: (on) => setSel(on ? [...sel, k] : sel.filter((x) => x !== k)) }) })) : null, renderExpanded ? (_jsx("td", { className: "pw-table__x", children: _jsx("button", { type: "button", className: "pw-xbtn", "aria-expanded": isOpen, "aria-label": (isOpen ? "Collapse " : "Expand ") + nameOf(r), onClick: (e) => { e.stopPropagation(); setOpen({ ...open, [k]: !isOpen }); }, children: _jsx(Icon, { name: isOpen ? "chevron-down" : "chevron-right", size: 14 }) }) })) : null, columns.map((c) => _jsx("td", { style: { textAlign: c.align }, className: cx(c.mono && "pw-mono", c.num && "is-nowrap", c.nowrap && "is-nowrap", c.pin === "start" && "is-pinned", c.className), children: c.key === first ? firstCell(c) : cellBody(c, r) }, c.key)), rowActions ? _jsx("td", { className: "pw-table__acts", onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), children: (() => { const acts = rowActions(r); return acts.length ? _jsx(ActionMenu, { label: "Actions for " + nameOf(r), items: acts }) : null; })() }) : null] }), renderExpanded && isOpen ? _jsxs("tr", { className: "pw-table__exp", children: [selection ? _jsx("td", {}) : null, _jsx("td", {}), _jsx("td", { colSpan: columns.length + (rowActions ? 1 : 0), children: renderExpanded(r) })] }) : null] }, k));
    };
    // Tree view: groups (one per path segment) with rollups, then their rows and sub-groups, in sorted order.
    const renderLevel = (entries, level) => entries.flatMap((e) => {
        if (e.type === "row")
            return [renderRow(e.row, level)];
        const g = e.group, isOpen = openGroups.has(g.key);
        const toggle = () => { const n = new Set(openGroups); if (isOpen)
            n.delete(g.key);
        else
            n.add(g.key); setOpenGroups(n); };
        const row = (_jsxs("tr", { className: "is-group", children: [selection ? _jsx("td", {}) : null, renderExpanded ? _jsx("td", {}) : null, columns.map((c) => (_jsx("td", { style: { textAlign: c.align }, className: cx(c.num && "is-nowrap", c.nowrap && "is-nowrap", c.pin === "start" && "is-pinned"), children: c.key === first ? (_jsxs("span", { className: "pw-treecell", style: { ["--lvl"]: level }, children: [_jsx("button", { type: "button", className: "pw-xbtn", "aria-expanded": isOpen, "aria-label": (isOpen ? "Collapse " : "Expand ") + g.seg.label + ", " + noun(g.all.length), onClick: toggle, children: _jsx(Icon, { name: isOpen ? "chevron-down" : "chevron-right", size: 14 }) }), g.seg.kind ? _jsx(Icon, { name: entityIcon[g.seg.kind], className: "pw-treecell__kind" }) : null, _jsxs("span", { className: "pw-treecell__txt", children: [_jsx("span", { className: "pw-treecell__name", children: g.seg.label }), _jsx("span", { className: "pw-caption pw-muted", children: (g.seg.kind ? entityLabel[g.seg.kind] + " · " : "") + noun(g.all.length) })] })] })) : rollupCell(c, g.all) }, c.key))), rowActions ? _jsx("td", {}) : null] }, "g:" + g.key));
        return isOpen ? [row, ...renderLevel(g.entries, level + 1)] : [row];
    });
    return (_jsxs("div", { className: cx("pw-table-box", density && "is-" + density), children: [getPath || toolbar ? (_jsxs("div", { className: "pw-tabletools", children: [_jsx("div", { className: "pw-tabletools__start", children: toolbar }), _jsxs("div", { className: "pw-tabletools__end", children: [isTree && tree ? _jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpenGroups(new Set(allGroupKeys(tree))), children: "Expand all" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpenGroups(new Set()), children: "Collapse all" })] }) : null, getPath ? _jsx(SegmentedControl, { label: "View", size: "sm", value: mode, onChange: (v) => setMode(v === "tree" ? "tree" : "list"), options: [{ value: "list", label: "List" }, { value: "tree", label: "Tree" }] }) : null] })] })) : null, selection && bulkActions && sel.length ? (_jsxs("div", { className: "pw-bulk", "aria-label": "Bulk actions", role: "group", children: [_jsxs("span", { className: "pw-body-strong pw-num", role: "status", children: [sel.length, " selected"] }), _jsx("div", { className: "pw-bulk__acts", children: bulkActions(sel, rows.filter((r) => sel.includes(keyOf(r)))) }), _jsx("button", { type: "button", className: "pw-linkbtn", onClick: () => setSel([]), children: "Clear selection" })] })) : null, _jsx("div", { className: cx("pw-table-wrap", density && "is-" + density), children: _jsxs("table", { className: cx("pw-table", stickyHeader && "is-sticky"), children: [caption ? _jsx("caption", { className: "pw-sr", children: caption }) : null, _jsx("thead", { children: _jsxs("tr", { children: [selection ? (_jsx("th", { className: "pw-table__sel", scope: "col", children: _jsx(Checkbox, { label: "Select all rows on this page", hideLabel: true, disabled: !view.length || state !== "ready", checked: selectedHere === 0 ? false : selectedHere === view.length ? true : "indeterminate", onChange: (on) => setSel(on ? Array.from(new Set([...sel, ...viewKeys])) : sel.filter((k) => !viewKeys.includes(k))) }) })) : null, renderExpanded ? _jsx("th", { className: "pw-table__x", children: _jsx("span", { className: "pw-sr", children: "Details" }) }) : null, columns.map((c) => {
                                        const s = sort && sort.key === c.key ? sort.dir : null;
                                        return (_jsx("th", { scope: "col", className: cx(c.pin === "start" && "is-pinned"), style: { width: c.width, textAlign: c.align }, "aria-sort": s ? (s === "asc" ? "ascending" : "descending") : undefined, children: c.sortable ? _jsxs("button", { type: "button", className: cx("pw-th-sort", s && "is-on"), onClick: () => toggleSort(c), children: [c.header, _jsx(Icon, { name: s === "asc" ? "arrow-up" : s === "desc" ? "arrow-down" : "sort", size: 12 })] }) : c.header }, c.key));
                                    }), rowActions ? _jsx("th", { className: "pw-table__acts", children: _jsx("span", { className: "pw-sr", children: "Actions" }) }) : null] }) }), _jsx("tbody", { children: state === "loading" ? Array.from({ length: 5 }).map((_, i) => (_jsxs("tr", { className: "is-skel", children: [selection ? _jsx("td", {}) : null, renderExpanded ? _jsx("td", {}) : null, columns.map((c, j) => _jsx("td", { children: _jsx(Skeleton, { w: j === 0 ? "70%" : "45%" }) }, j)), rowActions ? _jsx("td", {}) : null] }, i))) : state === "error" ? (_jsx("tr", { children: _jsx("td", { colSpan: ncol, className: "pw-table__state", children: _jsx(StateBlock, { kind: "error", inline: true, title: "Couldn\u2019t load rows", body: "The data source didn\u2019t respond. Other panels on this page are unaffected.", detail: errorDetail, action: onRetry ? "Retry" : undefined, onAction: onRetry }) }) })) : !view.length || state === "empty" ? (_jsx("tr", { children: _jsx("td", { colSpan: ncol, className: "pw-table__state", children: _jsx(StateBlock, { kind: "empty", inline: true, title: emptyTitle || "No rows match", body: emptyBody || "Clear filters or widen the time range." }) }) })) : isTree && tree ? renderLevel(tree, 0) : view.map((r) => renderRow(r, null)) })] }) }), showPager ? (_jsx(Pagination, { page: page, pageSize: pageSize, total: total, onPageChange: setPage, firstLast: pages > 5 || !!pageSizeOptions, pageSizeOptions: pageSizeOptions, onPageSizeChange: pageSizeOptions ? (n) => { setSizeInner(n); setPage(1); onPageSizeChange && onPageSizeChange(n); } : undefined })) : null] }));
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
    const name = ariaLabel || chartName(series.map((x) => x.name), unit, labels);
    // Markers are buttons only when they do something; then the chart is a labelled group rather than one image.
    const live = !!onMarker && markers.length > 0;
    const toneOf = (c) => (c ? "var(--" + c + ")" : "var(--ink)");
    const tbl = (_jsx("div", { className: "pw-chart__table", children: _jsxs("table", { className: "pw-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Time" }), series.map((s) => _jsxs("th", { style: { textAlign: "right" }, children: [s.name, unit ? " (" + unit + ")" : ""] }, s.name))] }) }), _jsx("tbody", { children: labels.map((l, i) => _jsxs("tr", { children: [_jsx("td", { children: l }), series.map((s) => _jsx("td", { style: { textAlign: "right" }, children: fmt(s.points[i], decimals) }, s.name))] }, i)) })] }) }));
    return (_jsxs("div", { ref: ref, className: "pw-chart", children: [table ? _jsx("div", { className: "pw-chart__bar", children: _jsx("button", { type: "button", className: "pw-chart__toggle", "aria-pressed": asTable, onClick: () => setAsTable(!asTable), children: asTable ? "Show chart" : "Show table" }) }) : null, asTable ? tbl : (_jsxs("svg", { width: w, height: height, role: live ? "group" : "img", "aria-label": name, onMouseLeave: () => { setHover(null); setDrag(null); }, onMouseMove: (e) => { const x = e.clientX - e.currentTarget.getBoundingClientRect().left; const i = idxAt(x); setHover(i); if (drag)
                    setDrag({ ...drag, b: i }); }, onMouseDown: (e) => { if (!onBrush)
                    return; const i = idxAt(e.clientX - e.currentTarget.getBoundingClientRect().left); setDrag({ a: i, b: i }); }, onMouseUp: () => { if (drag && Math.abs(drag.b - drag.a) > 1 && onBrush)
                    onBrush(Math.min(drag.a, drag.b), Math.max(drag.a, drag.b)); setDrag(null); }, children: [ticks.map((t, i) => _jsxs("g", { children: [_jsx("line", { x1: pad.l, x2: w - pad.r, y1: sy(t), y2: sy(t), className: "pw-grid" }), _jsx("text", { x: pad.l - 8, y: sy(t) + 4, className: "pw-tick", textAnchor: "end", children: tk(t) })] }, i)), xt.map((i) => _jsx("text", { x: sx(i), y: height - 5, className: "pw-tick", textAnchor: i === 0 ? "start" : i === n - 1 ? "end" : "middle", children: labels[i] }, i)), _jsx("text", { x: pad.l - 8, y: 10, className: "pw-tick", textAnchor: "end", children: unit }), highlight ? _jsx("rect", { x: sx(highlight[0]), y: pad.t, width: Math.max(2, sx(highlight[1]) - sx(highlight[0])), height: ih, className: "pw-hl" }) : null, band ? _jsx("rect", { x: pad.l, y: sy(band[1]), width: iw, height: sy(band[0]) - sy(band[1]), className: "pw-band" }) : null, threshold ? _jsxs("g", { children: [_jsx("line", { x1: pad.l, x2: w - pad.r, y1: sy(threshold.value), y2: sy(threshold.value), className: "pw-thr" }), _jsx("text", { x: showEnd ? pad.l + 6 : w - pad.r - 4, y: sy(threshold.value) - 6, className: "pw-tick", textAnchor: showEnd ? "start" : "end", children: threshold.label })] }) : null, series.map((s, k) => {
                        let d = "";
                        s.points.forEach((v, i) => { if (v == null)
                            return; d += (d && s.points[i - 1] != null ? "L" : "M") + sx(i).toFixed(1) + "," + sy(v).toFixed(1); });
                        return _jsx("path", { d: d, fill: "none", stroke: toneOf(s.color), strokeWidth: s.dashed ? 1.5 : 2, strokeDasharray: s.dashed ? "4 4" : undefined, strokeLinejoin: "round", strokeLinecap: "round" }, k);
                    }), showEnd ? ends.map((e) => _jsxs("g", { children: [_jsx("circle", { cx: sx(n - 1), cy: e.y, r: "4", fill: toneOf(e.color), stroke: "var(--surface-raised)", strokeWidth: "2" }), _jsx("text", { x: sx(n - 1) + 10, y: e.y + 4, className: "pw-endlab", children: e.name })] }, e.k)) : null, markers.map((m, i) => (_jsxs("g", { className: cx("pw-marker", live && "is-live"), ...(live ? { tabIndex: 0, role: "button", "aria-label": "Change: " + m.label + ", " + (labels[m.index] ?? "") } : { "aria-hidden": true }), onClick: () => onMarker && onMarker(m), onKeyDown: (e) => { if ((e.key === "Enter" || e.key === " ") && onMarker) {
                            e.preventDefault();
                            onMarker(m);
                        } }, children: [_jsx("rect", { x: sx(m.index) - 12, y: pad.t - 14, width: 24, height: ih + 14, fill: "transparent" }), _jsx("line", { x1: sx(m.index), x2: sx(m.index), y1: pad.t, y2: pad.t + ih, className: "pw-marker__l" }), _jsx("path", { d: `M${sx(m.index)},${pad.t - 4} l5,5 l-5,5 l-5,-5z`, className: "pw-marker__g" }), _jsx("text", { x: sx(m.index) + 9, y: pad.t + 5, className: "pw-marker__t", children: m.label })] }, i))), drag ? _jsx("rect", { x: sx(Math.min(drag.a, drag.b)), y: pad.t, width: Math.abs(sx(drag.b) - sx(drag.a)), height: ih, className: "pw-brush" }) : null, hover != null ? _jsx("line", { x1: sx(hover), x2: sx(hover), y1: pad.t, y2: pad.t + ih, className: "pw-cross" }) : null, hover != null ? series.map((s, k) => { const v = s.points[hover]; return v == null ? null : _jsx("circle", { cx: sx(hover), cy: sy(v), r: "4", fill: toneOf(s.color), stroke: "var(--surface-raised)", strokeWidth: "2" }, k); }) : null] })), !asTable && hover != null ? (_jsxs("div", { className: "pw-chart__tip", style: { left: Math.min(sx(hover) + 12, w - 190), top: 24 }, children: [_jsx("div", { className: "pw-caption pw-muted pw-num", children: labels[hover] }), series.map((s, k) => _jsxs("div", { className: "pw-chart__tiprow", children: [_jsx("i", { style: { background: toneOf(s.color) }, className: s.dashed ? "is-dashed" : "" }), _jsx("span", { children: s.name }), _jsxs("b", { children: [fmt(s.points[hover], decimals), " ", unit] })] }, k))] })) : null, !asTable && series.length > 1 ? _jsx(Legend, { line: true, items: series.map((s) => ({ name: s.name, color: s.color, dashed: s.dashed })) }) : null] }));
}
// A readable default name when the consumer gives none: "p50, p95 (ms), 10:00 to 11:00".
const chartName = (names, unit, labels) => `${names.join(", ") || "Chart"}${unit ? ` (${unit})` : ""}${labels.length ? `, ${labels[0]} to ${labels[labels.length - 1]}` : ""}`;
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
export function BarChart({ categories = [], series = [], stacked = true, height = 160, unit = "", ariaLabel, onBar, state = "ready", textures = false, table = true }) {
    const [ref, w] = useWidth();
    const [hover, setHover] = useState(null);
    const [asTable, setAsTable] = useState(false);
    const name = ariaLabel || chartName(series.map((x) => x.name), unit, categories);
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
    const dec = unit.includes("k") ? 1 : 0;
    const bar = table ? _jsx("div", { className: "pw-chart__bar", children: _jsx("button", { type: "button", className: "pw-chart__toggle", "aria-pressed": asTable, onClick: () => setAsTable(!asTable), children: asTable ? "Show chart" : "Show table" }) }) : null;
    if (asTable)
        return (_jsxs("div", { ref: ref, className: "pw-chart", children: [bar, _jsx("div", { className: "pw-chart__table", children: _jsxs("table", { className: "pw-table", children: [_jsx("caption", { className: "pw-sr", children: name }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: _jsx("span", { className: "pw-sr", children: "Category" }) }), series.map((s) => _jsxs("th", { scope: "col", style: { textAlign: "right" }, children: [s.name, unit ? " (" + unit + ")" : ""] }, s.name)), stacked && series.length > 1 ? _jsx("th", { scope: "col", style: { textAlign: "right" }, children: "Total" }) : null] }) }), _jsx("tbody", { children: categories.map((c, i) => _jsxs("tr", { children: [_jsx("th", { scope: "row", children: c }), series.map((s) => _jsx("td", { style: { textAlign: "right" }, children: fmt(s.values[i] || 0, dec) }, s.name)), stacked && series.length > 1 ? _jsx("td", { style: { textAlign: "right" }, children: fmt(totals[i], dec) }) : null] }, c)) })] }) })] }));
    const describe = (i) => `${categories[i]}: ` + series.map((s) => `${s.name} ${fmt(s.values[i] || 0, dec)}${unit ? " " + unit : ""}`).join(", ");
    return (_jsxs("div", { ref: ref, className: "pw-chart", children: [bar, _jsxs("svg", { width: w, height: height, role: onBar ? "group" : "img", "aria-label": name, onMouseLeave: () => setHover(null), children: [textures ? _jsx("defs", { children: series.map((s, k) => s.pattern ? _jsxs("pattern", { id: pid + k, width: "6", height: "6", patternUnits: "userSpaceOnUse", patternTransform: "rotate(" + (k % 2 ? 135 : 45) + ")", children: [_jsx("rect", { width: "6", height: "6", fill: "var(--" + s.color + ")" }), _jsx("line", { x1: "0", y1: "0", x2: "0", y2: "6", stroke: "var(--surface-raised)", strokeWidth: "1.4" })] }, k) : null) }) : null, [0, 0.5, 1].map((t, i) => _jsxs("g", { children: [_jsx("line", { x1: pad.l, x2: w - pad.r, y1: pad.t + ih - t * ih, y2: pad.t + ih - t * ih, className: "pw-grid" }), _jsx("text", { x: pad.l - 8, y: pad.t + ih - t * ih + 4, className: "pw-tick", textAnchor: "end", children: tk(t * max) })] }, i)), categories.map((c, i) => {
                        let acc = 0;
                        const x0 = pad.l + i * bw + (bw - thick) / 2;
                        const segs = series.map((s, k) => ({ s, k, v: s.values[i] || 0 })).filter((x) => x.v > 0);
                        return (_jsxs("g", { onMouseEnter: () => setHover(i), onClick: () => onBar && onBar(c, i), className: cx(onBar && "is-click"), ...(onBar ? { tabIndex: 0, role: "button", "aria-label": describe(i), onFocus: () => setHover(i), onBlur: () => setHover(null), onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onBar(c, i);
                                } } } : {}), children: [_jsx("rect", { x: pad.l + i * bw, y: pad.t, width: bw, height: ih, fill: "transparent" }), segs.map((g, j) => {
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
                    })] }), hover != null ? (_jsxs("div", { className: "pw-chart__tip", style: { left: Math.min(pad.l + hover * bw + bw, w - 190), top: 6 }, children: [_jsx("div", { className: "pw-caption pw-muted", children: categories[hover] }), series.map((s, k) => _jsxs("div", { className: "pw-chart__tiprow", children: [_jsx("i", { style: { background: "var(--" + s.color + ")", height: 8, width: 8 } }), _jsx("span", { children: s.name }), _jsxs("b", { children: [fmt(s.values[hover] || 0, dec), " ", unit] })] }, k)), stacked && series.length > 1 ? _jsxs("div", { className: "pw-chart__tiprow", children: [_jsx("i", {}), _jsx("span", { className: "pw-muted", children: "Total" }), _jsxs("b", { children: [fmt(totals[hover], dec), " ", unit] })] }) : null] })) : null, series.length > 1 ? _jsx(Legend, { items: series.map((s) => ({ name: s.name, color: s.color })) }) : null] }));
}
/* ---------- Run strip: last N runs inline in a table cell ---------- */
export function RunStrip({ runs = [], labels = [], name = "" }) {
    const word = { critical: "failed", warning: "succeeded after retry", healthy: "succeeded", info: "running", unknown: "skipped" };
    const glyph = { critical: "✕", warning: "↻", healthy: "", info: "", unknown: "" };
    const fails = runs.filter((r) => r === "critical").length;
    return (_jsx("span", { className: "pw-runs", role: "img", "aria-label": `${name} last ${runs.length} runs: ${fails} failed. ` + runs.map((r, i) => (labels[i] || "run " + (i + 1)) + " " + word[r]).join(", "), children: runs.map((r, i) => _jsx("span", { className: cx("pw-run", "is-" + r), title: (labels[i] || "") + " " + word[r], children: glyph[r] }, i)) }));
}
/* ---------- Heatmap (sequential: one hue, light to dark) ---------- */
export function Heatmap({ rows = [], cols = [], values = [], unit = "", ariaLabel, max, table = true }) {
    const m = max || Math.max(...values.flat().filter((v) => v != null), 1);
    const [hover, setHover] = useState(null);
    const [asTable, setAsTable] = useState(false);
    const bar = table ? _jsx("div", { className: "pw-chart__bar", children: _jsx("button", { type: "button", className: "pw-chart__toggle", "aria-pressed": asTable, onClick: () => setAsTable(!asTable), children: asTable ? "Show chart" : "Show table" }) }) : null;
    if (asTable)
        return (_jsxs("div", { className: "pw-heat", children: [bar, _jsx("div", { className: "pw-chart__table", children: _jsxs("table", { className: "pw-table", children: [_jsx("caption", { className: "pw-sr", children: ariaLabel }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: _jsx("span", { className: "pw-sr", children: "Name" }) }), cols.map((c, j) => _jsx("th", { scope: "col", style: { textAlign: "right" }, children: c }, j))] }) }), _jsx("tbody", { children: rows.map((r, i) => _jsxs("tr", { children: [_jsx("th", { scope: "row", className: "pw-mono", children: r }), cols.map((_, j) => _jsx("td", { style: { textAlign: "right" }, children: values[i]?.[j] == null ? "no data" : fmt(values[i]?.[j], 1) }, j))] }, r)) })] }) })] }));
    return (_jsxs("div", { className: "pw-heat", children: [bar, _jsxs("div", { role: "img", "aria-label": ariaLabel + (unit ? ` (${unit})` : "") + ". Use Show table for the values.", children: [_jsxs("div", { className: "pw-heat__grid", style: { gridTemplateColumns: `120px repeat(${cols.length}, minmax(10px, 1fr))` }, children: [rows.map((r, i) => (_jsxs(Fragment, { children: [_jsx("span", { className: "pw-caption pw-mono pw-heat__r", children: r }), cols.map((c, j) => {
                                        const v = values[i]?.[j];
                                        return _jsx("span", { className: "pw-heat__c", onMouseEnter: () => setHover({ r, c, v }), onMouseLeave: () => setHover(null), style: { opacity: v == null ? 1 : 0.08 + 0.92 * (v / m) }, "data-null": v == null ? "1" : undefined }, j);
                                    })] }, r))), _jsx("span", {}), cols.map((c, j) => _jsx("span", { className: "pw-tick pw-heat__x", children: j % 4 === 0 ? c : "" }, j))] }), _jsxs("div", { className: "pw-heat__f pw-caption pw-muted", children: [hover ? _jsxs("span", { className: "pw-num", children: [hover.r, " \u00B7 ", hover.c, ": ", _jsx("b", { children: hover.v == null ? "no data" : fmt(hover.v, 1) + " " + unit })] }) : _jsx("span", { children: "Darker = higher. Hatched = no data." }), _jsxs("span", { className: "pw-heat__scale", children: [_jsx("span", { children: "0" }), _jsx("i", {}), _jsxs("span", { className: "pw-num", children: [fmt(m, 0), " ", unit] })] })] })] })] }));
}
/* ---------- Status grid (e.g. DAG × runs) ---------- */
// With onCell it is an ARIA grid: one Tab stop, arrow keys move between cells, Home/End jump within a row
// (Ctrl+Home/End to the corners), Enter or Space opens a cell. Radix has no 2-D grid primitive, so this small roving
// focus is ours. Interactive cells keep their 18 px look inside a 24 px target (WCAG 2.5.8). Without onCell it is a
// plain table. Either way "Show table" lists every cell in words.
const RUN_WORD = { critical: "failed", warning: "succeeded after retry", healthy: "succeeded", info: "running", unknown: "skipped" };
const RUN_GLYPH = { critical: "✕", warning: "↻", healthy: "", unknown: "–", info: "•" };
export function StatusGrid({ rows = [], cols = [], cells = [], onCell, ariaLabel, rowLabelWidth = 200, table = true }) {
    const interactive = !!onCell;
    const [pos, setPos] = useState([0, 0]);
    const [asTable, setAsTable] = useState(false);
    const refs = useRef({});
    const pitch = interactive ? 24 : 18;
    const tracks = `${rowLabelWidth}px repeat(${cols.length}, ${pitch}px)`;
    const word = (s) => (s ? RUN_WORD[s] : "no run");
    const focusCell = (r, c) => {
        const nr = Math.max(0, Math.min(rows.length - 1, r)), nc = Math.max(0, Math.min(cols.length - 1, c));
        setPos([nr, nc]);
        refs.current[nr + ":" + nc]?.focus();
    };
    const onKey = (e, i, j) => {
        const k = e.key, ctrl = e.ctrlKey || e.metaKey;
        const go = k === "ArrowRight" ? [i, j + 1] : k === "ArrowLeft" ? [i, j - 1] : k === "ArrowDown" ? [i + 1, j] : k === "ArrowUp" ? [i - 1, j]
            : k === "Home" ? [ctrl ? 0 : i, 0] : k === "End" ? [ctrl ? rows.length - 1 : i, cols.length - 1] : null;
        if (go) {
            e.preventDefault();
            focusCell(go[0], go[1]);
            return;
        }
        const s = cells[i]?.[j], row = rows[i], col = cols[j];
        if ((k === "Enter" || k === " ") && onCell && s && row && col != null) {
            e.preventDefault();
            onCell(row, col, s);
        }
    };
    const R = interactive ? { grid: "grid", row: "row", ch: "columnheader", rh: "rowheader", cell: "gridcell" } : { grid: "table", row: "row", ch: "columnheader", rh: "rowheader", cell: "cell" };
    return (_jsxs("div", { className: "pw-sgrid-wrap", children: [table ? _jsx("div", { className: "pw-chart__bar", children: _jsx("button", { type: "button", className: "pw-chart__toggle", "aria-pressed": asTable, onClick: () => setAsTable(!asTable), children: asTable ? "Show grid" : "Show table" }) }) : null, asTable ? (_jsx("div", { className: "pw-chart__table", children: _jsxs("table", { className: "pw-table", children: [_jsx("caption", { className: "pw-sr", children: ariaLabel }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Name" }), cols.map((c, j) => _jsx("th", { scope: "col", children: c }, j))] }) }), _jsx("tbody", { children: rows.map((r, i) => _jsxs("tr", { children: [_jsx("th", { scope: "row", className: "pw-mono", children: r.label }), cols.map((_, j) => _jsx("td", { children: word(cells[i]?.[j]) }, j))] }, r.key)) })] }) })) : (_jsxs("div", { className: cx("pw-sgrid", interactive && "is-interactive"), role: R.grid, "aria-label": ariaLabel, children: [_jsxs("div", { className: "pw-sgrid__row pw-sgrid__head", role: R.row, style: { gridTemplateColumns: tracks }, children: [_jsx("span", { role: R.ch, className: "pw-caption pw-muted", children: _jsx("span", { className: "pw-sr", children: "Name" }) }), cols.map((c, j) => _jsx("span", { role: R.ch, className: "pw-tick pw-sgrid__ch", "aria-label": String(c), children: j % 2 === 0 ? c : "" }, j))] }), rows.map((r, i) => (_jsxs("div", { className: "pw-sgrid__row", role: R.row, style: { gridTemplateColumns: tracks }, children: [_jsx("span", { role: R.rh, className: "pw-mono pw-sgrid__rh", children: r.label }), cols.map((c, j) => {
                                const s = cells[i]?.[j];
                                const glyph = _jsx("span", { className: cx("pw-sgrid__c", s && "is-" + s), "aria-hidden": "true", children: s ? RUN_GLYPH[s] : null });
                                if (!interactive)
                                    return _jsxs("span", { role: R.cell, className: "pw-sgrid__cell", children: [_jsx("span", { className: "pw-sr", children: word(s) }), glyph] }, j);
                                const on = pos[0] === i && pos[1] === j;
                                return (_jsx("span", { role: R.cell, ref: (el) => { refs.current[i + ":" + j] = el; }, tabIndex: on ? 0 : -1, className: "pw-sgrid__cell is-hit", "aria-label": `${r.label}, ${c}: ${word(s)}`, onFocus: () => setPos([i, j]), onKeyDown: (e) => onKey(e, i, j), onClick: () => { setPos([i, j]); if (onCell && s)
                                        onCell(r, c, s); }, children: glyph }, j));
                            })] }, r.key)))] })), _jsxs("div", { className: "pw-sgrid__key pw-caption pw-muted", "aria-hidden": asTable || undefined, children: [_jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-healthy" }), "Succeeded"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-warning", children: "\u21BB" }), "Succeeded after retry"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-critical", children: "\u2715" }), "Failed"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-info", children: "\u2022" }), "Running"] }), _jsxs("span", { children: [_jsx("b", { className: "pw-sgrid__c is-unknown", children: "\u2013" }), "Skipped"] })] })] }));
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