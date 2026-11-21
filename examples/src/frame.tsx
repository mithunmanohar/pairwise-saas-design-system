// The app frame every example screen shares: one nav, one top bar, one way to mount.
// Preferences (theme, density, font) are saved in this browser; the URL wins (?theme=light&density=comfortable&font=inter),
// so the screenshot script can capture every variant from the same code. ?state= opens a demo state (e.g. prefs),
// ?frozen=1 stops live updates and ?controls=0 hides the demo's floating display switch.
import "@pairwise/ui/fonts.css";
import "@pairwise/ui/tokens.css";
import "@pairwise/ui/styles.css";
import "./examples.css";
import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell, SideNav, TopBar, PairwiseProvider, Toaster, Drawer, Select, Button, ScopePicker, ScopeNote, toast, tokens, type BreadcrumbsProps, type FontPreset, type NavGroup, type Scope, type ScopeDimension, type SearchItem } from "@pairwise/ui";
import { incidents, isOpen, repos, runs, services } from "./data";
import { ROOT, SCOPE_TREE, UNITS, inScope, pathBelow, rollup, scopeSummary, unitById, type ScopeMode } from "./org";
import type { Selection } from "./vary";

export const params = new URLSearchParams(location.search);
export const demoState = params.get("state") ?? "";
/** Screenshots pass ?frozen=1 so nothing moves; the live demo updates. */
export const frozen = params.has("frozen");
export const showControls = params.get("controls") !== "0";

/* ---------- Preferences: theme, density and font ---------- */
// The organization sets a default font (Administration); each person can keep it or choose their own (the account
// menu). Everything is applied as data-theme / data-density / data-font on <html>, which is all @pairwise/ui needs.
type ThemeId = "light" | "dark";
type DensityId = "compact" | "comfortable";
export interface Prefs { theme: ThemeId; density: DensityId; font: FontPreset | "org"; orgFont: FontPreset; org: string }
/** Organizations Dev A belongs to, with their role in each (the account menu switches between them). */
export const ORGS = [
  { id: "example-org", role: "Owner" },
  { id: "example-labs", role: "Developer" },
  { id: "sample-partner", role: "Viewer" },
] as const;
const FONT_IDS = tokens.fonts.map((f) => f.id as FontPreset);
export const isFont = (v: unknown): v is FontPreset => typeof v === "string" && (FONT_IDS as string[]).includes(v);
export const fontLabel = (id: FontPreset) => tokens.fonts.find((f) => f.id === id)?.label ?? id;
const STORE = "pairwise-demo-prefs";
let prefs: Prefs = { theme: "dark", density: "compact", font: "org", orgFont: "atkinson", org: "example-org" };
const subs = new Set<() => void>();
export const effectiveFont = (p: Prefs): FontPreset => (p.font === "org" ? p.orgFont : p.font);
function apply() {
  const html = document.documentElement;
  html.dataset.theme = prefs.theme;
  html.dataset.density = prefs.density;
  html.dataset.font = effectiveFont(prefs);
}
function initPrefs(defaultTheme: ThemeId) {
  prefs = { ...prefs, theme: defaultTheme };
  try {
    const saved: Partial<Prefs> = JSON.parse(localStorage.getItem(STORE) ?? "{}");
    if (saved.theme === "light" || saved.theme === "dark") prefs.theme = saved.theme;
    if (saved.density === "compact" || saved.density === "comfortable") prefs.density = saved.density;
    if (saved.font === "org" || isFont(saved.font)) prefs.font = saved.font;
    if (isFont(saved.orgFont)) prefs.orgFont = saved.orgFont;
    if (ORGS.some((o) => o.id === saved.org) && typeof saved.org === "string") prefs.org = saved.org;
  } catch { /* storage unavailable: defaults */ }
  const t = params.get("theme"), d = params.get("density"), f = params.get("font");
  if (t === "light" || t === "dark") prefs.theme = t;
  if (d === "compact" || d === "comfortable") prefs.density = d;
  if (isFont(f)) prefs.font = f;
  apply();
}
export const getPrefs = (): Prefs => prefs;
export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch };
  apply();
  try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch { /* not saved: still applied for this visit */ }
  subs.forEach((f) => f());
}
export const usePrefs = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => prefs);

