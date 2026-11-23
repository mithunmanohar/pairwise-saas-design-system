// The assistant: a contextual helper that reads as Pairwise, not a separate chat product (DECISIONS #29).
// AI-authored content is marked by an icon, a label and its layout, never by colour. Everything here composes existing
// parts: Drawer (docked or modal), Button, ActionMenu, Popover, cmdk, FileUpload, Avatar, ProgressBar, StatusBadge,
// StateBlock, Modal. The app owns the model: these components take messages and state as props, and never call one.
import * as React from "react";
import * as RPopover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import type {
  AssistantContextItem, AssistantContextKind, ContextBarProps, PromptComposerProps, PromptCommand, PromptSuggestion,
  AssistantMessageProps, AssistantPanelProps, AssistantProviderProps, AssistantApi, IconName,
} from "./types";
import { cx, Button, Drawer, Modal, Popover, StateBlock, StatusBadge, Tooltip, useCmdkAria, useCmdkHighlight } from "./core";
import { ActionMenu, CopyButton } from "./actions";
import { Avatar, KeyValueList, ProgressBar } from "./display";
import { RadioGroup, FileUpload } from "./inputs";
import { Textarea, useField } from "./forms";
import { ScopePicker } from "./hierarchy";
import { PathLine } from "./data";
import { SourceList } from "./content";
import { Icon, entityIcon, entityLabel } from "./icons";
import { AssistantSlot } from "./shell";
import { toast } from "./toast";
const { useState, useRef, useEffect, useMemo, useContext, createContext } = React;

/* ---------- Context items ---------- */
const KIND_WORD: Record<AssistantContextKind, string> = {
  page: "Page", entity: "Resource", filter: "Filter", ownership: "Ownership scope", runtime: "Runtime scope",
  time: "Time range", permission: "Your access", attachment: "Attachment",
};
const KIND_ICON: Record<AssistantContextKind, IconName> = {
  page: "page", entity: "cube", filter: "filter", ownership: "building", runtime: "server", time: "clock", permission: "lock", attachment: "file",
};
const ctxIcon = (c: AssistantContextItem): IconName => (c.entity ? entityIcon[c.entity] : KIND_ICON[c.kind]);
const ctxWord = (c: AssistantContextItem) => (c.kind === "entity" && c.entity ? entityLabel[c.entity] : KIND_WORD[c.kind]);

