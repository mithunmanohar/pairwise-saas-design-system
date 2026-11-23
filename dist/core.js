import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createFormatter } from "./format";
const timeZoneLabel = () => createFormatter({ locale: navigator.language, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, currency: "USD" }).timeZoneLabel();
import { Icon } from "./icons";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as RPopover from "@radix-ui/react-popover";
import * as RTooltip from "@radix-ui/react-tooltip";
import * as DM from "@radix-ui/react-dropdown-menu";
import * as RToggle from "@radix-ui/react-toggle-group";
import * as RTabs from "@radix-ui/react-tabs";
import { Command } from "cmdk";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Fragment } from "react";
const { useState, useRef, useEffect, useId, useCallback, useMemo } = React;
export const cx = (...a) => a.filter(Boolean).join(" ");
/* ---------- Button ---------- */
// Forwards its ref so it can be the trigger of a menu or popover. `asChild` styles its single child instead (e.g. a
// router link): <Button asChild variant="primary"><a href="/runs/new">Start run</a></Button>.
export const Button = React.forwardRef(function Button({ variant = "secondary", size, icon, iconRight, loading, disabled, className, children, forceState, asChild, ...rest }, ref) {
    const cls = cx("pw-btn", "pw-btn--" + variant, size === "sm" && "pw-btn--sm", !children && "pw-btn--icon", forceState && "is-" + forceState, className);
    const lead = loading ? _jsx("span", { className: "pw-spin", "aria-hidden": "true" }) : icon ? _jsx(Icon, { name: icon }) : null;
    const trail = iconRight ? _jsx(Icon, { name: iconRight }) : null;
    if (asChild) {
        return (_jsxs(Slot, { ref: ref, ...rest, className: cls, "aria-disabled": disabled || loading || undefined, "aria-busy": loading || undefined, children: [lead, _jsx(Slottable, { children: children }), trail] }));
    }
    return (_jsxs("button", { ref: ref, ...rest, type: rest.type || "button", disabled: disabled || loading, "aria-busy": loading || undefined, className: cls, children: [lead, children ? _jsx("span", { children: children }) : null, trail] }));
});
/* ---------- Popover (Radix Popover) ---------- */
// Non-modal floating panel for filters, details and small forms. Radix handles focus (moves in, returns to the
// trigger), Escape, outside click, collision and the portal. Close it from inside with <PopoverClose>.
export function Popover({ trigger, children, label, open, defaultOpen, onOpenChange, side = "bottom", align = "start", width, forceOpen, className }) {
    return (_jsxs(RPopover.Root, { open: forceOpen || open, defaultOpen: defaultOpen, onOpenChange: onOpenChange, children: [_jsx(RPopover.Trigger, { asChild: true, children: trigger }), _jsx(RPopover.Portal, { children: _jsx(RPopover.Content, { className: cx("pw-popover", className), side: side, align: align, sideOffset: 6, collisionPadding: 8, "aria-label": label, style: width ? { width } : undefined, children: children }) })] }));
}
/** Wraps an element inside a Popover so activating it closes the popover: <PopoverClose><Button>Done</Button></PopoverClose>. */
export function PopoverClose({ children }) { return _jsx(RPopover.Close, { asChild: true, children: children }); }
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
/* ---------- Tooltip (Radix Tooltip) ---------- */
// Radix adds the delay, collision handling, the portal (so the rail's scroll area can't clip it), Escape, and
// aria-describedby on the trigger. Tooltips in one TooltipProvider share a "skip delay": moving from one to the next
// opens it at once. AppShell provides one; a Tooltip outside any provider brings its own.
const TipScope = React.createContext(false);
export function TooltipProvider({ children, delay = 400 }) {
    return _jsx(RTooltip.Provider, { delayDuration: delay, skipDelayDuration: 300, children: _jsx(TipScope.Provider, { value: true, children: children }) });
}
export function Tooltip({ content, children, side = "top", forceOpen }) {
    const scoped = React.useContext(TipScope);
    const tip = (_jsxs(RTooltip.Root, { open: forceOpen ? true : undefined, children: [_jsx(RTooltip.Trigger, { asChild: true, children: children }), _jsx(RTooltip.Portal, { children: _jsx(RTooltip.Content, { className: "pw-tooltip", side: side, sideOffset: 6, collisionPadding: 8, children: content }) })] }));
    return scoped ? tip : _jsx(TooltipProvider, { children: tip });
}
/* ---------- Stable widths (internal) ---------- */
// Controls whose text changes (a menu's value, the time range, the selected tab) must not resize and push their
// neighbours. Fit shows `current` but reserves the width of the widest of `all`; Reserve keeps room for the bold
// (selected) weight of a label. The reserving copies are visibility: hidden, so screen readers skip them.
function Fit({ current, all }) {
    const texts = Array.from(new Set([current, ...all]));
    return _jsx("span", { className: "pw-fit", children: texts.map((t) => _jsx("span", { className: t === current ? undefined : "pw-fit__ghost", "aria-hidden": t === current ? undefined : true, children: t }, t)) });
}
const Reserve = ({ text }) => _jsx("span", { className: "pw-reserve", "data-text": text, children: text });
/* ---------- Menu select (used by scope, filters) ---------- */
// A compact picker for toolbars: a menu of choices on Radix DropdownMenu (arrow keys, typeahead, Home/End, focus
// returns to the trigger, portal). The trigger keeps the width of the widest option (Fit), so switching never moves
// its neighbours. Its accessible name is its visible text (prefix, or a hidden "Label:", then the value), so speech
// input users can say what they see.
// Options may be plain strings; a missing label falls back to the value.
const toOption = (o) => (typeof o === "string" ? { value: o, label: o } : { ...o, label: o.label ?? o.value });
export function MenuSelect({ label, value, options, onChange, icon, disabled, width, prefix, forceOpen, quiet }) {
    const [open, setOpen] = useState(false);
    const isOpen = forceOpen || open;
    const opts = options.map(toOption);
    const cur = opts.find((o) => o.value === value);
    const curLabel = cur ? cur.label : value;
    return (_jsxs(DM.Root, { open: isOpen, onOpenChange: setOpen, modal: forceOpen ? false : undefined, children: [_jsx(DM.Trigger, { asChild: true, disabled: disabled, children: _jsxs("button", { type: "button", className: cx("pw-field", quiet && "pw-field--quiet", isOpen && "is-open"), style: width ? { minWidth: width } : undefined, children: [icon ? _jsx(Icon, { name: icon }) : null, prefix ? _jsx("span", { className: "pw-field__pre", children: prefix }) : _jsxs("span", { className: "pw-sr", children: [label, ": "] }), _jsx("span", { className: "pw-field__val", children: _jsx(Fit, { current: curLabel, all: opts.map((o) => o.label) }) }), _jsx(Icon, { name: "chevron-down", size: 14 })] }) }), _jsx(DM.Portal, { children: _jsx(DM.Content, { className: "pw-menu pw-menusel", align: "start", sideOffset: 6, collisionPadding: 8, loop: true, "aria-label": label, children: _jsx(DM.RadioGroup, { value: value, onValueChange: (v) => onChange && onChange(v), children: opts.map((o) => (_jsxs(DM.RadioItem, { value: o.value, disabled: o.disabled, className: cx("pw-list__item", o.value === value && "is-selected"), children: [_jsx("span", { className: "pw-list__check", children: _jsx(DM.ItemIndicator, { children: _jsx(Icon, { name: "check", size: 14 }) }) }), _jsx("span", { children: o.label }), o.meta ? _jsx("span", { className: "pw-muted pw-list__meta", children: o.meta }) : null] }, o.value))) }) }) })] }));
}
/* ---------- Segmented control (Radix ToggleGroup, single) ---------- */
// A few mutually exclusive options shown at once: view modes, auto-refresh, chart range. A radio group: Tab enters
// at the selected option, arrows move, Space or Enter selects. Selected labels reserve their bold width.
export function SegmentedControl({ label, value, defaultValue, onChange, options, disabled, size }) {
    const [inner, setInner] = useState(defaultValue ?? "");
    const cur = value ?? inner;
    return (_jsx(RToggle.Root, { type: "single", className: cx("pw-seg", size === "sm" && "pw-seg--sm"), "aria-label": label, value: cur, disabled: disabled, onValueChange: (v) => { if (!v)
            return; setInner(v); onChange && onChange(v); }, children: options.map(toOption).map((o) => (_jsx(RToggle.Item, { value: o.value, disabled: o.disabled, className: cx("pw-seg__b", o.value === cur && "is-on"), children: _jsx(Reserve, { text: o.label }) }, o.value))) }));
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
    const [open, setOpen] = useState(false);
    const isOpen = forceOpen || open;
    const cur = ranges.find((r) => r.value === value);
    const [copied, setCopied] = useState(false);
    const timer = useRef(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);
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
    const copy = () => { setCopied(true); onCopy && onCopy(absolute || value); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setCopied(false), 1500); };
    const absProps = { "aria-invalid": absErr ? true : undefined, "aria-describedby": absErr ? errId : undefined };
    const shown = absolute || (cur ? cur.label ?? cur.value : value);
    return (_jsxs(RPopover.Root, { open: isOpen, onOpenChange: setOpen, children: [_jsx(RPopover.Trigger, { asChild: true, disabled: disabled, children: _jsxs("button", { type: "button", className: cx("pw-field pw-time", isOpen && "is-open"), children: [_jsx(Icon, { name: "clock" }), _jsx("span", { className: "pw-sr", children: "Time range: " }), _jsx("span", { className: "pw-field__val", children: _jsx(Fit, { current: shown, all: ranges.map((r) => r.label ?? r.value) }) }), _jsxs("span", { className: "pw-time__live", title: refresh === "off" ? "Auto-refresh off" : "Auto-refresh every " + refresh, children: [_jsx(Icon, { name: refresh === "off" ? "pause" : "refresh", size: 12 }), _jsx("span", { className: "pw-sr", children: ", auto-refresh " }), _jsx(Fit, { current: refresh, all: REFRESH.map((r) => r.value) })] }), _jsx(Icon, { name: "chevron-down", size: 14 })] }) }), _jsx(RPopover.Portal, { children: _jsx(RPopover.Content, { className: "pw-popover pw-time__pop", align: "end", sideOffset: 6, collisionPadding: 8, "aria-label": "Time range", children: _jsxs("div", { className: "pw-time__cols", children: [_jsxs("div", { children: [_jsx("div", { className: "pw-caption pw-muted pw-pop__h", id: errId + "-rel", children: "Relative" }), _jsx(RToggle.Root, { type: "single", orientation: "vertical", loop: true, className: "pw-list pw-list--flat pw-time__rel", "aria-labelledby": errId + "-rel", value: absolute ? "" : value, onValueChange: (v) => { if (v) {
                                            onChange && onChange(v);
                                            setOpen(false);
                                        } }, children: ranges.map((r) => (_jsxs(RToggle.Item, { value: r.value, className: cx("pw-list__item", !absolute && r.value === value && "is-selected"), children: [_jsx("span", { className: "pw-list__check", children: !absolute && r.value === value ? _jsx(Icon, { name: "check", size: 14 }) : null }), r.label ?? r.value] }, r.value))) })] }), _jsxs("div", { className: "pw-time__abs", children: [_jsxs("div", { className: "pw-caption pw-muted pw-pop__h", children: ["Absolute (", timeZoneLabel(), ")"] }), _jsxs("label", { className: "pw-lab", children: ["From", _jsx("input", { className: "pw-input pw-num", value: from, onChange: (e) => setFrom(e.target.value), onKeyDown: (e) => e.key === "Enter" && apply(), ...absProps })] }), _jsxs("label", { className: "pw-lab", children: ["To", _jsx("input", { className: "pw-input pw-num", value: to, onChange: (e) => setTo(e.target.value), onKeyDown: (e) => e.key === "Enter" && apply(), ...absProps })] }), absErr ? _jsxs("div", { id: errId, className: "pw-formfield__error pw-time__err", role: "alert", children: [_jsx(Icon, { name: "critical", size: 12 }), _jsx("span", { children: absErr })] }) : null, _jsx(Button, { size: "sm", onClick: apply, children: "Apply" }), _jsx("div", { className: "pw-caption pw-muted pw-pop__h", style: { marginTop: 12 }, children: "Auto-refresh" }), _jsx(SegmentedControl, { label: "Auto-refresh", value: refresh, options: REFRESH, onChange: (v) => onRefreshChange && onRefreshChange(v) }), _jsxs("button", { type: "button", className: "pw-linkbtn", onClick: copy, children: [_jsx(Icon, { name: "copy", size: 14 }), copied ? "Range copied" : "Copy range to paste elsewhere"] })] })] }) }) })] }));
}
/* ---------- Scope switcher ---------- */
export function ScopeSwitcher({ scope, options, onChange, compact, dimensions, label = "Environment" }) {
    // Runtime scope: where things run. `dimensions` takes any set; the 1.x scope/options pair is environment / cloud / cluster.
    const set = (k) => (v) => { if (scope)
        onChange && onChange({ ...scope, [k]: v }); };
    const dims = dimensions ?? (scope && options ? [
        { key: "env", label: "Environment", value: scope.env, options: options.env, onChange: set("env") },
        { key: "cloud", label: "Cloud", value: scope.cloud, options: options.cloud, onChange: set("cloud") },
        { key: "cluster", label: "Cluster", value: scope.cluster, options: options.cluster, onChange: set("cluster") },
    ] : []);
    const shown = compact ? dims.slice(0, 2) : dims;
    return (_jsx("div", { className: cx("pw-scope", compact && "is-compact"), role: "group", "aria-label": label, children: shown.map((d, i) => (_jsxs(Fragment, { children: [i ? _jsx("span", { className: "pw-scope__sep", "aria-hidden": "true", children: "/" }) : null, _jsx(MenuSelect, { quiet: true, label: d.label, value: d.value, options: d.options, onChange: d.onChange })] }, d.key))) }));
}
/* ---------- Global search and commands (cmdk) ---------- */
// One box for finding things and running commands. cmdk provides the combobox/listbox semantics, the active option
// (aria-activedescendant), arrow keys, Home/End and Enter. Items with `onRun` are commands; `group` sections the
// results; `recent` shows when the box is focused and empty. Filtering is local (every word must match the label,
// kind, description or keywords; label prefixes rank first) unless `filter={false}`, for results you fetch yourself
// in `onQueryChange` (show `loading` meanwhile).
// Ctrl+K (⌘K on Apple devices) focuses the most recently mounted search; only one listener is ever attached.
const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
const searchStack = [];
let shortcutBound = false;
function bindSearchShortcut() {
    if (shortcutBound || typeof document === "undefined")
        return;
    shortcutBound = true;
    document.addEventListener("keydown", (e) => {
        if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k")
            return;
        const top = searchStack[searchStack.length - 1]?.current;
        if (top) {
            e.preventDefault();
            top.focus();
            top.select();
        }
    });
}
const searchHay = (i) => [i.label, i.kind, i.description, ...(i.keywords || [])].filter(Boolean).join(" ").toLowerCase();
function searchRank(i, terms) {
    const hay = searchHay(i);
    if (!terms.every((t) => hay.includes(t)))
        return -1;
    const label = i.label.toLowerCase(), t0 = terms[0] || "";
    return label.startsWith(t0) ? 0 : label.includes(t0) ? 1 : 2;
}
/**
 * cmdk always reports aria-expanded="true", and leaves aria-activedescendant empty for the item it highlights first.
 * Keep both true to what is on screen so screen readers announce the highlighted option. (Shared with Combobox.)
 * Returns a ref callback for the cmdk list: it attaches whenever the list mounts (also inside a portal).
 */
