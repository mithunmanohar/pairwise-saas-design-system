// The demo's assistant. The Pages site is static, so answers are scripted: each one is built from the demo's fictional
// data for the current page, ownership scope, runtime scope and time range (seeded like vary.ts, so the same question
// in the same selection always gets the same answer), then "streamed" a few words at a time. No model, no API keys.
// Conversations live in a module store so they survive moving between pages.
import { useSyncExternalStore, type ReactNode } from "react";
import {
  AssistantPanel, AssistantMessage, PromptComposer, ContextBar, Markdown, ResourceCard, Disclosure, CodeBlock, Metric, StateBlock,
  useAssistant, type AssistantContextItem, type AssistantSource, type AssistantFeedback, type AssistantMessageStatus, type PromptSuggestion, type PromptCommand, type TopBarAssistant, type UploadItem,
} from "@pairwise/ui";
import { services, incidents, incidentById, isOpen, deploys, repos, members, workspaces, serviceByName } from "./data";
import { RESOURCES, RESOURCE_TYPES, SCOPE_TREE, inScope, pathBelow, rollup, serviceOwner, unitById, workspaceOwner, type Resource } from "./org";
import { share, varyInt, varyRound, type Selection } from "./vary";

/* ---------- The store ---------- */
type Extra =
  | { type: "resources"; ids: string[] }
  | { type: "metric"; label: string; value: string; delta: number; window: string }
  | { type: "steps"; steps: string[] }
  | { type: "diff"; title: string; code: string };
interface Answer { markdown: string; sources: AssistantSource[]; extras: Extra[]; followUps: PromptSuggestion[]; announce: string }
interface Msg { id: string; who: "person" | "assistant"; text: string; status: AssistantMessageStatus; answer?: Answer; feedback?: AssistantFeedback; context?: string[] }
interface Conv { id: string; title: string; updated: string; messages: Msg[] }
interface State { convs: Conv[]; activeId: string | null; busy: string | null; announcement: string; unread: boolean; draft: string; removed: string[]; added: AssistantContextItem[]; files: UploadItem[] }
let state: State = { convs: [], activeId: null, busy: null, announcement: "", unread: false, draft: "", removed: [], added: [], files: [] };
const subs = new Set<() => void>();
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; subs.forEach((f) => f()); };
const useStore = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => state);
let seq = 0;
const nextId = () => "m" + ++seq;
const now = () => "14:" + String(52 + (seq % 7)).padStart(2, "0");

/* ---------- What the current page is, for answers and suggestions ---------- */
export interface PageInfo { section: string; id?: string; label: string; sel: Selection; open: boolean }
let page: PageInfo | null = null;
/** Frame reports the page and selection on every render, so ask() knows where it was asked. */
export const setAssistantPage = (p: PageInfo) => { page = p; };

/* ---------- Scripted answers ---------- */
const scopeName = (sel: Selection) => (sel.scope ? unitById(sel.scope)?.label ?? "this scope" : "the whole organisation");
const where = (sel: Selection) => `**${scopeName(sel)}**, ${sel.env} / ${sel.cloud}`;
const money = (k: number) => `$${k.toFixed(1)}k`;
const src = (id: string, title: string, extra: Partial<AssistantSource> = {}): AssistantSource => ({ id, title, ...extra });
const svcRes = (name: string) => "svc:" + name;