function AddContext({ offer, onAdd }: { offer: AssistantContextItem[]; onAdd: (c: AssistantContextItem) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = q.trim().toLowerCase();
  const shown = offer.filter((c) => !t || (c.label + " " + ctxWord(c) + " " + (c.detail ?? "")).toLowerCase().includes(t));
  const hl = useCmdkHighlight(shown.map((c) => c.id));
  const listRef = useCmdkAria(inputRef, null);
  return (
    <Popover label="Add context" width={300} open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}
      trigger={<Button size="sm" variant="ghost" icon="plus">Add</Button>}>
      <Command shouldFilter={false} loop label="Add context" value={hl.value} onValueChange={hl.onValueChange} onKeyDown={hl.onKeyDown} onPointerMoveCapture={hl.onPointerMoveCapture}>
        <div className="pw-combo__search"><Icon name="search" size={14} />
          <Command.Input ref={inputRef} className="pw-combo__in" placeholder="Search this page…" value={q} onValueChange={(v) => { hl.onQuery(); setQ(v); }} autoFocus />
        </div>
        <Command.List ref={listRef} className="pw-list pw-combo__list" label="Context you can add">
          {!shown.length ? <Command.Empty className="pw-list__empty pw-muted">Nothing to add.</Command.Empty> : null}
          {shown.map((c) => (
            <Command.Item key={c.id} value={c.id} onSelect={() => { onAdd(c); setOpen(false); setQ(""); }} className="pw-list__item">
              <span className="pw-list__check"><Icon name={ctxIcon(c)} size={14} /></span>
              <span className="pw-search__txt"><span>{c.label}</span>{c.detail ? <span className="pw-caption pw-muted">{c.detail}</span> : null}</span>
              <span className="pw-muted pw-list__meta">{ctxWord(c)}</span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Popover>
  );
}

/**
 * What the assistant can see: the page, the selected entity, filters, the ownership scope, the runtime scope, the time
 * range and the person's access, as icon + word chips. "All context" lists every item with its path, and the
 * ownership scope can be changed there with the existing ScopePicker (the full tree never appears in the panel).
 */
export function ContextBar({ items, onRemove, available = [], onAdd, scope, max = 3 }: ContextBarProps) {
  const shown = items.slice(0, max), rest = items.length - shown.length;
  const canRemove = (c: AssistantContextItem) => c.removable !== false && !!onRemove;
  const offer = available.filter((a) => !items.some((i) => i.id === a.id));
  return (
    <div className="pw-ctx" role="group" aria-label="Context the assistant can see">
      <ul className="pw-ctx__chips">
        {shown.map((c) => (
          <li key={c.id}>
            <span className="pw-chip pw-ctx__chip" title={ctxWord(c) + ": " + c.label}>
              <Icon name={ctxIcon(c)} size={12} />
              <span><span className="pw-sr">{ctxWord(c)}: </span>{c.label}</span>
              {canRemove(c) ? <button type="button" className="pw-chip__x" aria-label={"Remove " + c.label + " from context"} onClick={() => onRemove!(c.id)}><Icon name="x" size={12} /></button> : null}
            </span>
          </li>
        ))}
      </ul>
      {items.length ? (
        <Popover label="Context the assistant can see" width={340} align="start"
          trigger={<Button size="sm" variant="ghost">{rest > 0 ? `+${rest} more` : "All context"}</Button>}>
          <ul className="pw-ctxi">
            {items.map((c) => (
              <li key={c.id} className="pw-ctxi__item">
                <Icon name={ctxIcon(c)} size={14} className="pw-ctxi__icon" />
                <div className="pw-ctxi__main">
                  <span className="pw-caption pw-muted">{ctxWord(c)}</span>
                  {c.kind === "ownership" && scope
                    ? <ScopePicker nodes={scope.nodes} value={scope.value} onChange={scope.onChange} loadChildren={scope.loadChildren} label="Change ownership scope" />
                    : <span className="pw-body-strong">{c.label}</span>}
                  {c.path && c.path.length ? <PathLine path={c.path} direct="" /> : null}
                  {c.detail ? <span className="pw-caption pw-muted">{c.detail}</span> : null}
                </div>
                {canRemove(c) ? <Button size="sm" variant="ghost" icon="x" aria-label={"Remove " + c.label + " from context"} onClick={() => onRemove!(c.id)} /> : null}
              </li>
            ))}
          </ul>
        </Popover>
      ) : <span className="pw-caption pw-muted">No context</span>}
      {onAdd && offer.length ? <AddContext offer={offer} onAdd={onAdd} /> : null}
    </div>
  );
}

/* ---------- PromptComposer ---------- */
// The textarea sits inside the cmdk root. While the "@" or "/" list is open, cmdk owns the arrows and Enter (they
// bubble to it); otherwise the textarea keeps them, so cmdk never sees them. No list navigation is written here.
const NAV = ["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", "Enter"];
type Trigger = { kind: "mention" | "command"; q: string; start: number } | null;
function findTrigger(before: string, mentions: boolean, commands: boolean): Trigger {
  const m = mentions ? /(^|\s)@([^\s@]*)$/.exec(before) : null;
  if (m) return { kind: "mention", q: m[2] ?? "", start: before.length - (m[2] ?? "").length - 1 };
  const c = commands ? /^\/([^\s]*)$/.exec(before) : null;
  if (c) return { kind: "command", q: c[1] ?? "", start: 0 };
  return null;
}
export function PromptComposer({
  value: valueProp, defaultValue = "", onChange, onSubmit, busy, onStop, label = "Ask the assistant", placeholder, maxLength, disabled, disabledReason,
  suggestions, onSuggestion, templates, mentions, onMentionQuery, mentionsLoading, commands, attachments, context, hint, error,
}: PromptComposerProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const set = (v: string) => { if (valueProp === undefined) setInner(v); onChange && onChange(v); };
  const ta = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState(0);
  const [closedAt, setClosedAt] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const over = maxLength != null && value.length > maxLength;
  const trigger = findTrigger(value.slice(0, caret), !!mentions, !!commands);
  const triggerKey = trigger ? trigger.kind + trigger.start : null;
  const pool: PromptCommand[] = trigger?.kind === "mention" ? mentions ?? [] : trigger ? commands ?? [] : [];
  const t = trigger ? trigger.q.toLowerCase() : "";
  const opts = pool.filter((o) => !t || [o.label, o.value, o.description, ...(o.keywords || [])].join(" ").toLowerCase().includes(t)).slice(0, 8);
  const loadingList = trigger?.kind === "mention" && !!mentionsLoading;
  const menuOpen = !!trigger && closedAt !== triggerKey && !disabled && (opts.length > 0 || loadingList);
  const hl = useCmdkHighlight(opts.map((o) => o.value));
  const listRef = useCmdkAria(ta as unknown as React.RefObject<HTMLInputElement>, null);
  useEffect(() => { if (trigger?.kind === "mention" && onMentionQuery) onMentionQuery(trigger.q); }, [trigger?.kind, trigger?.q]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { hl.onQuery(); }, [triggerKey, t]); // eslint-disable-line react-hooks/exhaustive-deps
  // The list unmounts when it closes; don't leave the textarea pointing at an option that no longer exists.
  React.useLayoutEffect(() => { if (!menuOpen) ta.current?.removeAttribute("aria-activedescendant"); }, [menuOpen]);

  const f = useField(undefined, disabled && disabledReason ? disabledReason : hint, error || localError || (over ? `Shorten it to ${maxLength} characters.` : undefined));
  const shownError = error || localError || (over ? `Shorten it to ${maxLength} characters.` : "");
  const moveCaret = (pos: number) => requestAnimationFrame(() => { const el = ta.current; if (!el) return; el.focus(); el.setSelectionRange(pos, pos); setCaret(pos); });
  const insert = (o: PromptCommand) => {
    if (!trigger) return;
    const token = trigger.kind === "mention" ? "@" + o.label + " " : "/" + o.value + " ";
    const next = value.slice(0, trigger.start) + token + value.slice(caret);
    set(next); moveCaret(trigger.start + token.length);
  };
  const send = () => {
    if (busy || disabled) return;
    const text = value.trim();
    if (!text) { setLocalError("Type a question first."); return; }
    if (over) return;
    setLocalError(""); onSubmit(text); set(""); setCaret(0);
  };
  const pick = (s: PromptSuggestion) => {
    const text = s.prompt ?? s.label;
    if (s.insert) { set(text); const i = text.indexOf("…"); moveCaret(i >= 0 ? i : text.length); return; }
    if (onSuggestion) onSuggestion(s); else onSubmit(text);
  };
  return (
    <Command className="pw-composer" shouldFilter={false} loop vimBindings={false} label=""
      value={hl.value} onValueChange={hl.onValueChange} onKeyDown={hl.onKeyDown} onPointerMoveCapture={hl.onPointerMoveCapture}>
      {suggestions && suggestions.length && !value ? (
        <div className="pw-composer__sugg" role="group" aria-label="Suggestions">
          {suggestions.map((s) => <Button key={s.label} size="sm" icon={s.icon} className="pw-prompt" disabled={disabled || busy} onClick={() => pick(s)}>{s.label}</Button>)}
        </div>
      ) : null}
      {context}
      <RPopover.Root open={menuOpen} onOpenChange={(o) => { if (!o) setClosedAt(triggerKey); }}>
        <RPopover.Anchor asChild>
          <div ref={boxRef} className={cx("pw-composer__box", shownError && "is-error", disabled && "is-disabled")}>
            <label htmlFor={f.id} className="pw-sr">{label}</label>
            <textarea ref={ta} id={f.id} data-autofocus className="pw-composer__in" rows={2} value={value} disabled={disabled}
              placeholder={placeholder ?? "Ask about this page" + (mentions ? ", @ to mention" : "") + (commands ? ", / for commands" : "")}
              aria-describedby={f.describedBy} aria-invalid={shownError ? true : undefined} aria-autocomplete={mentions || commands ? "list" : undefined}
              onChange={(e) => { set(e.target.value); setCaret(e.target.selectionStart); if (localError) setLocalError(""); }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
              onKeyDown={(e) => {
                if (menuOpen) return; // cmdk handles the list's keys
                if (NAV.includes(e.key)) e.stopPropagation();
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
              }} />
            <div className="pw-composer__tools">
              {attachments ? <FileUpload variant="button" label="Attach files" multiple disabled={disabled} {...attachments} /> : null}
              {templates && templates.length ? (
                <ActionMenu label="Prompt templates" align="start" trigger={<Button size="sm" variant="ghost" icon="page" disabled={disabled}>Templates</Button>}
                  items={templates.map((tp) => ({ label: tp.label, icon: tp.icon, onSelect: () => pick({ ...tp, insert: tp.insert ?? true }) }))} />
              ) : null}
              <span className="pw-composer__end">
                {maxLength ? <span className={cx("pw-caption pw-num", over ? "pw-tone--critical" : "pw-muted")}>{value.length} / {maxLength}</span> : null}
                {/* Separate elements (keys): reusing one button would fade its fill from ink to light behind dark text. */}
                {busy
                  ? <Button key="stop" size="sm" icon="stop" onClick={onStop}>Stop</Button>
                  : <Button key="send" size="sm" variant="primary" icon="send" aria-label="Send" disabled={disabled || over} onClick={send} />}
              </span>
            </div>
          </div>
        </RPopover.Anchor>
        <RPopover.Portal>
          <RPopover.Content className="pw-popover pw-composer__pop" side="top" align="start" sideOffset={4} collisionPadding={8}
            aria-label={trigger?.kind === "command" ? "Commands" : "Mentions"}
            onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => { if (boxRef.current?.contains(e.target as Node)) e.preventDefault(); }}>
            <Command.List ref={listRef} className="pw-list pw-composer__list" label={trigger?.kind === "command" ? "Commands" : "Mentions"} onMouseDown={(e) => e.preventDefault()}>
              {loadingList ? <Command.Loading className="pw-list__empty pw-muted">Loading…</Command.Loading> : null}
              {opts.map((o) => (
                <Command.Item key={o.value} value={o.value} onSelect={() => insert(o)} className="pw-list__item">
                  <span className="pw-list__check">{o.entity ? <Icon name={entityIcon[o.entity]} size={14} /> : o.icon ? <Icon name={o.icon} size={14} /> : null}</span>
                  <span className="pw-search__txt">
                    <span className={trigger?.kind === "command" ? "pw-mono" : undefined}>{trigger?.kind === "command" ? "/" + o.value : o.label}</span>
                    {o.description ? <span className="pw-caption pw-muted">{o.description}</span> : null}
                  </span>
                  <span className="pw-muted pw-list__meta">{o.group ?? (o.entity ? entityLabel[o.entity] : "")}</span>
                </Command.Item>
              ))}
            </Command.List>
          </RPopover.Content>
        </RPopover.Portal>
      </RPopover.Root>
      {f.hintId ? <div id={f.hintId} className="pw-formfield__hint">{disabled && disabledReason ? disabledReason : hint}</div> : null}
      {f.errId ? <div id={f.errId} className="pw-formfield__error"><Icon name="critical" size={12} /><span>{shownError}</span></div> : null}
    </Command>
  );
}

/* ---------- AssistantMessage ---------- */
const REPORT_REASONS = ["Inaccurate or made up", "Harmful or unsafe", "Out of date", "Something else"];
function ReportDialog({ open, onClose, onReport }: { open: boolean; onClose: () => void; onReport: (r: { reason: string; detail: string }) => void }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]!);
  const [detail, setDetail] = useState("");
  const close = () => { onClose(); setDetail(""); setReason(REPORT_REASONS[0]!); };
  return (
    <Modal open={open} title="Report a problem with this answer" onClose={close}
      actions={<><Button onClick={close}>Cancel</Button><Button variant="primary" onClick={() => { onReport({ reason, detail: detail.trim() }); close(); toast({ tone: "healthy", title: "Report sent", body: "Thanks. It helps us improve the assistant." }); }}>Send report</Button></>}>
      <RadioGroup label="What went wrong?" options={REPORT_REASONS} value={reason} onChange={setReason} />
      <Textarea label="Details" hint="Optional. Don't include passwords or secrets." rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} />
    </Modal>
  );
}
/**
 * One turn of a conversation, as a list item (AssistantPanel puts them in a list). The assistant's and agents' turns
 * carry the assistant icon or the agent's initials, their name, and their actions; the person's turns sit on the right.
 * While streaming, the body is aria-busy and nothing is announced; the panel announces the finished answer once.
 */
