// Fictional, deterministic sample data (no randomness, so screenshots are reproducible).

export const minutes = (start: number, n: number) =>
  Array.from({ length: n }, (_, i) => { const m = start + i; return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; });

const wave = (i: number, a: number, b: number) => Math.sin(i / a) * b + Math.sin(i / (a * 2.7)) * b * 0.6;

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

export const spark = (base: number, amp: number, n = 24, bump = 0) => Array.from({ length: n }, (_, i) => Math.round((base + wave(i, 2, amp) + (i > n - 7 ? bump : 0)) * 10) / 10);

export const errorBuckets = ["14:00", "14:10", "14:20", "14:30", "14:40", "14:50"];
export const errors5xx = [12, 9, 14, 31, 44, 38];
export const errors4xx = [48, 52, 45, 61, 58, 55];
export const errorsTimeout = [3, 2, 4, 19, 27, 22];

export interface Endpoint { id: string; route: string; status: "healthy" | "warning" | "critical"; p95: number; rps: number; errors: number }
export const endpoints: Endpoint[] = [
  { id: "e1", route: "POST /v1/checkout", status: "critical", p95: 642, rps: 184, errors: 2.9 },
  { id: "e2", route: "POST /v1/payments/authorize", status: "warning", p95: 388, rps: 172, errors: 0.8 },
  { id: "e3", route: "GET /v1/cart/:id", status: "healthy", p95: 121, rps: 611, errors: 0.1 },
  { id: "e4", route: "GET /v1/orders/:id", status: "healthy", p95: 96, rps: 240, errors: 0.0 },
  { id: "e5", route: "POST /v1/refunds", status: "healthy", p95: 205, rps: 12, errors: 0.2 },
];

/** Six CI jobs × the last 16 runs on feature/add-retry. */
export const jobs = [
  { key: "lint", label: "lint" }, { key: "types", label: "typecheck" }, { key: "unit", label: "unit tests" },
  { key: "integ", label: "integration tests" }, { key: "build", label: "build" }, { key: "e2e", label: "e2e (chromium)" },
];
export const runCols = Array.from({ length: 16 }, (_, i) => `#${1184 + i}`);
type S = "healthy" | "warning" | "critical" | "unknown" | "info";
const pattern: Record<string, string> = {
  lint: "hhhhhhhhhhhhhhhh", types: "hhhhhhhhhhhchhhh", unit: "hhhhwhhhhhhhhhhc",
  integ: "hhwhhhhwhhhhwhhc", build: "hhhhhhhhhhhhhhhh", e2e: "hhhhhuhhhhhhhhhu",
};
const code: Record<string, S> = { h: "healthy", w: "warning", c: "critical", u: "unknown", i: "info" };
export const cells: S[][] = jobs.map((j) => (pattern[j.key] ?? "").split("").map((ch) => code[ch] ?? "unknown"));
export const branchRuns: S[] = ["healthy", "healthy", "warning", "healthy", "healthy", "critical", "healthy", "healthy", "healthy", "warning", "healthy", "healthy", "healthy", "healthy", "critical", "healthy", "healthy", "healthy", "healthy", "critical"];
export const mainRuns: S[] = Array.from({ length: 20 }, (_, i): S => (i === 6 ? "warning" : "healthy"));

export const testLog = [
  "2026-10-29 14:02:11  INFO  Checking out feature/add-retry at 4f9c2e1",
  "2026-10-29 14:02:13  INFO  Restoring cache (pnpm store, 182 MB)",
  "2026-10-29 14:02:41  INFO  Running 214 tests in 12 files",
  "2026-10-29 14:03:02  INFO  ✓ cart.test.ts (38)",
  "2026-10-29 14:03:04  INFO  ✓ payments.test.ts (51)",
  "2026-10-29 14:03:05  ERROR ✕ retry.test.ts › retries 3 times then fails",
  "2026-10-29 14:03:05  ERROR   expected fn to be called 3 times, but it was called 4 times",
  "2026-10-29 14:03:05  ERROR   at withRetry (src/retry.ts:4:18)",
  "2026-10-29 14:03:06  INFO  213 passed, 1 failed (25.1 s)",
  "2026-10-29 14:03:06  INFO  Exit code 1",
].join("\n");
