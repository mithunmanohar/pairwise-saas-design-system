// Content parts for answers and records: expandable details, citations and their sources, and a resource card.
// They are generic (a "Related" list or a runbook can use them too); the assistant composes them.
import * as React from "react";
import type { DisclosureProps, CitationProps, SourceListProps, ResourceCardProps, AssistantSource } from "./types";
import { cx, StatusBadge } from "./core";
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
