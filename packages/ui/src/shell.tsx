import type { SideNavProps, TopBarProps, AppShellProps, PageHeaderProps } from "./types";
import { Icon } from "./icons";
import { cx, Button, Tooltip, ScopeSwitcher, GlobalSearch, TimeRangePicker } from "./core";
import * as React from "react";
import { Fragment } from "react";
const { useState, useRef, useEffect } = React;

export const NAV = [
  { group: null, items: [{ key: "home", label: "Home", icon: "home" }] },
  { group: "Respond", items: [{ key: "incidents", label: "Incidents & alerts", icon: "siren" }, { key: "changes", label: "Changes", icon: "changes" }] },
  { group: "Workloads", items: [{ key: "workloads", label: "All workloads", icon: "layers" }, { key: "services", label: "Services & APIs", icon: "server" }, { key: "pipelines", label: "Pipelines", icon: "pipeline" }, { key: "mljobs", label: "ML jobs", icon: "chip" }, { key: "clusters", label: "Clusters", icon: "cube" }, { key: "data", label: "Data services", icon: "database" }] },
  { group: "Lenses", items: [{ key: "cost", label: "Cost & usage", icon: "coins" }, { key: "reliability", label: "Reliability", icon: "target" }, { key: "governance", label: "Governance", icon: "shield" }, { key: "dashboards", label: "Dashboards", icon: "grid" }] },
];

export function SideNav({ active, onNavigate, collapsed, badges = {}, nav = NAV, onClose, overlay }: SideNavProps) {
  return (
    <nav className={cx("pw-rail", collapsed && "is-collapsed", overlay && "is-overlay")} aria-label="Primary">
      <div className="pw-rail__brand">
        {collapsed ? <span className="pw-rail__mark" aria-label="Pairwise">PW</span> : <span className="pw-rail__name">Pairwise</span>}
        {overlay ? <Button variant="ghost" icon="x" aria-label="Close navigation" onClick={onClose} className="pw-rail__close" /> : null}
      </div>
      <div className="pw-rail__scroll">
        {nav.map((g: any, gi: number) => (
          <div key={gi} className="pw-rail__group">
            {g.group ? (collapsed ? <hr className="pw-rail__sep" /> : <div className="pw-rail__gl pw-caption">{g.group}</div>) : null}
            <ul>
              {g.items.map((it: any) => {
                const on = it.key === active; const b = badges[it.key];
                const link = (
                  <a href={"#/" + it.key} aria-current={on ? "page" : undefined} className={cx("pw-rail__item", on && "is-on")} aria-label={collapsed ? it.label + (b ? `, ${b.count} ${b.tone === "critical" ? "critical" : ""}` : "") : undefined}
                    onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(it.key); }}>
                    <Icon name={it.icon} />
                    {!collapsed ? <span className="pw-rail__l">{it.label}</span> : null}
                    {b ? <span className={cx("pw-rail__badge", b.tone && "is-" + b.tone, collapsed && "is-dot")}>{collapsed ? "" : b.count}</span> : null}
                  </a>
                );
                return <li key={it.key}>{collapsed ? <Tooltip content={it.label} side="right">{link}</Tooltip> : link}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="pw-rail__foot">
        <a href="#/admin" className={cx("pw-rail__item", active === "admin" && "is-on")} onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("admin"); }} aria-label={collapsed ? "Administration" : undefined}>
          <Icon name="settings" />{!collapsed ? <span className="pw-rail__l">Administration</span> : null}
        </a>
      </div>
    </nav>
  );
}

export function TopBar({ scope, scopeOptions, onScope, time, onTime, refresh, onRefresh, searchItems, onSearch, alerts = 0, user = "M", onMenu, mode = "full", onAlerts, onCopyRange }: TopBarProps) {
  return (
    <header className={cx("pw-topbar", "is-" + mode)}>
      {onMenu ? <Button variant="ghost" icon="menu" aria-label="Open navigation" onClick={onMenu} /> : null}
      <ScopeSwitcher scope={scope} options={scopeOptions} onChange={onScope} compact={mode !== "full"} />
      <div className="pw-topbar__search"><GlobalSearch items={searchItems} onSelect={onSearch} placeholder={mode === "tablet" ? "Search" : undefined} /></div>
      <div className="pw-topbar__end">
        <TimeRangePicker value={time} onChange={onTime} refresh={refresh} onRefreshChange={onRefresh} onCopy={onCopyRange} />
        <button type="button" className="pw-iconbtn" aria-label={`Alerts, ${alerts} open critical`} onClick={onAlerts}>
          <Icon name="bell" />{alerts ? <span className="pw-iconbtn__n">{alerts}</span> : null}
        </button>
        <button type="button" className="pw-avatar" aria-label="Account: M, Platform Admin">{user}</button>
      </div>
    </header>
  );
}

// Width-aware shell: >=1360 expanded rail · 1024-1359 collapsed rail · <1024 rail hidden behind a menu button.
export function AppShell({ nav, top, children, density = "compact", forceWidth }: AppShellProps) {
  const ref = useRef(null);
  const [w, setW] = useState(forceWidth || 1440);
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    if (forceWidth || !ref.current) return;
    const ro = new ResizeObserver((e: any) => setW(e[0].contentRect.width)); ro.observe(ref.current as any); return () => ro.disconnect();
  }, [forceWidth]);
  const mode = w >= 1360 ? "full" : w >= 1024 ? "collapsed" : "tablet";
  return (
    <div ref={ref} className={cx("pw-shell", "is-" + mode, "is-" + density)} data-density={density}>
      {mode !== "tablet" ? React.cloneElement(nav, { collapsed: mode === "collapsed" }) : null}
      {mode === "tablet" && navOpen ? <div className="pw-layer is-contained"><div className="pw-scrim" onClick={() => setNavOpen(false)} />{React.cloneElement(nav, { collapsed: false, overlay: true, onClose: () => setNavOpen(false), onNavigate: (k: any) => { setNavOpen(false); nav.props.onNavigate && nav.props.onNavigate(k); } })}</div> : null}
      <div className="pw-shell__main">
        {React.cloneElement(top, { mode, onMenu: mode === "tablet" ? () => setNavOpen(true) : undefined })}
        <main className="pw-shell__content" id="main">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ crumbs, title, titleMono, status, meta, actions, tabs, back }: PageHeaderProps) {
  // meta: a short sentence, or structured fields [{label, value, mono?}] (preferred over dot-joined strings)
  const metaEl = Array.isArray(meta)
    ? <dl className="pw-fields">{meta.map((m: any) => <div key={m.label}><dt>{m.label}</dt><dd className={cx(m.mono && "pw-mono")}>{m.value}</dd></div>)}</dl>
    : meta ? <span className="pw-pagehead__meta">{meta}</span> : null;
  return (
    <div className="pw-pagehead">
      {crumbs || back ? <div className="pw-pagehead__nav">{back}{crumbs}</div> : null}
      <div className="pw-pagehead__row">
        <div className="pw-pagehead__t">
          <div className="pw-pagehead__tl"><h1 className={cx("pw-title", titleMono && "pw-title--mono")}>{title}</h1>{status}</div>
          {metaEl}
        </div>
        {actions ? <div className="pw-pagehead__a">{actions}</div> : null}
      </div>
      {tabs}
    </div>
  );
}
