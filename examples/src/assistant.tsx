// The demo's assistant. The Pages site is static, so answers are scripted: each one is built from the demo's fictional
// data for the current page, ownership scope, runtime scope and time range (seeded like vary.ts, so the same question
// in the same selection always gets the same answer), then "streamed" a block at a time. No model, no API keys.
// Answers are typed blocks (AnswerBlock), the way an app would ask its model to answer: the conclusion first, things
// to look at as rows, numbers as a strip, the next step set apart, evidence folded. Conversations live in a module
// store so they survive moving between pages.
import { useSyncExternalStore } from "react";
import {
  AssistantPanel, AssistantMessage, AssistantAnswer, PromptComposer, ContextBar, StateBlock,
  useAssistant, type AnswerBlock, type AttentionItem, type EntityRefProps, type AssistantContextItem, type AssistantSource, type AssistantFeedback,
  type AssistantMessageStatus, type PromptSuggestion, type PromptCommand, type TopBarAssistant, type UploadItem,
} from "@pairwise/ui";
import { services, incidents, incidentById, isOpen, deploys, repos, members, workspaces, serviceByName, type Incident, type Service } from "./data";
import { RESOURCE_TYPES, SCOPE_TREE, inScope, pathBelow, rollup, serviceOwner, unitById, workspaceOwner, type Resource } from "./org";
import { share, varyInt, varyRound, type Selection } from "./vary";

/* ---------- The store ---------- */
interface Answer { blocks: AnswerBlock[]; sources: AssistantSource[]; followUps: PromptSuggestion[]; announce: string }
interface Msg { id: string; who: "person" | "assistant"; text: string; status: AssistantMessageStatus; answer?: Answer; shown?: number; feedback?: AssistantFeedback; context?: string[] }
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
/** Set by the panel: buttons in answers open demo pages. */
let nav: (path: string) => void = () => undefined;
let askAgain: (prompt: string) => void = () => undefined;

/* ---------- Identifiers that become chips wherever they appear ---------- */
const open = (path: string) => () => nav(path);
const incRef = (i: Incident): EntityRefProps => ({ label: i.id, icon: "siren", kindLabel: "Incident", onOpen: open("incidents/" + i.id) });
const svcRef = (name: string): EntityRefProps => ({ label: name, kind: "webapp", onOpen: open("services/" + name) });
const resRef = (r: Resource): EntityRefProps => ({ label: r.name, kind: RESOURCE_TYPES.find((t) => t.type === r.type)?.kind ?? "resources", ...(r.type === "workspace" ? { icon: "coins" as const, kindLabel: "Cost workspace" } : {}), onOpen: open(r.href) });
export const ENTITIES: EntityRefProps[] = [
  ...incidents.map(incRef), ...services.map((s) => svcRef(s.name)),
  ...repos.map((r) => ({ label: r.name, kind: "repository" as const, onOpen: open("repos/" + r.name) })),
  // Workspaces whose names are ordinary words ("training", "staging") stay plain text: a chip must mean an identifier.
  ...workspaces.filter((w) => /[-\d]/.test(w.name)).map((w) => ({ label: w.name, icon: "coins" as const, kindLabel: "Cost workspace", onOpen: open("usage") })),
];

/* ---------- Scripted answers ---------- */
const scopeName = (sel: Selection) => (sel.scope ? unitById(sel.scope)?.label ?? "this scope" : "the whole organisation");
const runtime = (sel: Selection) => `${sel.env} / ${sel.cloud}`;
const money = (k: number) => `$${k.toFixed(1)}k`;
const src = (id: string, title: string, extra: Partial<AssistantSource> = {}): AssistantSource => ({ id, title, ...extra });
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const sevStatus = (i: Incident) => (i.sev <= 2 ? "critical" as const : "warning" as const);
const incItem = (i: Incident): AttentionItem => ({ id: i.id, ref: incRef(i), title: i.title, meta: `Severity ${i.sev} · ${i.state.toLowerCase()} for ${i.duration}`, status: sevStatus(i), statusLabel: i.state, action: { label: "Open", onSelect: open("incidents/" + i.id) } });
const svcItem = (sel: Selection, s: Service): AttentionItem => ({
  id: s.name, ref: svcRef(s.name), title: `p95 ${varyInt(sel, "p95-" + s.name, s.p95)} ms against a ${s.slo} ms objective`,
  meta: pathBelow(serviceOwner(s.name), sel.scope).map((p) => p.label).join(" › ") || undefined,
  status: s.status === "healthy" ? undefined : s.status, statusLabel: s.status === "critical" ? "Down" : "Degraded", action: { label: "Open", onSelect: open("services/" + s.name) },
});

