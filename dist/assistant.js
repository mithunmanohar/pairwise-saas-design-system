import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// The assistant: a contextual helper that reads as Pairwise, not a separate chat product (DECISIONS #29).
// AI-authored content is marked by an icon, a label and its layout, never by colour. Everything here composes existing
// parts: Drawer (docked or modal), Button, ActionMenu, Popover, cmdk, FileUpload, Avatar, ProgressBar, StatusBadge,
// StateBlock, Modal. The app owns the model: these components take messages and state as props, and never call one.
import * as React from "react";
import * as RPopover from "@radix-ui/react-popover";
import { Command } from "cmdk";
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
const KIND_WORD = {
    page: "Page", entity: "Resource", filter: "Filter", ownership: "Ownership scope", runtime: "Runtime scope",
    time: "Time range", permission: "Your access", attachment: "Attachment",
};
const KIND_ICON = {
    page: "page", entity: "cube", filter: "filter", ownership: "building", runtime: "server", time: "clock", permission: "lock", attachment: "file",
};
const ctxIcon = (c) => (c.entity ? entityIcon[c.entity] : KIND_ICON[c.kind]);
const ctxWord = (c) => (c.kind === "entity" && c.entity ? entityLabel[c.entity] : KIND_WORD[c.kind]);
function AddContext({ offer, onAdd }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const inputRef = useRef(null);
    const t = q.trim().toLowerCase();
    const shown = offer.filter((c) => !t || (c.label + " " + ctxWord(c) + " " + (c.detail ?? "")).toLowerCase().includes(t));
    const hl = useCmdkHighlight(shown.map((c) => c.id));
    const listRef = useCmdkAria(inputRef, null);
    return (_jsx(Popover, { label: "Add context", width: 300, open: open, onOpenChange: (o) => { setOpen(o); if (!o)
            setQ(""); }, trigger: _jsx(Button, { size: "sm", variant: "ghost", icon: "plus", children: "Add" }), children: _jsxs(Command, { shouldFilter: false, loop: true, label: "Add context", value: hl.value, onValueChange: hl.onValueChange, onKeyDown: hl.onKeyDown, onPointerMoveCapture: hl.onPointerMoveCapture, children: [_jsxs("div", { className: "pw-combo__search", children: [_jsx(Icon, { name: "search", size: 14 }), _jsx(Command.Input, { ref: inputRef, className: "pw-combo__in", placeholder: "Search this page\u2026", value: q, onValueChange: (v) => { hl.onQuery(); setQ(v); }, autoFocus: true })] }), _jsxs(Command.List, { ref: listRef, className: "pw-list pw-combo__list", label: "Context you can add", children: [!shown.length ? _jsx(Command.Empty, { className: "pw-list__empty pw-muted", children: "Nothing to add." }) : null, shown.map((c) => (_jsxs(Command.Item, { value: c.id, onSelect: () => { onAdd(c); setOpen(false); setQ(""); }, className: "pw-list__item", children: [_jsx("span", { className: "pw-list__check", children: _jsx(Icon, { name: ctxIcon(c), size: 14 }) }), _jsxs("span", { className: "pw-search__txt", children: [_jsx("span", { children: c.label }), c.detail ? _jsx("span", { className: "pw-caption pw-muted", children: c.detail }) : null] }), _jsx("span", { className: "pw-muted pw-list__meta", children: ctxWord(c) })] }, c.id)))] })] }) }));
}
/**
 * What the assistant can see: the page, the selected entity, filters, the ownership scope, the runtime scope, the time
 * range and the person's access, as icon + word chips. "All context" lists every item with its path, and the
 * ownership scope can be changed there with the existing ScopePicker (the full tree never appears in the panel).
 */