export function AssistantMessage({
  author, status = "done", time, children, sources, onSource, statusText, onRetry, followUps, onFollowUp,
  feedback, onFeedback, onReport, copyText, onRegenerate, provenance,
}: AssistantMessageProps) {
  const person = author.kind === "person";
  const [reporting, setReporting] = useState(false);
  const settled = status !== "streaming";
  const about = provenance ? [
    { label: "Generated", value: provenance.generated },
    ...(provenance.model ? [{ label: "Model", value: provenance.model }] : []),
    ...(provenance.context && provenance.context.length ? [{ label: "Context used", value: provenance.context.join(", ") }] : []),
    ...(sources && sources.length ? [{ label: "Sources", value: String(sources.length) }] : []),
    ...(provenance.tools && provenance.tools.length ? [{ label: "Tools", value: provenance.tools.join(", ") }] : []),
  ] : [];
  return (
    <li className={cx("pw-msg", person ? "pw-msg--person" : "pw-msg--ai", "is-" + status)} aria-busy={status === "streaming" || undefined}>
      <div className="pw-msg__head">
        {person ? null : <Avatar name={author.name} icon={author.kind === "assistant" ? "assistant" : undefined} size={20} decorative />}
        <span className="pw-body-strong">{author.name}</span>
        {author.description ? <span className="pw-caption pw-muted">{author.description}</span> : null}
        {time ? <span className="pw-caption pw-muted">{time}</span> : null}
        {status === "stopped" ? <StatusBadge status="unknown" label="Stopped" size="sm" /> : status === "error" ? <StatusBadge status="critical" label="Failed" size="sm" /> : null}
      </div>
      {children != null && children !== false ? <div className="pw-msg__body">{children}</div> : null}
      {status === "streaming" ? <div className="pw-msg__progress"><ProgressBar value={null} label={statusText || "Responding…"} showValue={false} /></div> : null}
      {status === "error" ? (
        <div className="pw-msg__error">
          <span className="pw-tone--critical pw-msg__errtxt"><Icon name="critical" size={14} /><span>{statusText || "The assistant couldn't finish this answer."}</span></span>
          {onRetry ? <Button size="sm" icon="refresh" onClick={onRetry}>Retry</Button> : null}
        </div>
      ) : null}
      {!person && sources && sources.length ? <SourceList sources={sources} onOpen={onSource} /> : null}
      {!person && settled && (onFeedback || copyText || onRegenerate || provenance || onReport) ? (
        <div className="pw-msg__acts" role="group" aria-label={"Actions for " + author.name + "'s answer"}>
          {onFeedback && status === "done" ? <>
            <Button size="sm" variant="ghost" icon="thumb-up" aria-pressed={feedback === "helpful"} onClick={() => onFeedback(feedback === "helpful" ? null : "helpful")}>Helpful</Button>
            <Button size="sm" variant="ghost" icon="thumb-down" aria-pressed={feedback === "not-helpful"} onClick={() => onFeedback(feedback === "not-helpful" ? null : "not-helpful")}>Not helpful</Button>
          </> : null}
          {copyText ? <CopyButton value={copyText} label="Copy answer" /> : null}
          {onRegenerate ? (status === "done"
            ? <Tooltip content="Regenerate"><Button size="sm" variant="ghost" icon="refresh" aria-label="Regenerate" onClick={onRegenerate} /></Tooltip>
            : <Button size="sm" variant="ghost" icon="refresh" onClick={onRegenerate}>Regenerate</Button>) : null}
          {provenance ? (
            <Popover label="About this answer" width={300} trigger={<Button size="sm" variant="ghost">About</Button>}>
              <div className="pw-msg__about">
                <span className="pw-caption pw-muted">Written by {author.name}. Check important details before acting on them.</span>
                <KeyValueList items={about} label="About this answer" />
              </div>
            </Popover>
          ) : null}
          {onReport ? <ActionMenu label="More actions for this answer" items={[{ label: "Report a problem", icon: "flag", onSelect: () => setReporting(true) }]} /> : null}
        </div>
      ) : null}
      {!person && status === "done" && followUps && followUps.length ? (
        <div className="pw-msg__follow" role="group" aria-label="Suggested follow-ups">
          {followUps.map((s) => <Button key={s.label} size="sm" icon={s.icon} className="pw-prompt" onClick={() => onFollowUp && onFollowUp(s)}>{s.label}</Button>)}
        </div>
      ) : null}
      {onReport ? <ReportDialog open={reporting} onClose={() => setReporting(false)} onReport={onReport} /> : null}
    </li>
  );
}

