// The fictional ownership hierarchy (2.1): Example Company → business function → squad → initiative → project, with
// the demo's services, repositories and cost workspaces owned at any level. Everything a capability page shows is
// filtered by the ownership scope chosen in the top bar; the full hierarchy is shown only in the Resource Explorer
// and the scope picker.
import { entityLabel, type EntityKind, type PathSegment, type Status, type TreeNode } from "@pairwise/ui";
import { incidents, isOpen, repos, runs, deploys, services, workspaces } from "./data";

export interface Unit { id: string; kind: EntityKind; label: string; parent: string | null; noAccess?: boolean; lead?: string; budget?: number }
export const ROOT = "co";
export const UNITS: Unit[] = [
  { id: ROOT, kind: "company", label: "Example Company", parent: null, lead: "Dev A", budget: 52 },
  { id: "fn-commerce", kind: "function", label: "Commerce", parent: ROOT, lead: "Dev C", budget: 24 },
  { id: "sq-payments", kind: "squad", label: "Payments", parent: "fn-commerce", lead: "Dev C", budget: 12 },
  { id: "in-checkout", kind: "initiative", label: "Checkout reliability", parent: "sq-payments", lead: "Dev A", budget: 11 },
  { id: "pr-checkout", kind: "project", label: "Checkout", parent: "in-checkout", lead: "Dev B", budget: 8 },
  { id: "pr-payauth", kind: "project", label: "Payment authorisation", parent: "in-checkout", lead: "Dev C", budget: 3 },
  { id: "sq-storefront", kind: "squad", label: "Storefront", parent: "fn-commerce", lead: "Dev D", budget: 8 },
  { id: "in-refresh", kind: "initiative", label: "Storefront refresh", parent: "sq-storefront", lead: "Dev D", budget: 7 },
  { id: "pr-web", kind: "project", label: "Web storefront", parent: "in-refresh", lead: "Dev I", budget: 7 },
  { id: "sq-fulfilment", kind: "squad", label: "Fulfilment", parent: "fn-commerce", lead: "Dev J", budget: 2 },
  { id: "fn-data", kind: "function", label: "Data and AI", parent: ROOT, lead: "Dev E", budget: 24 },
  { id: "sq-ai", kind: "squad", label: "AI platform", parent: "fn-data", lead: "Dev E", budget: 16 },
  { id: "in-ai", kind: "initiative", label: "AI transformation", parent: "sq-ai", lead: "Dev E", budget: 16 },
  { id: "pr-gateway", kind: "project", label: "Model gateway", parent: "in-ai", lead: "Dev E", budget: 10 },
  { id: "pr-recs", kind: "project", label: "Recommendation engine", parent: "in-ai", lead: "Dev H", budget: 6 },
  { id: "sq-discovery", kind: "squad", label: "Discovery", parent: "fn-data", lead: "Dev F", budget: 8 },
  { id: "pr-search", kind: "project", label: "Search", parent: "sq-discovery", lead: "Dev F", budget: 8 },
  { id: "fn-platform", kind: "function", label: "Platform engineering", parent: ROOT, lead: "Dev G", budget: 4 },
  { id: "sq-infra", kind: "squad", label: "Infrastructure", parent: "fn-platform", lead: "Dev G", budget: 4 },
  { id: "sq-identity", kind: "squad", label: "Identity", parent: "fn-platform", lead: "Dev I" },
  { id: "fn-finance", kind: "function", label: "Finance and risk", parent: ROOT, noAccess: true },
];
export const unitById = (id: string) => UNITS.find((u) => u.id === id);
const childrenOf = (id: string) => UNITS.filter((u) => u.parent === id);

