import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// AssistantAnswer: an answer drawn from typed blocks instead of one long Markdown string. Each kind of information gets
// its own shape: the conclusion first, things to look at as rows, numbers as a strip, what to do in a tinted box,
// evidence as code or steps. The limits are built in (rows, figures), so an agent can't flood the panel.
import * as React from "react";
import { Button, Skeleton } from "./core";
import { CodeBlock } from "./actions";
import { Markdown } from "./markdown";
import { AnswerSummary, AttentionList, MetricStrip, NextStep, Disclosure } from "./content";
export function AssistantAnswer({ blocks, streaming, sources, onSource, entities }) {
    const lastText = blocks.reduce((n, b, i) => (b.type === "text" ? i : n), -1);
    const block = (b, i) => {
        switch (b.type) {
            case "summary": return _jsx(AnswerSummary, { status: b.status, statusLabel: b.statusLabel, children: b.text }, i);
            case "text": return _jsx(Markdown, { streaming: streaming && i === lastText && i === blocks.length - 1, sources: sources, onSource: onSource, entities: entities, children: b.markdown }, i);
            case "items": return _jsx(AttentionList, { items: b.items, title: b.title, max: b.max }, i);
            case "metrics": return _jsx(MetricStrip, { items: b.items, label: b.label }, i);
            case "next": return (_jsx(NextStep, { title: b.title, proposal: b.proposal, actions: b.actions && b.actions.length ? b.actions.map((a) => _jsx(Button, { size: "sm", onClick: a.onSelect, children: a.label }, a.label)) : undefined, children: _jsx(Markdown, { sources: sources, onSource: onSource, entities: entities, children: b.text }) }, i));
            case "code": return _jsx(CodeBlock, { code: b.code, title: b.title, diff: b.diff, maxHeight: 240 }, i);
            case "steps": return _jsx(Disclosure, { summary: b.title ?? "How this was worked out", meta: `${b.steps.length} step${b.steps.length === 1 ? "" : "s"}`, children: _jsx("ol", { className: "pw-steps", children: b.steps.map((s) => _jsx("li", { children: s }, s)) }) }, i);
            case "custom": return _jsx(React.Fragment, { children: b.content }, i);
        }
    };
    return (_jsxs("div", { className: "pw-answer", children: [blocks.map(block), streaming ? _jsxs("div", { className: "pw-answer__next", "aria-hidden": "true", children: [_jsx(Skeleton, { w: "72%" }), _jsx(Skeleton, { w: "48%" })] }) : null] }));
}
//# sourceMappingURL=answer.js.map