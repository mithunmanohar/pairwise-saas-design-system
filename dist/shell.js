import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Icon } from "./icons";
import { cx, Button, Tooltip, TooltipProvider, ScopeSwitcher, GlobalSearch, TimeRangePicker } from "./core";
import { ActionMenu } from "./actions";
import { KeyValueList } from "./display";
import * as React from "react";
const { useState, useRef, useEffect } = React;
export const NAV = [
    { group: null, items: [{ key: "home", label: "Home", icon: "home" }] },
    { group: "Respond", items: [{ key: "incidents", label: "Incidents & alerts", icon: "siren" }, { key: "changes", label: "Changes", icon: "changes" }] },
    { group: "Workloads", items: [{ key: "workloads", label: "All workloads", icon: "layers" }, { key: "services", label: "Services & APIs", icon: "server" }, { key: "pipelines", label: "Pipelines", icon: "pipeline" }, { key: "mljobs", label: "ML jobs", icon: "chip" }, { key: "clusters", label: "Clusters", icon: "cube" }, { key: "data", label: "Data services", icon: "database" }] },
    { group: "Lenses", items: [{ key: "cost", label: "Cost & usage", icon: "coins" }, { key: "reliability", label: "Reliability", icon: "target" }, { key: "governance", label: "Governance", icon: "shield" }, { key: "dashboards", label: "Dashboards", icon: "grid" }] },
];
export function SideNav({ active, onNavigate, collapsed, badges = {}, nav = NAV, onClose, overlay }) {
    return (_jsxs("nav", { className: cx("pw-rail", collapsed && "is-collapsed", overlay && "is-overlay"), "aria-label": "Primary", children: [_jsxs("div", { className: "pw-rail__brand", children: [collapsed ? _jsx("span", { className: "pw-rail__mark", "aria-label": "Pairwise", children: "PW" }) : _jsx("span", { className: "pw-rail__name", children: "Pairwise" }), overlay ? _jsx(Button, { variant: "ghost", icon: "x", "aria-label": "Close navigation", onClick: onClose, className: "pw-rail__close" }) : null] }), _jsx("div", { className: "pw-rail__scroll", children: nav.map((g, gi) => (_jsxs("div", { className: "pw-rail__group", children: [g.group ? (collapsed ? _jsx("hr", { className: "pw-rail__sep" }) : _jsx("div", { className: "pw-rail__gl pw-caption", children: g.group })) : null, _jsx("ul", { children: g.items.map((it) => {
                                const on = it.key === active;
                                const b = badges[it.key];
                                const link = (_jsxs("a", { href: "#/" + it.key, "aria-current": on ? "page" : undefined, className: cx("pw-rail__item", on && "is-on"), "aria-label": collapsed ? it.label + (b ? `, ${b.count} ${b.tone === "critical" ? "critical" : ""}` : "") : undefined, onClick: (e) => { e.preventDefault(); onNavigate && onNavigate(it.key); }, children: [_jsx(Icon, { name: it.icon }), !collapsed ? _jsx("span", { className: "pw-rail__l", children: it.label }) : null, b ? _jsx("span", { className: cx("pw-rail__badge", b.tone && "is-" + b.tone, collapsed && "is-dot"), children: collapsed ? "" : b.count }) : null] }));
                                return _jsx("li", { children: collapsed ? _jsx(Tooltip, { content: it.label, side: "right", children: link }) : link }, it.key);
                            }) })] }, gi))) }), _jsx("div", { className: "pw-rail__foot", children: _jsxs("a", { href: "#/admin", className: cx("pw-rail__item", active === "admin" && "is-on"), onClick: (e) => { e.preventDefault(); onNavigate && onNavigate("admin"); }, "aria-label": collapsed ? "Administration" : undefined, children: [_jsx(Icon, { name: "settings" }), !collapsed ? _jsx("span", { className: "pw-rail__l", children: "Administration" }) : null] }) })] }));
}
export function TopBar({ ownership, runtime, scope, scopeOptions, onScope, time, onTime, refresh, onRefresh, searchItems, searchRecent, onSearch, alerts = 0, user = "M", accountLabel, account, onMenu, mode = "full", onAlerts, onCopyRange }) {
    return (_jsxs("header", { className: cx("pw-topbar", "is-" + mode), children: [onMenu ? _jsx(Button, { variant: "ghost", icon: "menu", "aria-label": "Open navigation", onClick: onMenu }) : null, ownership ? _jsxs(_Fragment, { children: [_jsx("div", { className: "pw-topbar__group", children: ownership }), _jsx("span", { className: "pw-topbar__divider", "aria-hidden": "true" })] }) : null, runtime || (scope && scopeOptions) ? _jsx(ScopeSwitcher, { dimensions: runtime, scope: scope, options: scopeOptions, onChange: onScope, compact: mode !== "full" }) : null, _jsx("div", { className: "pw-topbar__search", children: _jsx(GlobalSearch, { items: searchItems, recent: searchRecent, onSelect: onSearch, placeholder: mode === "tablet" ? "Search" : undefined }) }), _jsxs("div", { className: "pw-topbar__end", children: [_jsx(TimeRangePicker, { value: time, onChange: onTime, refresh: refresh, onRefreshChange: onRefresh, onCopy: onCopyRange }), _jsxs("button", { type: "button", className: "pw-iconbtn", "aria-label": `Alerts, ${alerts} open critical`, onClick: onAlerts, children: [_jsx(Icon, { name: "bell" }), alerts ? _jsx("span", { className: "pw-iconbtn__n", children: alerts }) : null] }), account ? (_jsx(ActionMenu, { label: accountLabel || "Account: " + account.name, items: account.items ?? [], trigger: _jsxs("button", { type: "button", className: "pw-avatar", children: [_jsx("span", { "aria-hidden": "true", children: user }), _jsx("span", { className: "pw-sr", children: accountLabel || "Account: " + account.name })] }), header: _jsxs("div", { className: "pw-acct", children: [_jsx("span", { className: "pw-avatar pw-acct__avatar", "aria-hidden": "true", children: user }), _jsxs("span", { className: "pw-acct__who", children: [_jsx("span", { className: "pw-body-strong", children: account.name }), account.email ? _jsx("span", { className: "pw-caption pw-muted", children: account.email }) : null, account.role || account.org ? _jsxs("span", { className: "pw-acct__role", children: [account.role ? _jsx("span", { className: "pw-chip", children: account.role }) : null, account.org ? _jsx("span", { className: "pw-caption pw-muted", children: account.org }) : null] }) : null] })] }) })) : _jsxs("button", { type: "button", className: "pw-avatar", children: [_jsx("span", { "aria-hidden": "true", children: user }), _jsx("span", { className: "pw-sr", children: accountLabel || "Account" })] })] })] }));
}
// Width-aware shell: >=1360 expanded rail · 1024-1359 collapsed rail · <1024 rail hidden behind a menu button.
export function AppShell({ nav, top, children, density = "compact", forceWidth }) {
    const ref = useRef(null);
    const [w, setW] = useState(forceWidth || 1440);
    const [navOpen, setNavOpen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (forceWidth || !el)
            return;
        const ro = new ResizeObserver((e) => { const r = e[0]; if (r)
            setW(r.contentRect.width); });
        ro.observe(el);
        return () => ro.disconnect();
    }, [forceWidth]);
    const mode = w >= 1360 ? "full" : w >= 1024 ? "collapsed" : "tablet";
    return (_jsx(TooltipProvider, { children: _jsxs("div", { ref: ref, className: cx("pw-shell", "is-" + mode, "is-" + density), "data-density": density, children: [mode !== "tablet" ? React.cloneElement(nav, { collapsed: mode === "collapsed" }) : null, mode === "tablet" && navOpen ? _jsxs("div", { className: "pw-layer is-contained", children: [_jsx("div", { className: "pw-scrim", onClick: () => setNavOpen(false) }), React.cloneElement(nav, { collapsed: false, overlay: true, onClose: () => setNavOpen(false), onNavigate: (k) => { setNavOpen(false); nav.props.onNavigate && nav.props.onNavigate(k); } })] }) : null, _jsxs("div", { className: "pw-shell__main", children: [React.cloneElement(top, { mode, onMenu: mode === "tablet" ? () => setNavOpen(true) : undefined }), _jsx("main", { className: "pw-shell__content", id: "main", children: children })] })] }) }));
}
const isFields = (m) => Array.isArray(m);
export function PageHeader({ kind, crumbs, title, titleMono, status, meta, actions, tabs, back }) {
    // meta: a short sentence, or structured fields [{label, value, mono?}] (preferred over dot-joined strings)
    const metaEl = isFields(meta)
        ? _jsx(KeyValueList, { layout: "inline", items: meta })
        : meta ? _jsx("span", { className: "pw-pagehead__meta", children: meta }) : null;
    return (_jsxs("div", { className: "pw-pagehead", children: [crumbs || back ? _jsxs("div", { className: "pw-pagehead__nav", children: [back, crumbs] }) : null, _jsxs("div", { className: "pw-pagehead__row", children: [_jsxs("div", { className: "pw-pagehead__t", children: [kind ? _jsxs("span", { className: "pw-kind", children: [kind.icon ? _jsx(Icon, { name: kind.icon, size: 14 }) : null, _jsx("span", { className: "pw-kind__label", children: kind.label }), kind.detail ? _jsxs("span", { className: "pw-kind__detail", children: [" \u00B7 ", kind.detail] }) : null] }) : null, _jsxs("div", { className: "pw-pagehead__tl", children: [_jsx("h1", { className: cx("pw-title", titleMono && "pw-title--mono"), children: title }), status] }), metaEl] }), actions ? _jsx("div", { className: "pw-pagehead__a", children: actions }) : null] }), tabs] }));
}
//# sourceMappingURL=shell.js.map