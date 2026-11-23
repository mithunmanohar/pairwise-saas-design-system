import { jsx as _jsx } from "react/jsx-runtime";
// Markdown from a model, rendered as Pairwise elements: text styles, links, lists, tables, and CodeBlock for fences.
// markdown-to-jsx builds React elements (never innerHTML). Raw HTML is not parsed, images become links (a model can't
// make the page load an image), and unsafe URLs are dropped by its sanitizer. In its own module so apps that don't
// render Markdown don't load the parser.
import * as React from "react";
import { compiler, RuleType } from "markdown-to-jsx/react";
import { Citation, EntityRef } from "./content";
import { cx } from "./core";
import { CodeBlock } from "./actions";
const { useMemo, useRef } = React;
// "[1]" in the text becomes a Citation when `sources` has a first source.
function withCitations(text, key, sources, open) {
    const parts = text.split(/\[(\d{1,2})\]/);
    if (parts.length === 1)
        return text;
    return parts.map((p, i) => {
        if (i % 2 === 0)
            return p;
        const s = sources[Number(p) - 1];
        return s ? _jsx(Citation, { n: Number(p), title: s.title, href: s.href, onOpen: open ? () => open(s) : undefined }, key + "-" + i) : "[" + p + "]";
    });
}
// Known identifiers ("INC-2041", "checkout-api") become EntityRef chips, then "[1]" becomes a citation.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function enrich(text, key, entities, sources, open) {
    const cite = (t, k) => (sources && sources.length ? withCitations(t, k, sources, open) : t);
    if (!entities || !entities.length)
        return cite(text, key);
    const byLabel = new Map(entities.map((e) => [e.label, e]));
    const re = new RegExp(`(?<![\\w-])(${[...byLabel.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})(?![\\w-])`);
    const parts = text.split(re);
    if (parts.length === 1)
        return cite(text, key);
    return parts.map((p, i) => (i % 2 === 1 ? _jsx(EntityRef, { ...byLabel.get(p) }, key + "-e" + i) : _jsx(React.Fragment, { children: cite(p, key + "-" + i) }, key + "-t" + i)));
}
export function Markdown({ children, streaming, onLink, headingLevel = 3, className, sources, onSource, entities }) {
    const linkRef = useRef(onLink);
    linkRef.current = onLink;
    const srcRef = useRef(onSource);
    srcRef.current = onSource;
    const out = useMemo(() => {
        const heading = (n) => {
            const level = Math.min(6, Math.max(headingLevel, n));
            const H = ("h" + level);
            return ({ children: c }) => _jsx(H, { className: level <= 3 ? "pw-subheading" : "pw-body-strong", children: c });
        };
        const Link = ({ href, title, children: c }) => (_jsx("a", { href: href, title: title, className: "pw-link", onClick: (e) => { const h = linkRef.current; if (h && href && h(href) !== false)
                e.preventDefault(); }, children: c }));
        const Table = ({ children: c }) => _jsx("div", { className: "pw-md__table", tabIndex: 0, role: "region", "aria-label": "Table", children: _jsx("table", { children: c }) });
        const options = {
            disableParsingRawHTML: true, forceBlock: true, wrapper: React.Fragment, optimizeForStreaming: !!streaming,
            overrides: { h1: heading(1), h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6), a: Link, table: Table },
            renderRule(next, node, _render, state) {
                if (node.type === RuleType.codeBlock) {
                    const lang = node.lang || "";
                    return _jsx(CodeBlock, { code: node.text, title: lang || "Code", diff: lang === "diff", maxHeight: 280 }, state.key);
                }
                if (node.type === RuleType.text && ((sources && sources.length) || (entities && entities.length)))
                    return _jsx(React.Fragment, { children: enrich(node.text, String(state.key), entities, sources, srcRef.current && ((s) => srcRef.current(s))) }, state.key);
                if (node.type === RuleType.codeInline) {
                    const ent = entities?.find((e) => e.label === node.text);
                    return ent ? _jsx(EntityRef, { ...ent }, state.key) : _jsx("code", { className: "pw-md__code", children: node.text }, state.key);
                }
                if (node.type === RuleType.image) {
                    const label = node.alt || node.title || "Image";
                    return node.target ? _jsx("a", { href: node.target, className: "pw-link", children: label }, state.key) : _jsx("span", { children: label }, state.key);
                }
                return next();
            },
        };
        return compiler(children, options);
    }, [children, streaming, headingLevel, sources, entities]);
    return _jsx("div", { className: cx("pw-md", className), children: out });
}
//# sourceMappingURL=markdown.js.map