/* ---------- Ownership scope (2.1) ---------- */
// One ownership scope for the whole app, kept in the URL (#/services?scope=in-ai) so links and reloads keep it. The
// whole organisation is the default and leaves the URL clean. "Direct only" and the runtime scope are kept for the
// visit, shared by every page.
const hashQuery = () => new URLSearchParams(location.hash.split("?")[1] ?? "");
export const hashPath = () => decodeURIComponent(location.hash.replace(/^#\/?/, "").split("?")[0] ?? "");
export function getScope(): string | null {
  const id = hashQuery().get("scope");
  const u = id ? unitById(id) : undefined;
  return u && u.id !== ROOT && !u.noAccess ? u.id : null;
}
/** A demo path with the current scope carried along. */
export const withScope = (path: string) => { const s = getScope(); return s ? `${path}?scope=${s}` : path; };
export function setScope(id: string | null) {
  const q = hashQuery();
  if (id && id !== ROOT) q.set("scope", id); else q.delete("scope");
  const qs = q.toString();
  location.hash = "/" + (hashPath() || "overview") + (qs ? "?" + qs : "");
}
const onHash = (f: () => void) => { window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); };
export const useScope = () => useSyncExternalStore(onHash, getScope);

let scopeMode: ScopeMode = "descendants";
let runtime: Scope = { env: "prod", cloud: "region-a", cluster: "cluster-1" };
let timeRange = "1h";
type Refresh = "off" | "30s" | "1m" | "5m";
let refreshEvery: Refresh = "30s";
const ctxSubs = new Set<() => void>();
const emit = () => ctxSubs.forEach((f) => f());
const onCtx = (f: () => void) => { ctxSubs.add(f); return () => { ctxSubs.delete(f); }; };
export const setScopeMode = (m: ScopeMode) => { scopeMode = m; emit(); };
const setRuntime = (r: Scope) => { runtime = r; emit(); };
const setTime = (t: string) => { timeRange = t; emit(); };
const setRefresh = (r: Refresh) => { refreshEvery = r; emit(); };
const useMode = () => useSyncExternalStore(onCtx, () => scopeMode);
const useRuntime = () => useSyncExternalStore(onCtx, () => runtime);
const useTime = () => useSyncExternalStore(onCtx, () => timeRange);
const useRefresh = () => useSyncExternalStore(onCtx, () => refreshEvery);

/** Everything the top bar selects: pages pass it to vary.ts so each selection gets its own (fictional) numbers. */
export function useSelection(): Selection {
  const scope = useScope();
  const mode = useMode();
  const rt = useRuntime();
  const time = useTime();
  return useMemo(() => ({ scope, mode, env: rt.env, cloud: rt.cloud, cluster: rt.cluster, time }), [scope, mode, rt, time]);
}

/** What a capability page needs: the scope, whether it reaches descendants, and helpers to filter and label rows. */
export function useOwnership() {
  const scope = useScope();
  const mode = useMode();
  return {
    scope, mode,
    /** is something owned by `owner` in scope */ has: (owner: string) => inScope(owner, scope, mode),
    /** its ownership path below the scope, for DataTable getPath */ path: (owner: string) => pathBelow(owner, scope),
    directLabel: `Owned by ${scope ? unitById(scope)?.label ?? "this scope" : "the company"}`,
  };
}

/** "Showing AI transformation and its 2 projects, in prod / region-a" with Direct only / Including descendants. */
export function OwnershipNote() {
  const scope = useScope();
  const mode = useMode();
  const rt = useRuntime();
  const u = scope ? unitById(scope) : undefined;
  return (
    <ScopeNote scope={u ? u.label : "the whole organisation"} summary={mode === "direct" ? (u ? "only, not its children" : "only, not its business functions") : scopeSummary(scope)}
      runtime={`${rt.env} / ${rt.cloud}`} mode={mode} onModeChange={setScopeMode} />
  );
}

/** The account menu's preferences drawer. The font preview renders in the chosen face via data-font. */
function PreferencesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const p = usePrefs();
  const font = effectiveFont(p);
  const usage = tokens.fonts.find((f) => f.id === font)?.usage;
  return (
    <Drawer open={open} title="Your preferences" subtitle="Dev A, saved in this browser" onClose={onClose}
      footer={<><Button onClick={() => { setPrefs({ theme: "dark", density: "compact", font: "org" }); toast("Preferences reset"); }}>Reset to defaults</Button><Button variant="primary" onClick={onClose}>Done</Button></>}>
      <Select label="Font" value={p.font} onChange={(v) => setPrefs({ font: v === "org" ? "org" : isFont(v) ? v : "org" })}
        hint="Applies to every page. Your organization's default is set in Administration."
        options={[{ value: "org", label: `Organization default (${fontLabel(p.orgFont)})` }, ...tokens.fonts.map((f) => ({ value: f.id, label: f.label }))]} />
      <div className="ex-fontpreview" data-font={font} aria-label={`Preview of ${fontLabel(font)}`}>
        <div className="pw-heading">checkout-api is degraded</div>
        <div>p95 latency 403 ms, above the 300 ms objective since 14:31.</div>
        <div className="pw-mono">run_8f3k2 · 4f9c2e1 · feature/add-retry · Il1 O0</div>
        {usage ? <div className="pw-caption pw-muted">{usage}</div> : null}
      </div>
      <Select label="Theme" value={p.theme} onChange={(v) => setPrefs({ theme: v === "light" ? "light" : "dark" })} options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]} />
      <Select label="Density" value={p.density} onChange={(v) => setPrefs({ density: v === "comfortable" ? "comfortable" : "compact" })}
        hint="Compact fits more rows; comfortable gives each row more room."
        options={[{ value: "compact", label: "Compact, 32 px rows" }, { value: "comfortable", label: "Comfortable, 40 px rows" }]} />
    </Drawer>
  );
}

