import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFormatter } from "./format";
const timeZoneLabel = () => createFormatter({ locale: navigator.language, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, currency: "USD" }).timeZoneLabel();
import { Icon } from "./icons";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Fragment } from "react";
const { useState, useRef, useEffect, useId, useCallback, useMemo } = React;
export const cx = (...a) => a.filter(Boolean).join(" ");
/* ---------- Button ---------- */
// Forwards its ref so it can be the trigger of a menu or popover.
export const Button = React.forwardRef(function Button({ variant = "secondary", size, icon, iconRight, loading, disabled, className, children, forceState, ...rest }, ref) {
    return (_jsxs("button", { ref: ref, ...rest, type: rest.type || "button", disabled: disabled || loading, "aria-busy": loading || undefined, className: cx("pw-btn", "pw-btn--" + variant, size === "sm" && "pw-btn--sm", !children && "pw-btn--icon", forceState && "is-" + forceState, className), children: [loading ? _jsx("span", { className: "pw-spin", "aria-hidden": "true" }) : icon ? _jsx(Icon, { name: icon }) : null, children ? _jsx("span", { children: children }) : null, iconRight ? _jsx(Icon, { name: iconRight }) : null] }));
});
/* ---------- Status ---------- */
const STATUS_LABEL = { critical: "Critical", warning: "Warning", healthy: "Healthy", unknown: "No data", info: "Running" };
export function StatusBadge({ status = "unknown", label, emphasis, size, className }) {
    // emphasis: filled tint for critical/warning by default; healthy/unknown/info always outline (healthy is quiet)
    const filled = emphasis !== undefined ? emphasis : status === "critical" || status === "warning";
    return (_jsxs("span", { className: cx("pw-badge", "pw-badge--" + status, filled && "is-filled", size === "sm" && "pw-badge--sm", className), children: [_jsx(Icon, { name: status, size: size === "sm" ? 12 : 14 }), _jsx("span", { children: label || STATUS_LABEL[status] })] }));
}
export function StatusDot({ status = "unknown", label }) {
    return _jsxs("span", { className: cx("pw-sdot", "pw-badge--" + status), title: label || STATUS_LABEL[status], children: [_jsx(Icon, { name: status, size: 12 }), _jsx("span", { className: "pw-sr", children: label || STATUS_LABEL[status] })] });
}
const SEV = { 1: ["critical", 4], 2: ["critical", 3], 3: ["warning", 2], 4: ["unknown", 1] };
export function SeverityMark({ level = 3, showLabel = true, count }) {
    const [tone, n] = SEV[level];
    return (_jsxs("span", { className: cx("pw-sev", "pw-sev--" + (count === 0 ? "zero" : tone)), "aria-label": "Severity " + level + (count != null ? ", " + count : ""), children: [_jsx("span", { className: "pw-sev__bars", "aria-hidden": "true", children: [0, 1, 2, 3].map((i) => _jsx("i", { className: i < n ? "on" : "" }, i)) }), showLabel ? _jsxs("span", { children: ["SEV", level] }) : null, count != null ? _jsx("b", { children: count }) : null] }));
}
/* ---------- Trend ---------- */
// direction from sign; goodness from polarity: "up-bad" (latency, errors, cost) | "up-good" | "neutral"
export function Trend({ value, unit = "%", polarity = "up-bad", window: win, threshold = 2, breach }) {
    const dir = Math.abs(value) < threshold ? "flat" : value > 0 ? "up" : "down";
    const bad = dir !== "flat" && ((polarity === "up-bad" && dir === "up") || (polarity === "up-good" && dir === "down"));
    const tone = bad ? (breach ? "critical" : "warning") : "neutral";
    const glyph = dir === "up" ? "▲" : dir === "down" ? "▼" : "▬";
    return (_jsxs("span", { className: cx("pw-trend", "pw-trend--" + tone), children: [_jsx("span", { "aria-hidden": "true", children: glyph }), _jsxs("span", { className: "pw-num", children: [dir === "flat" ? "±" : "", Math.abs(value).toLocaleString("en", { maximumFractionDigits: 1 }), unit] }), win ? _jsxs("span", { className: "pw-muted", children: ["vs ", win] }) : null, _jsx("span", { className: "pw-sr", children: bad ? "worse" : dir === "flat" ? "no change" : "better or neutral" })] }));
}
/* ---------- Tooltip ---------- */
export function Tooltip({ content, children, side = "top", forceOpen }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    const show = forceOpen || open;
    return (_jsxs("span", { className: "pw-tipwrap", onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false), onFocus: () => setOpen(true), onBlur: () => setOpen(false), onKeyDown: (e) => e.key === "Escape" && setOpen(false), children: [React.cloneElement(children, { "aria-describedby": show ? id : undefined }), show ? _jsx("span", { role: "tooltip", id: id, className: cx("pw-tip", "pw-tip--" + side), children: content }) : null] }));
}
/* ---------- Popover (internal) ---------- */
export function usePopover() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const onDoc = (e) => { if (ref.current && e.target instanceof Node && !ref.current.contains(e.target))
            setOpen(false); };
        const onKey = (e) => { if (e.key === "Escape")
            setOpen(false); };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [open]);
    return { open, setOpen, ref };
}
/* ---------- Menu select (used by scope, filters) ---------- */
// Options may be plain strings; a missing label falls back to the value.
const toOption = (o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export function MenuSelect({ label, value, options, onChange, icon, disabled, width, prefix, forceOpen, quiet }) {
    const { open, setOpen, ref } = usePopover();
    const isOpen = forceOpen || open;
    const opts = options.map(toOption);
    const cur = opts.find((o) => o.value === value);
    const curLabel = cur ? cur.label : value;
    return (_jsxs("div", { className: "pw-menusel", ref: ref, children: [_jsxs("button", { type: "button", className: cx("pw-field", quiet && "pw-field--quiet", isOpen && "is-open"), "aria-haspopup": "listbox", "aria-expanded": isOpen, "aria-label": label + ": " + curLabel, disabled: disabled, onClick: () => setOpen(!open), style: width ? { minWidth: width } : undefined, children: [icon ? _jsx(Icon, { name: icon }) : null, prefix ? _jsx("span", { className: "pw-field__pre", children: prefix }) : null, _jsx("span", { className: "pw-field__val", children: curLabel }), _jsx(Icon, { name: "chevron-down", size: 14 })] }), isOpen ? (_jsx("ul", { role: "listbox", "aria-label": label, className: "pw-pop pw-list", children: opts.map((o) => {
                    const v = o.value;
                    const sel = v === value;
                    return (_jsxs("li", { role: "option", "aria-selected": sel, tabIndex: 0, className: cx("pw-list__item", sel && "is-selected"), onClick: () => { onChange && onChange(v); setOpen(false); }, onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onChange && onChange(v);
                            setOpen(false);
                        } }, children: [_jsx("span", { className: "pw-list__check", children: sel ? _jsx(Icon, { name: "check", size: 14 }) : null }), _jsx("span", { children: o.label }), o.meta ? _jsx("span", { className: "pw-muted pw-list__meta", children: o.meta }) : null] }, v));
                }) })) : null] }));
}
/* ---------- Time range picker ---------- */
export const TIME_RANGES = [
    { value: "15m", label: "Last 15 min" }, { value: "1h", label: "Last 1 hour" }, { value: "6h", label: "Last 6 hours" },
    { value: "24h", label: "Last 24 hours" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" },
    { value: "mtd", label: "Month to date" }, { value: "6mo", label: "Last 6 months" },
];
const REFRESH = [{ value: "off", label: "Off" }, { value: "30s", label: "30 s" }, { value: "1m", label: "1 min" }, { value: "5m", label: "5 min" }];
// Absolute ranges are typed as "YYYY-MM-DD HH:mm" in the browser's time zone (shown in the heading).
const pad2 = (n) => String(n).padStart(2, "0");
const localStamp = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const STAMP = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
export function TimeRangePicker({ value = "1h", refresh = "30s", onChange, onRefreshChange, onCopy, ranges = TIME_RANGES, forceOpen, disabled, absolute, defaultAbsolute, onAbsoluteChange }) {
    const { open, setOpen, ref } = usePopover();
    const isOpen = forceOpen || open;
    const cur = ranges.find((r) => r.value === value);
    const [copied, setCopied] = useState(false);
    const [from, setFrom] = useState(() => defaultAbsolute?.from ?? localStamp(new Date(Date.now() - 3600e3)));
    const [to, setTo] = useState(() => defaultAbsolute?.to ?? localStamp(new Date()));
    const [absErr, setAbsErr] = useState(null);
    const errId = useId();
    const apply = () => {
        const f = from.trim(), t = to.trim();
        if (!STAMP.test(f) || !STAMP.test(t))
            return setAbsErr("Use the format YYYY-MM-DD HH:mm.");
        if (f >= t)
            return setAbsErr("“From” must be before “To”.");
        setAbsErr(null);
        onAbsoluteChange && onAbsoluteChange({ from: f, to: t });
        setOpen(false);
    };
    const absProps = { "aria-invalid": absErr ? true : undefined, "aria-describedby": absErr ? errId : undefined };
    return (_jsxs("div", { className: "pw-time", ref: ref, children: [_jsxs("button", { type: "button", className: cx("pw-field", isOpen && "is-open"), "aria-haspopup": "dialog", "aria-expanded": isOpen, onClick: () => setOpen(!open), disabled: disabled, children: [_jsx(Icon, { name: "clock" }), _jsx("span", { className: "pw-field__val", children: absolute || (cur ? cur.label : value) }), refresh !== "off" ? _jsxs("span", { className: "pw-time__live", title: "Auto-refresh every " + refresh, children: [_jsx(Icon, { name: "refresh", size: 12 }), refresh] }) : null, _jsx(Icon, { name: "chevron-down", size: 14 })] }), isOpen ? (_jsx("div", { role: "dialog", "aria-label": "Time range", className: "pw-pop pw-time__pop", children: _jsxs("div", { className: "pw-time__cols", children: [_jsxs("div", { children: [_jsx("div", { className: "pw-caption pw-muted pw-pop__h", children: "Relative" }), _jsx("ul", { role: "listbox", "aria-label": "Relative ranges", className: "pw-list pw-list--flat", children: ranges.map((r) => (_jsxs("li", { role: "option", tabIndex: 0, "aria-selected": r.value === value, className: cx("pw-list__item", r.value === value && "is-selected"), onClick: () => { onChange && onChange(r.value); setOpen(false); }, onKeyDown: (e) => { if (e.key === "Enter") {
                                            onChange && onChange(r.value);
                                            setOpen(false);
                                        } }, children: [_jsx("span", { className: "pw-list__check", children: r.value === value ? _jsx(Icon, { name: "check", size: 14 }) : null }), r.label] }, r.value))) })] }), _jsxs("div", { className: "pw-time__abs", children: [_jsxs("div", { className: "pw-caption pw-muted pw-pop__h", children: ["Absolute (", timeZoneLabel(), ")"] }), _jsxs("label", { className: "pw-lab", children: ["From", _jsx("input", { className: "pw-input pw-num", value: from, onChange: (e) => setFrom(e.target.value), onKeyDown: (e) => e.key === "Enter" && apply(), ...absProps })] }), _jsxs("label", { className: "pw-lab", children: ["To", _jsx("input", { className: "pw-input pw-num", value: to, onChange: (e) => setTo(e.target.value), onKeyDown: (e) => e.key === "Enter" && apply(), ...absProps })] }), absErr ? _jsxs("div", { id: errId, className: "pw-formfield__error pw-time__err", role: "alert", children: [_jsx(Icon, { name: "critical", size: 12 }), _jsx("span", { children: absErr })] }) : null, _jsx(Button, { size: "sm", onClick: apply, children: "Apply" }), _jsx("div", { className: "pw-caption pw-muted pw-pop__h", style: { marginTop: 12 }, children: "Auto-refresh" }), _jsx("div", { className: "pw-seg", role: "radiogroup", "aria-label": "Auto-refresh", children: REFRESH.map((r) => _jsx("button", { type: "button", role: "radio", "aria-checked": r.value === refresh, className: cx("pw-seg__b", r.value === refresh && "is-on"), onClick: () => onRefreshChange && onRefreshChange(r.value), children: r.label }, r.value)) }), _jsxs("button", { type: "button", className: "pw-linkbtn", onClick: () => { setCopied(true); onCopy && onCopy(value); setTimeout(() => setCopied(false), 1500); }, children: [_jsx(Icon, { name: "copy", size: 14 }), copied ? "Range copied" : "Copy range to paste elsewhere"] })] })] }) })) : null] }));
}
/* ---------- Scope switcher ---------- */
export function ScopeSwitcher({ scope, options, onChange, compact }) {
    // scope: {env, cloud, cluster}; options: {env:[], cloud:[], cluster:[]}
    const set = (k) => (v) => onChange && onChange({ ...scope, [k]: v });
    return (_jsxs("div", { className: cx("pw-scope", compact && "is-compact"), role: "group", "aria-label": "Scope", children: [_jsx(MenuSelect, { quiet: true, label: "Environment", value: scope.env, options: options.env, onChange: set("env") }), _jsx("span", { className: "pw-scope__sep", "aria-hidden": "true", children: "/" }), _jsx(MenuSelect, { quiet: true, label: "Cloud", value: scope.cloud, options: options.cloud, onChange: set("cloud") }), !compact ? _jsxs(Fragment, { children: [_jsx("span", { className: "pw-scope__sep", "aria-hidden": "true", children: "/" }), _jsx(MenuSelect, { quiet: true, label: "Cluster", value: scope.cluster, options: options.cluster, onChange: set("cluster") })] }) : null] }));
}
/* ---------- Global search ---------- */
export function GlobalSearch({ items = [], onSelect, placeholder = "Search repositories, runs, files", forceQuery, emptyHint }) {
    const [q, setQ] = useState(forceQuery || "");
    const [focus, setFocus] = useState(!!forceQuery);
    const [hi, setHi] = useState(0);
    const inputRef = useRef(null);
    useEffect(() => {
        const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            inputRef.current?.focus();
        } };
        document.addEventListener("keydown", k);
        return () => document.removeEventListener("keydown", k);
    }, []);
    const res = q ? items.filter((i) => (i.label + " " + (i.kind || "")).toLowerCase().includes(q.toLowerCase())).slice(0, 7) : [];
    const pick = (i) => { onSelect && onSelect(i); setQ(""); setFocus(false); };
    return (_jsxs("div", { className: "pw-search", onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget))
            setFocus(false); }, children: [_jsx(Icon, { name: "search" }), _jsx("input", { ref: inputRef, className: "pw-search__in", role: "combobox", "aria-expanded": focus && res.length > 0, "aria-controls": "pw-search-res", "aria-label": "Search", placeholder: placeholder, value: q, onFocus: () => setFocus(true), onChange: (e) => { setQ(e.target.value); setHi(0); }, onKeyDown: (e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHi(Math.min(hi + 1, res.length - 1));
                    }
                    if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHi(Math.max(hi - 1, 0));
                    }
                    const sel = res[hi];
                    if (e.key === "Enter" && sel)
                        pick(sel);
                    if (e.key === "Escape") {
                        setQ("");
                        e.currentTarget.blur();
                    }
                } }), _jsx("kbd", { className: "pw-kbd", children: "\u2318K" }), focus && q ? (_jsx("ul", { id: "pw-search-res", role: "listbox", className: "pw-pop pw-list pw-search__res", children: res.length ? res.map((i, n) => (_jsxs("li", { role: "option", "aria-selected": n === hi, tabIndex: -1, className: cx("pw-list__item", n === hi && "is-active"), onMouseDown: (e) => e.preventDefault(), onClick: () => pick(i), children: [i.status ? _jsx(StatusDot, { status: i.status }) : _jsx("span", { className: "pw-list__check" }), _jsx("span", { className: "pw-mono", children: i.label }), _jsx("span", { className: "pw-muted pw-list__meta", children: i.kind })] }, i.label))) : _jsxs("li", { className: "pw-list__empty pw-muted", children: ["No match for \u201C", q, "\u201D.", emptyHint ? " " + emptyHint : ""] }) })) : null] }));
}
/* ---------- Filter bar ---------- */
export function FilterBar({ filters = [], values = {}, onChange, query, onQuery, queryPlaceholder = "Filter by name", onClear, count, children }) {
    const active = Object.keys(values).filter((k) => values[k] && values[k] !== "all");
    return (_jsxs("div", { className: "pw-filterbar", role: "search", children: [_jsxs("div", { className: "pw-filterbar__q", children: [_jsx(Icon, { name: "filter" }), _jsx("input", { className: "pw-input pw-input--bare", "aria-label": queryPlaceholder, placeholder: queryPlaceholder, value: query || "", onChange: (e) => onQuery && onQuery(e.target.value) })] }), filters.map((f) => (_jsx(MenuSelect, { label: f.label, prefix: f.label, value: values[f.key] || "all", options: [{ value: "all", label: "All" }, ...f.options], onChange: (v) => onChange && onChange({ ...values, [f.key]: v }) }, f.key))), children, _jsxs("span", { className: "pw-filterbar__end", children: [count != null ? _jsx("span", { className: "pw-caption pw-muted pw-num", children: count }) : null, active.length || query ? _jsxs("button", { type: "button", className: "pw-linkbtn", onClick: onClear, children: ["Clear ", active.length + (query ? 1 : 0)] }) : null] })] }));
}
/* ---------- Breadcrumbs ---------- */
export function Breadcrumbs({ items = [], onNavigate }) {
    return (_jsx("nav", { "aria-label": "Breadcrumb", className: "pw-crumbs", children: _jsx("ol", { children: items.map((it, i) => {
                const last = i === items.length - 1;
                return (_jsxs("li", { children: [last ? _jsx("span", { "aria-current": "page", className: cx(it.mono && "pw-mono"), children: it.label })
                            : _jsx("a", { href: it.href || "#", className: cx(it.mono && "pw-mono"), onClick: (e) => { if (onNavigate) {
                                    e.preventDefault();
                                    onNavigate(it);
                                } }, children: it.label }), !last ? _jsx("span", { className: "pw-crumbs__sep", "aria-hidden": "true", children: "/" }) : null] }, i));
            }) }) }));
}
/* ---------- Tabs ---------- */
export function Tabs({ tabs = [], value, onChange, size }) {
    const refs = useRef([]);
    return (_jsx("div", { role: "tablist", className: cx("pw-tabs", size === "sm" && "pw-tabs--sm"), children: tabs.map((t, i) => {
            const on = t.value === value;
            return (_jsxs("button", { ref: (el) => (refs.current[i] = el), role: "tab", type: "button", "aria-selected": on, tabIndex: on ? 0 : -1, disabled: t.disabled, className: cx("pw-tab", on && "is-on"), onClick: () => onChange && onChange(t.value), onKeyDown: (e) => {
                    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                    if (!d)
                        return;
                    const n = (i + d + tabs.length) % tabs.length;
                    refs.current[n]?.focus();
                    const next = tabs[n];
                    if (onChange && next)
                        onChange(next.value);
                }, children: [t.label, t.count != null ? _jsx("span", { className: cx("pw-tab__count", t.tone && "pw-tone--" + t.tone), children: t.count }) : null] }, t.value));
        }) }));
}
/* ---------- Panel (data surface) ---------- */
export function Panel({ title, meta, actions, children, flush, className, footer, id }) {
    return (_jsxs("section", { className: cx("pw-panel", flush && "pw-panel--flush", className), "aria-labelledby": title && id ? id : undefined, children: [title || actions ? (_jsxs("header", { className: "pw-panel__h", children: [_jsxs("div", { className: "pw-panel__t", children: [_jsx("h3", { id: id, className: "pw-subheading", children: title }), meta ? _jsx("span", { className: "pw-caption pw-muted", children: meta }) : null] }), actions ? _jsx("div", { className: "pw-panel__a", children: actions }) : null] })) : null, _jsx("div", { className: "pw-panel__b", children: children }), footer ? _jsx("footer", { className: "pw-panel__f", children: footer }) : null] }));
}
/* ---------- Metric (KPI) ---------- */
export function Metric({ label, scope, value, unit, delta, target, status, statusLabel, freshness, action, onAction, spark, state = "ready", compact }) {
    if (state === "loading")
        return _jsxs("div", { className: "pw-metric is-loading", "aria-busy": "true", children: [_jsx(Skeleton, { w: "40%" }), _jsx(Skeleton, { w: "60%", h: 28 }), _jsx(Skeleton, { w: "50%" })] });
    return (_jsxs("div", { className: cx("pw-metric", compact && "pw-metric--compact", state === "degraded" && "is-degraded", state === "error" && "is-error"), children: [_jsxs("div", { className: "pw-metric__h", children: [_jsx("span", { className: "pw-body-strong", children: label }), scope ? _jsx("span", { className: "pw-muted pw-caption", children: scope }) : null] }), state === "error" ? (_jsxs("div", { className: "pw-metric__err", children: [_jsx(StatusBadge, { status: "unknown", label: "Couldn\u2019t load" }), _jsx("span", { className: "pw-caption pw-muted", children: "Query timed out after 30 s." })] })) : (_jsxs(Fragment, { children: [_jsxs("div", { className: "pw-metric__v", children: [_jsx("span", { className: "pw-figure", children: value }), unit ? _jsx("span", { className: "pw-muted", children: unit }) : null, spark ? _jsx(Sparkline, { points: spark.points, threshold: spark.threshold, tone: status, width: 96, height: 28 }) : null] }), _jsxs("div", { className: "pw-metric__d", children: [status === "critical" || status === "warning" ? _jsx(StatusBadge, { status: status, label: statusLabel }) : null, delta ? _jsx(Trend, { ...delta, breach: status === "critical" }) : null] }), _jsx("div", { className: "pw-metric__d", children: target ? _jsx("span", { className: "pw-caption pw-muted", children: target }) : null })] })), (freshness || action) ? (_jsxs("div", { className: "pw-metric__f", children: [state === "degraded" ? _jsxs("span", { className: "pw-caption pw-tone--warning", children: [_jsx(Icon, { name: "warning", size: 12 }), " ", freshness] }) : freshness ? _jsx("span", { className: "pw-caption pw-muted", children: freshness }) : _jsx("span", {}), action ? _jsxs("button", { type: "button", className: "pw-linkbtn", onClick: onAction, children: [action, _jsx(Icon, { name: "chevron-right", size: 14 })] }) : null] })) : null] }));
}
/* ---------- Skeleton & state templates ---------- */
export function Skeleton({ w = "100%", h: ht = 12, style }) { return _jsx("span", { className: "pw-skel", style: { width: w, height: ht, ...style }, "aria-hidden": "true" }); }
const STATE_DEF = {
    empty: { icon: "unknown", title: "Nothing here yet" },
    error: { icon: "critical", title: "Couldn’t load this view" },
    "no-access": { icon: "lock", title: "You don’t have access" },
    degraded: { icon: "warning", title: "Showing partial data" },
};
export function StateBlock({ kind = "empty", title, body, action, onAction, secondary, onSecondary, detail, rows = 4, inline }) {
    if (kind === "loading") {
        return (_jsxs("div", { className: cx("pw-state", "pw-state--loading", inline && "is-inline"), "aria-busy": "true", "aria-live": "polite", children: [_jsx("span", { className: "pw-sr", children: "Loading" }), Array.from({ length: rows }).map((_, i) => _jsxs("div", { className: "pw-state__skrow", children: [_jsx(Skeleton, { w: (28 + ((i * 37) % 40)) + "%" }), _jsx(Skeleton, { w: "14%" }), _jsx(Skeleton, { w: "10%" })] }, i))] }));
    }
    const d = STATE_DEF[kind];
    return (_jsxs("div", { className: cx("pw-state", "pw-state--" + kind, inline && "is-inline"), role: kind === "error" ? "alert" : undefined, children: [_jsx("span", { className: cx("pw-state__icon", kind === "error" && "pw-tone--critical", kind === "degraded" && "pw-tone--warning"), children: _jsx(Icon, { name: d.icon, size: 20 }) }), _jsxs("div", { className: "pw-state__txt", children: [_jsx("div", { className: "pw-body-strong", children: title || d.title }), body ? _jsx("div", { className: "pw-muted", children: body }) : null, detail ? _jsx("code", { className: "pw-state__detail", children: detail }) : null, action || secondary ? _jsxs("div", { className: "pw-state__acts", children: [action ? _jsx(Button, { variant: "secondary", size: "sm", onClick: onAction, children: action }) : null, secondary ? _jsx("button", { type: "button", className: "pw-linkbtn", onClick: onSecondary, children: secondary }) : null] }) : null] })] }));
}
/* ---------- Alert banner & toast ---------- */
export function AlertBanner({ tone = "critical", title, children, action, onAction, onDismiss, meta }) {
    const icon = tone === "healthy" ? "healthy" : tone;
    return (_jsxs("div", { className: cx("pw-banner", "pw-banner--" + tone), role: tone === "critical" ? "alert" : "status", children: [_jsx(Icon, { name: icon }), _jsxs("div", { className: "pw-banner__txt", children: [_jsx("span", { className: "pw-body-strong", children: title }), children ? _jsxs("span", { children: [" ", children] }) : null, meta ? _jsx("span", { className: "pw-caption pw-muted pw-banner__meta", children: meta }) : null] }), action ? _jsx(Button, { size: "sm", variant: "secondary", onClick: onAction, children: action }) : null, onDismiss ? _jsx(Button, { size: "sm", variant: "ghost", icon: "x", "aria-label": "Dismiss", onClick: onDismiss }) : null] }));
}
export function Toast({ tone = "info", title, body, action, onAction, onClose }) {
    return (_jsxs("div", { className: cx("pw-toast", "pw-toast--" + tone), role: "status", "aria-live": "polite", children: [_jsx(Icon, { name: tone }), _jsxs("div", { className: "pw-toast__txt", children: [_jsx("div", { className: "pw-body-strong", children: title }), body ? _jsx("div", { className: "pw-muted", children: body }) : null] }), action ? _jsx("button", { type: "button", className: "pw-linkbtn", onClick: onAction, children: action }) : null, onClose ? _jsx(Button, { size: "sm", variant: "ghost", icon: "x", "aria-label": "Close", onClick: onClose }) : null] }));
}
export function ToastRegion({ children }) { return _jsx("div", { className: "pw-toasts", "aria-live": "polite", children: children }); }
/* ---------- Drawer & modal (Radix Dialog) ---------- */
// Radix handles the focus trap, Escape, outside click and aria-modal. `contained` renders a non-modal dialog inside the
// nearest positioned ancestor (used by the preview cards and embedded demos): no focus trap, no scroll lock.
// Focus returns to whatever was focused when the dialog opened (there is no Dialog.Trigger to return to).
function useReturnFocus(open) {
    const prev = useRef(null);
    if (open && !prev.current && typeof document !== "undefined")
        prev.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return (e) => { e.preventDefault(); prev.current?.focus(); prev.current = null; };
}
function Scrim({ contained, light }) {
    const cls = cx("pw-scrim", light && "pw-scrim--light");
    return contained ? _jsx("div", { className: cls }) : _jsx(Dialog.Overlay, { className: cls });
}
export function Drawer({ open, title, subtitle, onClose, children, footer, width, contained }) {
    const onCloseAutoFocus = useReturnFocus(open);
    return (_jsx(Dialog.Root, { open: open, onOpenChange: (o) => { if (!o)
            onClose(); }, modal: !contained, children: open ? (_jsxs("div", { className: cx("pw-layer", contained && "is-contained"), children: [_jsx(Scrim, { contained: contained, light: true }), _jsx(Dialog.Content, { asChild: true, "aria-describedby": undefined, onCloseAutoFocus: onCloseAutoFocus, children: _jsxs("aside", { className: "pw-drawer", style: width ? { width } : undefined, children: [_jsxs("header", { className: "pw-drawer__h", children: [_jsxs("div", { children: [_jsx(Dialog.Title, { asChild: true, children: _jsx("div", { className: "pw-heading", children: title }) }), subtitle ? _jsx("div", { className: "pw-caption pw-muted", children: subtitle }) : null] }), _jsx(Button, { variant: "ghost", icon: "x", "aria-label": "Close", onClick: onClose })] }), _jsx("div", { className: "pw-drawer__b", children: children }), footer ? _jsx("footer", { className: "pw-drawer__f", children: footer }) : null] }) })] })) : null }));
}
export function Modal({ open, title, onClose, children, actions, contained, tone }) {
    const onCloseAutoFocus = useReturnFocus(open);
    return (_jsx(Dialog.Root, { open: open, onOpenChange: (o) => { if (!o)
            onClose(); }, modal: !contained, children: open ? (_jsxs("div", { className: cx("pw-layer", "pw-layer--center", contained && "is-contained"), children: [_jsx(Scrim, { contained: contained }), _jsxs(Dialog.Content, { className: "pw-modal", role: tone === "critical" ? "alertdialog" : "dialog", "aria-describedby": undefined, onCloseAutoFocus: onCloseAutoFocus, children: [_jsxs("header", { className: "pw-modal__h", children: [_jsx(Dialog.Title, { asChild: true, children: _jsx("div", { className: "pw-heading", children: title }) }), _jsx(Button, { variant: "ghost", icon: "x", "aria-label": "Close", onClick: onClose })] }), _jsx("div", { className: "pw-modal__b", children: children }), actions ? _jsx("footer", { className: "pw-modal__f", children: actions }) : null] })] })) : null }));
}
/* ---------- Sparkline (also used by Metric) ---------- */
export function Sparkline({ points = [], width = 120, height = 28, threshold, tone, label }) {
    if (!points.length)
        return null;
    const max = Math.max(...points, threshold || 0) * 1.08, min = Math.min(...points, 0);
    const sx = (i) => 1 + (i * (width - 2)) / (points.length - 1);
    const sy = (v) => height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
    const d = points.map((v, i) => (i ? "L" : "M") + sx(i).toFixed(1) + "," + sy(v).toFixed(1)).join("");
    const last = points[points.length - 1] ?? 0;
    return (_jsxs("svg", { className: "pw-spark", width: width, height: height, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": label || `Trend, latest ${last}`, children: [threshold != null ? _jsx("line", { x1: "0", x2: width, y1: sy(threshold), y2: sy(threshold), className: "pw-spark__thr" }) : null, _jsx("path", { d: d, className: "pw-spark__l" }), _jsx("circle", { cx: sx(points.length - 1), cy: sy(last), r: "4", className: cx("pw-spark__dot", tone && "pw-fill--" + tone) })] }));
}
//# sourceMappingURL=core.js.map