export function ContextBar({ items, onRemove, available = [], onAdd, scope, max = 3 }) {
    const shown = items.slice(0, max), rest = items.length - shown.length;
    const canRemove = (c) => c.removable !== false && !!onRemove;
    const offer = available.filter((a) => !items.some((i) => i.id === a.id));
    return (_jsxs("div", { className: "pw-ctx", role: "group", "aria-label": "Context the assistant can see", children: [_jsx("ul", { className: "pw-ctx__chips", children: shown.map((c) => (_jsx("li", { children: _jsxs("span", { className: "pw-chip pw-ctx__chip", title: ctxWord(c) + ": " + c.label, children: [_jsx(Icon, { name: ctxIcon(c), size: 12 }), _jsxs("span", { children: [_jsxs("span", { className: "pw-sr", children: [ctxWord(c), ": "] }), c.label] }), canRemove(c) ? _jsx("button", { type: "button", className: "pw-chip__x", "aria-label": "Remove " + c.label + " from context", onClick: () => onRemove(c.id), children: _jsx(Icon, { name: "x", size: 12 }) }) : null] }) }, c.id))) }), items.length ? (_jsx(Popover, { label: "Context the assistant can see", width: 340, align: "start", trigger: _jsx(Button, { size: "sm", variant: "ghost", children: rest > 0 ? `+${rest} more` : "All context" }), children: _jsx("ul", { className: "pw-ctxi", children: items.map((c) => (_jsxs("li", { className: "pw-ctxi__item", children: [_jsx(Icon, { name: ctxIcon(c), size: 14, className: "pw-ctxi__icon" }), _jsxs("div", { className: "pw-ctxi__main", children: [_jsx("span", { className: "pw-caption pw-muted", children: ctxWord(c) }), c.kind === "ownership" && scope
                                        ? _jsx(ScopePicker, { nodes: scope.nodes, value: scope.value, onChange: scope.onChange, loadChildren: scope.loadChildren, label: "Change ownership scope" })
                                        : _jsx("span", { className: "pw-body-strong", children: c.label }), c.path && c.path.length ? _jsx(PathLine, { path: c.path, direct: "" }) : null, c.detail ? _jsx("span", { className: "pw-caption pw-muted", children: c.detail }) : null] }), canRemove(c) ? _jsx(Button, { size: "sm", variant: "ghost", icon: "x", "aria-label": "Remove " + c.label + " from context", onClick: () => onRemove(c.id) }) : null] }, c.id))) }) })) : _jsx("span", { className: "pw-caption pw-muted", children: "No context" }), onAdd && offer.length ? _jsx(AddContext, { offer: offer, onAdd: onAdd }) : null] }));
}
/* ---------- PromptComposer ---------- */
// The textarea sits inside the cmdk root. While the "@" or "/" list is open, cmdk owns the arrows and Enter (they
// bubble to it); otherwise the textarea keeps them, so cmdk never sees them. No list navigation is written here.
const NAV = ["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", "Enter"];
function findTrigger(before, mentions, commands) {
    const m = mentions ? /(^|\s)@([^\s@]*)$/.exec(before) : null;
    if (m)
        return { kind: "mention", q: m[2] ?? "", start: before.length - (m[2] ?? "").length - 1 };
    const c = commands ? /^\/([^\s]*)$/.exec(before) : null;
    if (c)
        return { kind: "command", q: c[1] ?? "", start: 0 };
    return null;
}
export function PromptComposer({ value: valueProp, defaultValue = "", onChange, onSubmit, busy, onStop, label = "Ask the assistant", placeholder, maxLength, disabled, disabledReason, suggestions, onSuggestion, templates, mentions, onMentionQuery, mentionsLoading, commands, attachments, context, hint, error, }) {
    const [inner, setInner] = useState(defaultValue);
    const value = valueProp ?? inner;
    const set = (v) => { if (valueProp === undefined)
        setInner(v); onChange && onChange(v); };
    const ta = useRef(null);
    const boxRef = useRef(null);
    const [caret, setCaret] = useState(0);
    const [closedAt, setClosedAt] = useState(null);
    const [localError, setLocalError] = useState("");
    const over = maxLength != null && value.length > maxLength;
    const trigger = findTrigger(value.slice(0, caret), !!mentions, !!commands);
    const triggerKey = trigger ? trigger.kind + trigger.start : null;
    const pool = trigger?.kind === "mention" ? mentions ?? [] : trigger ? commands ?? [] : [];
    const t = trigger ? trigger.q.toLowerCase() : "";
    const opts = pool.filter((o) => !t || [o.label, o.value, o.description, ...(o.keywords || [])].join(" ").toLowerCase().includes(t)).slice(0, 8);
    const loadingList = trigger?.kind === "mention" && !!mentionsLoading;
    const menuOpen = !!trigger && closedAt !== triggerKey && !disabled && (opts.length > 0 || loadingList);
    const hl = useCmdkHighlight(opts.map((o) => o.value));
    const listRef = useCmdkAria(ta, null);
    useEffect(() => { if (trigger?.kind === "mention" && onMentionQuery)
        onMentionQuery(trigger.q); }, [trigger?.kind, trigger?.q]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { hl.onQuery(); }, [triggerKey, t]); // eslint-disable-line react-hooks/exhaustive-deps
    // The list unmounts when it closes; don't leave the textarea pointing at an option that no longer exists.
    React.useLayoutEffect(() => { if (!menuOpen)
        ta.current?.removeAttribute("aria-activedescendant"); }, [menuOpen]);
    const f = useField(undefined, disabled && disabledReason ? disabledReason : hint, error || localError || (over ? `Shorten it to ${maxLength} characters.` : undefined));
    const shownError = error || localError || (over ? `Shorten it to ${maxLength} characters.` : "");
    const moveCaret = (pos) => requestAnimationFrame(() => { const el = ta.current; if (!el)
        return; el.focus(); el.setSelectionRange(pos, pos); setCaret(pos); });
    const insert = (o) => {
        if (!trigger)
            return;
        const token = trigger.kind === "mention" ? "@" + o.label + " " : "/" + o.value + " ";
        const next = value.slice(0, trigger.start) + token + value.slice(caret);
        set(next);
        moveCaret(trigger.start + token.length);
    };
    const send = () => {
        if (busy || disabled)
            return;
        const text = value.trim();
        if (!text) {
            setLocalError("Type a question first.");
            return;
        }
        if (over)
            return;
        setLocalError("");
        onSubmit(text);
        set("");
        setCaret(0);
    };
    const pick = (s) => {
        const text = s.prompt ?? s.label;
        if (s.insert) {
            set(text);
            const i = text.indexOf("…");
            moveCaret(i >= 0 ? i : text.length);
            return;
        }
        if (onSuggestion)
            onSuggestion(s);
        else
            onSubmit(text);
    };
    return (_jsxs(Command, { className: "pw-composer", shouldFilter: false, loop: true, vimBindings: false, label: "", value: hl.value, onValueChange: hl.onValueChange, onKeyDown: hl.onKeyDown, onPointerMoveCapture: hl.onPointerMoveCapture, children: [suggestions && suggestions.length && !value ? (_jsx("div", { className: "pw-composer__sugg", role: "group", "aria-label": "Suggestions", children: suggestions.map((s) => _jsx(Button, { size: "sm", icon: s.icon, className: "pw-prompt", disabled: disabled || busy, onClick: () => pick(s), children: s.label }, s.label)) })) : null, context, _jsxs(RPopover.Root, { open: menuOpen, onOpenChange: (o) => { if (!o)
                    setClosedAt(triggerKey); }, children: [_jsx(RPopover.Anchor, { asChild: true, children: _jsxs("div", { ref: boxRef, className: cx("pw-composer__box", shownError && "is-error", disabled && "is-disabled"), children: [_jsx("label", { htmlFor: f.id, className: "pw-sr", children: label }), _jsx("textarea", { ref: ta, id: f.id, "data-autofocus": true, className: "pw-composer__in", rows: 2, value: value, disabled: disabled, placeholder: placeholder ?? "Ask about this page" + (mentions ? ", @ to mention" : "") + (commands ? ", / for commands" : ""), "aria-describedby": f.describedBy, "aria-invalid": shownError ? true : undefined, "aria-autocomplete": mentions || commands ? "list" : undefined, onChange: (e) => { set(e.target.value); setCaret(e.target.selectionStart); if (localError)
                                        setLocalError(""); }, onSelect: (e) => setCaret(e.currentTarget.selectionStart), onKeyDown: (e) => {
                                        if (menuOpen)
                                            return; // cmdk handles the list's keys
                                        if (NAV.includes(e.key))
                                            e.stopPropagation();
                                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                            e.preventDefault();
                                            send();
                                        }
                                    } }), _jsxs("div", { className: "pw-composer__tools", children: [attachments ? _jsx(FileUpload, { variant: "button", label: "Attach files", multiple: true, disabled: disabled, ...attachments }) : null, templates && templates.length ? (_jsx(ActionMenu, { label: "Prompt templates", align: "start", trigger: _jsx(Button, { size: "sm", variant: "ghost", icon: "page", disabled: disabled, children: "Templates" }), items: templates.map((tp) => ({ label: tp.label, icon: tp.icon, onSelect: () => pick({ ...tp, insert: tp.insert ?? true }) })) })) : null, _jsxs("span", { className: "pw-composer__end", children: [maxLength ? _jsxs("span", { className: cx("pw-caption pw-num", over ? "pw-tone--critical" : "pw-muted"), children: [value.length, " / ", maxLength] }) : null, busy
                                                    ? _jsx(Button, { size: "sm", icon: "stop", onClick: onStop, children: "Stop" }, "stop")
                                                    : _jsx(Button, { size: "sm", variant: "primary", icon: "send", "aria-label": "Send", disabled: disabled || over, onClick: send }, "send")] })] })] }) }), _jsx(RPopover.Portal, { children: _jsx(RPopover.Content, { className: "pw-popover pw-composer__pop", side: "top", align: "start", sideOffset: 4, collisionPadding: 8, "aria-label": trigger?.kind === "command" ? "Commands" : "Mentions", onOpenAutoFocus: (e) => e.preventDefault(), onCloseAutoFocus: (e) => e.preventDefault(), onInteractOutside: (e) => { if (boxRef.current?.contains(e.target))
                                e.preventDefault(); }, children: _jsxs(Command.List, { ref: listRef, className: "pw-list pw-composer__list", label: trigger?.kind === "command" ? "Commands" : "Mentions", onMouseDown: (e) => e.preventDefault(), children: [loadingList ? _jsx(Command.Loading, { className: "pw-list__empty pw-muted", children: "Loading\u2026" }) : null, opts.map((o) => (_jsxs(Command.Item, { value: o.value, onSelect: () => insert(o), className: "pw-list__item", children: [_jsx("span", { className: "pw-list__check", children: o.entity ? _jsx(Icon, { name: entityIcon[o.entity], size: 14 }) : o.icon ? _jsx(Icon, { name: o.icon, size: 14 }) : null }), _jsxs("span", { className: "pw-search__txt", children: [_jsx("span", { className: trigger?.kind === "command" ? "pw-mono" : undefined, children: trigger?.kind === "command" ? "/" + o.value : o.label }), o.description ? _jsx("span", { className: "pw-caption pw-muted", children: o.description }) : null] }), _jsx("span", { className: "pw-muted pw-list__meta", children: o.group ?? (o.entity ? entityLabel[o.entity] : "") })] }, o.value)))] }) }) })] }), f.hintId ? _jsx("div", { id: f.hintId, className: "pw-formfield__hint", children: disabled && disabledReason ? disabledReason : hint }) : null, f.errId ? _jsxs("div", { id: f.errId, className: "pw-formfield__error", children: [_jsx(Icon, { name: "critical", size: 12 }), _jsx("span", { children: shownError })] }) : null] }));
}
/* ---------- AssistantMessage ---------- */
const REPORT_REASONS = ["Inaccurate or made up", "Harmful or unsafe", "Out of date", "Something else"];
function ReportDialog({ open, onClose, onReport }) {
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [detail, setDetail] = useState("");
    const close = () => { onClose(); setDetail(""); setReason(REPORT_REASONS[0]); };
    return (_jsxs(Modal, { open: open, title: "Report a problem with this answer", onClose: close, actions: _jsxs(_Fragment, { children: [_jsx(Button, { onClick: close, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: () => { onReport({ reason, detail: detail.trim() }); close(); toast({ tone: "healthy", title: "Report sent", body: "Thanks. It helps us improve the assistant." }); }, children: "Send report" })] }), children: [_jsx(RadioGroup, { label: "What went wrong?", options: REPORT_REASONS, value: reason, onChange: setReason }), _jsx(Textarea, { label: "Details", hint: "Optional. Don't include passwords or secrets.", rows: 3, value: detail, onChange: (e) => setDetail(e.target.value) })] }));
}
/**
 * One turn of a conversation, as a list item (AssistantPanel puts them in a list). The assistant's and agents' turns
 * carry the assistant icon or the agent's initials, their name, and their actions; the person's turns sit on the right.
 * While streaming, the body is aria-busy and nothing is announced; the panel announces the finished answer once.
 */