/** Navigation between demo pages ("services", "runs/run_8f3k2"). The demo app provides hash routing. */
const NavCtx = createContext<(path: string) => void>(() => {});
export const NavProvider = NavCtx.Provider;
export const useNav = () => useContext(NavCtx);
/** Breadcrumb links route inside the demo: each item's href is a demo path such as "#/services". */
export function useCrumbNav(): NonNullable<BreadcrumbsProps["onNavigate"]> {
  const go = useNav();
  return (item) => { if (item.href) go(item.href.replace(/^#\/?/, "")); };
}

export const NAV: NavGroup[] = [
  { group: "Explore", items: [
    { key: "overview", label: "Overview", icon: "home" },
    { key: "explorer", label: "Resource explorer", icon: "layers" },
  ] },
  { group: "Build", items: [
    { key: "runs", label: "CI runs", icon: "pipeline" },
    { key: "repos", label: "Repositories", icon: "git-repo" },
  ] },
  { group: "Operate", items: [
    { key: "services", label: "Services", icon: "server" },
    { key: "incidents", label: "Incidents", icon: "siren" },
    { key: "deploys", label: "Deployments", icon: "changes" },
  ] },
  { group: "Finance", items: [
    { key: "usage", label: "Usage and cost", icon: "coins" },
  ] },
  { group: "Manage", items: [
    { key: "access", label: "Access", icon: "shield" },
  ] },
];

// Global search covers every routable object in the demo, grouped by kind, plus commands (go to a page, switch
// theme, open preferences). Recent items show when the box is focused and empty.
const SEARCH: (SearchItem & { path: string })[] = [
  ...services.map((s) => ({ label: s.name, kind: "Service", group: "Services", status: s.status === "healthy" ? undefined : s.status, path: "services/" + s.name })),
  ...incidents.map((i) => ({ label: i.id, kind: "Incident", group: "Incidents", description: i.title, status: isOpen(i) ? (i.sev <= 2 ? "critical" as const : "warning" as const) : undefined, path: "incidents/" + i.id })),
  ...runs.map((r) => ({ label: r.id, kind: "CI run", group: "CI runs", status: r.status === "critical" ? "critical" as const : undefined, path: "runs/" + r.id })),
  ...repos.map((r) => ({ label: r.name, kind: "Repository", group: "Repositories", path: "repos/" + r.name })),
  { label: "feature/add-retry", kind: "Branch", group: "Branches", path: "runs/run_8f3k2" },
  ...UNITS.filter((u) => u.id !== ROOT && !u.noAccess).map((u) => ({ label: u.label, kind: "Scope", group: "Teams and projects", description: "Open in the resource explorer", path: `explorer?scope=${u.id}` })),
];
const RECENT = ["checkout-api", "INC-2041", "run_8f3k2"].map((l) => SEARCH.find((s) => s.label === l)).filter((s): s is (typeof SEARCH)[number] => !!s);
function commands(go: (path: string) => void, openPrefs: () => void): SearchItem[] {
  const pages = NAV.flatMap((g) => g.items).concat([{ key: "admin", label: "Administration", icon: "settings" }]);
  return [
    ...pages.map((p): SearchItem => ({ id: "go:" + p.key, label: "Go to " + p.label.toLowerCase(), group: "Commands", icon: p.icon, keywords: ["open", "page", p.key], onRun: () => go(p.key) })),
    { id: "cmd:theme", label: "Switch theme", group: "Commands", icon: "settings", description: "Between light and dark", keywords: ["dark", "light", "mode"], onRun: () => setPrefs({ theme: getPrefs().theme === "dark" ? "light" : "dark" }) },
    { id: "cmd:prefs", label: "Open your preferences", group: "Commands", icon: "user", description: "Font, theme and density", keywords: ["settings", "font", "density"], onRun: openPrefs },
  ];
}
const RUNTIME_OPTIONS = { env: ["prod", "staging"], cloud: ["region-a", "region-b"], cluster: ["cluster-1", "cluster-2"] };
const RUNTIME_LABEL = { env: "Environment", cloud: "Region", cluster: "Cluster" };

export function Frame({ active, children }: { active: string; children: ReactNode }) {
  const go = useNav();
  const p = usePrefs();
  const org = ORGS.find((o) => o.id === p.org) ?? ORGS[0];
  const scope = useScope();
  const rt = useRuntime();
  const openIncidents = rollup(scope).openIncidents.length;
  const runtimeDims: ScopeDimension[] = (["env", "cloud", "cluster"] as const).map((k) => ({
    key: k, label: RUNTIME_LABEL[k], value: rt[k], options: RUNTIME_OPTIONS[k],
    onChange: (v) => { const next = { ...rt, [k]: v }; setRuntime(next); toast(`Showing ${next.env} / ${next.cloud}`); },
  }));
  const time = useTime();
  const refresh = useRefresh();
  const [prefsOpen, setPrefsOpen] = useState(demoState === "prefs");
  return (
    <AppShell
      nav={<SideNav active={active} nav={NAV} onNavigate={go} badges={{ incidents: { count: openIncidents, tone: "critical" }, runs: { count: 1 } }} />}
      top={
        <TopBar
          ownership={<ScopePicker nodes={SCOPE_TREE} value={scope} onChange={setScope} wholeLabel="Whole organisation" />}
          runtime={runtimeDims}
          time={time} onTime={setTime} refresh={refresh} onRefresh={(r) => setRefresh(r as Refresh)}
          alerts={openIncidents} onAlerts={() => go("incidents")} user="DA" accountLabel="Account: Dev A"
          account={{
            name: "Dev A", email: "dev.a@example-org.dev", role: org.role, org: org.id,
            items: [
              { heading: "Switch organization" },
              ...ORGS.map((o) => ({ label: o.id, meta: o.role, checked: o.id === org.id,
                onSelect: () => { if (o.id === org.id) return; setPrefs({ org: o.id }); toast({ title: `Switched to ${o.id}`, body: `You're ${o.role === "Owner" ? "an" : "a"} ${o.role} here. This demo shows the same sample data in every organization.` }); } })),
              "separator",
              { label: "Your preferences", icon: "settings", meta: "Font, theme", onSelect: () => setPrefsOpen(true) },
              { label: "Keyboard shortcuts", icon: "terminal", onSelect: () => toast({ title: "Keyboard shortcuts", body: "⌘K or Ctrl+K searches and runs commands. Arrow keys move between tabs. Esc closes menus and dialogs. F8 jumps to notifications." }) },
              "separator",
              { label: "Sign out", icon: "external", onSelect: () => toast({ title: "This is a demo", body: "You stay signed in as Dev A." }) },
            ],
          }}
          searchItems={[...commands(go, () => setPrefsOpen(true)), ...SEARCH]} searchRecent={RECENT} onSearch={(i) => { if (i.onRun) return; const hit = SEARCH.find((s) => s.label === i.label); if (!hit) return; if (hit.path.startsWith("explorer?scope=")) { location.hash = "/" + hit.path; return; } go(hit.path); }}
          onCopyRange={() => toast("Time range copied")}
        />
      }>
      {children}
      <PreferencesDrawer open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </AppShell>
  );
}

/** Renders a screen. ?theme= wins, then a saved preference, then `defaultTheme` (the live demo defaults to dark). */
export function mount(screen: ReactNode, defaultTheme: ThemeId = "dark") {
  initPrefs(defaultTheme);
  const el = document.getElementById("root");
  if (!el) throw new Error("#root missing");
  createRoot(el).render(<PairwiseProvider>{screen}<Toaster /></PairwiseProvider>);
}
