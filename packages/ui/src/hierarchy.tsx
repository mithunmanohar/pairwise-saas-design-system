// Ownership hierarchy (2.1): TreeView (React Aria Tree), ScopePicker, SplitView and ScopeNote.
// Organise by ownership, navigate by scope, operate by capability. The hierarchy is shown in full only in the
// Resource Explorer (TreeView in a SplitView) and in the ScopePicker; every other page shows the scope as one chip
// in the top bar and says what it covers with a ScopeNote.
import * as React from "react";
import * as RPopover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Tree, TreeItem, TreeItemContent, TreeLoadMoreItem, Button as RacButton, type Key, type Selection } from "react-aria-components";
import type { TreeNode, TreeViewProps, ScopePickerProps, SplitViewProps, ScopeNoteProps } from "./types";
import { cx, Button, StatusDot, SegmentedControl, Drawer, useCmdkAria, useCmdkHighlight } from "./core";
import { Icon, entityIcon, entityLabel } from "./icons";
const { useState, useRef, useEffect, useMemo, useCallback } = React;

/* ---------- Tree helpers (exported for apps that build scopes) ---------- */
export interface TreeIndexEntry { node: TreeNode; parentId: string | null; path: TreeNode[] }
/** Flattens a tree (including loaded children) into id → {node, parentId, path from the root down to the node}. */
export function indexTree(nodes: TreeNode[], loaded: Record<string, TreeNode[]> = {}): Map<string, TreeIndexEntry> {
  const out = new Map<string, TreeIndexEntry>();
  const walk = (list: TreeNode[], parent: TreeNode[]) => {
    for (const n of list) {
      out.set(n.id, { node: n, parentId: parent.length ? parent[parent.length - 1]!.id : null, path: [...parent, n] });
      const kids = n.children ?? loaded[n.id];
      if (kids) walk(kids, [...parent, n]);
    }
  };
  walk(nodes, []);
  return out;
}
const termsOf = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const matches = (n: TreeNode, terms: string[]) => { const hay = (n.label + " " + entityLabel[n.kind] + " " + (n.keywords || []).join(" ")).toLowerCase(); return terms.every((t) => hay.includes(t)); };