/** Who owns each service, repository and cost workspace. */
const OWNER: Record<string, string> = {
  "svc:checkout-api": "pr-checkout", "svc:payments-api": "pr-payauth", "svc:cart-api": "pr-web", "svc:orders-api": "sq-fulfilment",
  "svc:llm-gateway": "pr-gateway", "svc:ranker-model": "pr-recs", "svc:embeddings-batch": "pr-recs", "svc:search-api": "pr-search",
  "svc:notifications-worker": "sq-infra", "svc:auth-api": "sq-identity",
  "repo:sample-repo": "pr-checkout", "repo:web-app": "pr-web", "repo:ml-models": "pr-recs", "repo:llm-gateway": "pr-gateway",
  "repo:infra": "sq-infra", "repo:docs": "fn-platform",
  "ws:checkout-prod": "pr-checkout", "ws:storefront-prod": "pr-web", "ws:assistant-prod": "pr-gateway", "ws:training": "pr-recs",
  "ws:search-prod": "pr-search", "ws:staging": "sq-infra",
};
export const serviceOwner = (name: string) => OWNER["svc:" + name] ?? ROOT;
export const repoOwner = (name: string) => OWNER["repo:" + name] ?? ROOT;
export const workspaceOwner = (name: string) => OWNER["ws:" + name] ?? ROOT;
/** Deploys and incidents belong to their service's owner; runs to their repository's. */
export const runOwner = (repo: string) => repoOwner(repo);

/** The unit and its ancestors, top first. */
export function lineage(id: string): Unit[] {
  const out: Unit[] = [];
  for (let u = unitById(id); u; u = u.parent ? unitById(u.parent) : undefined) out.unshift(u);
  return out;
}
export type ScopeMode = "descendants" | "direct";
/** Is something owned by `owner` inside `scope`? Direct only: owned by the scope itself. */
export function inScope(owner: string, scope: string | null, mode: ScopeMode = "descendants") {
  const s = scope ?? ROOT;
  if (mode === "direct") return owner === s;
  return lineage(owner).some((u) => u.id === s);
}
const seg = (u: Unit): PathSegment => ({ id: u.id, label: u.label, kind: u.kind });
/** The owner's path BELOW the scope ([] when the scope owns it directly): what a table shows under each row. */
export function pathBelow(owner: string, scope: string | null): PathSegment[] {
  const line = lineage(owner);
  const i = line.findIndex((u) => u.id === (scope ?? ROOT));
  return line.slice(i + 1).map(seg);
}

/* ---------- Resources: one list over every kind, for the explorer ---------- */
export type ResourceType = "service" | "repository" | "workspace";
export interface Resource { id: string; name: string; type: ResourceType; owner: string; status: Status; statusLabel: string; detail: string; spend: number | null; href: string }
const HEALTH_WORD = { healthy: "Healthy", warning: "Degraded", critical: "Down" } as const;
export const RESOURCES: Resource[] = [
  ...services.map((s): Resource => ({ id: "svc:" + s.name, name: s.name, type: "service", owner: serviceOwner(s.name), status: s.status, statusLabel: HEALTH_WORD[s.status], detail: s.kind, spend: null, href: "services/" + s.name })),
  ...repos.map((r): Resource => ({ id: "repo:" + r.name, name: r.name, type: "repository", owner: repoOwner(r.name), status: r.lastRun, statusLabel: r.lastRunLabel, detail: r.language, spend: null, href: "repos/" + r.name })),
  ...workspaces.map((w): Resource => ({ id: "ws:" + w.name, name: w.name, type: "workspace", owner: workspaceOwner(w.name), status: w.spend / w.budget >= 0.92 ? "warning" : "healthy", statusLabel: w.spend / w.budget >= 0.92 ? "Near budget" : "Within budget", detail: "Cost workspace", spend: w.spend, href: "usage" })),
];
export const RESOURCE_TYPES: { type: ResourceType; label: string; one: string; kind: EntityKind; icon?: "server" | "coins" }[] = [
  { type: "service", label: "Services", one: "Service", kind: "webapp", icon: "server" },
  { type: "repository", label: "Repositories", one: "Repository", kind: "repository" },
  { type: "workspace", label: "Cost workspaces", one: "Cost workspace", kind: "infrastructure", icon: "coins" },
];