function attention(sel: Selection): Answer {
  const r = rollup(sel.scope, sel.mode);
  const open = r.openIncidents;
  const degraded = services.filter((s) => s.status !== "healthy" && inScope(serviceOwner(s.name), sel.scope, sel.mode));
  if (!open.length && !degraded.length) {
    return { markdown: `Nothing needs attention in ${where(sel)} right now. Every service is within its objective and there are no open incidents [1].`,
      sources: [src("svc", "Service health", { kind: "Services" })], extras: [], followUps: [{ label: "What changed today?" }], announce: "Assistant replied: nothing needs attention." };
  }
  const lines = [
    `${open.length ? `**${open.length} open incident${open.length === 1 ? "" : "s"}** and ` : ""}**${degraded.length} degraded service${degraded.length === 1 ? "" : "s"}** in ${where(sel)} [1]:`,
    "",
    ...open.map((i) => `- \`${i.id}\` ${i.title}, severity ${i.sev}, ${i.state.toLowerCase()} for ${i.duration} [2].`),
    ...degraded.map((s) => `- \`${s.name}\`: p95 ${varyInt(sel, "p95-" + s.name, s.p95)} ms against a ${s.slo} ms objective.`),
    "",
    open.some((i) => i.id === "INC-2041") ? "The checkout slowdown started 2 minutes after deploy `v2.14.1` [3]. Rolling back is the quickest fix." : "None of them followed a deploy in the last hour.",
  ];
  return {
    markdown: lines.join("\n"),
    sources: [src("svc", "Service health", { kind: "Services" }), src("inc", "Open incidents", { kind: "Incidents" }), src("dep", "Deploy dep_9a1, checkout-api v2.14.1", { kind: "Deployment", excerpt: "PR #1482 by Dev B, 14:29" })],
    extras: [{ type: "resources", ids: degraded.map((s) => svcRes(s.name)).slice(0, 3) }],
    followUps: [{ label: "Investigate INC-2041" }, { label: "Draft a status update" }],
    announce: `Assistant replied: ${open.length} open incidents and ${degraded.length} degraded services.`,
  };
}
function spend(sel: Selection): Answer {
  const total = varyRound(sel, "spend", 46.5 * share(sel)); // the same figure as Usage and cost's Spend
  const ws = workspaces.filter((w) => inScope(workspaceOwner(w.name), sel.scope, sel.mode)).sort((a, b) => b.change - a.change);
  const top = ws[0];
  const rise = varyRound(sel, "spend-delta", 9.4, 1, 0.8);
  const lines = [
    `Spend in ${where(sel)} is **${money(total)}** this month, **${rise} %** above the same day last month [1].`,
    "",
    top ? `Most of the rise is \`${top.name}\` (${top.team}), up ${top.change} %${top.tokens ? `, from ${top.tokens}M model tokens` : ""} [2].` : "No workspace in this scope rose by more than 5 %.",
    "",
    "| Workspace | Spend | Budget | Change |", "| --- | --- | --- | --- |",
    ...ws.slice(0, 4).map((w) => `| ${w.name} | ${money(w.spend)} | ${money(w.budget)} | ${w.change > 0 ? "+" : ""}${w.change} % |`),
  ];
  const near = ws.filter((w) => w.spend / w.budget >= 0.92);
  if (near.length) lines.push("", `${near.map((w) => "`" + w.name + "`").join(" and ")} ${near.length === 1 ? "is" : "are"} within 8 % of budget.`);
  return {
    markdown: lines.join("\n"),
    sources: [src("cost", "Usage and cost, month to date", { kind: "Report", updated: "Today 06:00" }), src("ws", "Workspace budgets", { kind: "Report" })],
    extras: [{ type: "metric", label: "Spend, month to date", value: money(total), delta: rise, window: "same day last month" }],
    followUps: [{ label: "Which workspaces are near budget?" }, { label: "Break it down by squad" }],
    announce: `Assistant replied: spend is ${money(total)}, up ${rise} percent.`,
  };
}
function investigate(sel: Selection, id: string): Answer {
  const inc = incidentById(id) ?? incidents[0]!;
  const dep = deploys.find((d) => d.service === inc.service);
  const svc = serviceByName(inc.service);
  return {
    markdown: [
      `\`${inc.id}\` (${inc.title}) most likely comes from ${dep ? `deploy \`${dep.version}\` of \`${inc.service}\` at ${dep.when} [1]` : "a change to its dependencies"}.`,
      "",
      `- The alert fired at ${inc.events.find((e) => e.kind === "alert")?.time ?? inc.started} [2]${svc ? `: p95 ${varyInt(sel, "p95-" + svc.name, svc.p95)} ms against ${svc.slo} ms` : ""}.`,
      dep ? `- ${dep.pr} changed the retry policy, which doubles calls to the payments provider under load [3].` : "- No deploy in the last hour.",
      "- Error rate is unchanged, so customers see slow checkouts, not failures.",
      "",
      `**Suggested next step:** roll back to the previous version. It's a proposal: nothing has been changed.`,
    ].join("\n"),
    sources: [src("dep", `Deploy ${dep?.id ?? "dep_9a1"}, ${inc.service} ${dep?.version ?? ""}`.trim(), { kind: "Deployment", updated: dep?.when }),
      src("alert", "Alert: p95 above SLO for 2 min", { kind: "Alert", excerpt: inc.events.find((e) => e.kind === "alert")?.body }),
      src("pr", `Pull request ${dep?.pr ?? "#1482"}`, { entity: "repository", path: [{ id: "r", label: "sample-repo" }] })],
    extras: [
      { type: "steps", steps: ["Read the incident timeline and the alert", `Compared ${inc.service}'s latency with deploys in the last 2 hours`, "Read the diff of the deploy that preceded the alert", "Checked the error rate for failed payments"] },
      { type: "diff", title: "retry.yaml in " + (dep?.pr ?? "#1482"), code: "@@ payments client @@\n timeout: 2s\n-retries: 1\n+retries: 3\n+retry_on: [timeout, 503]" },
    ],
    followUps: [{ label: "Draft a status update" }, { label: "Who should review the rollback?" }],
    announce: `Assistant replied: ${inc.id} most likely comes from deploy ${dep?.version ?? ""}.`,
  };
}
function owns(sel: Selection): Answer {
  const r = rollup(sel.scope, sel.mode);
  const by = (t: Resource["type"]) => r.resources.filter((x) => x.type === t).length;
  const bad = r.resources.filter((x) => x.status === "warning" || x.status === "critical");
  return {
    markdown: [
      `${where(sel)} owns **${r.resources.length} resources**${sel.mode === "direct" ? " directly" : ", including everything below it"} [1]:`,
      "",
      `- ${by("service")} services, ${by("repository")} repositories and ${by("workspace")} cost workspaces`,
      `- ${r.runs.length} CI runs and ${r.deploys.length} deploys today`,
      "",
      bad.length ? `${bad.length} need${bad.length === 1 ? "s" : ""} attention:` : "All of them are healthy.",
    ].join("\n"),
    sources: [src("explorer", "Resource explorer", { kind: "Ownership" })],
    extras: [{ type: "resources", ids: bad.map((x) => x.id).slice(0, 3) }],
    followUps: [{ label: "What changed today?" }, { label: "Why did spend rise this month?" }],
    announce: `Assistant replied: ${r.resources.length} resources, ${bad.length} need attention.`,
  };
}
function service(sel: Selection, name: string): Answer {
  const s = serviceByName(name)!;
  const dep = deploys.find((d) => d.service === name);
  const p95 = varyInt(sel, "p95-" + name, s.p95);
  return {
    markdown: s.status === "healthy"
      ? `\`${name}\` is healthy: p95 is ${p95} ms against a ${s.slo} ms objective, with ${Math.round(s.budget * 100)} % of its error budget left [1].`
      : `\`${name}\` is degraded: p95 is **${p95} ms** against a ${s.slo} ms objective [1].${dep ? ` It started after deploy \`${dep.version}\` at ${dep.when} [2].` : ""}`,
    sources: [src("svc", `${name} latency`, { entity: "webapp" }), ...(dep ? [src("dep", `Deploy ${dep.id}, ${name} ${dep.version}`, { kind: "Deployment" })] : [])],
    extras: [{ type: "resources", ids: [svcRes(name)] }],
    followUps: s.status === "healthy" ? [{ label: "What changed today?" }] : [{ label: "Investigate INC-2041" }],
    announce: `Assistant replied: ${name} is ${s.status === "healthy" ? "healthy" : "degraded"}.`,
  };
}
function statusUpdate(sel: Selection): Answer {
  const inc = incidents.find((i) => isOpen(i) && inScope(serviceOwner(i.service), sel.scope, sel.mode)) ?? incidents[0]!;
  return {
    markdown: ["Here's a draft for the status page. Edit it before you post it:", "", `> **Slower checkouts.** Since ${inc.started.replace("Today ", "")}, some checkouts take longer than usual. Payments are not failing. We've found the cause and are rolling back a change. Next update in 30 minutes.`].join("\n"),
    sources: [src("inc", `${inc.id} timeline`, { kind: "Incident" })], extras: [], followUps: [{ label: "Make it shorter" }],
    announce: "Assistant replied with a draft status update.",
  };
}
function changes(sel: Selection): Answer {
  const d = rollup(sel.scope, sel.mode).deploys;
  return {
    markdown: d.length ? [`${d.length} deploys in ${where(sel)} today [1]:`, "", ...d.slice(0, 5).map((x) => `- ${x.when} \`${x.service}\` ${x.version}: ${x.statusLabel.toLowerCase()}`)].join("\n") : `No deploys in ${where(sel)} today [1].`,
    sources: [src("dep", "Deployments, today", { kind: "Deployments" })], extras: [], followUps: [{ label: "What needs attention right now?" }],
    announce: `Assistant replied: ${d.length} deploys today.`,
  };
}
function fallback(sel: Selection, label: string): Answer {
  return {
    markdown: `This demo answers from its sample data about ${label.toLowerCase()} in ${where(sel)}. Try one of these, or mention a service with @.`,
    sources: [], extras: [], followUps: suggestionsFor(page?.section ?? "", page?.id), announce: "Assistant replied with suggestions.",
  };
}
function respond(prompt: string, sel: Selection, p: PageInfo | null, ctx: AssistantContextItem[]): Answer {
  const q = prompt.toLowerCase();
  const inc = /inc-\d+/i.exec(prompt)?.[0]?.toUpperCase() ?? (p?.section === "incidents" && p.id ? p.id : undefined);
  const svc = services.find((s) => q.includes(s.name))?.name ?? ctx.find((c) => c.kind === "entity" && serviceByName(c.label))?.label;
  if (/status update|shorter/.test(q)) return statusUpdate(sel);
  if (inc && /investigat|why|cause|incident/.test(q + (p?.section === "incidents" ? " incident" : ""))) return investigate(sel, inc);
  if (/spend|cost|budget|squad/.test(q)) return spend(sel);
  if (svc && !/attention/.test(q)) return service(sel, svc);
  if (/own|below|explorer/.test(q)) return owns(sel);
  if (/changed|deploy/.test(q)) return changes(sel);
  if (/attention|summar|wrong|slo|degraded|unhealthy/.test(q) || q.startsWith("/summarise")) return attention(sel);
  return fallback(sel, p?.label ?? "this page");
}

