// Fictional, deterministic sample data (no randomness, so screenshots are reproducible).
// One story runs through every page: deploy v2.14.1 of checkout-api at 14:29 pushed p95 latency over its SLO, which
// opened incident INC-2041; meanwhile run_8f3k2 on feature/add-retry failed a unit test in sample-repo.
import type { Status, TimelineEvent } from "@pairwise/ui";

export type Health = "healthy" | "warning" | "critical";

export const minutes = (start: number, n: number) =>
  Array.from({ length: n }, (_, i) => { const m = start + i; return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; });

const wave = (i: number, a: number, b: number) => Math.sin(i / a) * b + Math.sin(i / (a * 2.7)) * b * 0.6;
const round1 = (v: number) => Math.round(v * 10) / 10;

/** Latency at minute k after 13:58. A deploy at minute 33 pushes p95 over the 300 ms SLO. */
export const DEPLOY_AT = 33;
export const p95At = (k: number) => Math.round(214 + wave(k, 3, 14) + (k >= DEPLOY_AT ? 118 + Math.min(k - DEPLOY_AT, 6) * 9 : 0));
export const p50At = (k: number) => Math.round(96 + wave(k + 7, 4, 6) + (k >= DEPLOY_AT ? 22 : 0));
/** The 60-minute window ending `shift` minutes after 14:57 (shift = 0 is the static screenshot). */
export const latencyWindow = (shift: number) => ({
  labels: minutes(13 * 60 + 58 + shift, 60),
  p95: Array.from({ length: 60 }, (_, i) => p95At(i + shift)),
  p50: Array.from({ length: 60 }, (_, i) => p50At(i + shift)),
});
/** A quiet latency window for a healthy service around `base` ms. */
export const steadyWindow = (shift: number, base: number, seed: number) => ({
  labels: minutes(13 * 60 + 58 + shift, 60),
  p95: Array.from({ length: 60 }, (_, i) => Math.round(base + wave(i + shift + seed, 3, base * 0.06))),
  p50: Array.from({ length: 60 }, (_, i) => Math.round(base * 0.45 + wave(i + shift + seed + 7, 4, base * 0.03))),
});

export const spark = (base: number, amp: number, n = 24, bump = 0) => Array.from({ length: n }, (_, i) => round1(base + wave(i, 2, amp) + (i > n - 7 ? bump : 0)));

export const errorBuckets = ["14:00", "14:10", "14:20", "14:30", "14:40", "14:50"];
export const errors5xx = [12, 9, 14, 31, 44, 38];
export const errors4xx = [48, 52, 45, 61, 58, 55];
export const errorsTimeout = [3, 2, 4, 19, 27, 22];

/* ---------- Services ---------- */
export interface Service { name: string; kind: string; owner: string; version: string; status: Health; p95: number; slo: number; rps: number; errors: number; availability: number; budget: number; region: string }
export const services: Service[] = [
  { name: "checkout-api", kind: "HTTP API", owner: "Payments team", version: "v2.14.1", status: "warning", p95: 403, slo: 300, rps: 1219, errors: 0.42, availability: 99.94, budget: 0.38, region: "region-a" },
  { name: "llm-gateway", kind: "Model gateway", owner: "AI platform", version: "v0.9.3", status: "warning", p95: 1840, slo: 2500, rps: 86, errors: 1.2, availability: 99.71, budget: 0.12, region: "region-a" },
  { name: "payments-api", kind: "HTTP API", owner: "Payments team", version: "v5.2.0", status: "healthy", p95: 188, slo: 300, rps: 412, errors: 0.08, availability: 99.99, budget: 0.86, region: "region-a" },
  { name: "cart-api", kind: "HTTP API", owner: "Storefront team", version: "v3.7.2", status: "healthy", p95: 121, slo: 250, rps: 611, errors: 0.1, availability: 99.98, budget: 0.79, region: "region-a" },
  { name: "search-api", kind: "HTTP API", owner: "Discovery team", version: "v1.31.0", status: "healthy", p95: 142, slo: 300, rps: 958, errors: 0.05, availability: 99.99, budget: 0.91, region: "region-b" },
  { name: "ranker-model", kind: "Model service", owner: "AI platform", version: "v12", status: "healthy", p95: 64, slo: 120, rps: 958, errors: 0.02, availability: 99.99, budget: 0.94, region: "region-b" },
  { name: "orders-api", kind: "HTTP API", owner: "Fulfilment team", version: "v4.0.6", status: "healthy", p95: 96, slo: 250, rps: 240, errors: 0.0, availability: 100, budget: 1, region: "region-a" },
  { name: "auth-api", kind: "HTTP API", owner: "Identity team", version: "v8.1.1", status: "healthy", p95: 54, slo: 150, rps: 1730, errors: 0.03, availability: 99.99, budget: 0.88, region: "region-a" },
  { name: "notifications-worker", kind: "Queue worker", owner: "Platform team", version: "v2.3.0", status: "healthy", p95: 310, slo: 1000, rps: 74, errors: 0.2, availability: 99.96, budget: 0.67, region: "region-b" },
  { name: "embeddings-batch", kind: "Batch job", owner: "AI platform", version: "v3.0.1", status: "healthy", p95: 920, slo: 2000, rps: 12, errors: 0.0, availability: 99.9, budget: 0.72, region: "region-b" },
];
export const serviceByName = (name: string) => services.find((s) => s.name === name);