export function AssistantMessage({ author, status = "done", time, children, sources, onSource, statusText, onRetry, followUps, onFollowUp, feedback, onFeedback, onReport, copyText, onRegenerate, provenance, }) {
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
    return (_jsxs("li", { className: cx("pw-msg", person ? "pw-msg--person" : "pw-msg--ai", "is-" + status), "aria-busy": status === "streaming" || undefined, children: [_jsxs("div", { className: "pw-msg__head", children: [person ? null : _jsx(Avatar, { name: author.name, icon: author.kind === "assistant" ? "assistant" : undefined, size: 20, decorative: true }), _jsx("span", { className: "pw-body-strong", children: author.name }), author.description ? _jsx("span", { className: "pw-caption pw-muted", children: author.description }) : null, time ? _jsx("span", { className: "pw-caption pw-muted", children: time }) : null, status === "stopped" ? _jsx(StatusBadge, { status: "unknown", label: "Stopped", size: "sm" }) : status === "error" ? _jsx(StatusBadge, { status: "critical", label: "Failed", size: "sm" }) : null] }), children != null && children !== false ? _jsx("div", { className: "pw-msg__body", children: children }) : null, status === "streaming" ? _jsx("div", { className: "pw-msg__progress", children: _jsx(ProgressBar, { value: null, label: statusText || "Responding…", showValue: false }) }) : null, status === "error" ? (_jsxs("div", { className: "pw-msg__error", children: [_jsxs("span", { className: "pw-tone--critical pw-msg__errtxt", children: [_jsx(Icon, { name: "critical", size: 14 }), _jsx("span", { children: statusText || "The assistant couldn't finish this answer." })] }), onRetry ? _jsx(Button, { size: "sm", icon: "refresh", onClick: onRetry, children: "Retry" }) : null] })) : null, !person && sources && sources.length ? _jsx(SourceList, { sources: sources, onOpen: onSource }) : null, !person && settled && (onFeedback || copyText || onRegenerate || provenance || onReport) ? (_jsxs("div", { className: "pw-msg__acts", role: "group", "aria-label": "Actions for " + author.name + "'s answer", children: [onFeedback && status === "done" ? _jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", variant: "ghost", icon: "thumb-up", "aria-pressed": feedback === "helpful", onClick: () => onFeedback(feedback === "helpful" ? null : "helpful"), children: "Helpful" }), _jsx(Button, { size: "sm", variant: "ghost", icon: "thumb-down", "aria-pressed": feedback === "not-helpful", onClick: () => onFeedback(feedback === "not-helpful" ? null : "not-helpful"), children: "Not helpful" })] }) : null, copyText ? _jsx(CopyButton, { value: copyText, label: "Copy answer" }) : null, onRegenerate ? (status === "done"
                        ? _jsx(Tooltip, { content: "Regenerate", children: _jsx(Button, { size: "sm", variant: "ghost", icon: "refresh", "aria-label": "Regenerate", onClick: onRegenerate }) })
                        : _jsx(Button, { size: "sm", variant: "ghost", icon: "refresh", onClick: onRegenerate, children: "Regenerate" })) : null, provenance ? (_jsx(Popover, { label: "About this answer", width: 300, trigger: _jsx(Button, { size: "sm", variant: "ghost", children: "About" }), children: _jsxs("div", { className: "pw-msg__about", children: [_jsxs("span", { className: "pw-caption pw-muted", children: ["Written by ", author.name, ". Check important details before acting on them."] }), _jsx(KeyValueList, { items: about, label: "About this answer" })] }) })) : null, onReport ? _jsx(ActionMenu, { label: "More actions for this answer", items: [{ label: "Report a problem", icon: "flag", onSelect: () => setReporting(true) }] }) : null] })) : null, !person && status === "done" && followUps && followUps.length ? (_jsx("div", { className: "pw-msg__follow", role: "group", "aria-label": "Suggested follow-ups", children: followUps.map((s) => _jsx(Button, { size: "sm", icon: s.icon, className: "pw-prompt", onClick: () => onFollowUp && onFollowUp(s), children: s.label }, s.label)) })) : null, onReport ? _jsx(ReportDialog, { open: reporting, onClose: () => setReporting(false), onReport: onReport }) : null] }));
}
/* ---------- AssistantPanel ---------- */
/**
 * The assistant's panel: a docked Drawer beside the content at 1280 px and wider (AppShell sets `placement`), a modal
 * drawer below that, and with `expanded` the whole content area. Header: new conversation, history, expand, close.
 * One polite live region reads `announcement` (a finished, stopped or failed answer), never each streamed word.
 */
