// The app frame every example screen shares: one nav, one top bar, one way to mount.
// Theme, density and an optional demo state come from the URL (?theme=light&density=comfortable&state=modal),
// so the screenshot script can capture every variant from the same code. ?frozen=1 stops live updates and
// ?controls=0 hides the demo's floating display switch.
import "@pairwise/ui/fonts.css";
import "@pairwise/ui/tokens.css";
import "@pairwise/ui/styles.css";
import "./examples.css";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell, SideNav, TopBar, PairwiseProvider, Toaster, toast, type BreadcrumbsProps, type NavGroup, type Scope, type SearchItem } from "@pairwise/ui";
import { incidents, isOpen, repos, runs, services } from "./data";

export const params = new URLSearchParams(location.search);
export const demoState = params.get("state") ?? "";
/** Screenshots pass ?frozen=1 so nothing moves; the live demo updates. */
export const frozen = params.has("frozen");
export const showControls = params.get("controls") !== "0";

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
  { group: null, items: [{ key: "overview", label: "Overview", icon: "home" }] },
  { group: "Operate", items: [
    { key: "services", label: "Services", icon: "server" },
    { key: "incidents", label: "Incidents", icon: "siren" },
    { key: "deploys", label: "Deployments", icon: "changes" },
  ] },
  { group: "Build", items: [
    { key: "runs", label: "CI runs", icon: "pipeline" },
    { key: "repos", label: "Repositories", icon: "layers" },
  ] },
  { group: "Manage", items: [
    { key: "usage", label: "Usage and cost", icon: "coins" },
    { key: "access", label: "Access", icon: "shield" },
  ] },
];

// Global search covers every routable object in the demo.
const SEARCH: (SearchItem & { path: string })[] = [
  ...services.map((s) => ({ label: s.name, kind: "Service", status: s.status === "healthy" ? undefined : s.status, path: "services/" + s.name })),
  ...incidents.map((i) => ({ label: i.id, kind: "Incident", status: isOpen(i) ? (i.sev <= 2 ? "critical" as const : "warning" as const) : undefined, path: "incidents/" + i.id })),
  ...runs.map((r) => ({ label: r.id, kind: "CI run", status: r.status === "critical" ? "critical" as const : undefined, path: "runs/" + r.id })),
  ...repos.map((r) => ({ label: r.name, kind: "Repository", path: "repos/" + r.name })),
  { label: "feature/add-retry", kind: "Branch", path: "runs/run_8f3k2" },
];
const openIncidents = incidents.filter(isOpen).length;

export function Frame({ active, children }: { active: string; children: ReactNode }) {
  const go = useNav();
  const [scope, setScope] = useState<Scope>({ env: "prod", cloud: "region-a", cluster: "cluster-1" });
  const [time, setTime] = useState("1h");
  const [refresh, setRefresh] = useState<"off" | "30s" | "1m" | "5m">("30s");
  return (
    <AppShell
      nav={<SideNav active={active} nav={NAV} onNavigate={go} badges={{ incidents: { count: openIncidents, tone: "critical" }, runs: { count: 1 } }} />}
      top={
        <TopBar
          scope={scope} onScope={(s) => { setScope(s); toast(`Showing ${s.env} / ${s.cloud}`); }}
          scopeOptions={{ env: [{ value: "prod" }, { value: "staging" }], cloud: [{ value: "region-a" }, { value: "region-b" }], cluster: [{ value: "cluster-1" }, { value: "cluster-2" }] }}
          time={time} onTime={setTime} refresh={refresh} onRefresh={(r) => setRefresh(r as typeof refresh)}
          alerts={openIncidents} onAlerts={() => go("incidents")} user="DA" accountLabel="Account: Dev A"
          searchItems={SEARCH} onSearch={(i) => { const hit = SEARCH.find((s) => s.label === i.label); if (hit) go(hit.path); }}
          onCopyRange={() => toast("Time range copied")}
        />
      }>
      {children}
    </AppShell>
  );
}

/** Renders a screen. ?theme= wins; otherwise `defaultTheme` (the live demo defaults to dark). */
export function mount(screen: ReactNode, defaultTheme: "light" | "dark" = "dark") {
  const html = document.documentElement;
  const theme = params.get("theme");
  html.dataset.theme = theme === "dark" || theme === "light" ? theme : defaultTheme;
  html.dataset.density = params.get("density") === "comfortable" ? "comfortable" : "compact";
  const el = document.getElementById("root");
  if (!el) throw new Error("#root missing");
  createRoot(el).render(<PairwiseProvider>{screen}<Toaster /></PairwiseProvider>);
}