export interface Endpoint { id: string; route: string; status: Health; p95: number; rps: number; errors: number }
const CHECKOUT_ENDPOINTS: Endpoint[] = [
  { id: "e1", route: "POST /v1/checkout", status: "critical", p95: 642, rps: 184, errors: 2.9 },
  { id: "e2", route: "POST /v1/payments/authorize", status: "warning", p95: 388, rps: 172, errors: 0.8 },
  { id: "e3", route: "GET /v1/cart/:id", status: "healthy", p95: 121, rps: 611, errors: 0.1 },
  { id: "e4", route: "GET /v1/orders/:id", status: "healthy", p95: 96, rps: 240, errors: 0.0 },
  { id: "e5", route: "POST /v1/refunds", status: "healthy", p95: 205, rps: 12, errors: 0.2 },
];
/** checkout-api has hand-written endpoints; other services get three derived from their name. */
export function endpointsFor(s: Service): Endpoint[] {
  if (s.name === "checkout-api") return CHECKOUT_ENDPOINTS;
  const r = s.name.replace(/-(api|model|worker|batch|gateway)$/, "");
  const f = [1.3, 0.8, 0.6];
  return ["POST", "GET", "GET"].map((m, i) => ({
    id: `${s.name}-${i}`, route: `${m} /v1/${r}${i === 2 ? "/:id" : i === 1 ? "s" : ""}`,
    status: i === 0 && s.status !== "healthy" ? s.status : "healthy",
    p95: Math.round(s.p95 * (f[i] ?? 1)), rps: Math.round(s.rps * [0.2, 0.5, 0.3][i]!), errors: round1(s.errors * [1.6, 0.6, 0.4][i]!),
  }));
}