/* ---------- Asking, streaming, stopping ---------- */
let timer: number | undefined;
const live = () => !new URLSearchParams(location.search).has("frozen");
const patchMsg = (id: string, patch: Partial<Msg>) => set({ convs: state.convs.map((c) => ({ ...c, messages: c.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })) });
function stream(id: string, answer: Answer) {
  window.clearInterval(timer);
  const words = answer.markdown.split(/(\s+)/);
  if (!live()) { patchMsg(id, { text: answer.markdown, status: "done" }); set({ busy: null, announcement: answer.announce }); return; }
  let n = 0;
  set({ busy: id, announcement: "" });
  timer = window.setInterval(() => {
    n += 6;
    const done = n >= words.length;
    patchMsg(id, { text: words.slice(0, n).join(""), status: done ? "done" : "streaming" });
    if (done) { window.clearInterval(timer); set({ busy: null, announcement: answer.announce, unread: !page?.open }); }
  }, 45);
}
/** Ask a question (or just open the panel without one). The context is what the page and the menu item added. */
export function demoAsk(prompt: string | undefined, ctx: AssistantContextItem[]) {
  if (!prompt) return;
  const sel = page?.sel;
  if (!sel) return;
  let conv = state.convs.find((c) => c.id === state.activeId);
  if (!conv) { conv = { id: "c" + (state.convs.length + 1), title: prompt.length > 48 ? prompt.slice(0, 47) + "…" : prompt, updated: now(), messages: [] }; set({ convs: [conv, ...state.convs], activeId: conv.id }); }
  const answer = respond(prompt, sel, page, ctx);
  const q: Msg = { id: nextId(), who: "person", text: prompt, status: "done" };
  const a: Msg = { id: nextId(), who: "assistant", text: "", status: "streaming", answer, context: ctx.map((c) => c.label) };
  const cid = conv.id;
  set({ convs: state.convs.map((c) => (c.id === cid ? { ...c, updated: now(), messages: [...c.messages, q, a] } : c)), draft: "" });
  stream(a.id, answer);
}
function stop() {
  window.clearInterval(timer);
  if (state.busy) patchMsg(state.busy, { status: "stopped" });
  set({ busy: null, announcement: "Response stopped." });
}
export function assistantActivity(open: boolean): TopBarAssistant["activity"] {
  return state.busy ? "working" : state.unread && !open ? "unread" : "idle";
}
export const useAssistantStore = useStore;
export const clearUnread = () => { if (state.unread) set({ unread: false }); };