/* ---------- AssistantPanel ---------- */
/**
 * The assistant's panel: a docked Drawer beside the content at 1280 px and wider (AppShell sets `placement`), a modal
 * drawer below that, and with `expanded` the whole content area. Header: new conversation, history, expand, close.
 * One polite live region reads `announcement` (a finished, stopped or failed answer), never each streamed word.
 */
export function AssistantPanel({
  open, onClose, title = "Assistant", expanded, onExpandedChange, conversations = [], activeId, onSelectConversation, onNewConversation,
  state = "ready", errorDetail, onRetry, empty, announcement, composer, children, placement: placementProp, contained,
}: AssistantPanelProps) {
  const slot = useContext(AssistantSlot);
  const placement = placementProp ?? slot?.placement ?? "docked";
  const docked = placement === "docked" || !!contained;
  const covering = !!open && docked && !!expanded && !contained;
  const setCovering = slot?.setCovering;
  useEffect(() => { if (!setCovering) return; setCovering(covering); return () => setCovering(false); }, [covering, setCovering]);
  const endRef = useRef<HTMLDivElement>(null);
  const count = React.Children.toArray(children).length;
  const hasMessages = count > 0;
  // A new turn starts at the top of the panel, with the question just above the answer, so a long structured answer
  // reads from its beginning (the conclusion first). The panel never chases the streaming text down.
  const seen = useRef(-1);
  React.useLayoutEffect(() => {
    if (!open) { seen.current = -1; return; }
    const sc = endRef.current?.closest(".pw-drawer__b");
    if (!sc || count === seen.current) return;
    const first = seen.current < 0;
    seen.current = count;
    const msgs = sc.querySelectorAll<HTMLElement>(".pw-msgs > .pw-msg");
    const people = sc.querySelectorAll<HTMLElement>(".pw-msgs > .pw-msg--person");
    const target = people[people.length - 1] ?? msgs[msgs.length - 1];
    if (!target) return;
    sc.scrollTop += target.getBoundingClientRect().top - sc.getBoundingClientRect().top - (first ? 0 : 8);
  }, [count, open, state]);
  const active = conversations.find((c) => c.id === activeId);
  const actions = <>
    {onNewConversation ? <Tooltip content="New conversation"><Button variant="ghost" icon="plus" aria-label="New conversation" onClick={onNewConversation} /></Tooltip> : null}
    {conversations.length ? (
      <ActionMenu label="Conversation history" trigger={<Button variant="ghost" icon="history" aria-label="Conversation history" />}
        items={[{ heading: "Recent conversations" }, ...conversations.map((c) => ({ label: c.title, meta: c.updated, checked: c.id === activeId, onSelect: () => onSelectConversation && onSelectConversation(c.id) }))]} />
    ) : null}
    {docked && !contained && onExpandedChange ? (
      <Tooltip content={expanded ? "Dock beside the page" : "Expand"}>
        <Button variant="ghost" icon={expanded ? "collapse" : "expand"} aria-label={expanded ? "Dock beside the page" : "Expand"} onClick={() => onExpandedChange(!expanded)} />
      </Tooltip>
    ) : null}
  </>;
  const body = state === "loading" ? <StateBlock kind="loading" rows={3} />
    : state === "error" ? <StateBlock kind="error" title="The assistant isn't available" body="Your work on this page is unaffected." detail={errorDetail} action={onRetry ? "Retry" : undefined} onAction={onRetry} />
    : state === "no-access" ? <StateBlock kind="no-access" title="The assistant isn't turned on for you" body="Ask an administrator of your organization for access." />
    : state === "empty" || !hasMessages ? <div className="pw-asst__empty">{empty ?? <StateBlock kind="empty" title="Ask about what you're looking at" body="The assistant sees this page and the scope you've chosen. It answers with sources and can't change anything." />}</div>
    : <ol className="pw-msgs" aria-label="Conversation">{children}</ol>;
  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={active ? active.title : undefined} docked={docked} actions={actions}
      className={cx("pw-asst", docked && expanded && !contained && "is-expanded", contained && "is-contained")}
      footer={state === "no-access" || state === "loading" ? undefined : composer}>
      {body}
      <div ref={endRef} className="pw-asst__end" />
      <div className="pw-sr" role="status" aria-live="polite">{announcement}</div>
    </Drawer>
  );
}

