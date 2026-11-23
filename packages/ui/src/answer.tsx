// AssistantAnswer: an answer drawn from typed blocks instead of one long Markdown string. Each kind of information gets
// its own shape: the conclusion first, things to look at as rows, numbers as a strip, what to do in a tinted box,
// evidence as code or steps. The limits are built in (rows, figures), so an agent can't flood the panel.
import * as React from "react";
import type { AssistantAnswerProps, AnswerBlock } from "./types";
import { Button, Skeleton } from "./core";
import { CodeBlock } from "./actions";
import { Markdown } from "./markdown";
import { AnswerSummary, AttentionList, MetricStrip, NextStep, Disclosure } from "./content";

export function AssistantAnswer({ blocks, streaming, sources, onSource, entities }: AssistantAnswerProps) {
  const lastText = blocks.reduce((n, b, i) => (b.type === "text" ? i : n), -1);
  const block = (b: AnswerBlock, i: number): React.ReactNode => {
    switch (b.type) {
      case "summary": return <AnswerSummary key={i} status={b.status} statusLabel={b.statusLabel}>{b.text}</AnswerSummary>;
      case "text": return <Markdown key={i} streaming={streaming && i === lastText && i === blocks.length - 1} sources={sources} onSource={onSource} entities={entities}>{b.markdown}</Markdown>;
      case "items": return <AttentionList key={i} items={b.items} title={b.title} max={b.max} />;
      case "metrics": return <MetricStrip key={i} items={b.items} label={b.label} />;
      case "next": return (
        <NextStep key={i} title={b.title} proposal={b.proposal}
          actions={b.actions && b.actions.length ? b.actions.map((a) => <Button key={a.label} size="sm" onClick={a.onSelect}>{a.label}</Button>) : undefined}>
          <Markdown sources={sources} onSource={onSource} entities={entities}>{b.text}</Markdown>
        </NextStep>
      );
      case "code": return <CodeBlock key={i} code={b.code} title={b.title} diff={b.diff} maxHeight={240} />;
      case "steps": return <Disclosure key={i} summary={b.title ?? "How this was worked out"} meta={`${b.steps.length} step${b.steps.length === 1 ? "" : "s"}`}><ol className="pw-steps">{b.steps.map((s) => <li key={s}>{s}</li>)}</ol></Disclosure>;
      case "custom": return <React.Fragment key={i}>{b.content}</React.Fragment>;
    }
  };
  return (
    <div className="pw-answer">
      {blocks.map(block)}
      {streaming ? <div className="pw-answer__next" aria-hidden="true"><Skeleton w="72%" /><Skeleton w="48%" /></div> : null}
    </div>
  );
}