/* ---------- Suggestions, mentions and commands ---------- */
export function suggestionsFor(section: string, id?: string): PromptSuggestion[] {
  switch (section) {
    case "usage": return [{ label: "Why did spend rise this month?" }, { label: "Which workspaces are near budget?" }];
    case "explorer": return [{ label: "What does this scope own?" }, { label: "What needs attention below this scope?" }];
    case "incidents": return id ? [{ label: `Investigate ${id}` }, { label: "Draft a status update" }] : [{ label: "What needs attention right now?" }];
    case "services": return id ? [{ label: `How is ${id} doing?` }, { label: "What changed today?" }] : [{ label: "Which services are outside their SLO?" }, { label: "What changed today?" }];
    case "deploys": return [{ label: "What changed today?" }, { label: "Investigate INC-2041" }];
    default: return [{ label: "What needs attention right now?" }, { label: "What changed today?" }];
  }
}
const MENTIONS: PromptCommand[] = [
  ...services.map((s) => ({ value: s.name, label: s.name, entity: "webapp" as const, description: s.kind })),
  ...repos.map((r) => ({ value: "repo:" + r.name, label: r.name, entity: "repository" as const })),
  ...incidents.map((i) => ({ value: i.id, label: i.id, icon: "siren" as const, description: i.title, group: "Incident" })),
  ...members.map((m) => ({ value: m.id, label: m.name, icon: "user" as const, group: "Person" })),
];
const COMMANDS: PromptCommand[] = [
  { value: "summarise", label: "Summarise", description: "What this page shows, worst first" },
  { value: "investigate", label: "Investigate", description: "Find the likely cause of an incident" },
  { value: "explain", label: "Explain", description: "Explain a service, run or cost" },
];
const TEMPLATES: PromptSuggestion[] = [
  { label: "Compare two services", prompt: "Compare … with … over the last week" },
  { label: "Explain a cost", prompt: "Why did … cost more this month?" },
];

