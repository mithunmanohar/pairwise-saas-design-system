import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Content parts for answers and records: expandable details, citations and their sources, and a resource card.
// They are generic (a "Related" list or a runbook can use them too); the assistant composes them.
import * as React from "react";
import { cx, Button, StatusBadge, StatusDot, Trend } from "./core";
import { ActionMenu } from "./actions";
import { KeyValueList } from "./display";
import { PathLine } from "./data";
import { Icon, entityIcon, entityLabel } from "./icons";
/* ---------- Disclosure ---------- */
// Native <details>/<summary>: the browser provides the button role, Enter / Space and the expanded state, so there is
// no hand-written keyboard logic. Controlled with `open` + `onOpenChange`, or left to itself.
export function Disclosure({ summary, meta, open, defaultOpen, onOpenChange, className, children }) {
    return (_jsxs("details", { className: cx("pw-disc", className), ...(open !== undefined ? { open } : defaultOpen ? { open: true } : {}), onToggle: (e) => { const o = e.currentTarget.open; if (o !== open)
            onOpenChange && onOpenChange(o); }, children: [_jsxs("summary", { className: "pw-disc__s", children: [_jsx(Icon, { name: "chevron-right", size: 14, className: "pw-disc__chev" }), _jsx("span", { className: "pw-disc__t", children: summary }), meta ? _jsx("span", { className: "pw-caption pw-muted", children: meta }) : null] }), _jsx("div", { className: "pw-disc__b", children: children })] }));
}
/* ---------- Citation ---------- */
// An inline numbered reference to a source: read as "Source 1: <title>".
export function Citation({ n, title, href, onOpen }) {
    const name = `Source ${n}: ${title}`;
    if (href || onOpen) {
        return (_jsx("a", { className: "pw-cite", href: href ?? "#source-" + n, "aria-label": name, title: title, onClick: (e) => { if (onOpen) {
                e.preventDefault();
                onOpen();
            } }, children: n }));
    }
    return _jsx("span", { className: "pw-cite", role: "note", "aria-label": name, title: title, children: n });
}
/* ---------- SourceList ---------- */
// The sources an answer used, numbered to match its citations, behind "3 sources".
function SourceRow({ s, n, onOpen }) {
    const name = s.href || onOpen
        ? _jsx("a", { className: "pw-link pw-body-strong", href: s.href ?? "#", onClick: (e) => { if (onOpen) {
                e.preventDefault();
                onOpen(s);
            } }, children: s.title })
        : _jsx("span", { className: "pw-body-strong", children: s.title });
    return (_jsxs("li", { className: "pw-sources__item", children: [_jsx("span", { className: "pw-sources__n", "aria-hidden": "true", children: n }), _jsxs("div", { className: "pw-sources__main", children: [_jsxs("div", { className: "pw-sources__row", children: [name, s.entity || s.kind ? _jsxs("span", { className: "pw-kind pw-caption pw-muted", children: [s.entity ? _jsx(Icon, { name: entityIcon[s.entity], size: 12 }) : null, s.kind ?? (s.entity ? entityLabel[s.entity] : "")] }) : null] }), s.path && s.path.length ? _jsx(PathLine, { path: s.path, direct: "" }) : null, s.excerpt ? _jsx("blockquote", { className: "pw-sources__quote pw-caption", children: s.excerpt }) : null, s.updated ? _jsxs("span", { className: "pw-caption pw-muted", children: ["Updated ", s.updated] }) : null] })] }));
}
export function SourceList({ sources, onOpen, defaultOpen }) {
    if (!sources.length)
        return null;
    return (_jsx(Disclosure, { className: "pw-sources", defaultOpen: defaultOpen, summary: `${sources.length} source${sources.length === 1 ? "" : "s"}`, children: _jsx("ol", { className: "pw-sources__list", "aria-label": "Sources", children: sources.map((s, i) => _jsx(SourceRow, { s: s, n: i + 1, onOpen: onOpen }, s.id)) }) }));
}
/* ---------- ResourceCard ---------- */
// A referenced resource: its kind (icon + word), name, status, where it sits below the scope, and a few facts.
// The name is the one link; actions sit in a menu, so the card is never one big nested control.
export function ResourceCard({ kind, name, mono, href, onOpen, status, statusLabel, path, facts, actions }) {
    const title = href || onOpen
        ? _jsx("a", { className: cx("pw-link pw-body-strong", mono && "pw-mono"), href: href ?? "#", onClick: (e) => { if (onOpen) {
                e.preventDefault();
                onOpen();
            } }, children: name })
        : _jsx("span", { className: cx("pw-body-strong", mono && "pw-mono"), children: name });
    return (_jsxs("article", { className: "pw-rcard", "aria-label": `${entityLabel[kind]} ${name}`, children: [_jsxs("div", { className: "pw-rcard__top", children: [_jsxs("span", { className: "pw-kind pw-caption pw-muted", children: [_jsx(Icon, { name: entityIcon[kind], size: 12 }), entityLabel[kind]] }), status ? _jsx(StatusBadge, { status: status, label: statusLabel, size: "sm" }) : null, actions && actions.length ? _jsx("span", { className: "pw-rcard__menu", children: _jsx(ActionMenu, { items: actions, label: "Actions for " + name }) }) : null] }), _jsx("div", { className: "pw-rcard__name", children: title }), path && path.length ? _jsx(PathLine, { path: path, direct: "" }) : null, facts && facts.length ? _jsx(KeyValueList, { items: facts, layout: "inline", className: "pw-rcard__facts" }) : null] }));
}
/* ---------- EntityRef ---------- */
// An identifier inside text or a row: the kind's icon and the name in mono on a neutral tint, so "INC-2041" reads as a
// thing you can open, apart from the words describing it. A link when it opens something; the kind is read first.
export function EntityRef({ label, kind, icon, kindLabel, href, onOpen, mono = true }) {
    const word = kindLabel ?? (kind ? entityLabel[kind] : undefined);
    const ic = icon ?? (kind ? entityIcon[kind] : undefined);
    const body = _jsxs(_Fragment, { children: [ic ? _jsx(Icon, { name: ic, size: 12 }) : null, word ? _jsxs("span", { className: "pw-sr", children: [word, " "] }) : null, _jsx("span", { className: mono ? "pw-mono" : undefined, children: label })] });
    if (href || onOpen)
        return _jsx("a", { className: "pw-ref is-link", href: href ?? "#", onClick: (e) => { if (onOpen) {
                e.preventDefault();
                onOpen();
            } }, children: body });
    return _jsx("span", { className: "pw-ref", children: body });
}
/* ---------- AnswerSummary ---------- */
// The answer first: one or two sentences, a little larger, with the status of what it is about (healthy stays quiet).
export function AnswerSummary({ status, statusLabel, children }) {
    return (_jsxs("p", { className: cx("pw-lead", status && "has-status"), children: [status ? _jsx(StatusDot, { status: status, label: statusLabel }) : null, _jsx("span", { children: children })] }));
}
/* ---------- AttentionList ---------- */
// The things to look at, worst first: each row is an identifier, its status and one action on the first line, and
// what it is on the second. At most `max` rows show (default 5); the rest are one click away, never a wall of text.
export function AttentionList({ items, title, max = 5 }) {
    const [all, setAll] = React.useState(false);
    const shown = all ? items : items.slice(0, max), rest = items.length - shown.length;
    if (!items.length)
        return null;
    return (_jsxs("section", { className: "pw-attn", "aria-label": title ?? "Items", children: [title ? _jsx("div", { className: "pw-eyebrow", "aria-hidden": "true", children: title }) : null, _jsx("ul", { className: "pw-attn__list", children: shown.map((it) => (_jsxs("li", { className: cx("pw-attn__row", it.status === "critical" && "is-critical"), children: [_jsxs("span", { className: "pw-attn__top", children: [_jsx(EntityRef, { ...it.ref }), it.status ? _jsx(StatusBadge, { status: it.status, label: it.statusLabel, size: "sm" }) : null, it.action ? _jsxs(Button, { size: "sm", variant: "ghost", className: "pw-attn__act", onClick: it.action.onSelect, children: [it.action.label, _jsxs("span", { className: "pw-sr", children: [" ", it.ref.label] })] }) : null] }), _jsx("span", { className: "pw-attn__title", children: it.title }), it.meta ? _jsx("span", { className: "pw-caption pw-muted", children: it.meta }) : null] }, it.id))) }), rest > 0 ? _jsx(Button, { size: "sm", variant: "ghost", icon: "chevron-down", onClick: () => setAll(true), children: `Show ${rest} more` }) : null] }));
}
/* ---------- MetricStrip ---------- */
// The numbers an answer rests on, as a row of up to four figures with their trend, not sentences full of numbers.
export function MetricStrip({ items, label = "Key figures" }) {
    const shown = items.slice(0, 4);
    if (!shown.length)
        return null;
    return (_jsx("dl", { className: "pw-mstrip", "aria-label": label, children: shown.map((m) => (_jsxs("div", { className: "pw-mstrip__item", children: [_jsx("dt", { className: "pw-caption pw-muted", children: m.label }), _jsxs("dd", { children: [_jsx("span", { className: "pw-mstrip__v pw-num", children: m.value }), m.unit ? _jsxs("span", { className: "pw-muted", children: [" ", m.unit] }) : null] }), m.delta ? _jsx("dd", { className: "pw-mstrip__d", children: _jsx(Trend, { ...m.delta }) }) : null] }, m.label))) }));
}
/* ---------- NextStep ---------- */
// What to do now, set apart on a neutral tint with real buttons. A proposal says so: nothing has been changed.
export function NextStep({ title = "Suggested next step", children, actions, proposal = true }) {
    return (_jsxs("section", { className: "pw-next", "aria-label": title, children: [_jsxs("div", { className: "pw-next__h", children: [_jsx(Icon, { name: "arrow-right", size: 14 }), _jsx("span", { className: "pw-body-strong", children: title })] }), _jsx("div", { className: "pw-next__b", children: children }), proposal ? _jsx("div", { className: "pw-caption pw-muted", children: "Proposed. Nothing has been changed." }) : null, actions ? _jsx("div", { className: "pw-next__acts", children: actions }) : null] }));
}
//# sourceMappingURL=content.js.map