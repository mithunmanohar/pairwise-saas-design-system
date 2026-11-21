import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// Small display components: a key–value details list, avatars and a progress bar.
import * as React from "react";
import * as RAvatar from "@radix-ui/react-avatar";
import * as RProgress from "@radix-ui/react-progress";
import { cx, Skeleton, StatusDot } from "./core";
import { CopyButton } from "./actions";
/* ---------- KeyValueList ---------- */
// A <dl> of labelled facts: an object's details in a drawer, a page header's fields, a settings summary.
// layout "rows" (label left, value right, a hairline between), "grid" (label above value, in columns) or "inline"
// (fields in a wrapping line, as in PageHeader). Missing values show "–" (read as "None"). `copy` adds a copy button.
const isEmpty = (v) => v == null || v === "" || v === false;
export function KeyValueList({ items, layout = "rows", columns = 2, loading, className, label }) {
    return (_jsx("dl", { className: cx(layout === "inline" ? "pw-fields" : "pw-kv", "pw-kv--" + layout, className), "aria-label": label, "aria-busy": loading || undefined, style: layout === "grid" ? { "--pw-kv-cols": columns } : undefined, children: items.map((it) => (_jsxs("div", { className: "pw-kv__item", children: [_jsx("dt", { children: it.label }), _jsxs("dd", { className: cx(it.mono && "pw-mono"), children: [loading ? _jsx(Skeleton, { w: "60%" }) : isEmpty(it.value) ? _jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u2013" }), _jsx("span", { className: "pw-sr", children: "None" })] }) : it.value, !loading && it.copy ? _jsx(CopyButton, { value: it.copy, label: "Copy " + it.label.toLowerCase() }) : null] })] }, it.label))) }));
}
/* ---------- Avatar ---------- */
// A person or team: their image, or initials on a neutral fill (no colour coding: Signal keeps chroma for status).
// Named by `name` unless `decorative` (when the name is already written next to it).
const initialsOf = (name) => {
    const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "", b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "";
    return (a + b).toUpperCase();
};
export function Avatar({ name, src, size = 28, status, decorative, initials }) {
    return (_jsxs("span", { className: cx("pw-av", "pw-av--" + size), role: decorative ? undefined : "img", "aria-label": decorative ? undefined : name + (status ? ", " + status : ""), "aria-hidden": decorative || undefined, children: [_jsxs(RAvatar.Root, { className: "pw-av__root", children: [src ? _jsx(RAvatar.Image, { className: "pw-av__img", src: src, alt: "" }) : null, _jsx(RAvatar.Fallback, { className: "pw-av__fb", delayMs: src ? 300 : 0, children: initials || initialsOf(name) })] }), status ? _jsx("span", { className: "pw-av__status", "aria-hidden": "true", children: _jsx(StatusDot, { status: status }) }) : null] }));
}
/** Overlapping avatars with a "+N" for the rest. The group is named "Dev A, Dev B and 3 others". */
export function AvatarGroup({ people, max = 4, size = 28, label }) {
    const shown = people.slice(0, max), rest = people.slice(max);
    const names = people.map((p) => p.name);
    const auto = names.length <= max ? names.join(", ") : `${shown.map((p) => p.name).join(", ")} and ${rest.length} other${rest.length === 1 ? "" : "s"}`;
    return (_jsxs("span", { className: cx("pw-avgroup", "pw-av--" + size), role: "img", "aria-label": label ? `${label}: ${auto}` : auto, children: [shown.map((p) => _jsx(Avatar, { name: p.name, src: p.src, size: size, decorative: true }, p.name)), rest.length ? _jsx("span", { className: cx("pw-av", "pw-av--" + size, "pw-av--more"), "aria-hidden": "true", title: rest.map((p) => p.name).join(", "), children: _jsx("span", { className: "pw-av__root", children: _jsxs("span", { className: "pw-av__fb", children: ["+", rest.length] }) }) }) : null] }));
}
/* ---------- ProgressBar ---------- */
// Determinate (value 0..max) or indeterminate (value null). Radix sets role="progressbar" and the aria-value*;
// the visible label names it and the value text ("42 %", or your `valueText`) is what screen readers read.
export function ProgressBar({ value, max = 100, label, hideLabel, valueText, tone = "ink", hint, showValue = true }) {
    const id = React.useId();
    const indeterminate = value == null;
    const pct = indeterminate ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
    const text = valueText ?? (indeterminate ? undefined : Math.round(pct) + " %");
    return (_jsxs("div", { className: cx("pw-progress", "pw-progress--" + tone, indeterminate && "is-indeterminate"), children: [_jsxs("div", { className: cx("pw-progress__h", hideLabel && "pw-sr"), children: [_jsx("span", { id: id, className: "pw-progress__label", children: label }), showValue && text ? _jsx("span", { className: "pw-caption pw-muted pw-num", "aria-hidden": "true", children: text }) : null] }), _jsx(RProgress.Root, { className: "pw-progress__track", value: indeterminate ? null : value, max: max, "aria-labelledby": id, getValueLabel: () => text ?? "", children: _jsx(RProgress.Indicator, { className: "pw-progress__fill", style: indeterminate ? undefined : { transform: `translateX(-${100 - pct}%)` } }) }), hint ? _jsx("div", { className: "pw-caption pw-muted", children: hint }) : null] }));
}
//# sourceMappingURL=display.js.map