/* ---------- The panel ---------- */
function Extras({ extras, go }: { extras: Extra[]; go: (path: string) => void }): ReactNode {
  return extras.map((x, i) => {
    if (x.type === "resources") return x.ids.map((id) => {
      const r = RESOURCES.find((y) => y.id === id);
      if (!r) return null;
      const s = r.type === "service" ? serviceByName(r.name) : undefined;
      return <ResourceCard key={id} kind={r.type === "service" ? "webapp" : RESOURCE_TYPES.find((t) => t.type === r.type)?.kind ?? "resources"} name={r.name} mono status={r.status === "healthy" ? undefined : r.status} statusLabel={r.statusLabel}
        path={pathBelow(r.owner, page?.sel.scope ?? null)} facts={s ? [{ label: "p95", value: `${s.p95} ms` }, { label: "Objective", value: `${s.slo} ms` }] : [{ label: "Kind", value: r.detail }]}
        onOpen={() => go(r.href)} actions={[{ label: "Open", icon: "external", onSelect: () => go(r.href) }]} />;
    });
    if (x.type === "metric") return <Metric key={i} compact label={x.label} value={x.value} delta={{ value: x.delta, unit: " %", window: x.window }} />;
    if (x.type === "steps") return <Disclosure key={i} summary="How this was worked out" meta={`${x.steps.length} steps`}><ol className="ex-worked">{x.steps.map((s) => <li key={s}>{s}</li>)}</ol></Disclosure>;
    return <CodeBlock key={i} title={x.title} code={x.code} diff />;
  });
}
const PAGE_HELP: Record<string, string> = {
  usage: "It can explain spend and budgets", explorer: "It can tell you what a scope owns", incidents: "It can investigate an incident with you",
};
export function DemoAssistant({ go, context }: { go: (path: string) => void; context: AssistantContextItem[] }) {
  const a = useAssistant();
  const s = useStore();
  const conv = s.convs.find((c) => c.id === s.activeId);
  const items = [...context.filter((c) => !s.removed.includes(c.id)), ...s.added.filter((c) => !context.some((x) => x.id === c.id))];
  const available: AssistantContextItem[] = services.filter((x) => inScope(serviceOwner(x.name), page?.sel.scope ?? null)).map((x) => ({ id: "svc:" + x.name, kind: "entity", entity: "webapp", label: x.name, detail: x.kind }));
  const ask = (text: string) => {
    const files: AssistantContextItem[] = s.files.map((f) => ({ id: "file:" + f.id, kind: "attachment", label: f.name }));
    a.ask(text, [...s.added, ...files]); set({ files: [] });
  };
  const sources = (m: Msg) => m.answer?.sources ?? [];
  const sug = suggestionsFor(page?.section ?? "", page?.id);
  return (
    <AssistantPanel open={a.open} onClose={() => a.setOpen(false)} expanded={a.expanded} onExpandedChange={a.setExpanded}
      conversations={s.convs} activeId={s.activeId} onSelectConversation={(id) => { stop(); set({ activeId: id }); }}
      onNewConversation={() => { stop(); set({ activeId: null, announcement: "" }); }} announcement={s.announcement}
      empty={<StateBlock kind="empty" title="Ask about what you're looking at" body={`${PAGE_HELP[page?.section ?? ""] ?? "It sees this page and the scope you've chosen"}. Answers come with sources and it can't change anything. This demo's answers are scripted.`} />}
      composer={
        <PromptComposer value={s.draft} onChange={(v) => set({ draft: v })} onSubmit={ask} busy={!!s.busy} onStop={stop} maxLength={600}
          suggestions={conv?.messages.length ? undefined : sug} onSuggestion={(x) => ask(x.prompt ?? x.label)}
          templates={TEMPLATES} mentions={MENTIONS} commands={COMMANDS}
          attachments={{ files: s.files, accept: ".txt,.log,.json,.yaml,.csv", maxSize: 2_000_000, maxFiles: 3,
            onFiles: (fs) => set({ files: [...s.files, ...fs.map((f, i) => ({ id: f.name + "-" + Date.now() + i, name: f.name, size: f.size, status: "done" as const }))] }),
            onRemove: (id) => set({ files: s.files.filter((f) => f.id !== id) }) }}
          context={<ContextBar items={items} onRemove={(id) => set({ removed: [...s.removed, id], added: s.added.filter((x) => x.id !== id) })}
            available={available} onAdd={(it) => set({ added: [...s.added, it], removed: s.removed.filter((x) => x !== it.id) })}
            scope={{ nodes: SCOPE_TREE, value: page?.sel.scope ?? null, onChange: (id) => { const h = location.hash.replace(/\?.*$/, ""); location.hash = h + (id ? "?scope=" + id : ""); } }} />} />
      }>
      {(conv?.messages ?? []).map((m) => m.who === "person"
        ? <AssistantMessage key={m.id} author={{ name: "Dev A", kind: "person" }} time={conv?.updated}>{m.text}</AssistantMessage>
        : (
          <AssistantMessage key={m.id} author={{ name: "Assistant", kind: "assistant" }} status={m.status} time={conv?.updated}
            sources={m.status === "streaming" ? undefined : sources(m)} onSource={() => undefined}
            feedback={m.feedback} onFeedback={(f) => patchMsg(m.id, { feedback: f })} onReport={() => undefined}
            copyText={m.answer?.markdown} onRegenerate={m.answer ? () => stream(m.id, m.answer!) : undefined}
            provenance={{ generated: conv?.updated ?? "", model: "Scripted demo answers", context: m.context, tools: ["services.read", "incidents.read", "costs.read"] }}
            followUps={m.answer?.followUps} onFollowUp={(f) => ask(f.prompt ?? f.label)}>
            <Markdown streaming={m.status === "streaming"} sources={sources(m)} onSource={() => undefined}>{m.text}</Markdown>
            {m.status === "done" && m.answer ? <Extras extras={m.answer.extras} go={(p) => { go(p); if (!a.expanded) return; a.setExpanded(false); }} /> : null}
          </AssistantMessage>
        ))}
    </AssistantPanel>
  );
}