export function AssistantPanel({ open, onClose, title = "Assistant", expanded, onExpandedChange, conversations = [], activeId, onSelectConversation, onNewConversation, state = "ready", errorDetail, onRetry, empty, announcement, composer, children, placement: placementProp, contained, }) {
    const slot = useContext(AssistantSlot);
    const placement = placementProp ?? slot?.placement ?? "docked";
    const docked = placement === "docked" || !!contained;
    const covering = !!open && docked && !!expanded && !contained;
    const setCovering = slot?.setCovering;
    useEffect(() => { if (!setCovering)
        return; setCovering(covering); return () => setCovering(false); }, [covering, setCovering]);
    const endRef = useRef(null);
    const count = React.Children.toArray(children).length;
    const hasMessages = count > 0;
    // A new turn starts at the top of the panel, with the question just above the answer, so a long structured answer
    // reads from its beginning (the conclusion first). The panel never chases the streaming text down.
    const seen = useRef(-1);
    React.useLayoutEffect(() => {
        if (!open) {
            seen.current = -1;
            return;
        }
        const sc = endRef.current?.closest(".pw-drawer__b");
        if (!sc || count === seen.current)
            return;
        const first = seen.current < 0;
        seen.current = count;
        const msgs = sc.querySelectorAll(".pw-msgs > .pw-msg");
        const people = sc.querySelectorAll(".pw-msgs > .pw-msg--person");
        const target = people[people.length - 1] ?? msgs[msgs.length - 1];
        if (!target)
            return;
        sc.scrollTop += target.getBoundingClientRect().top - sc.getBoundingClientRect().top - (first ? 0 : 8);
    }, [count, open, state]);
    const active = conversations.find((c) => c.id === activeId);
    const actions = _jsxs(_Fragment, { children: [onNewConversation ? _jsx(Tooltip, { content: "New conversation", children: _jsx(Button, { variant: "ghost", icon: "plus", "aria-label": "New conversation", onClick: onNewConversation }) }) : null, conversations.length ? (_jsx(ActionMenu, { label: "Conversation history", trigger: _jsx(Button, { variant: "ghost", icon: "history", "aria-label": "Conversation history" }), items: [{ heading: "Recent conversations" }, ...conversations.map((c) => ({ label: c.title, meta: c.updated, checked: c.id === activeId, onSelect: () => onSelectConversation && onSelectConversation(c.id) }))] })) : null, docked && !contained && onExpandedChange ? (_jsx(Tooltip, { content: expanded ? "Dock beside the page" : "Expand", children: _jsx(Button, { variant: "ghost", icon: expanded ? "collapse" : "expand", "aria-label": expanded ? "Dock beside the page" : "Expand", onClick: () => onExpandedChange(!expanded) }) })) : null] });
    const body = state === "loading" ? _jsx(StateBlock, { kind: "loading", rows: 3 })
        : state === "error" ? _jsx(StateBlock, { kind: "error", title: "The assistant isn't available", body: "Your work on this page is unaffected.", detail: errorDetail, action: onRetry ? "Retry" : undefined, onAction: onRetry })
            : state === "no-access" ? _jsx(StateBlock, { kind: "no-access", title: "The assistant isn't turned on for you", body: "Ask an administrator of your organization for access." })
                : state === "empty" || !hasMessages ? _jsx("div", { className: "pw-asst__empty", children: empty ?? _jsx(StateBlock, { kind: "empty", title: "Ask about what you're looking at", body: "The assistant sees this page and the scope you've chosen. It answers with sources and can't change anything." }) })
                    : _jsx("ol", { className: "pw-msgs", "aria-label": "Conversation", children: children });
    return (_jsxs(Drawer, { open: open, onClose: onClose, title: title, subtitle: active ? active.title : undefined, docked: docked, actions: actions, className: cx("pw-asst", docked && expanded && !contained && "is-expanded", contained && "is-contained"), footer: state === "no-access" || state === "loading" ? undefined : composer, children: [body, _jsx("div", { ref: endRef, className: "pw-asst__end" }), _jsx("div", { className: "pw-sr", role: "status", "aria-live": "polite", children: announcement })] }));
}
const AssistantCtx = createContext(null);
/**
 * Holds whether the assistant is open or expanded and what the current page shows, so launchers (top bar, page and row
 * menus, the command palette) can call ask() with the right context. It makes no model calls: `onAsk` hands the prompt
 * and context to the app.
 */