/* ---------- Incidents ---------- */
export type IncidentState = "Investigating" | "Acknowledged" | "Monitoring" | "Resolved";
export interface Incident { id: string; title: string; service: string; sev: 1 | 2 | 3 | 4; state: IncidentState; started: string; duration: string; commander: string; impact: string; events: TimelineEvent[] }
export const incidents: Incident[] = [
  { id: "INC-2041", title: "p95 latency above SLO on checkout", service: "checkout-api", sev: 2, state: "Investigating", started: "Today 14:31", duration: "27 min", commander: "Dev A",
    impact: "About 1 in 6 checkouts take longer than 600 ms. No failed payments.",
    events: [
      { time: "14:57", kind: "comment", title: "Rollback to v2.14.0 proposed", body: "The retry change in PR #1482 doubles calls to the payments provider under load.", actor: "Dev A" },
      { time: "14:44", kind: "ack", title: "Acknowledged", actor: "Dev A, incident commander" },
      { time: "14:38", kind: "page", title: "Paged payments on-call", actor: "Alerting" },
      { time: "14:31", kind: "alert", title: "p95 above SLO for 2 min", body: "403 ms against a 300 ms objective", actor: "Alerting", highlight: true },
      { time: "14:29", kind: "deploy", title: "Deployed v2.14.1", actor: "Deploy bot, PR #1482 by Dev B", link: true },
    ] },
  { id: "INC-2040", title: "Token rate limit errors from model provider", service: "llm-gateway", sev: 3, state: "Acknowledged", started: "Today 11:02", duration: "3 h 56 min", commander: "Dev E",
    impact: "1.2 % of summarisation requests retry once. Users see slower answers, not errors.",
    events: [
      { time: "12:15", kind: "config", title: "Fallback model enabled for batch traffic", actor: "Dev E" },
      { time: "11:20", kind: "ack", title: "Acknowledged", actor: "Dev E" },
      { time: "11:02", kind: "warn", title: "429 rate above 1 %", actor: "Alerting", highlight: true },
    ] },
  { id: "INC-2038", title: "Payment authorisations failing in region-b", service: "payments-api", sev: 1, state: "Resolved", started: "Yesterday 22:14", duration: "41 min", commander: "Dev C",
    impact: "Card payments in region-b failed for 41 minutes. Retried automatically once resolved.",
    events: [
      { time: "22:55", kind: "resolve", title: "Resolved", body: "Certificate rotated; error rate back to baseline.", actor: "Dev C" },
      { time: "22:31", kind: "ticket", title: "Postmortem ticket opened", actor: "Dev C" },
      { time: "22:14", kind: "alert", title: "Authorisation errors above 5 %", actor: "Alerting", highlight: true },
    ] },
  { id: "INC-2035", title: "Search results stale after index rebuild", service: "search-api", sev: 3, state: "Resolved", started: "Nov 17, 09:40", duration: "2 h 5 min", commander: "Dev F",
    impact: "New products took up to two hours to appear in search.",
    events: [
      { time: "11:45", kind: "resolve", title: "Resolved", actor: "Dev F" },
      { time: "09:40", kind: "warn", title: "Index freshness above 30 min", actor: "Alerting", highlight: true },
    ] },
  { id: "INC-2031", title: "Notification queue backlog", service: "notifications-worker", sev: 4, state: "Resolved", started: "Nov 15, 16:05", duration: "18 min", commander: "Dev G",
    impact: "Order emails were delayed by up to 15 minutes.",
    events: [
      { time: "16:23", kind: "resolve", title: "Resolved", body: "Scaled workers from 4 to 8.", actor: "Dev G" },
      { time: "16:05", kind: "warn", title: "Queue depth above 10,000", actor: "Alerting", highlight: true },
    ] },
];
export const incidentById = (id: string) => incidents.find((i) => i.id === id);
export const isOpen = (i: Incident) => i.state !== "Resolved";

/* ---------- Deployments ---------- */
export interface Deploy { id: string; service: string; version: string; env: "prod" | "staging"; status: Status; statusLabel: string; author: string; pr: string; when: string; duration: string }
export const deploys: Deploy[] = [
  { id: "dep_9a1", service: "checkout-api", version: "v2.14.1", env: "prod", status: "warning", statusLabel: "Degraded", author: "Dev B", pr: "#1482", when: "14:29", duration: "6 min" },
  { id: "dep_9a0", service: "search-api", version: "v1.31.0", env: "prod", status: "healthy", statusLabel: "Succeeded", author: "Dev F", pr: "#3310", when: "13:52", duration: "4 min" },
  { id: "dep_99z", service: "ranker-model", version: "v12", env: "prod", status: "info", statusLabel: "Canary 25 %", author: "Dev H", pr: "#88", when: "13:40", duration: "Running" },
  { id: "dep_99y", service: "cart-api", version: "v3.7.2", env: "prod", status: "healthy", statusLabel: "Succeeded", author: "Dev D", pr: "#902", when: "12:18", duration: "5 min" },
  { id: "dep_99x", service: "llm-gateway", version: "v0.9.3", env: "prod", status: "healthy", statusLabel: "Succeeded", author: "Dev E", pr: "#214", when: "11:47", duration: "3 min" },
  { id: "dep_99w", service: "payments-api", version: "v5.2.1", env: "staging", status: "critical", statusLabel: "Failed", author: "Dev C", pr: "#771", when: "11:05", duration: "2 min" },
  { id: "dep_99v", service: "auth-api", version: "v8.1.1", env: "prod", status: "healthy", statusLabel: "Succeeded", author: "Dev I", pr: "#1290", when: "10:30", duration: "7 min" },
  { id: "dep_99u", service: "orders-api", version: "v4.0.6", env: "prod", status: "unknown", statusLabel: "Rolled back", author: "Dev J", pr: "#640", when: "09:12", duration: "9 min" },
];
export const deployDays = ["Nov 14", "Nov 15", "Nov 16", "Nov 17", "Nov 18", "Nov 19", "Nov 20"];
export const deploysOk = [11, 9, 2, 1, 14, 12, 9];
export const deploysFailed = [1, 0, 0, 0, 2, 1, 1];
export const deploysRolledBack = [0, 1, 0, 0, 0, 1, 1];

