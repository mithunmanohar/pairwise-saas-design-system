// Markdown from a model, rendered as Pairwise elements: text styles, links, lists, tables, and CodeBlock for fences.
// markdown-to-jsx builds React elements (never innerHTML). Raw HTML is not parsed, images become links (a model can't
// make the page load an image), and unsafe URLs are dropped by its sanitizer. In its own module so apps that don't
// render Markdown don't load the parser.
import * as React from "react";
import { compiler, RuleType, type MarkdownToJSX } from "markdown-to-jsx/react";
import type { MarkdownProps, AssistantSource } from "./types";
import { Citation } from "./content";
import { cx } from "./core";
import { CodeBlock } from "./actions";
const { useMemo, useRef } = React;

// "[1]" in the text becomes a Citation when `sources` has a first source.
function withCitations(text: string, key: string, sources: AssistantSource[], open?: (s: AssistantSource) => void): React.ReactNode {
  const parts = text.split(/\[(\d{1,2})\]/);
  if (parts.length === 1) return text;
  return parts.map((p, i) => {
    if (i % 2 === 0) return p;
    const s = sources[Number(p) - 1];
    return s ? <Citation key={key + "-" + i} n={Number(p)} title={s.title} href={s.href} onOpen={open ? () => open(s) : undefined} /> : "[" + p + "]";
  });
}
export function Markdown({ children, streaming, onLink, headingLevel = 3, className, sources, onSource }: MarkdownProps) {
  const linkRef = useRef(onLink); linkRef.current = onLink;
  const srcRef = useRef(onSource); srcRef.current = onSource;
  const out = useMemo(() => {
    const heading = (n: number) => {
      const level = Math.min(6, Math.max(headingLevel, n));
      const H = ("h" + level) as "h2";
      return ({ children: c }: { children?: React.ReactNode }) => <H className={level <= 3 ? "pw-subheading" : "pw-body-strong"}>{c}</H>;
    };
    const Link = ({ href, title, children: c }: { href?: string; title?: string; children?: React.ReactNode }) => (
      <a href={href} title={title} className="pw-link" onClick={(e) => { const h = linkRef.current; if (h && href && h(href) !== false) e.preventDefault(); }}>{c}</a>
    );
    const Table = ({ children: c }: { children?: React.ReactNode }) => <div className="pw-md__table" tabIndex={0} role="region" aria-label="Table"><table>{c}</table></div>;
    const options: MarkdownToJSX.Options = {
      disableParsingRawHTML: true, forceBlock: true, wrapper: React.Fragment, optimizeForStreaming: !!streaming,
      overrides: { h1: heading(1), h2: heading(2), h3: heading(3), h4: heading(4), h5: heading(5), h6: heading(6), a: Link, table: Table },
      renderRule(next, node, _render, state) {
        if (node.type === RuleType.codeBlock) {
          const lang = node.lang || "";
          return <CodeBlock key={state.key} code={node.text} title={lang || "Code"} diff={lang === "diff"} maxHeight={280} />;
        }
        if (node.type === RuleType.text && sources && sources.length) return <React.Fragment key={state.key}>{withCitations(node.text, String(state.key), sources, srcRef.current && ((s) => srcRef.current!(s)))}</React.Fragment>;
        if (node.type === RuleType.codeInline) return <code key={state.key} className="pw-md__code">{node.text}</code>;
        if (node.type === RuleType.image) {
          const label = node.alt || node.title || "Image";
          return node.target ? <a key={state.key} href={node.target} className="pw-link">{label}</a> : <span key={state.key}>{label}</span>;
        }
        return next();
      },
    };
    return compiler(children, options);
  }, [children, streaming, headingLevel, sources]);
  return <div className={cx("pw-md", className)}>{out}</div>;
}
