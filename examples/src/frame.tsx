// The app frame every example screen shares: one nav, one top bar, one way to mount.
// Theme, density and an optional demo state come from the URL (?theme=dark&density=comfortable&state=modal),
// so the screenshot script can capture every variant from the same code. ?frozen=1 stops live updates.
import "@pairwise/ui/fonts.css";
import "@pairwise/ui/tokens.css";
import "@pairwise/ui/styles.css";
import "./examples.css";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell, SideNav, TopBar, PairwiseProvider, Toaster, toast, type NavGroup, type Scope, type SearchItem } from "@pairwise/ui";

export const params = new URLSearchParams(location.search);
export const demoState = params.get("state") ?? "";
/** Screenshots pass ?frozen=1 so nothing moves; the live demo updates. */
export const frozen = params.has("frozen");

/** Navigation between demo pages. Standalone screens get a no-op; the demo app provides real routing. */
const NavCtx = createContext<(key: string) => void>(() => {});
export const NavProvider = NavCtx.Provider;
export const useNav = () => useContext(NavCtx);

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

const SEARCH: SearchItem[] = [
  { label: "checkout-api", kind: "Service", status: "warning" },
  { label: "run_8f3k2", kind: "CI run", status: "critical" },
  { label: "sample-repo", kind: "Repository" },
  { label: "feature/add-retry", kind: "Branch" },
];
const ROUTE_OF: Record<string, string> = { Service: "services", "CI run": "runs", Repository: "repos", Branch: "runs" };

export function Frame({ active, children }: { active: string; children: ReactNode }) {
  const go = useNav();
  const [scope, setScope] = useState<Scope>({ env: "prod", cloud: "region-a", cluster: "cluster-1" });
  const [time, setTime] = useState("1h");
  const [refresh, setRefresh] = useState<"off" | "30s" | "1m" | "5m">("30s");
  return (
    <AppShell
      nav={<SideNav active={active} nav={NAV} onNavigate={go} badges={{ incidents: { count: 1, tone: "critical" }, runs: { count: 3 } }} />}
      top={
        <TopBar
          scope={scope} onScope={setScope}
          scopeOptions={{ env: [{ value: "prod" }, { value: "staging" }], cloud: [{ value: "region-a" }, { value: "region-b" }], cluster: [{ value: "cluster-1" }, { value: "cluster-2" }] }}
          time={time} onTime={setTime} refresh={refresh} onRefresh={(r) => setRefresh(r as typeof refresh)}
          alerts={2} onAlerts={() => go("incidents")} user="DA" accountLabel="Account: Dev A"
          searchItems={SEARCH} onSearch={(i) => { const r = ROUTE_OF[i.kind ?? ""]; if (r) go(r); else toast(`Opened ${i.label}`); }}
          onCopyRange={() => toast("Time range copied")}
        />
      }>
      {children}
    </AppShell>
  );
}

/** Renders a screen. ?theme= wins; otherwise `defaultTheme` (the live demo defaults to dark). */
export function mount(screen: ReactNode, defaultTheme: "light" | "dark" = "light") {
  const html = document.documentElement;
  const theme = params.get("theme");
  html.dataset.theme = theme === "dark" || theme === "light" ? theme : defaultTheme;
  html.dataset.density = params.get("density") === "comfortable" ? "comfortable" : "compact";
  const el = document.getElementById("root");
  if (!el) throw new Error("#root missing");
  createRoot(el).render(<PairwiseProvider>{screen}<Toaster /></PairwiseProvider>);
}
