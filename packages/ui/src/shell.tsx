import type { SideNavProps, TopBarProps, AppShellProps, PageHeaderProps, PageHeaderField, NavGroup, ShellMode } from "./types";
import { Icon } from "./icons";
import { cx, Button, Tooltip, TooltipProvider, ScopeSwitcher, GlobalSearch, TimeRangePicker } from "./core";
import { ActionMenu } from "./actions";
import { KeyValueList } from "./display";
import * as React from "react";
import { Fragment } from "react";
const { useState, useRef, useEffect } = React;

export const NAV: NavGroup[] = [
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
        {nav.map((g, gi) => (
          <div key={gi} className="pw-rail__group">
            {g.group ? (collapsed ? <hr className="pw-rail__sep" /> : <div className="pw-rail__gl pw-caption">{g.group}</div>) : null}
            <ul>
              {g.items.map((it) => {
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

export function TopBar({ scope, scopeOptions, onScope, time, onTime, refresh, onRefresh, searchItems, searchRecent, onSearch, alerts = 0, user = "M", accountLabel, account, onMenu, mode = "full", onAlerts, onCopyRange }: TopBarProps) {
  return (
    <header className={cx("pw-topbar", "is-" + mode)}>
      {onMenu ? <Button variant="ghost" icon="menu" aria-label="Open navigation" onClick={onMenu} /> : null}
      <ScopeSwitcher scope={scope} options={scopeOptions} onChange={onScope} compact={mode !== "full"} />
      <div className="pw-topbar__search"><GlobalSearch items={searchItems} recent={searchRecent} onSelect={onSearch} placeholder={mode === "tablet" ? "Search" : undefined} /></div>
      <div className="pw-topbar__end">
        <TimeRangePicker value={time} onChange={onTime} refresh={refresh} onRefreshChange={onRefresh} onCopy={onCopyRange} />
        <button type="button" className="pw-iconbtn" aria-label={`Alerts, ${alerts} open critical`} onClick={onAlerts}>
          <Icon name="bell" />{alerts ? <span className="pw-iconbtn__n">{alerts}</span> : null}
        </button>
        {account ? (
          <ActionMenu label={accountLabel || "Account: " + account.name} items={account.items ?? []}
            trigger={<button type="button" className="pw-avatar"><span aria-hidden="true">{user}</span><span className="pw-sr">{accountLabel || "Account: " + account.name}</span></button>}
            header={
              <div className="pw-acct">
                <span className="pw-avatar pw-acct__avatar" aria-hidden="true">{user}</span>
                <span className="pw-acct__who">
                  <span className="pw-body-strong">{account.name}</span>
                  {account.email ? <span className="pw-caption pw-muted">{account.email}</span> : null}
                  {account.role || account.org ? <span className="pw-acct__role">{account.role ? <span className="pw-chip">{account.role}</span> : null}{account.org ? <span className="pw-caption pw-muted">{account.org}</span> : null}</span> : null}
                </span>
              </div>
            } />
        ) : <button type="button" className="pw-avatar"><span aria-hidden="true">{user}</span><span className="pw-sr">{accountLabel || "Account"}</span></button>}
      </div>
    </header>
  );
}

// Width-aware shell: >=1360 expanded rail · 1024-1359 collapsed rail · <1024 rail hidden behind a menu button.
export function AppShell({ nav, top, children, density = "compact", forceWidth }: AppShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(forceWidth || 1440);
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (forceWidth || !el) return;
    const ro = new ResizeObserver((e) => { const r = e[0]; if (r) setW(r.contentRect.width); }); ro.observe(el); return () => ro.disconnect();
  }, [forceWidth]);
  const mode: ShellMode = w >= 1360 ? "full" : w >= 1024 ? "collapsed" : "tablet";
  return (
    <TooltipProvider>
    <div ref={ref} className={cx("pw-shell", "is-" + mode, "is-" + density)} data-density={density}>
      {mode !== "tablet" ? React.cloneElement(nav, { collapsed: mode === "collapsed" }) : null}
      {mode === "tablet" && navOpen ? <div className="pw-layer is-contained"><div className="pw-scrim" onClick={() => setNavOpen(false)} />{React.cloneElement(nav, { collapsed: false, overlay: true, onClose: () => setNavOpen(false), onNavigate: (k: string) => { setNavOpen(false); nav.props.onNavigate && nav.props.onNavigate(k); } })}</div> : null}
      <div className="pw-shell__main">
        {React.cloneElement(top, { mode, onMenu: mode === "tablet" ? () => setNavOpen(true) : undefined })}
        <main className="pw-shell__content" id="main">{children}</main>
      </div>
    </div>
    </TooltipProvider>
  );
}

const isFields = (m: PageHeaderProps["meta"]): m is PageHeaderField[] => Array.isArray(m);
export function PageHeader({ crumbs, title, titleMono, status, meta, actions, tabs, back }: PageHeaderProps) {
  // meta: a short sentence, or structured fields [{label, value, mono?}] (preferred over dot-joined strings)
  const metaEl = isFields(meta)
    ? <KeyValueList layout="inline" items={meta} />
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