export function AssistantProvider({ onAsk, defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);
    const [expanded, setExpanded] = useState(false);
    const [context, setPageContext] = useState([]);
    const askRef = useRef(onAsk);
    askRef.current = onAsk;
    const ctxRef = useRef(context);
    ctxRef.current = context;
    const api = useMemo(() => ({
        open, setOpen, toggle: () => setOpen((o) => !o), expanded, setExpanded, context, setPageContext,
        ask: (prompt, extra = []) => {
            setOpen(true);
            const merged = [...ctxRef.current.filter((c) => !extra.some((e) => e.id === c.id)), ...extra];
            askRef.current && askRef.current(prompt, merged);
        },
    }), [open, expanded, context]);
    return _jsx(AssistantCtx.Provider, { value: api, children: children });
}
/** The assistant's state and ask(), inside an AssistantProvider. */
export function useAssistant() {
    const v = useContext(AssistantCtx);
    if (!v)
        throw new Error("useAssistant needs an <AssistantProvider> above it.");
    return v;
}
/**
 * A page declares what it shows the assistant (its name, the selected entity, filters, scopes, time, access). The items
 * replace the previous page's on mount and clear on unmount. Pass a stable list (it is compared by content).
 */
export function useAssistantContext(items) {
    const v = useContext(AssistantCtx);
    const set = v?.setPageContext;
    const key = JSON.stringify(items);
    useEffect(() => { set && set(items); }, [key, set]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => () => { set && set([]); }, [set]);
}
//# sourceMappingURL=assistant.js.map