/* ---------- CI ---------- */
/** Six CI jobs × the last 16 runs on feature/add-retry. */
export const jobs = [
  { key: "lint", label: "lint" }, { key: "types", label: "typecheck" }, { key: "unit", label: "unit tests" },
  { key: "integ", label: "integration tests" }, { key: "build", label: "build" }, { key: "e2e", label: "e2e (chromium)" },
];
export const runCols = Array.from({ length: 16 }, (_, i) => `#${1184 + i}`);
const pattern: Record<string, string> = {
  lint: "hhhhhhhhhhhhhhhh", types: "hhhhhhhhhhhchhhh", unit: "hhhhwhhhhhhhhhhc",
  integ: "hhwhhhhwhhhhwhhc", build: "hhhhhhhhhhhhhhhh", e2e: "hhhhhuhhhhhhhhhu",
};
const code: Record<string, Status> = { h: "healthy", w: "warning", c: "critical", u: "unknown", i: "info" };
export const cells: Status[][] = jobs.map((j) => (pattern[j.key] ?? "").split("").map((ch) => code[ch] ?? "unknown"));
export const branchRuns: Status[] = ["healthy", "healthy", "warning", "healthy", "healthy", "critical", "healthy", "healthy", "healthy", "warning", "healthy", "healthy", "healthy", "healthy", "critical", "healthy", "healthy", "healthy", "healthy", "critical"];
export const mainRuns: Status[] = Array.from({ length: 20 }, (_, i): Status => (i === 6 ? "warning" : "healthy"));

export interface Run { id: string; repo: string; branch: string; commit: string; status: Status; statusLabel: string; author: string; trigger: string; when: string; duration: string; history: Status[] }
export const runs: Run[] = [
  { id: "run_8f3k2", repo: "sample-repo", branch: "feature/add-retry", commit: "4f9c2e1", status: "critical", statusLabel: "Failed", author: "Dev A", trigger: "push", when: "14:02", duration: "4 min 12 s", history: branchRuns.slice(-10) },
  { id: "run_8f3h7", repo: "sample-repo", branch: "main", commit: "b71d0a4", status: "info", statusLabel: "Running", author: "Dev B", trigger: "merge", when: "14:54", duration: "1 min 40 s", history: mainRuns.slice(-10) },
  { id: "run_8f3g1", repo: "web-app", branch: "feature/dark-charts", commit: "e02f9c3", status: "healthy", statusLabel: "Passed", author: "Dev F", trigger: "pull request", when: "13:47", duration: "6 min 03 s", history: ["healthy", "healthy", "critical", "healthy", "healthy", "healthy", "healthy", "warning", "healthy", "healthy"] },
  { id: "run_8f3d9", repo: "ml-models", branch: "train/ranker-v13", commit: "9ac4e18", status: "warning", statusLabel: "Passed after retry", author: "Dev H", trigger: "schedule", when: "13:10", duration: "38 min 51 s", history: ["healthy", "warning", "healthy", "healthy", "warning", "healthy", "healthy", "healthy", "warning", "warning"] },
  { id: "run_8f3c2", repo: "infra", branch: "main", commit: "51be7d0", status: "healthy", statusLabel: "Passed", author: "Dev G", trigger: "merge", when: "12:36", duration: "2 min 18 s", history: Array.from({ length: 10 }, (): Status => "healthy") },
  { id: "run_8f3b5", repo: "sample-repo", branch: "fix/refund-rounding", commit: "c3a8f72", status: "healthy", statusLabel: "Passed", author: "Dev D", trigger: "pull request", when: "11:58", duration: "3 min 57 s", history: ["healthy", "healthy", "healthy", "critical", "healthy", "healthy", "healthy", "healthy", "healthy", "healthy"] },
  { id: "run_8f3a0", repo: "web-app", branch: "main", commit: "0d4e6b9", status: "unknown", statusLabel: "Cancelled", author: "Dev I", trigger: "merge", when: "11:20", duration: "48 s", history: ["healthy", "healthy", "healthy", "healthy", "healthy", "healthy", "healthy", "healthy", "healthy", "unknown"] },
];
export const runById = (id: string) => runs.find((r) => r.id === id);

