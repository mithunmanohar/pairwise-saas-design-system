import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// Small, very common building blocks: an action menu, a copy button, a tag and a code / log block.
import * as React from "react";
import * as DM from "@radix-ui/react-dropdown-menu";
import { cx, Button } from "./core";
import { Icon } from "./icons";
const { useState, useRef, useEffect } = React;
/* ---------- ActionMenu (Radix DropdownMenu) ---------- */
// Items with `checked` render as checkbox items (a tick, announced as checked), for picking the current one of several.
export function ActionMenu({ items, label = "More actions", trigger, align = "end", header, forceOpen }) {
    return (_jsxs(DM.Root, { ...(forceOpen ? { open: true, modal: false } : {}), children: [_jsx(DM.Trigger, { asChild: true, children: trigger ?? _jsx(Button, { variant: "ghost", icon: "more", "aria-label": label }) }), _jsx(DM.Portal, { children: _jsxs(DM.Content, { className: "pw-menu", align: align, sideOffset: 4, loop: true, "aria-label": label, children: [header ? _jsxs(_Fragment, { children: [_jsx(DM.Label, { asChild: true, children: _jsx("div", { className: "pw-menu__header", children: header }) }), _jsx(DM.Separator, { className: "pw-menu__sep" })] }) : null, items.map((it, i) => {
                            if (it === "separator")
                                return _jsx(DM.Separator, { className: "pw-menu__sep" }, i);
                            if ("heading" in it)
                                return _jsx(DM.Label, { className: "pw-menu__heading pw-caption pw-muted", children: it.heading }, i);
                            const body = _jsxs(_Fragment, { children: [_jsx("span", { className: "pw-list__check", children: it.checked ? _jsx(Icon, { name: "check", size: 14 }) : it.icon ? _jsx(Icon, { name: it.icon, size: 14 }) : null }), _jsx("span", { children: it.label }), it.meta || it.shortcut ? _jsx("span", { className: "pw-muted pw-list__meta", children: it.meta ?? it.shortcut }) : null] });
                            const cls = cx("pw-list__item", it.tone && "pw-tone--" + it.tone, it.checked && "is-selected");
                            return it.checked !== undefined
                                ? _jsx(DM.CheckboxItem, { className: cls, disabled: it.disabled, checked: it.checked, onSelect: it.onSelect, children: body }, i)
                                : _jsx(DM.Item, { className: cls, disabled: it.disabled, onSelect: it.onSelect, children: body }, i);
                        })] }) })] }));
}
/* ---------- CopyButton ---------- */
async function writeClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return;
    }
    catch { /* insecure context or denied: fall back */ }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
}
export function CopyButton({ value, label = "Copy", children, onCopy }) {
    const [done, setDone] = useState(false);
    const timer = useRef(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const copy = async () => {
        await writeClipboard(value);
        onCopy && onCopy(value);
        setDone(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDone(false), 1500);
    };
    const status = _jsx("span", { className: "pw-sr", role: "status", children: done ? "Copied" : "" });
    if (children == null)
        return _jsxs(_Fragment, { children: [status, _jsx(Button, { variant: "ghost", size: "sm", icon: done ? "check" : "copy", "aria-label": label, title: done ? "Copied" : label, onClick: copy })] });
    return (_jsxs("button", { type: "button", className: "pw-copy", title: done ? "Copied" : "Copy", onClick: copy, children: [_jsx("span", { className: "pw-mono", children: children }), _jsx(Icon, { name: done ? "check" : "copy", size: 14 }), status] }));
}
/* ---------- Tag ---------- */
export function Tag({ children, mono, onRemove, removeLabel }) {
    const text = typeof children === "string" || typeof children === "number" ? String(children) : "";
    return (_jsxs("span", { className: cx("pw-chip", mono && "pw-mono"), children: [_jsx("span", { children: children }), onRemove ? _jsx("button", { type: "button", className: "pw-chip__x", "aria-label": removeLabel || ("Remove " + text).trim(), onClick: onRemove, children: _jsx(Icon, { name: "x", size: 12 }) }) : null] }));
}
/* ---------- CodeBlock (code, diffs as text, logs) ---------- */
export function CodeBlock({ code, title, lineNumbers, wrap: wrapInit = false, maxHeight = 320, highlight = [], copy = true }) {
    const lines = code.replace(/\n$/, "").split("\n");
    const nums = lineNumbers ?? lines.length > 1;
    const [wrap, setWrap] = useState(wrapInit);
    const hl = new Set(highlight);
    const numW = String(lines.length).length + "ch";
    return (_jsxs("figure", { className: "pw-code", children: [_jsxs("figcaption", { className: "pw-code__bar", children: [_jsx("span", { className: "pw-caption pw-muted", children: title }), _jsxs("span", { className: "pw-code__acts", children: [_jsx("button", { type: "button", className: "pw-chart__toggle", "aria-pressed": wrap, onClick: () => setWrap(!wrap), children: "Wrap lines" }), copy ? _jsx(CopyButton, { value: code, label: "Copy " + (title || "code") }) : null] })] }), _jsx("pre", { className: cx("pw-code__pre", wrap && "is-wrap"), style: { maxHeight }, tabIndex: 0, "aria-label": title || "Code", children: _jsx("code", { children: lines.map((l, i) => (_jsxs("span", { className: cx("pw-code__line", hl.has(i + 1) && "is-hl"), children: [nums ? _jsx("span", { className: "pw-code__n", style: { width: numW }, "aria-hidden": "true", children: i + 1 }) : null, _jsx("span", { className: "pw-code__t", children: l || " " })] }, i))) }) })] }));
}
//# sourceMappingURL=actions.js.map