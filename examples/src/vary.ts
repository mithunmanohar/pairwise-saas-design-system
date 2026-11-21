// Seeded variation for the demo: every top-bar selection (ownership scope, runtime scope, time range) gets its own
// fictional numbers. The same selection always shows the same numbers, so links and screenshots are reproducible,
// and the default selection (whole organisation, prod / region-a / cluster-1, last hour) returns the hand-written
// data unchanged, so the demo's story and the README screenshots stay exactly as they are.
import { minutes, type Service } from "./data";
import { rollup, type ScopeMode } from "./org";

export interface Selection { scope: string | null; mode: ScopeMode; env: string; cloud: string; cluster: string; time: string }
export const DEFAULT_SELECTION: Selection = { scope: null, mode: "descendants", env: "prod", cloud: "region-a", cluster: "cluster-1", time: "1h" };
export const isDefault = (s: Selection) =>
  s.scope === null && s.mode === "descendants" && s.env === "prod" && s.cloud === "region-a" && s.cluster === "cluster-1" && s.time === "1h";
const selKey = (s: Selection) => [s.scope ?? "org", s.mode, s.env, s.cloud, s.cluster, s.time].join("|");

/** FNV-1a: a stable 32-bit hash of a string. */
export function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** mulberry32: a small seeded generator of numbers in [0, 1). */
export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const draw = (s: Selection, key: string) => rng(hash(selKey(s) + "#" + key));

/** A multiplier around 1 (± spread) for one figure; exactly 1 for the default selection. */
export function factor(s: Selection, key: string, spread = 0.35) {
  return isDefault(s) ? 1 : 1 + (draw(s, key)() * 2 - 1) * spread;
}
export const vary = (s: Selection, key: string, base: number, spread?: number) => base * factor(s, key, spread);
export const varyInt = (s: Selection, key: string, base: number, spread?: number) => (isDefault(s) ? base : Math.max(0, Math.round(vary(s, key, base, spread))));
export const varyRound = (s: Selection, key: string, base: number, digits = 1, spread?: number) => {
  if (isDefault(s)) return base;
  const p = 10 ** digits;
  return Math.round(vary(s, key, base, spread) * p) / p;
};
/** A whole series scaled by one factor, with a little jitter per point; unchanged for the default selection. */
export function varySeries(s: Selection, key: string, points: number[], spread = 0.35, jitter = 0.08) {
  if (isDefault(s)) return points;
  const f = factor(s, key, spread);
  const r = draw(s, key + "#points");
  return points.map((v) => v * f * (1 + (r() * 2 - 1) * jitter));
}
/** A smooth fictional series of n points around `base`, different for every selection and key. */
export function wave(s: Selection, key: string, n: number, base: number, amp = 0.12) {
  const r = draw(s, key + "#wave");
  const p1 = r() * 6, p2 = r() * 6, f = factor(s, key);
  return Array.from({ length: n }, (_, i) => base * f * (1 + amp * (Math.sin(i / 3 + p1) * 0.6 + Math.sin(i / 7.3 + p2) * 0.4)));
}

/** The scope's share of the organisation (by spend), so a squad's organisation-level charts are smaller. */
export function share(s: Selection) {
  if (s.scope === null && s.mode === "descendants") return 1;
  const all = rollup(null).spend;
  return all ? Math.max(0.05, rollup(s.scope, s.mode).spend / all) : 1;
}

/* ---------- Time windows ---------- */
export interface TimeWindow { labels: string[]; /** "last 6 hours", for headings and aria labels */ phrase: string; /** minutes per point, for minute-based windows */ step: number | null }
const hhmm = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Days ending on the demo's "today", Nov 20. */
const days = (n: number) => Array.from({ length: n }, (_, i) => {
  const d = new Date(Date.UTC(2026, 10, 20 - (n - 1 - i)));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
});
const END = 14 * 60 + 57; // the demo's "now", 14:57
/** The points a chart shows for a time range. "1h" is exactly the demo's original window. */
export function windowFor(time: string, shift = 0): TimeWindow {
  switch (time) {
    case "15m": return { labels: minutes(END - 14 + shift, 15), phrase: "last 15 minutes", step: 1 };
    case "6h": return { labels: Array.from({ length: 72 }, (_, i) => hhmm(END + shift - (71 - i) * 5)), phrase: "last 6 hours", step: 5 };
    case "24h": return { labels: Array.from({ length: 24 }, (_, i) => hhmm((15 + i) * 60)), phrase: "last 24 hours", step: 60 };
    case "7d": return { labels: days(7), phrase: "last 7 days", step: null };
    case "30d": return { labels: days(30), phrase: "last 30 days", step: null };
    case "mtd": return { labels: days(20), phrase: "month to date", step: null };
    case "6mo": return { labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], phrase: "last 6 months", step: null };
    default: return { labels: minutes(13 * 60 + 58 + shift, 60), phrase: "last hour", step: 1 };
  }
}

/** A service's figures for the selection: latency, traffic, errors and budget move; its status and SLO don't. */
export function varyService(s: Selection, svc: Service): Service {
  if (isDefault(s)) return svc;
  const k = (f: string) => `${svc.name}:${f}`;
  let p95 = Math.round(vary(s, k("p95"), svc.p95, 0.3));
  if (svc.status === "healthy") p95 = Math.min(p95, Math.round(svc.slo * 0.9));
  if (svc.status !== "healthy" && svc.p95 > svc.slo) p95 = Math.max(p95, Math.round(svc.slo * 1.05));
  return {
    ...svc,
    p95,
    rps: Math.max(1, Math.round(vary(s, k("rps"), svc.rps, 0.4))),
    errors: Math.round(vary(s, k("errors"), svc.errors, 0.5) * 100) / 100,
    budget: Math.min(1, Math.max(0.02, Math.round(vary(s, k("budget"), svc.budget, 0.3) * 100) / 100)),
    availability: Math.min(100, Math.round(vary(s, k("availability"), svc.availability, 0.0004) * 100) / 100),
  };
}

/** Counts (bar heights, sparklines) scaled by `mult` and varied, rounded; unchanged for the default selection. */
export function varyCounts(s: Selection, key: string, values: number[], mult = 1) {
  if (isDefault(s)) return values;
  return varySeries(s, key, values.map((v) => v * mult)).map((v) => Math.max(0, Math.round(v)));
}