/* ---------- TreeView ---------- */
// The ownership tree on React Aria's Tree (treegrid): arrows move focus (Right expands, Left collapses or goes to the
// parent), Home/End, typeahead; Enter, Space or a click selects. Selection is "toggle" style so arrowing through the
// tree never changes the scope on its own. Each row: chevron, kind icon, label, and on the right the worst status
// below it with a count (healthy shows nothing) or a muted count. `hasChildren` + `loadChildren` load on expand.
// `filter` keeps matching nodes and their ancestors, expanded.
export function TreeView({ nodes, label, selectedId, onSelect, expandedIds, defaultExpandedIds = [], onExpandedChange, loadChildren, filter = "", state = "ready", emptyText = "Nothing here yet.", className }: TreeViewProps) {
  const [expandedInner, setExpandedInner] = useState<string[]>(defaultExpandedIds);
  const expanded = expandedIds ?? expandedInner;
  const [loaded, setLoaded] = useState<Record<string, TreeNode[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const index = useMemo(() => indexTree(nodes, loaded), [nodes, loaded]);
  const terms = termsOf(filter);
  // While filtering: the matches, their ancestors (kept, expanded) and nothing else.
  const visible = useMemo(() => {
    if (!terms.length) return null;
    const keep = new Set<string>(), open = new Set<string>();
    for (const [id, e] of index) if (matches(e.node, terms)) { keep.add(id); e.path.slice(0, -1).forEach((a) => { keep.add(a.id); open.add(a.id); }); }
    return { keep, open };
  }, [index, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const load = useCallback((id: string) => {
    const e = index.get(id);
    if (!e || !loadChildren || e.node.children || loaded[id] || loading[id]) return;
    setLoading((l) => ({ ...l, [id]: true })); setFailed((f) => ({ ...f, [id]: false }));
    loadChildren(e.node).then((kids) => setLoaded((l) => ({ ...l, [id]: kids })), () => setFailed((f) => ({ ...f, [id]: true })))
      .finally(() => setLoading((l) => ({ ...l, [id]: false })));
  }, [index, loadChildren, loaded, loading]);
  const setExpanded = (keys: Set<Key>) => {
    const ids = [...keys].map(String);
    ids.filter((id) => !expanded.includes(id)).forEach(load);
    setExpandedInner(ids); onExpandedChange && onExpandedChange(ids);
  };
  // Controlled expansion can open a node from outside (e.g. "Expand all"): load what it needs.
  useEffect(() => { expanded.forEach(load); }, [expanded.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  if (state === "loading") return <div className={cx("pw-tree-wrap", className)} aria-busy="true"><span className="pw-sr">Loading</span>{[0, 1, 2, 3].map((i) => <div key={i} className="pw-tree__row" style={{ ["--lvl" as string]: Math.min(i, 2) }}><span className="pw-skel" style={{ width: 120 + i * 18, height: 12 }} /></div>)}</div>;
  if (state === "error") return <div className={cx("pw-tree-wrap pw-tree__msg", className)} role="alert"><Icon name="critical" size={14} className="pw-tone--critical" />Couldn’t load the organisation. Try again.</div>;
  const render = (n: TreeNode): React.ReactElement | null => {
    if (visible && !visible.keep.has(n.id)) return null;
    const kids = n.children ?? loaded[n.id];
    const hasKids = !!(kids?.length || (n.hasChildren && !kids));
    return (
      <TreeItem key={n.id} id={n.id} textValue={n.label} hasChildItems={hasKids} isDisabled={n.noAccess} className={cx("pw-tree__item", n.noAccess && "is-noaccess")}>
        <TreeItemContent>
          {({ hasChildItems, isExpanded, level }) => (
            <div className={cx("pw-tree__row", n.kind === "resources" && "is-group")} style={{ ["--lvl" as string]: level - 1 }}>
              {hasChildItems ? <RacButton slot="chevron" className="pw-tree__chev" aria-label={(isExpanded ? "Collapse " : "Expand ") + n.label}><Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={14} /></RacButton> : <span className="pw-tree__chev" />}
              <span className="pw-tree__kind" title={entityLabel[n.kind]}><Icon name={n.icon ?? (n.noAccess ? "lock" : entityIcon[n.kind])} /></span>
              <span className="pw-tree__label">{n.label}</span>
              <span className="pw-sr">, {entityLabel[n.kind]}{n.noAccess ? ", no access" : ""}</span>
              {n.status && n.status !== "healthy" && n.status !== "unknown" ? <span className="pw-tree__meta"><StatusDot status={n.status} label={n.statusLabel} />{n.statusCount != null ? <span aria-hidden="true">{n.statusCount}</span> : null}</span>
                : n.meta != null ? <span className="pw-tree__meta">{n.meta}</span> : null}
            </div>
          )}
        </TreeItemContent>
        {kids ? kids.map(render) : null}
        {n.hasChildren && !kids && loading[n.id] ? <TreeLoadMoreItem isLoading className="pw-tree__loading"><span className="pw-spin" aria-hidden="true" />Loading…</TreeLoadMoreItem> : null}
        {n.hasChildren && !kids && failed[n.id] ? <TreeItem id={n.id + "::error"} textValue="Couldn’t load" isDisabled className="pw-tree__item"><TreeItemContent><div className="pw-tree__row pw-tree__msg" style={{ ["--lvl" as string]: (index.get(n.id)?.path.length ?? 1) }}><Icon name="critical" size={14} className="pw-tone--critical" />Couldn’t load. Collapse and expand to retry.</div></TreeItemContent></TreeItem> : null}
      </TreeItem>
    );
  };
  const shown = nodes.map(render).filter(Boolean);
  return (
    <div className={cx("pw-tree-wrap", className)}>
      {shown.length ? (
        <Tree aria-label={label} className="pw-tree" selectionMode="single" selectionBehavior="toggle" disallowEmptySelection={selectedId != null}
          selectedKeys={selectedId != null ? [selectedId] : []}
          onSelectionChange={(keys: Selection) => { if (keys === "all") return; const id = [...keys][0]; const e = id != null ? index.get(String(id)) : undefined; if (e && onSelect) onSelect(e.node); }}
          expandedKeys={visible ? new Set([...expanded, ...visible.open]) : expanded} onExpandedChange={(k) => setExpanded(k as Set<Key>)}>
          {shown}
        </Tree>
      ) : <div className="pw-tree__msg pw-muted">{terms.length ? `No match for “${filter}”.` : emptyText}</div>}
    </div>
  );
}

/* ---------- ScopePicker ---------- */
// The ownership scope, shown once, in the top bar: a chip with the current node's kind icon, name and kind. It opens a
// popover with search across the organisation (cmdk; each result shows its path, the one place outside the explorer
// that does), "Up to <parent>", "Whole organisation", and the tree around the current node.
export function ScopePicker({ nodes, value, onChange, label = "Ownership scope", wholeLabel = "Whole organisation", loadChildren, forceOpen }: ScopePickerProps) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const [q, setQ] = useState("");
  const index = useMemo(() => indexTree(nodes), [nodes]);
  const cur = value != null ? index.get(value) : undefined;
  const parent = cur?.parentId ? index.get(cur.parentId) : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useCmdkAria(inputRef, null);
  const terms = termsOf(q);
  const results = terms.length ? [...index.values()].filter((e) => matches(e.node, terms)).slice(0, 12) : [];
  const hl = useCmdkHighlight(results.map((e) => e.node.id));
  const pick = (id: string | null) => { onChange && onChange(id); setOpen(false); setQ(""); };
  const pathText = (e: TreeIndexEntry) => { const up = e.path.slice(0, -1).map((p) => p.label); return up.length > 3 ? ["…", ...up.slice(-2)].join(" › ") : up.join(" › "); };
  return (
    <RPopover.Root open={isOpen} onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}>
      <RPopover.Trigger asChild>
        <button ref={triggerRef} type="button" className={cx("pw-scopechip", isOpen && "is-open")} title={cur ? cur.path.map((p) => p.label).join(" › ") : wholeLabel}>
          <Icon name={cur ? cur.node.icon ?? entityIcon[cur.node.kind] : "building"} />
          <span className="pw-sr">{label}: </span>
          <span className="pw-scopechip__name">{cur ? cur.node.label : wholeLabel}</span>
          {cur ? <span className="pw-scopechip__kind">{entityLabel[cur.node.kind]}</span> : null}
          <Icon name="chevron-down" size={14} />
        </button>
      </RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content className="pw-popover pw-scopepick" align="start" sideOffset={6} collisionPadding={8} aria-label={label}
          onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}>
          <Command shouldFilter={false} loop label={"Search " + label.toLowerCase()} value={hl.value} onValueChange={hl.onValueChange} onKeyDown={hl.onKeyDown} onPointerMoveCapture={hl.onPointerMoveCapture}>
            <div className="pw-combo__search"><Icon name="search" size={14} />
              <Command.Input ref={inputRef} className="pw-combo__in" placeholder="Search teams, initiatives, projects" value={q} onValueChange={(v) => { hl.onQuery(); setQ(v); }} />
            </div>
            <Command.List ref={listRef} className="pw-list pw-scopepick__results" label="Matches" hidden={!terms.length}>
              {terms.length && !results.length ? <Command.Empty className="pw-list__empty pw-muted">No match for “{q}”.</Command.Empty> : null}
              {results.map((e) => (
                <Command.Item key={e.node.id} value={e.node.id} onSelect={() => pick(e.node.id)} className={cx("pw-list__item", e.node.id === value && "is-selected")}>
                  <span className="pw-list__check"><Icon name={e.node.icon ?? entityIcon[e.node.kind]} size={14} /></span>
                  <span className="pw-search__txt"><span>{e.node.label}</span>{e.path.length > 1 ? <span className="pw-caption pw-muted">{pathText(e)}</span> : null}</span>
                  <span className="pw-muted pw-list__meta">{entityLabel[e.node.kind]}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
          {!terms.length ? (
            <>
              <div className="pw-scopepick__acts">
                {parent ? <Button size="sm" variant="ghost" icon="level-up" onClick={() => pick(parent.node.id)}>{"Up to " + parent.node.label}</Button> : null}
                {value != null ? <Button size="sm" variant="ghost" icon="building" onClick={() => pick(null)}>{wholeLabel}</Button> : null}
              </div>
              <TreeView label="Organisation" nodes={nodes} loadChildren={loadChildren} selectedId={value ?? null} onSelect={(n) => pick(n.id)}
                defaultExpandedIds={cur ? cur.path.slice(0, -1).map((p) => p.id) : nodes.map((n) => n.id)} className="pw-scopepick__tree" />
            </>
          ) : null}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}

/* ---------- SplitView ---------- */
// The Resource Explorer layout: a fixed explorer-width pane (the tree) beside the workspace. The pane collapses to a
// strip; below 1024 px of available width it moves into a Drawer opened from a button, and the workspace's own
// child list and "up" link act as the drill-down on phones.
export function SplitView({ aside, asideLabel, asideTitle, children, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, forceWidth }: SplitViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(forceWidth || 1200);
  const [inner, setInner] = useState(defaultCollapsed);
  const [drawer, setDrawer] = useState(false);
  const collapsed = collapsedProp ?? inner;
  const setCollapsed = (c: boolean) => { setInner(c); onCollapsedChange && onCollapsedChange(c); };
  useEffect(() => {
    const el = ref.current; if (forceWidth || !el) return;
    const ro = new ResizeObserver((e) => { const r = e[0]; if (r) setW(r.contentRect.width); }); ro.observe(el); return () => ro.disconnect();
  }, [forceWidth]);
  const narrow = (forceWidth || w) < 1024;
  return (
    <div ref={ref} className={cx("pw-split", narrow && "is-narrow", collapsed && !narrow && "is-collapsed")}>
      {narrow ? (
        <>
          <div className="pw-split__bar"><Button size="sm" icon="layers" onClick={() => setDrawer(true)}>{"Show " + asideLabel.toLowerCase()}</Button></div>
          <Drawer open={drawer} title={asideTitle ?? asideLabel} onClose={() => setDrawer(false)} width={360}>{aside}</Drawer>
        </>
      ) : collapsed ? (
        <div className="pw-split__strip"><Button size="sm" variant="ghost" icon="chevrons-right" aria-label={"Show " + asideLabel.toLowerCase()} onClick={() => setCollapsed(false)} /></div>
      ) : (
        <aside className="pw-split__aside" aria-label={asideLabel}>
          <div className="pw-split__head">
            <span className="pw-caption pw-muted">{asideTitle ?? asideLabel}</span>
            <Button size="sm" variant="ghost" icon="chevrons-left" aria-label={"Hide " + asideLabel.toLowerCase()} onClick={() => setCollapsed(true)} />
          </div>
          {aside}
        </aside>
      )}
      <div className="pw-split__main">{children}</div>
    </div>
  );
}

/* ---------- ScopeNote ---------- */
// One line under a capability page's header: what this page covers. The ownership scope is the chip in the top bar;
// this says how far it reaches ("and its 2 projects"), the runtime scope if relevant, and offers Direct only.
export function ScopeNote({ scope, summary, runtime, mode, onModeChange, children }: ScopeNoteProps) {
  return (
    <div className="pw-scopenote">
      <span className="pw-scopenote__txt" aria-live="polite">Showing <b>{scope}</b>{summary ? <> {summary}</> : null}{runtime ? <>, in {runtime}</> : null}</span>
      {children}
      {onModeChange ? <SegmentedControl label="Items to include" size="sm" value={mode ?? "descendants"} onChange={(v) => onModeChange(v === "direct" ? "direct" : "descendants")}
        options={[{ value: "descendants", label: "Including descendants" }, { value: "direct", label: "Direct only" }]} /> : null}
    </div>
  );
}