/* ---------- Rollups ---------- */
const RANK: Status[] = ["critical", "warning", "info", "unknown", "healthy"];
/** The worst status among things in scope and how many have it (healthy and unknown roll up to nothing). */
export function worst(statuses: Status[]): { status: Status; count: number } | null {
  for (const s of RANK.slice(0, 2)) { const n = statuses.filter((x) => x === s).length; if (n) return { status: s, count: n }; }
  return null;
}
const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 10) / 10;
export function rollup(scope: string | null, mode: ScopeMode = "descendants") {
  const res = RESOURCES.filter((r) => inScope(r.owner, scope, mode));
  return {
    resources: res,
    spend: sum(res.map((r) => r.spend ?? 0)),
    health: worst(res.filter((r) => r.type === "service").map((r) => r.status)),
    worst: worst(res.map((r) => r.status)),
    openIncidents: incidents.filter((i) => isOpen(i) && inScope(serviceOwner(i.service), scope, mode)),
    runs: runs.filter((r) => inScope(runOwner(r.repo), scope, mode)),
    deploys: deploys.filter((d) => inScope(serviceOwner(d.service), scope, mode)),
  };
}

/* ---------- The tree, for the explorer and the scope picker ---------- */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const KIND_PLURAL: Partial<Record<EntityKind, [string, string]>> = {
  function: ["business function", "business functions"], squad: ["squad", "squads"], initiative: ["initiative", "initiatives"], project: ["project", "projects"],
};
/** "and its 2 projects", or for the whole organisation "across 3 business functions". */
export function scopeSummary(scope: string | null): string | undefined {
  const kids = childrenOf(scope ?? ROOT).filter((u) => !u.noAccess);
  if (!kids.length) return undefined;
  const counts = new Map<EntityKind, number>();
  kids.forEach((k) => counts.set(k.kind, (counts.get(k.kind) ?? 0) + 1));
  const words = [...counts].map(([k, n]) => { const w = KIND_PLURAL[k] ?? [entityLabel[k].toLowerCase(), entityLabel[k].toLowerCase()]; return plural(n, w[0], w[1]); });
  const text = words.join(" and ");
  return scope ? `and its ${text}` : `across ${text}`;
}

function unitNode(u: Unit, withResources: boolean): TreeNode {
  if (u.noAccess) return { id: u.id, kind: u.kind, label: u.label, noAccess: true };
  const roll = rollup(u.id);
  const kids = childrenOf(u.id).map((c) => unitNode(c, withResources));
  const direct = RESOURCES.filter((r) => r.owner === u.id);
  if (withResources && direct.length) {
    kids.push({ id: "res:" + u.id, kind: "resources", label: u.kind === "project" ? "Resources" : "Direct resources", meta: String(direct.length), hasChildren: true });
  }
  return {
    id: u.id, kind: u.kind, label: u.label,
    ...(roll.worst ? { status: roll.worst.status, statusCount: roll.worst.count, statusLabel: `${roll.worst.count} ${roll.worst.status === "critical" ? "failing" : "need attention"} below` } : { meta: String(roll.resources.length) }),
    keywords: [u.lead ?? "", entityLabel[u.kind]],
    ...(kids.length ? { children: kids } : {}),
  };
}
/** Units only: the scope picker's tree. */
export const SCOPE_TREE: TreeNode[] = [unitNode(unitById(ROOT)!, false)];
/** Units plus a lazily loaded "Resources" group wherever something is owned: the explorer's tree. */
export const EXPLORER_TREE: TreeNode[] = [unitNode(unitById(ROOT)!, true)];
/** Loads a resource group's children: one node per resource type (never one leaf per resource). */
export function loadResourceTypes(node: TreeNode, delay = 250): Promise<TreeNode[]> {
  const unit = node.id.replace(/^res:/, "");
  const direct = RESOURCES.filter((r) => r.owner === unit);
  const groups = RESOURCE_TYPES.map((t) => ({ t, items: direct.filter((r) => r.type === t.type) })).filter((g) => g.items.length).map(({ t, items }): TreeNode => {
    const w = worst(items.map((r) => r.status));
    return { id: `res:${unit}:${t.type}`, kind: t.kind, ...(t.icon ? { icon: t.icon } : {}), label: t.label, ...(w ? { status: w.status, statusCount: w.count } : { meta: String(items.length) }) };
  });
  return new Promise((done) => window.setTimeout(() => done(groups), delay));
}
/** The unit a tree node stands for (resource groups stand for their owner). */
export const unitOfNode = (id: string) => (id.startsWith("res:") ? id.split(":")[1] ?? ROOT : id);