function attention(sel: Selection): Answer {
  const r = rollup(sel.scope, sel.mode);
  const open_ = r.openIncidents;
  const inScopeSvcs = services.filter((s) => inScope(serviceOwner(s.name), sel.scope, sel.mode));
  const degraded = inScopeSvcs.filter((s) => s.status !== "healthy");
  if (!open_.length && !degraded.length) {
    return { blocks: [{ type: "summary", text: `Nothing needs attention in ${scopeName(sel)} (${runtime(sel)}) right now.`, status: "healthy", statusLabel: "All healthy" },
      { type: "text", markdown: "Every service is within its objective and there are no open incidents [1]." }],
      sources: [src("svc", "Service health", { kind: "Services" })], followUps: [{ label: "What changed today?" }], announce: "Assistant replied: nothing needs attention." };
  }
  const worst = open_.some((i) => i.sev <= 2) ? "critical" as const : "warning" as const;
  const checkout = open_.some((i) => i.id === "INC-2041");
  return {
    blocks: [
      { type: "summary", text: `${open_.length ? plural(open_.length, "open incident") + " and " : ""}${plural(degraded.length, "degraded service")} need attention in ${scopeName(sel)}.`, status: worst, statusLabel: worst === "critical" ? "Needs action" : "Needs attention" },
      { type: "items", title: "Needs attention", items: [...open_.map(incItem), ...degraded.map((s) => svcItem(sel, s))] },
      { type: "metrics", items: [
        { label: "Services healthy", value: `${inScopeSvcs.length - degraded.length} of ${inScopeSvcs.length}` },
        { label: "Open incidents", value: String(open_.length) },
        { label: "Deploys today", value: String(r.deploys.length), delta: { value: 14, unit: " %", polarity: "neutral", window: "7-day average" } },
      ] },
      ...(checkout ? [
        { type: "text" as const, markdown: "The checkout slowdown started 2 minutes after deploy `v2.14.1` of checkout-api [3]." },
        { type: "next" as const, text: "Roll back checkout-api to `v2.14.0`, the version before the slowdown.", actions: [{ label: "Investigate INC-2041", onSelect: () => askAgain("Investigate INC-2041") }, { label: "Open deployments", onSelect: open("deploys") }] },
      ] : []),
    ],
    sources: [src("svc", "Service health", { kind: "Services" }), src("inc", "Open incidents", { kind: "Incidents" }), src("dep", "Deploy dep_9a1, checkout-api v2.14.1", { kind: "Deployment", excerpt: "PR #1482 by Dev B, 14:29" })],
    followUps: [{ label: "Draft a status update" }, { label: "What changed today?" }],
    announce: `Assistant replied: ${open_.length} open incidents and ${degraded.length} degraded services need attention.`,
  };
}
function spend(sel: Selection): Answer {
  const total = varyRound(sel, "spend", 46.5 * share(sel)); // the same figure as Usage and cost's Spend
  const forecast = varyRound(sel, "forecast", 54.8 * share(sel)), budget = Math.round(52 * share(sel) * 10) / 10;
  const ws = workspaces.filter((w) => inScope(workspaceOwner(w.name), sel.scope, sel.mode)).sort((a, b) => b.spend / b.budget - a.spend / a.budget);
  const near = ws.filter((w) => w.spend / w.budget >= 0.92);
  const top = [...ws].sort((a, b) => b.change - a.change)[0];
  const rise = varyRound(sel, "spend-delta", 9.4, 1, 0.8);
  return {
    blocks: [
      { type: "summary", text: `Spend is ${money(total)} this month, up ${rise} %${top ? `, mostly ${top.name}` : ""}. The forecast is over budget.`, status: forecast > budget ? "warning" : undefined, statusLabel: "Over budget" },
      { type: "metrics", items: [
        { label: "Spend, month to date", value: money(total), delta: { value: rise, unit: " %", window: "same day last month" } },
        { label: "Forecast", value: money(forecast) },
        { label: "Budget", value: money(budget) },
      ] },
      ...(near.length ? [{ type: "items" as const, title: "Near budget", items: near.map((w): AttentionItem => ({
        id: w.id, ref: { label: w.name, icon: "coins", kindLabel: "Cost workspace", onOpen: open("usage") }, title: `${money(w.spend)} of ${money(w.budget)}, up ${w.change} % on last month`,
        meta: w.team, status: "warning", statusLabel: `${Math.round((w.spend / w.budget) * 100)} % of budget`,
      })) }] : []),
      ...(top ? [{ type: "text" as const, markdown: `${top.name} (${top.team}) rose ${top.change} %${top.tokens ? `, from ${top.tokens}M model tokens` : ""} [2].` }] : []),
      ...(near.length ? [{ type: "next" as const, text: `Set a budget alert on the ${near[0]!.name} workspace, or cap its nightly workers.`, actions: [{ label: "Open usage and cost", onSelect: open("usage") }] }] : []),
    ],
    sources: [src("cost", "Usage and cost, month to date", { kind: "Report", updated: "Today 06:00" }), src("ws", "Workspace budgets", { kind: "Report" })],
    followUps: [{ label: "Break it down by squad" }, { label: "What changed today?" }],
    announce: `Assistant replied: spend is ${money(total)}, up ${rise} percent.`,
  };
}
function investigate(sel: Selection, id: string): Answer {
  const inc = incidentById(id) ?? incidents[0]!;
  const dep = deploys.find((d) => d.service === inc.service);
  const svc = serviceByName(inc.service);
  const alert = inc.events.find((e) => e.kind === "alert");
  const p95 = svc ? varyInt(sel, "p95-" + svc.name, svc.p95) : 0;
  return {
    blocks: [
      { type: "summary", text: `${inc.id} most likely comes from ${dep ? `deploy ${dep.version} of ${inc.service}` : "a change to its dependencies"}.`, status: sevStatus(inc), statusLabel: `Severity ${inc.sev}` },
      ...(svc ? [{ type: "metrics" as const, items: [
        { label: "p95 latency", value: `${p95} ms`, delta: { value: Math.round(((p95 - svc.slo) / svc.slo) * 100), unit: " %", window: "objective", breach: true } },
        { label: "Objective", value: `${svc.slo} ms` },
        { label: "Error rate", value: `${svc.errors} %`, delta: { value: 0, unit: " %", polarity: "neutral" as const, window: "last hour" } },
      ] }] : []),
      { type: "text", markdown: [
        `- The alert fired at ${alert?.time ?? inc.started} [2], 2 minutes after the deploy at ${dep?.when ?? "14:29"} [1].`,
        dep ? `- ${dep.pr} changed the retry policy, which doubles calls to the payments provider under load [3].` : "- No deploy in the last hour.",
        "- Customers see slow checkouts, not failures.",
      ].join("\n") },
      { type: "code", title: "retry.yaml in " + (dep?.pr ?? "#1482"), code: "@@ payments client @@\n timeout: 2s\n-retries: 1\n+retries: 3\n+retry_on: [timeout, 503]", diff: true },
      { type: "next", text: `Roll back ${inc.service} to \`v2.14.0\`, then confirm p95 returns under ${svc?.slo ?? 300} ms.`, actions: [{ label: `Open ${inc.service}`, onSelect: open("services/" + inc.service) }, { label: "Draft a status update", onSelect: () => askAgain("Draft a status update") }] },
      { type: "steps", steps: ["Read the incident timeline and the alert", `Compared ${inc.service}'s latency with deploys in the last 2 hours`, "Read the diff of the deploy that preceded the alert", "Checked the error rate for failed payments"] },
    ],
    sources: [src("dep", `Deploy ${dep?.id ?? "dep_9a1"}, ${inc.service} ${dep?.version ?? ""}`.trim(), { kind: "Deployment", updated: dep?.when }),
      src("alert", "Alert: p95 above SLO for 2 min", { kind: "Alert", excerpt: alert?.body }),
      src("pr", `Pull request ${dep?.pr ?? "#1482"}`, { entity: "repository", path: [{ id: "r", label: "sample-repo" }] })],
    followUps: [{ label: "Who should review the rollback?" }],
    announce: `Assistant replied: ${inc.id} most likely comes from deploy ${dep?.version ?? ""}.`,
  };
}
function owns(sel: Selection): Answer {
  const r = rollup(sel.scope, sel.mode);
  const by = (t: Resource["type"]) => r.resources.filter((x) => x.type === t).length;
  const bad = r.resources.filter((x) => x.status === "warning" || x.status === "critical");
  return {
    blocks: [
      { type: "summary", text: `${scopeName(sel)} owns ${plural(r.resources.length, "resource")}${sel.mode === "direct" ? " directly" : ", including everything below it"}. ${bad.length ? `${bad.length} need${bad.length === 1 ? "s" : ""} attention.` : "All are healthy."}`, status: bad.length ? "warning" : "healthy", statusLabel: bad.length ? "Needs attention" : "All healthy" },
      { type: "metrics", items: [{ label: "Services", value: String(by("service")) }, { label: "Repositories", value: String(by("repository")) }, { label: "Cost workspaces", value: String(by("workspace")) }, { label: "Deploys today", value: String(r.deploys.length) }] },
      ...(bad.length ? [{ type: "items" as const, title: "Needs attention", items: bad.map((x): AttentionItem => ({ id: x.id, ref: resRef(x), title: x.detail, meta: pathBelow(x.owner, sel.scope).map((p) => p.label).join(" › ") || undefined, status: x.status, statusLabel: x.statusLabel, action: { label: "Open", onSelect: open(x.href) } })) }] : []),
      { type: "text", markdown: "Counts come from the resource explorer [1]." },
    ],
    sources: [src("explorer", "Resource explorer", { kind: "Ownership" })],
    followUps: [{ label: "Why did spend rise this month?" }, { label: "What changed today?" }],
    announce: `Assistant replied: ${r.resources.length} resources, ${bad.length} need attention.`,
  };
}
function service(sel: Selection, name: string): Answer {
  const s = serviceByName(name)!;
  const dep = deploys.find((d) => d.service === name);
  const p95 = varyInt(sel, "p95-" + name, s.p95);
  const healthy = s.status === "healthy";
  return {
    blocks: [
      { type: "summary", text: healthy ? `${name} is healthy.` : `${name} is degraded: p95 is ${p95} ms against a ${s.slo} ms objective.`, status: healthy ? "healthy" : s.status, statusLabel: healthy ? "Healthy" : "Degraded" },
      { type: "metrics", items: [
        { label: "p95 latency", value: `${p95} ms`, delta: healthy ? undefined : { value: Math.round(((p95 - s.slo) / s.slo) * 100), unit: " %", window: "objective", breach: true } },
        { label: "Objective", value: `${s.slo} ms` },
        { label: "Error budget left", value: `${Math.round(s.budget * 100)} %` },
        { label: "Requests", value: `${s.rps}`, unit: "/s" },
      ] },
      { type: "text", markdown: dep ? `Last deploy: \`${dep.version}\` at ${dep.when} by ${dep.author}, ${dep.statusLabel.toLowerCase()} [2].` : "No deploys today [1]." },
      ...(!healthy && dep ? [{ type: "next" as const, text: `Compare ${name} before and after \`${dep.version}\`, and roll back if it caused the slowdown.`, actions: [{ label: `Open ${name}`, onSelect: open("services/" + name) }] }] : []),
    ],
    sources: [src("svc", `${name} latency`, { entity: "webapp" }), ...(dep ? [src("dep", `Deploy ${dep.id}, ${name} ${dep.version}`, { kind: "Deployment" })] : [])],
    followUps: healthy ? [{ label: "What changed today?" }] : [{ label: "Investigate INC-2041" }],
    announce: `Assistant replied: ${name} is ${healthy ? "healthy" : "degraded"}.`,
  };
}
function statusUpdate(sel: Selection): Answer {
  const inc = incidents.find((i) => isOpen(i) && inScope(serviceOwner(i.service), sel.scope, sel.mode)) ?? incidents[0]!;
  const text = `Slower checkouts. Since ${inc.started.replace("Today ", "")}, some checkouts take longer than usual. Payments are not failing. We've found the cause and are rolling back a change. Next update in 30 minutes.`;
  return {
    blocks: [
      { type: "summary", text: `A draft status update for ${inc.id}. Edit it before you post it.` },
      { type: "code", title: "Status page draft", code: text },
      { type: "next", text: `Post it from ${inc.id}'s timeline.`, proposal: false, actions: [{ label: `Open ${inc.id}`, onSelect: open("incidents/" + inc.id) }] },
    ],
    sources: [src("inc", `${inc.id} timeline`, { kind: "Incident" })], followUps: [{ label: "Make it shorter" }],
    announce: "Assistant replied with a draft status update.",
  };
}
function changes(sel: Selection): Answer {
  const d = rollup(sel.scope, sel.mode).deploys;
  const bad = d.filter((x) => x.status !== "healthy");
  return {
    blocks: [
      { type: "summary", text: d.length ? `${plural(d.length, "deploy")} in ${scopeName(sel)} today. ${bad.length ? `${bad.length} didn't go cleanly.` : "All succeeded."}` : `No deploys in ${scopeName(sel)} today.`, status: bad.some((x) => x.status === "critical") ? "warning" : undefined, statusLabel: "Some failed" },
      ...(d.length ? [{ type: "items" as const, title: "Today, newest first", items: d.map((x): AttentionItem => ({ id: x.id, ref: svcRef(x.service), title: `${x.version} at ${x.when} by ${x.author}`, meta: `${x.env} · ${x.pr}`, status: x.status === "healthy" ? undefined : x.status === "info" ? "info" : x.status, statusLabel: x.statusLabel, action: { label: "Open", onSelect: open("deploys") } })) }] : []),
      { type: "text", markdown: "From the deployments list [1]." },
    ],
    sources: [src("dep", "Deployments, today", { kind: "Deployments" })], followUps: [{ label: "What needs attention right now?" }],
    announce: `Assistant replied: ${d.length} deploys today.`,
  };
}
function fallback(sel: Selection, label: string): Answer {
  return {
    blocks: [{ type: "text", markdown: `This demo answers from its sample data about ${label.toLowerCase()} in **${scopeName(sel)}**. Try one of these, or mention a service with @.` }],
    sources: [], followUps: suggestionsFor(page?.section ?? "", page?.id), announce: "Assistant replied with suggestions.",
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

/* ---------- Streaming: blocks appear in order; text blocks a few words at a time ---------- */
const cost = (b: AnswerBlock) => (b.type === "text" ? b.markdown.length : b.type === "summary" || b.type === "next" ? b.text.length : 80);
const total = (a: Answer) => a.blocks.reduce((n, b) => n + cost(b), 0);
function partial(blocks: AnswerBlock[], n: number): AnswerBlock[] {
  const out: AnswerBlock[] = [];
  let used = 0;
  for (const b of blocks) {
    const c = cost(b);
    if (used + c <= n) { out.push(b); used += c; continue; }
    const k = n - used;
    if (k > 0 && b.type === "text") out.push({ ...b, markdown: b.markdown.slice(0, k) });
    else if (k > 0 && b.type === "summary") out.push({ ...b, text: b.text.slice(0, k) });
    break;
  }
  return out;
}
/** Plain text of an answer, for Copy. */
const plain = (a: Answer) => a.blocks.map((b) => {
  switch (b.type) {
    case "summary": return b.text;
    case "text": return b.markdown;
    case "items": return b.items.map((i) => `- ${i.ref.label}: ${typeof i.title === "string" ? i.title : ""}${i.statusLabel ? ` (${i.statusLabel})` : ""}`).join("\n");
    case "metrics": return b.items.map((m) => `${m.label}: ${m.value}${m.unit ?? ""}`).join(" · ");
    case "next": return `Next step: ${b.text}`;
    case "code": return b.code;
    case "steps": return b.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
    default: return "";
  }
}).filter(Boolean).join("\n\n");

let timer: number | undefined;
const live = () => !new URLSearchParams(location.search).has("frozen");
const patchMsg = (id: string, patch: Partial<Msg>) => set({ convs: state.convs.map((c) => ({ ...c, messages: c.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })) });
function stream(id: string, answer: Answer) {
  window.clearInterval(timer);
  const end = total(answer);
  if (!live()) { patchMsg(id, { shown: end, status: "done" }); set({ busy: null, announcement: answer.announce }); return; }
  let n = 0;
  set({ busy: id, announcement: "" });
  patchMsg(id, { shown: 0, status: "streaming" });
  timer = window.setInterval(() => {
    n += 18;
    const done = n >= end;
    patchMsg(id, { shown: Math.min(n, end), status: done ? "done" : "streaming" });
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
  const a: Msg = { id: nextId(), who: "assistant", text: "", status: "streaming", answer, shown: 0, context: ctx.map((c) => c.label) };
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
  nav = (p) => { go(p); if (a.expanded) a.setExpanded(false); };
  askAgain = (p) => ask(p);
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
            copyText={m.answer ? plain(m.answer) : undefined} onRegenerate={m.answer ? () => stream(m.id, m.answer!) : undefined}
            provenance={{ generated: conv?.updated ?? "", model: "Scripted demo answers", context: m.context, tools: ["services.read", "incidents.read", "costs.read"] }}
            followUps={m.answer?.followUps} onFollowUp={(f) => ask(f.prompt ?? f.label)}>
            {m.answer ? <AssistantAnswer blocks={m.status === "streaming" ? partial(m.answer.blocks, m.shown ?? 0) : m.status === "stopped" ? partial(m.answer.blocks, m.shown ?? 0) : m.answer.blocks}
              streaming={m.status === "streaming"} sources={sources(m)} onSource={() => undefined} entities={ENTITIES} /> : null}
          </AssistantMessage>
        ))}
    </AssistantPanel>
  );
}
