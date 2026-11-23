// Content parts for answers and records: expandable details, citations and their sources, and a resource card.
// They are generic (a "Related" list or a runbook can use them too); the assistant composes them.
import * as React from "react";
import type { DisclosureProps, CitationProps, SourceListProps, ResourceCardProps, AssistantSource, EntityRefProps, AttentionListProps, MetricStripProps, NextStepProps, AnswerSummaryProps } from "./types";
import { cx, Button, StatusBadge, StatusDot, Trend } from "./core";
import { ActionMenu } from "./actions";
import { KeyValueList } from "./display";
import { PathLine } from "./data";
import { Icon, entityIcon, entityLabel } from "./icons";

/* ---------- Disclosure ---------- */
// Native <details>/<summary>: the browser provides the button role, Enter / Space and the expanded state, so there is
// no hand-written keyboard logic. Controlled with `open` + `onOpenChange`, or left to itself.
export function Disclosure({ summary, meta, open, defaultOpen, onOpenChange, className, children }: DisclosureProps) {
  return (
    <details className={cx("pw-disc", className)} {...(open !== undefined ? { open } : defaultOpen ? { open: true } : {})}
      onToggle={(e) => { const o = e.currentTarget.open; if (o !== open) onOpenChange && onOpenChange(o); }}>
      <summary className="pw-disc__s">
        <Icon name="chevron-right" size={14} className="pw-disc__chev" />
        <span className="pw-disc__t">{summary}</span>
        {meta ? <span className="pw-caption pw-muted">{meta}</span> : null}
      </summary>
      <div className="pw-disc__b">{children}</div>
    </details>
  );
}

/* ---------- Citation ---------- */
// An inline numbered reference to a source: read as "Source 1: <title>".
export function Citation({ n, title, href, onOpen }: CitationProps) {
  const name = `Source ${n}: ${title}`;
  if (href || onOpen) {
    return (
      <a className="pw-cite" href={href ?? "#source-" + n} aria-label={name} title={title}
        onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(); } }}>{n}</a>
    );
  }
  return <span className="pw-cite" role="note" aria-label={name} title={title}>{n}</span>;
}

/* ---------- SourceList ---------- */
// The sources an answer used, numbered to match its citations, behind "3 sources".
function SourceRow({ s, n, onOpen }: { s: AssistantSource; n: number; onOpen?: (s: AssistantSource) => void }) {
  const name = s.href || onOpen
    ? <a className="pw-link pw-body-strong" href={s.href ?? "#"} onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(s); } }}>{s.title}</a>
    : <span className="pw-body-strong">{s.title}</span>;
  return (
    <li className="pw-sources__item">
      <span className="pw-sources__n" aria-hidden="true">{n}</span>
      <div className="pw-sources__main">
        <div className="pw-sources__row">
          {name}
          {s.entity || s.kind ? <span className="pw-kind pw-caption pw-muted">{s.entity ? <Icon name={entityIcon[s.entity]} size={12} /> : null}{s.kind ?? (s.entity ? entityLabel[s.entity] : "")}</span> : null}
        </div>
        {s.path && s.path.length ? <PathLine path={s.path} direct="" /> : null}
        {s.excerpt ? <blockquote className="pw-sources__quote pw-caption">{s.excerpt}</blockquote> : null}
        {s.updated ? <span className="pw-caption pw-muted">Updated {s.updated}</span> : null}
      </div>
    </li>
  );
}
export function SourceList({ sources, onOpen, defaultOpen }: SourceListProps) {
  if (!sources.length) return null;
  return (
    <Disclosure className="pw-sources" defaultOpen={defaultOpen} summary={`${sources.length} source${sources.length === 1 ? "" : "s"}`}>
      <ol className="pw-sources__list" aria-label="Sources">
        {sources.map((s, i) => <SourceRow key={s.id} s={s} n={i + 1} onOpen={onOpen} />)}
      </ol>
    </Disclosure>
  );
}

/* ---------- ResourceCard ---------- */
// A referenced resource: its kind (icon + word), name, status, where it sits below the scope, and a few facts.
// The name is the one link; actions sit in a menu, so the card is never one big nested control.
export function ResourceCard({ kind, name, mono, href, onOpen, status, statusLabel, path, facts, actions }: ResourceCardProps) {
  const title = href || onOpen
    ? <a className={cx("pw-link pw-body-strong", mono && "pw-mono")} href={href ?? "#"} onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(); } }}>{name}</a>
    : <span className={cx("pw-body-strong", mono && "pw-mono")}>{name}</span>;
  return (
    <article className="pw-rcard" aria-label={`${entityLabel[kind]} ${name}`}>
      <div className="pw-rcard__top">
        <span className="pw-kind pw-caption pw-muted"><Icon name={entityIcon[kind]} size={12} />{entityLabel[kind]}</span>
        {status ? <StatusBadge status={status} label={statusLabel} size="sm" /> : null}
        {actions && actions.length ? <span className="pw-rcard__menu"><ActionMenu items={actions} label={"Actions for " + name} /></span> : null}
      </div>
      <div className="pw-rcard__name">{title}</div>
      {path && path.length ? <PathLine path={path} direct="" /> : null}
      {facts && facts.length ? <KeyValueList items={facts} layout="inline" className="pw-rcard__facts" /> : null}
    </article>
  );
}

