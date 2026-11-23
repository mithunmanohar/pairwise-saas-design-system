import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Ownership hierarchy (2.1): TreeView (React Aria Tree), ScopePicker, SplitView and ScopeNote.
// Organise by ownership, navigate by scope, operate by capability. The hierarchy is shown in full only in the
// Resource Explorer (TreeView in a SplitView) and in the ScopePicker; every other page shows the scope as one chip
// in the top bar and says what it covers with a ScopeNote.
import * as React from "react";
import * as RPopover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Tree, TreeItem, TreeItemContent, TreeLoadMoreItem, Button as RacButton } from "react-aria-components";
import { cx, Button, StatusDot, SegmentedControl, Drawer, useCmdkAria, useCmdkHighlight } from "./core";
import { Icon, entityIcon, entityLabel } from "./icons";
const { useState, useRef, useEffect, useMemo, useCallback } = React;
/** Flattens a tree (including loaded children) into id → {node, parentId, path from the root down to the node}. */
export function indexTree(nodes, loaded = {}) {
    const out = new Map();
    const walk = (list, parent) => {
        for (const n of list) {
            out.set(n.id, { node: n, parentId: parent.length ? parent[parent.length - 1].id : null, path: [...parent, n] });
            const kids = n.children ?? loaded[n.id];
            if (kids)
                walk(kids, [...parent, n]);
        }
    };
    walk(nodes, []);
    return out;
}
const termsOf = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
const matches = (n, terms) => { const hay = (n.label + " " + entityLabel[n.kind] + " " + (n.keywords || []).join(" ")).toLowerCase(); return terms.every((t) => hay.includes(t)); };
/* ---------- TreeView ---------- */
// The ownership tree on React Aria's Tree (treegrid): arrows move focus (Right expands, Left collapses or goes to the
// parent), Home/End, typeahead; Enter, Space or a click selects. Selection is "toggle" style so arrowing through the
// tree never changes the scope on its own. Each row: chevron, kind icon, label, and on the right the worst status
// below it with a count (healthy shows nothing) or a muted count. `hasChildren` + `loadChildren` load on expand.
// `filter` keeps matching nodes and their ancestors, expanded.
export function TreeView({ nodes, label, selectedId, onSelect, expandedIds, defaultExpandedIds = [], onExpandedChange, loadChildren, filter = "", state = "ready", emptyText = "Nothing here yet.", className }) {
    const [expandedInner, setExpandedInner] = useState(defaultExpandedIds);
    const expanded = expandedIds ?? expandedInner;
    const [loaded, setLoaded] = useState({});
    const [loading, setLoading] = useState({});
    const [failed, setFailed] = useState({});
    const index = useMemo(() => indexTree(nodes, loaded), [nodes, loaded]);
    const terms = termsOf(filter);
    // While filtering: the matches, their ancestors (kept, expanded) and nothing else.
    const visible = useMemo(() => {
        if (!terms.length)
            return null;
        const keep = new Set(), open = new Set();
        for (const [id, e] of index)
            if (matches(e.node, terms)) {
                keep.add(id);
                e.path.slice(0, -1).forEach((a) => { keep.add(a.id); open.add(a.id); });
            }
        return { keep, open };
    }, [index, filter]); // eslint-disable-line react-hooks/exhaustive-deps
    const load = useCallback((id) => {
        const e = index.get(id);
        if (!e || !loadChildren || e.node.children || loaded[id] || loading[id])
            return;
        setLoading((l) => ({ ...l, [id]: true }));
        setFailed((f) => ({ ...f, [id]: false }));
        loadChildren(e.node).then((kids) => setLoaded((l) => ({ ...l, [id]: kids })), () => setFailed((f) => ({ ...f, [id]: true })))
            .finally(() => setLoading((l) => ({ ...l, [id]: false })));
    }, [index, loadChildren, loaded, loading]);
    const setExpanded = (keys) => {
        const ids = [...keys].map(String);
        ids.filter((id) => !expanded.includes(id)).forEach(load);
        setExpandedInner(ids);
        onExpandedChange && onExpandedChange(ids);
    };
    // Controlled expansion can open a node from outside (e.g. "Expand all"): load what it needs.
    useEffect(() => { expanded.forEach(load); }, [expanded.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
    if (state === "loading")
        return _jsxs("div", { className: cx("pw-tree-wrap", className), "aria-busy": "true", children: [_jsx("span", { className: "pw-sr", children: "Loading" }), [0, 1, 2, 3].map((i) => _jsx("div", { className: "pw-tree__row", style: { ["--lvl"]: Math.min(i, 2) }, children: _jsx("span", { className: "pw-skel", style: { width: 120 + i * 18, height: 12 } }) }, i))] });
    if (state === "error")
        return _jsxs("div", { className: cx("pw-tree-wrap pw-tree__msg", className), role: "alert", children: [_jsx(Icon, { name: "critical", size: 14, className: "pw-tone--critical" }), "Couldn\u2019t load the organisation. Try again."] });
    const render = (n) => {
        if (visible && !visible.keep.has(n.id))
            return null;
        const kids = n.children ?? loaded[n.id];
        const hasKids = !!(kids?.length || (n.hasChildren && !kids));
        return (_jsxs(TreeItem, { id: n.id, textValue: n.label, hasChildItems: hasKids, isDisabled: n.noAccess, className: cx("pw-tree__item", n.noAccess && "is-noaccess"), children: [_jsx(TreeItemContent, { children: ({ hasChildItems, isExpanded, level }) => (_jsxs("div", { className: cx("pw-tree__row", n.kind === "resources" && "is-group"), style: { ["--lvl"]: level - 1 }, children: [hasChildItems ? _jsx(RacButton, { slot: "chevron", className: "pw-tree__chev", "aria-label": (isExpanded ? "Collapse " : "Expand ") + n.label, children: _jsx(Icon, { name: isExpanded ? "chevron-down" : "chevron-right", size: 14 }) }) : _jsx("span", { className: "pw-tree__chev" }), _jsx("span", { className: "pw-tree__kind", title: entityLabel[n.kind], children: _jsx(Icon, { name: n.icon ?? (n.noAccess ? "lock" : entityIcon[n.kind]) }) }), _jsx("span", { className: "pw-tree__label", children: n.label }), _jsxs("span", { className: "pw-sr", children: [", ", entityLabel[n.kind], n.noAccess ? ", no access" : ""] }), n.status && n.status !== "healthy" && n.status !== "unknown" ? _jsxs("span", { className: "pw-tree__meta", children: [_jsx(StatusDot, { status: n.status, label: n.statusLabel }), n.statusCount != null ? _jsx("span", { "aria-hidden": "true", children: n.statusCount }) : null] })
                                : n.meta != null ? _jsx("span", { className: "pw-tree__meta", children: n.meta }) : null] })) }), kids ? kids.map(render) : null, n.hasChildren && !kids && loading[n.id] ? _jsxs(TreeLoadMoreItem, { isLoading: true, className: "pw-tree__loading", children: [_jsx("span", { className: "pw-spin", "aria-hidden": "true" }), "Loading\u2026"] }) : null, n.hasChildren && !kids && failed[n.id] ? _jsx(TreeItem, { id: n.id + "::error", textValue: "Couldn\u2019t load", isDisabled: true, className: "pw-tree__item", children: _jsx(TreeItemContent, { children: _jsxs("div", { className: "pw-tree__row pw-tree__msg", style: { ["--lvl"]: (index.get(n.id)?.path.length ?? 1) }, children: [_jsx(Icon, { name: "critical", size: 14, className: "pw-tone--critical" }), "Couldn\u2019t load. Collapse and expand to retry."] }) }) }) : null] }, n.id));
    };
    const shown = nodes.map(render).filter(Boolean);
    return (_jsx("div", { className: cx("pw-tree-wrap", className), children: shown.length ? (_jsx(Tree, { "aria-label": label, className: "pw-tree", selectionMode: "single", selectionBehavior: "toggle", disallowEmptySelection: selectedId != null, selectedKeys: selectedId != null ? [selectedId] : [], onSelectionChange: (keys) => { if (keys === "all")
                return; const id = [...keys][0]; const e = id != null ? index.get(String(id)) : undefined; if (e && onSelect)
                onSelect(e.node); }, expandedKeys: visible ? new Set([...expanded, ...visible.open]) : expanded, onExpandedChange: (k) => setExpanded(k), children: shown })) : _jsx("div", { className: "pw-tree__msg pw-muted", children: terms.length ? `No match for “${filter}”.` : emptyText }) }));
}
/* ---------- ScopePicker ---------- */
// The ownership scope, shown once, in the top bar: a chip with the current node's kind icon, name and kind. It opens a
// popover with search across the organisation (cmdk; each result shows its path, the one place outside the explorer
// that does), "Up to <parent>", "Whole organisation", and the tree around the current node.
export function ScopePicker({ nodes, value, onChange, label = "Ownership scope", wholeLabel = "Whole organisation", loadChildren, forceOpen }) {
    const [open, setOpen] = useState(false);
    const isOpen = forceOpen || open;
    const [q, setQ] = useState("");
    const index = useMemo(() => indexTree(nodes), [nodes]);
    const cur = value != null ? index.get(value) : undefined;
    const parent = cur?.parentId ? index.get(cur.parentId) : undefined;
    const inputRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useCmdkAria(inputRef, null);
    const terms = termsOf(q);
    const results = terms.length ? [...index.values()].filter((e) => matches(e.node, terms)).slice(0, 12) : [];
    const hl = useCmdkHighlight(results.map((e) => e.node.id));
    const pick = (id) => { onChange && onChange(id); setOpen(false); setQ(""); };
    const pathText = (e) => { const up = e.path.slice(0, -1).map((p) => p.label); return up.length > 3 ? ["…", ...up.slice(-2)].join(" › ") : up.join(" › "); };
    return (_jsxs(RPopover.Root, { open: isOpen, onOpenChange: (o) => { setOpen(o); if (!o)
            setQ(""); }, children: [_jsx(RPopover.Trigger, { asChild: true, children: _jsxs("button", { ref: triggerRef, type: "button", className: cx("pw-scopechip", isOpen && "is-open"), title: cur ? cur.path.map((p) => p.label).join(" › ") : wholeLabel, children: [_jsx(Icon, { name: cur ? cur.node.icon ?? entityIcon[cur.node.kind] : "building" }), _jsxs("span", { className: "pw-sr", children: [label, ": "] }), _jsx("span", { className: "pw-scopechip__name", children: cur ? cur.node.label : wholeLabel }), cur ? _jsx("span", { className: "pw-scopechip__kind", children: entityLabel[cur.node.kind] }) : null, _jsx(Icon, { name: "chevron-down", size: 14 })] }) }), _jsx(RPopover.Portal, { children: _jsxs(RPopover.Content, { className: "pw-popover pw-scopepick", align: "start", sideOffset: 6, collisionPadding: 8, "aria-label": label, onOpenAutoFocus: (e) => { e.preventDefault(); inputRef.current?.focus(); }, children: [_jsxs(Command, { shouldFilter: false, loop: true, label: "Search " + label.toLowerCase(), value: hl.value, onValueChange: hl.onValueChange, onKeyDown: hl.onKeyDown, onPointerMoveCapture: hl.onPointerMoveCapture, children: [_jsxs("div", { className: "pw-combo__search", children: [_jsx(Icon, { name: "search", size: 14 }), _jsx(Command.Input, { ref: inputRef, className: "pw-combo__in", placeholder: "Search teams, initiatives, projects", value: q, onValueChange: (v) => { hl.onQuery(); setQ(v); } })] }), _jsxs(Command.List, { ref: listRef, className: "pw-list pw-scopepick__results", label: "Matches", hidden: !terms.length, children: [terms.length && !results.length ? _jsxs(Command.Empty, { className: "pw-list__empty pw-muted", children: ["No match for \u201C", q, "\u201D."] }) : null, results.map((e) => (_jsxs(Command.Item, { value: e.node.id, onSelect: () => pick(e.node.id), className: cx("pw-list__item", e.node.id === value && "is-selected"), children: [_jsx("span", { className: "pw-list__check", children: _jsx(Icon, { name: e.node.icon ?? entityIcon[e.node.kind], size: 14 }) }), _jsxs("span", { className: "pw-search__txt", children: [_jsx("span", { children: e.node.label }), e.path.length > 1 ? _jsx("span", { className: "pw-caption pw-muted", children: pathText(e) }) : null] }), _jsx("span", { className: "pw-muted pw-list__meta", children: entityLabel[e.node.kind] })] }, e.node.id)))] })] }), !terms.length ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "pw-scopepick__acts", children: [parent ? _jsx(Button, { size: "sm", variant: "ghost", icon: "level-up", onClick: () => pick(parent.node.id), children: "Up to " + parent.node.label }) : null, value != null ? _jsx(Button, { size: "sm", variant: "ghost", icon: "building", onClick: () => pick(null), children: wholeLabel }) : null] }), _jsx(TreeView, { label: "Organisation", nodes: nodes, loadChildren: loadChildren, selectedId: value ?? null, onSelect: (n) => pick(n.id), defaultExpandedIds: cur ? cur.path.slice(0, -1).map((p) => p.id) : nodes.map((n) => n.id), className: "pw-scopepick__tree" })] })) : null] }) })] }));
}
/* ---------- SplitView ---------- */
// The Resource Explorer layout: a fixed explorer-width pane (the tree) beside the workspace. The pane collapses to a
// strip; below 1024 px of available width it moves into a Drawer opened from a button, and the workspace's own
// child list and "up" link act as the drill-down on phones.
export function SplitView({ aside, asideLabel, asideTitle, children, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, drawerOpen, onDrawerOpenChange, forceWidth }) {
    const ref = useRef(null);
    const [w, setW] = useState(forceWidth || 1200);
    const [inner, setInner] = useState(defaultCollapsed);
    const [drawerInner, setDrawerInner] = useState(false);
    const drawer = drawerOpen ?? drawerInner;
    const setDrawer = (o) => { setDrawerInner(o); onDrawerOpenChange && onDrawerOpenChange(o); };
    const collapsed = collapsedProp ?? inner;
    const setCollapsed = (c) => { setInner(c); onCollapsedChange && onCollapsedChange(c); };
    useEffect(() => {
        const el = ref.current;
        if (forceWidth || !el)
            return;
        const ro = new ResizeObserver((e) => { const r = e[0]; if (r)
            setW(r.contentRect.width); });
        ro.observe(el);
        return () => ro.disconnect();
    }, [forceWidth]);
    const narrow = (forceWidth || w) < 1024;
    return (_jsxs("div", { ref: ref, className: cx("pw-split", narrow && "is-narrow", collapsed && !narrow && "is-collapsed"), children: [narrow ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "pw-split__bar", children: _jsx(Button, { size: "sm", icon: "layers", onClick: () => setDrawer(true), children: "Show " + asideLabel.toLowerCase() }) }), _jsx(Drawer, { open: drawer, title: asideTitle ?? asideLabel, onClose: () => setDrawer(false), width: 360, children: aside })] })) : collapsed ? (_jsx("div", { className: "pw-split__strip", children: _jsx(Button, { size: "sm", variant: "ghost", icon: "chevrons-right", "aria-label": "Show " + asideLabel.toLowerCase(), onClick: () => setCollapsed(false) }) })) : (_jsxs("aside", { className: "pw-split__aside", "aria-label": asideLabel, children: [_jsxs("div", { className: "pw-split__head", children: [_jsx("span", { className: "pw-caption pw-muted", children: asideTitle ?? asideLabel }), _jsx(Button, { size: "sm", variant: "ghost", icon: "chevrons-left", "aria-label": "Hide " + asideLabel.toLowerCase(), onClick: () => setCollapsed(true) })] }), aside] })), _jsx("div", { className: "pw-split__main", children: children })] }));
}
/* ---------- ScopeNote ---------- */
// One line under a capability page's header: what this page covers. The ownership scope is the chip in the top bar;
// this says how far it reaches ("and its 2 projects"), the runtime scope if relevant, and offers Direct only.
export function ScopeNote({ scope, summary, runtime, mode, onModeChange, children }) {
    return (_jsxs("div", { className: "pw-scopenote", children: [_jsxs("span", { className: "pw-scopenote__txt", "aria-live": "polite", children: ["Showing ", _jsx("b", { children: scope }), summary ? _jsxs(_Fragment, { children: [" ", summary] }) : null, runtime ? _jsxs(_Fragment, { children: [", in ", runtime] }) : null] }), children, onModeChange ? _jsx(SegmentedControl, { label: "Items to include", size: "sm", value: mode ?? "descendants", onChange: (v) => onModeChange(v === "direct" ? "direct" : "descendants"), options: [{ value: "descendants", label: "Including descendants" }, { value: "direct", label: "Direct only" }] }) : null] }));
}
//# sourceMappingURL=hierarchy.js.map