export const testLog = [
  "2026-11-20 14:02:11  INFO  Checking out feature/add-retry at 4f9c2e1",
  "2026-11-20 14:02:13  INFO  Restoring cache (pnpm store, 182 MB)",
  "2026-11-20 14:02:41  INFO  Running 214 tests in 12 files",
  "2026-11-20 14:03:02  INFO  ✓ cart.test.ts (38)",
  "2026-11-20 14:03:04  INFO  ✓ payments.test.ts (51)",
  "2026-11-20 14:03:05  ERROR ✕ retry.test.ts › retries 3 times then fails",
  "2026-11-20 14:03:05  ERROR   expected fn to be called 3 times, but it was called 4 times",
  "2026-11-20 14:03:05  ERROR   at withRetry (src/retry.ts:4:18)",
  "2026-11-20 14:03:06  INFO  213 passed, 1 failed (25.1 s)",
  "2026-11-20 14:03:06  INFO  Exit code 1",
].join("\n");
export const passLog = (r: Run) => [
  `2026-11-20 ${r.when}:04  INFO  Checking out ${r.branch} at ${r.commit}`,
  `2026-11-20 ${r.when}:06  INFO  Restoring cache (pnpm store, 182 MB)`,
  `2026-11-20 ${r.when}:31  INFO  Running 214 tests in 12 files`,
  `2026-11-20 ${r.when}:55  INFO  214 passed (24.3 s)`,
  `2026-11-20 ${r.when}:55  INFO  Exit code 0`,
].join("\n");

/* ---------- Repositories ---------- */
export interface Repo { name: string; description: string; language: string; visibility: "Private" | "Internal"; openPrs: number; lastRun: Status; lastRunLabel: string; updated: string; topics: string[] }
export const repos: Repo[] = [
  { name: "sample-repo", description: "Checkout and payments API for example-org.", language: "TypeScript", visibility: "Private", openPrs: 7, lastRun: "critical", lastRunLabel: "Failed", updated: "14:02", topics: ["payments", "api", "typescript"] },
  { name: "web-app", description: "Customer storefront and account pages.", language: "TypeScript", visibility: "Internal", openPrs: 12, lastRun: "healthy", lastRunLabel: "Passed", updated: "13:47", topics: ["frontend", "react"] },
  { name: "ml-models", description: "Training and evaluation pipelines for the ranker and embeddings.", language: "Python", visibility: "Private", openPrs: 3, lastRun: "warning", lastRunLabel: "Passed after retry", updated: "13:10", topics: ["ml", "training"] },
  { name: "infra", description: "Terraform and cluster configuration.", language: "HCL", visibility: "Private", openPrs: 2, lastRun: "healthy", lastRunLabel: "Passed", updated: "12:36", topics: ["terraform", "kubernetes"] },
  { name: "llm-gateway", description: "Routing, caching and rate limits for model providers.", language: "Go", visibility: "Internal", openPrs: 4, lastRun: "healthy", lastRunLabel: "Passed", updated: "Yesterday", topics: ["llm", "go"] },
  { name: "docs", description: "Public developer documentation.", language: "Markdown", visibility: "Internal", openPrs: 1, lastRun: "healthy", lastRunLabel: "Passed", updated: "Nov 18", topics: ["docs"] },
];
export const repoByName = (name: string) => repos.find((r) => r.name === name);