/* ---------- EntityRef ---------- */
// An identifier inside text or a row: the kind's icon and the name in mono on a neutral tint, so "INC-2041" reads as a
// thing you can open, apart from the words describing it. A link when it opens something; the kind is read first.
export function EntityRef({ label, kind, icon, kindLabel, href, onOpen, mono = true }: EntityRefProps) {
  const word = kindLabel ?? (kind ? entityLabel[kind] : undefined);
  const ic = icon ?? (kind ? entityIcon[kind] : undefined);
  const body = <>{ic ? <Icon name={ic} size={12} /> : null}{word ? <span className="pw-sr">{word} </span> : null}<span className={mono ? "pw-mono" : undefined}>{label}</span></>;
  if (href || onOpen) return <a className="pw-ref is-link" href={href ?? "#"} onClick={(e) => { if (onOpen) { e.preventDefault(); onOpen(); } }}>{body}</a>;
  return <span className="pw-ref">{body}</span>;
}

/* ---------- AnswerSummary ---------- */
// The answer first: one or two sentences, a little larger, with the status of what it is about (healthy stays quiet).
export function AnswerSummary({ status, statusLabel, children }: AnswerSummaryProps) {
  return (
    <p className={cx("pw-lead", status && "has-status")}>
      {status ? <StatusDot status={status} label={statusLabel} /> : null}
      <span>{children}</span>
    </p>
  );
}

/* ---------- AttentionList ---------- */
// The things to look at, worst first: each row is an identifier, its status and one action on the first line, and
// what it is on the second. At most `max` rows show (default 5); the rest are one click away, never a wall of text.
export function AttentionList({ items, title, max = 5 }: AttentionListProps) {
  const [all, setAll] = React.useState(false);
  const shown = all ? items : items.slice(0, max), rest = items.length - shown.length;
  if (!items.length) return null;
  return (
    <section className="pw-attn" aria-label={title ?? "Items"}>
      {title ? <div className="pw-eyebrow" aria-hidden="true">{title}</div> : null}
      <ul className="pw-attn__list">
        {shown.map((it) => (
          <li key={it.id} className={cx("pw-attn__row", it.status === "critical" && "is-critical")}>
            <span className="pw-attn__top">
              <EntityRef {...it.ref} />
              {it.status ? <StatusBadge status={it.status} label={it.statusLabel} size="sm" /> : null}
              {it.action ? <Button size="sm" variant="ghost" className="pw-attn__act" onClick={it.action.onSelect}>{it.action.label}<span className="pw-sr"> {it.ref.label}</span></Button> : null}
            </span>
            <span className="pw-attn__title">{it.title}</span>
            {it.meta ? <span className="pw-caption pw-muted">{it.meta}</span> : null}
          </li>
        ))}
      </ul>
      {rest > 0 ? <Button size="sm" variant="ghost" icon="chevron-down" onClick={() => setAll(true)}>{`Show ${rest} more`}</Button> : null}
    </section>
  );
}

/* ---------- MetricStrip ---------- */
// The numbers an answer rests on, as a row of up to four figures with their trend, not sentences full of numbers.
export function MetricStrip({ items, label = "Key figures" }: MetricStripProps) {
  const shown = items.slice(0, 4);
  if (!shown.length) return null;
  return (
    <dl className="pw-mstrip" aria-label={label}>
      {shown.map((m) => (
        <div key={m.label} className="pw-mstrip__item">
          <dt className="pw-caption pw-muted">{m.label}</dt>
          <dd><span className="pw-mstrip__v pw-num">{m.value}</span>{m.unit ? <span className="pw-muted"> {m.unit}</span> : null}</dd>
          {m.delta ? <dd className="pw-mstrip__d"><Trend {...m.delta} /></dd> : null}
        </div>
      ))}
    </dl>
  );
}

/* ---------- NextStep ---------- */
// What to do now, set apart on a neutral tint with real buttons. A proposal says so: nothing has been changed.
export function NextStep({ title = "Suggested next step", children, actions, proposal = true }: NextStepProps) {
  return (
    <section className="pw-next" aria-label={title}>
      <div className="pw-next__h"><Icon name="arrow-right" size={14} /><span className="pw-body-strong">{title}</span></div>
      <div className="pw-next__b">{children}</div>
      {proposal ? <div className="pw-caption pw-muted">Proposed. Nothing has been changed.</div> : null}
      {actions ? <div className="pw-next__acts">{actions}</div> : null}
    </section>
  );
}