/* ---------- AssistantProvider ---------- */
type Internal = AssistantApi & { setPageContext: (items: AssistantContextItem[]) => void };
const AssistantCtx = createContext<Internal | null>(null);
/**
 * Holds whether the assistant is open or expanded and what the current page shows, so launchers (top bar, page and row
 * menus, the command palette) can call ask() with the right context. It makes no model calls: `onAsk` hands the prompt
 * and context to the app.
 */
export function AssistantProvider({ onAsk, defaultOpen = false, children }: AssistantProviderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(false);
  const [context, setPageContext] = useState<AssistantContextItem[]>([]);
  const askRef = useRef(onAsk); askRef.current = onAsk;
  const ctxRef = useRef(context); ctxRef.current = context;
  const api = useMemo<Internal>(() => ({
    open, setOpen, toggle: () => setOpen((o) => !o), expanded, setExpanded, context, setPageContext,
    ask: (prompt, extra = []) => {
      setOpen(true);
      const merged = [...ctxRef.current.filter((c) => !extra.some((e) => e.id === c.id)), ...extra];
      askRef.current && askRef.current(prompt, merged);
    },
  }), [open, expanded, context]);
  return <AssistantCtx.Provider value={api}>{children}</AssistantCtx.Provider>;
}
/** The assistant's state and ask(), inside an AssistantProvider. */
export function useAssistant(): AssistantApi {
  const v = useContext(AssistantCtx);
  if (!v) throw new Error("useAssistant needs an <AssistantProvider> above it.");
  return v;
}
/**
 * A page declares what it shows the assistant (its name, the selected entity, filters, scopes, time, access). The items
 * replace the previous page's on mount and clear on unmount. Pass a stable list (it is compared by content).
 */
export function useAssistantContext(items: AssistantContextItem[]) {
  const v = useContext(AssistantCtx);
  const set = v?.setPageContext;
  const key = JSON.stringify(items);
  useEffect(() => { set && set(items); }, [key, set]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { set && set([]); }, [set]);
}