/**
 * Owns cmdk's highlighted item (GlobalSearch, Combobox). cmdk highlights the first result in an effect after each
 * keystroke; when someone types and presses ↓ quickly, that late reset used to pull the highlight back to the first
 * result. Here the automatic "first result" is accepted only until the person moves the highlight (arrows,
 * Home/End, PageUp/PageDown or the pointer); a new query starts over. Pass the keys of the results in order.
 */
const NAV_KEYS = ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"];
export function useCmdkHighlight(keys) {
    const [value, setValue] = useState("");
    const moved = useRef(false), navigating = useRef(false);
    const valid = keys.includes(value);
    const mark = () => { navigating.current = true; moved.current = true; queueMicrotask(() => { navigating.current = false; }); };
    return {
        value: valid ? value : keys[0] ?? "",
        onValueChange: (v) => { if (navigating.current || !moved.current || !valid)
            setValue(v); },
        onKeyDown: (e) => { if (NAV_KEYS.includes(e.key))
            mark(); },
        onPointerMoveCapture: () => mark(),
        onQuery: () => { moved.current = false; },
    };
}
export function useCmdkAria(inputRef, open) {
    React.useLayoutEffect(() => { if (open !== null)
        inputRef.current?.setAttribute("aria-expanded", String(open)); });
    const stop = useRef(undefined);
    return useCallback((list) => {
        stop.current?.();
        stop.current = undefined;
        const input = inputRef.current;
        if (!list || !input)
            return;
        const sync = () => {
            const sel = list.hidden ? null : list.querySelector('[cmdk-item][aria-selected="true"]');
            if (sel) {
                if (input.getAttribute("aria-activedescendant") !== sel.id)
                    input.setAttribute("aria-activedescendant", sel.id);
            }
            else
                input.removeAttribute("aria-activedescendant");
        };
        const mo = new MutationObserver(sync);
        mo.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected", "hidden"] });
        sync();
        stop.current = () => mo.disconnect();
    }, [inputRef]);
}
const itemKey = (i) => i.id ?? (i.kind ? i.kind + ":" : "") + i.label;
export function GlobalSearch({ items = [], onSelect, placeholder = "Search repositories, runs, files", forceQuery, emptyHint, recent, loading, onQueryChange, filter = true, limit = 7, shortcut = true, label = "Search" }) {
    const [q, setQ] = useState(forceQuery || "");
    const [active, setActive] = useState(!!forceQuery);
    const inputRef = useRef(null);
    useEffect(() => {
        if (!shortcut)
            return;
        bindSearchShortcut();
        searchStack.push(inputRef);
        return () => { const i = searchStack.indexOf(inputRef); if (i >= 0)
            searchStack.splice(i, 1); };
    }, [shortcut]);
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const results = q
        ? (filter ? items.map((i) => [i, searchRank(i, terms)]).filter(([, r]) => r >= 0).sort((a, b) => a[1] - b[1]).map(([i]) => i) : items).slice(0, limit)
        : (recent || []).slice(0, limit);
    const groups = [];
    for (const i of results) {
        const name = q ? i.group || "" : "Recent";
        const g = groups.find((x) => x.name === name);
        if (g)
            g.items.push(i);
        else
            groups.push({ name, items: [i] });
    }
    const open = active && (q ? true : results.length > 0);
    const listRef = useCmdkAria(inputRef, open);
    const hl = useCmdkHighlight(results.map(itemKey));
    const setQuery = (v) => { hl.onQuery(); setQ(v); onQueryChange && onQueryChange(v); };
    const pick = (i) => { i.onRun && i.onRun(); onSelect && onSelect(i); setQuery(""); setActive(false); };
    return (_jsxs(Command, { className: "pw-search", label: label, shouldFilter: false, loop: true, value: hl.value, onValueChange: hl.onValueChange, onPointerMoveCapture: hl.onPointerMoveCapture, onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget))
            setActive(false); }, onKeyDown: (e) => {
            hl.onKeyDown(e);
            if (open)
                return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setActive(true);
            }
            else if (e.key === "Enter" || e.key === "Home" || e.key === "End")
                e.preventDefault();
        }, children: [_jsx(Icon, { name: "search" }), _jsx(Command.Input, { ref: inputRef, className: "pw-search__in", placeholder: placeholder, value: q, onValueChange: (v) => { setQuery(v); setActive(true); }, onFocus: () => setActive(true), onKeyDown: (e) => { if (e.key === "Escape") {
                    if (open)
                        setActive(false);
                    else if (q)
                        setQuery("");
                    else
                        e.currentTarget.blur();
                } } }), shortcut ? _jsx("kbd", { className: "pw-kbd", "aria-hidden": "true", children: isApple() ? "⌘K" : "Ctrl K" }) : null, _jsxs(Command.List, { ref: listRef, className: "pw-pop pw-list pw-search__res", label: "Search results", hidden: !open, onMouseDown: (e) => e.preventDefault(), children: [loading ? _jsx(Command.Loading, { className: "pw-list__empty pw-muted", children: "Searching\u2026" }) : null, !loading && q ? _jsxs(Command.Empty, { className: "pw-list__empty pw-muted", children: ["No match for \u201C", q, "\u201D.", emptyHint ? " " + emptyHint : ""] }) : null, groups.map((g) => {
                        const body = g.items.map((i) => (_jsxs(Command.Item, { value: itemKey(i), onSelect: () => pick(i), className: "pw-list__item", children: [i.status ? _jsx(StatusDot, { status: i.status }) : _jsx("span", { className: "pw-list__check", children: i.icon ? _jsx(Icon, { name: i.icon, size: 14 }) : null }), _jsxs("span", { className: "pw-search__txt", children: [_jsx("span", { className: cx(i.onRun ? undefined : "pw-mono"), children: i.label }), i.description ? _jsx("span", { className: "pw-caption pw-muted", children: i.description }) : null] }), i.shortcut ? _jsx("kbd", { className: "pw-kbd pw-list__meta", children: i.shortcut }) : _jsx("span", { className: "pw-muted pw-list__meta", children: i.kind })] }, itemKey(i))));
                        return g.name ? _jsx(Command.Group, { heading: g.name, className: "pw-search__group", children: body }, g.name) : _jsx(Fragment, { children: body }, "");
                    })] })] }));
}
/* ---------- Filter bar ---------- */
export function FilterBar({ filters = [], values = {}, onChange, query, onQuery, queryPlaceholder = "Filter by name", onClear, count, children }) {
    const active = Object.keys(values).filter((k) => values[k] && values[k] !== "all");
    return (_jsxs("div", { className: "pw-filterbar", role: "search", children: [_jsxs("div", { className: "pw-filterbar__q", children: [_jsx(Icon, { name: "filter" }), _jsx("input", { className: "pw-input pw-input--bare", "aria-label": queryPlaceholder, placeholder: queryPlaceholder, value: query || "", onChange: (e) => onQuery && onQuery(e.target.value) })] }), filters.map((f) => (_jsx(MenuSelect, { label: f.label, prefix: f.label, value: values[f.key] || "all", options: [{ value: "all", label: "All" }, ...f.options], onChange: (v) => onChange && onChange({ ...values, [f.key]: v }) }, f.key))), children, _jsxs("span", { className: "pw-filterbar__end", children: [active.length || query ? _jsxs("button", { type: "button", className: "pw-linkbtn", onClick: onClear, children: ["Clear ", active.length + (query ? 1 : 0)] }) : null, count != null ? _jsx("span", { className: "pw-caption pw-muted pw-num", children: count }) : null] })] }));
}
/* ---------- Breadcrumbs ---------- */
// With maxItems, the earlier levels fold into a "…" menu (Radix DropdownMenu) so a deep path never repeats the levels
// above the current scope; the current page always shows.
export function Breadcrumbs({ items = [], onNavigate, maxItems }) {
    const fold = maxItems && maxItems >= 2 && items.length > maxItems ? items.length - (maxItems - 1) : 0;
    const hidden = items.slice(0, fold), shown = items.slice(fold);
    const go = (it) => { if (onNavigate)
        onNavigate(it);
    else if (it.href)
        window.location.href = it.href; };
    const crumb = (it, last) => {
        const body = _jsxs(_Fragment, { children: [it.icon ? _jsx(Icon, { name: it.icon, size: 14 }) : null, _jsx("span", { children: it.label })] });
        return last ? _jsx("span", { "aria-current": "page", className: cx("pw-crumbs__item", it.mono && "pw-mono"), children: body })
            : _jsx("a", { href: it.href || "#", className: cx("pw-crumbs__item", it.mono && "pw-mono"), onClick: (e) => { if (onNavigate) {
                    e.preventDefault();
                    onNavigate(it);
                } }, children: body });
    };
    return (_jsx("nav", { "aria-label": "Breadcrumb", className: "pw-crumbs", children: _jsxs("ol", { children: [hidden.length ? (_jsxs("li", { children: [_jsxs(DM.Root, { children: [_jsx(DM.Trigger, { asChild: true, children: _jsx("button", { type: "button", className: "pw-crumbs__more", "aria-label": `Show ${hidden.length} more level${hidden.length === 1 ? "" : "s"}`, children: "\u2026" }) }), _jsx(DM.Portal, { children: _jsx(DM.Content, { className: "pw-menu", align: "start", sideOffset: 4, loop: true, children: hidden.map((it, i) => (_jsxs(DM.Item, { className: "pw-list__item", onSelect: () => go(it), children: [_jsx("span", { className: "pw-list__check", children: it.icon ? _jsx(Icon, { name: it.icon, size: 14 }) : null }), _jsx("span", { className: cx(it.mono && "pw-mono"), children: it.label })] }, i))) }) })] }), _jsx("span", { className: "pw-crumbs__sep", "aria-hidden": "true", children: "/" })] })) : null, shown.map((it, i) => {
                    const last = i === shown.length - 1;
                    return (_jsxs("li", { children: [crumb(it, last), !last ? _jsx("span", { className: "pw-crumbs__sep", "aria-hidden": "true", children: "/" }) : null] }, fold + i));
                })] }) }));
}
/* ---------- Tabs (Radix Tabs) ---------- */
// Arrow keys move and select (wrapping), Home/End jump, disabled tabs are skipped. Selected labels reserve their bold
// width, so switching never moves the tabs after them. Pass the panels as children (<TabPanel value>) to link each tab
// to its panel; without children the tabs only switch the page's content (e.g. in PageHeader) and don't point at it.
export function Tabs({ tabs = [], value, onChange, size, label, children }) {
    const list = (_jsx(RTabs.List, { className: cx("pw-tabs", size === "sm" && "pw-tabs--sm"), "aria-label": label, loop: true, children: tabs.map((t) => (_jsxs(RTabs.Trigger, { value: t.value, disabled: t.disabled, className: cx("pw-tab", t.value === value && "is-on"), ...(children ? {} : { "aria-controls": undefined }), children: [_jsx(Reserve, { text: t.label }), t.count != null ? _jsx("span", { className: cx("pw-tab__count", t.tone && "pw-tone--" + t.tone), children: t.count }) : null] }, t.value))) }));
    return _jsxs(RTabs.Root, { value: value, onValueChange: (v) => onChange && onChange(v), activationMode: "automatic", className: "pw-tabsroot", children: [list, children] });
}
/** The content for one tab; render inside <Tabs>. Focusable, labelled by its tab. */
export function TabPanel({ value, children, className }) {
    return _jsx(RTabs.Content, { value: value, className: cx("pw-tabpanel", className), children: children });
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
// Toast is the visual: Toaster shows queued toasts in an always-present live region (Radix Toast). A Toast placed by
// hand is announced as a status message.
export function Toast({ tone = "info", title, body, action, onAction, onClose }) {
    return (_jsxs("div", { className: cx("pw-toast", "pw-toast--" + tone), role: tone === "critical" ? "alert" : "status", children: [_jsx(Icon, { name: tone }), _jsxs("div", { className: "pw-toast__txt", children: [_jsx("div", { className: "pw-body-strong", children: title }), body ? _jsx("div", { className: "pw-muted", children: body }) : null] }), action ? _jsx("button", { type: "button", className: "pw-linkbtn", onClick: onAction, children: action }) : null, onClose ? _jsx(Button, { size: "sm", variant: "ghost", icon: "x", "aria-label": "Close", onClick: onClose }) : null] }));
}
export function ToastRegion({ children }) { return _jsx("div", { className: "pw-toasts", role: "region", "aria-label": "Notifications", children: children }); }
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
// Focus moves to an element marked data-autofocus (e.g. the assistant's composer) instead of the first control.
function focusMarked(e) {
    const el = e.currentTarget?.querySelector("[data-autofocus]");
    if (el) {
        e.preventDefault();
        el.focus();
    }
}
// `docked`: a panel beside the page (the assistant), not a floating layer. It is still a Radix dialog (non-modal), so
// focus moves in on open and returns on close, but it renders in place with a border and no shadow or scrim, clicking
// the page doesn't close it, and Escape closes it only while focus is inside it.
export function Drawer({ open, title, subtitle, onClose, children, footer, width, contained, docked, actions, className }) {
    const onCloseAutoFocus = useReturnFocus(open);
    const ref = useRef(null);
    const panel = (_jsx(Dialog.Content, { asChild: true, "aria-describedby": undefined, onCloseAutoFocus: onCloseAutoFocus, onOpenAutoFocus: focusMarked, ...(docked ? {
            onInteractOutside: (e) => e.preventDefault(),
            onEscapeKeyDown: (e) => { if (!ref.current?.contains(document.activeElement))
                e.preventDefault(); },
        } : {}), children: _jsxs("aside", { ref: ref, className: cx("pw-drawer", docked && "pw-drawer--docked", className), style: width ? { width } : undefined, children: [_jsxs("header", { className: "pw-drawer__h", children: [_jsxs("div", { className: "pw-drawer__t", children: [_jsx(Dialog.Title, { asChild: true, children: _jsx("div", { className: "pw-heading", children: title }) }), subtitle ? _jsx("div", { className: "pw-caption pw-muted", children: subtitle }) : null] }), _jsxs("div", { className: "pw-drawer__acts", children: [actions, _jsx(Button, { variant: "ghost", icon: "x", "aria-label": "Close", onClick: onClose })] })] }), _jsx("div", { className: "pw-drawer__b", children: children }), footer ? _jsx("footer", { className: "pw-drawer__f", children: footer }) : null] }) }));
    return (_jsx(Dialog.Root, { open: open, onOpenChange: (o) => { if (!o)
            onClose(); }, modal: !contained && !docked, children: open ? (docked ? panel : (_jsxs("div", { className: cx("pw-layer", contained && "is-contained"), children: [_jsx(Scrim, { contained: contained, light: true }), panel] }))) : null }));
}
// tone="critical" is an alert dialog: a destructive decision. It is described by its body (read on open), and clicking
// outside doesn't dismiss it; Escape, Close and the actions do.
export function Modal({ open, title, onClose, children, actions, contained, tone }) {
    const onCloseAutoFocus = useReturnFocus(open);
    const alert = tone === "critical";
    return (_jsx(Dialog.Root, { open: open, onOpenChange: (o) => { if (!o)
            onClose(); }, modal: !contained, children: open ? (_jsxs("div", { className: cx("pw-layer", "pw-layer--center", contained && "is-contained"), children: [_jsx(Scrim, { contained: contained }), _jsxs(Dialog.Content, { className: "pw-modal", role: alert ? "alertdialog" : "dialog", ...(alert ? {} : { "aria-describedby": undefined }), onCloseAutoFocus: onCloseAutoFocus, onInteractOutside: alert ? (e) => e.preventDefault() : undefined, children: [_jsxs("header", { className: "pw-modal__h", children: [_jsx(Dialog.Title, { asChild: true, children: _jsx("div", { className: "pw-heading", children: title }) }), _jsx(Button, { variant: "ghost", icon: "x", "aria-label": "Close", onClick: onClose })] }), alert ? _jsx(Dialog.Description, { asChild: true, children: _jsx("div", { className: "pw-modal__b", children: children }) }) : _jsx("div", { className: "pw-modal__b", children: children }), actions ? _jsx("footer", { className: "pw-modal__f", children: actions }) : null] })] })) : null }));
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