/* ---------- Usage and cost ---------- */
export const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
export const costCompute = [18.2, 18.9, 19.4, 20.1, 21.0, 22.6];
export const costModels = [6.1, 7.4, 9.0, 10.8, 12.9, 15.2];
export const costStorage = [4.0, 4.1, 4.3, 4.4, 4.6, 4.7];
export const costNetwork = [2.2, 2.3, 2.2, 2.5, 2.6, 2.8];
export const costOther = [1.1, 1.0, 1.2, 1.1, 1.3, 1.2];
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
/** Model tokens (millions) per hour of the week: office-hours peaks, a quiet weekend, one missing hour on Sunday. */
export const tokenHeat: (number | null)[][] = days.map((_, d) => hours.map((_, h) => {
  if (d === 6 && h === 3) return null;
  const work = h >= 8 && h <= 18 ? 1 : h >= 6 && h <= 21 ? 0.55 : 0.18;
  const weekend = d >= 5 ? 0.35 : 1;
  return round1((2 + 9 * work * weekend + wave(h + d * 5, 2, 0.8)) * (d === 1 || d === 2 ? 1.1 : 1));
}));
export interface Workspace { id: string; name: string; team: string; spend: number; budget: number; tokens: number; change: number }
export const workspaces: Workspace[] = [
  { id: "w1", name: "assistant-prod", team: "AI platform", spend: 9.8, budget: 10, tokens: 412, change: 18.2 },
  { id: "w2", name: "checkout-prod", team: "Payments team", spend: 8.1, budget: 11, tokens: 0, change: 4.1 },
  { id: "w3", name: "search-prod", team: "Discovery team", spend: 6.4, budget: 8, tokens: 96, change: 1.6 },
  { id: "w4", name: "training", team: "AI platform", spend: 5.9, budget: 6, tokens: 0, change: 22.5 },
  { id: "w5", name: "storefront-prod", team: "Storefront team", spend: 4.2, budget: 7, tokens: 0, change: -3.4 },
  { id: "w6", name: "staging", team: "Platform team", spend: 2.3, budget: 4, tokens: 31, change: -8.0 },
];

/* ---------- Access ---------- */
export type Role = "Owner" | "Admin" | "Developer" | "Viewer";
export interface Member { id: string; name: string; initials: string; email: string; role: Role; teams: string[]; lastActive: string; mfa: boolean }
export const members: Member[] = [
  { id: "m1", name: "Dev A", initials: "DA", email: "dev.a@example-org.dev", role: "Owner", teams: ["Payments"], lastActive: "Now", mfa: true },
  { id: "m2", name: "Dev B", initials: "DB", email: "dev.b@example-org.dev", role: "Developer", teams: ["Payments"], lastActive: "12 min ago", mfa: true },
  { id: "m3", name: "Dev C", initials: "DC", email: "dev.c@example-org.dev", role: "Admin", teams: ["Payments", "Platform"], lastActive: "1 h ago", mfa: true },
  { id: "m4", name: "Dev D", initials: "DD", email: "dev.d@example-org.dev", role: "Developer", teams: ["Storefront"], lastActive: "3 h ago", mfa: true },
  { id: "m5", name: "Dev E", initials: "DE", email: "dev.e@example-org.dev", role: "Admin", teams: ["AI platform"], lastActive: "Now", mfa: true },
  { id: "m6", name: "Dev F", initials: "DF", email: "dev.f@example-org.dev", role: "Developer", teams: ["Discovery"], lastActive: "Yesterday", mfa: false },
  { id: "m7", name: "Dev G", initials: "DG", email: "dev.g@example-org.dev", role: "Developer", teams: ["Platform"], lastActive: "2 days ago", mfa: true },
  { id: "m8", name: "Dev H", initials: "DH", email: "dev.h@example-org.dev", role: "Viewer", teams: ["AI platform"], lastActive: "Nov 12", mfa: false },
];
export const tokens = [
  { id: "t1", name: "ci-deploy", scope: "deploy:write", owner: "Dev C", created: "Aug 2", lastUsed: "14:29", expires: "Feb 2, 2027" },
  { id: "t2", name: "grafana-reader", scope: "metrics:read", owner: "Dev G", created: "Jun 18", lastUsed: "14:57", expires: "Never" },
  { id: "t3", name: "eval-harness", scope: "models:invoke", owner: "Dev E", created: "Oct 30", lastUsed: "Yesterday", expires: "Dec 1, 2026" },
];
export const auditLog: TimelineEvent[] = [
  { time: "14:51", kind: "config", title: "Changed role of Dev B to Developer", actor: "Dev A" },
  { time: "13:20", kind: "info", title: "Created API token eval-harness", actor: "Dev E", tag: "models:invoke" },
  { time: "11:04", kind: "warn", title: "Sign-in without MFA", actor: "Dev F, from a new device" },
  { time: "09:30", kind: "ack", title: "Invited dev.j@example-org.dev as Viewer", actor: "Dev C" },
  { time: "Nov 19", kind: "config", title: "Enforced SSO for the Payments team", actor: "Dev A" },
];
