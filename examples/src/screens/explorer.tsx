// Resource Explorer: the one page that shows the whole ownership hierarchy. The tree on the left sets the ownership
// scope (the same one the top bar shows and every page reads); the right is the selected node's workspace, with the
// same tabs for every kind: overview, resources, delivery, observability, infrastructure and financials.
import { useEffect, useState } from "react";
import {
  PageHeader, Panel, Tabs, Metric, DataTable, StatusBadge, BulletBar, Trend, Breadcrumbs, TreeView, SplitView, TextInput, Button, Icon,
  entityIcon, entityLabel, type BreadcrumbItem, type Column, type Status, type TreeNode,
} from "@pairwise/ui";
import { Frame, OwnershipNote, useNav, useOwnership, useScope, useSelection, setScope, frozen } from "../frame";
import { varyService } from "../vary";
import { ROOT, UNITS, EXPLORER_TREE, RESOURCE_TYPES, lineage, rollup, unitById, unitOfNode, loadResourceTypes, serviceOwner, runOwner, workspaceOwner, worst, type Resource, type Unit } from "../org";
import { incidents, isOpen, services, workspaces, type Incident, type Run, type Service, type Workspace, type Deploy } from "../data";
import { SERVICE_STATUS } from "./services";
import { stateBadge } from "./incidents";

const money = (k: number) => `$${k.toFixed(1)}k`;
const TABS = [
  { value: "overview", label: "Overview" }, { value: "resources", label: "Resources" }, { value: "delivery", label: "Delivery" },
  { value: "observability", label: "Observability" }, { value: "infrastructure", label: "Infrastructure" }, { value: "financials", label: "Financials" },
];
const hrefFor = (unit: string, tab = "overview") => `#/explorer/${tab}${unit === ROOT ? "" : "?scope=" + unit}`;
const lineageIds = (id: string) => lineage(id).map((u) => u.id);
const ALL_PARENTS = UNITS.filter((u) => UNITS.some((c) => c.parent === u.id)).map((u) => u.id);
const statusWord = (s: Status) => (s === "critical" ? "failing" : s === "warning" ? "need attention" : s);
/** A worst-first rollup, read as "1 failing"; healthy stays quiet. */
function Health({ items }: { items: Status[] }) {
  const w = worst(items);
  return w ? <StatusBadge size="sm" status={w.status} label={`${w.count} ${statusWord(w.status)}`} /> : <StatusBadge size="sm" status="healthy" label="Healthy" />;
}
const resourceWord = (s: Status) => (s === "critical" ? "failing" : s === "warning" ? "need attention" : s === "healthy" ? "healthy" : s);

function OrgTree({ selected, onPick }: { selected: string; onPick: (n: TreeNode) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string[]>(() => lineageIds(selected));
  // A scope chosen elsewhere (the top bar's picker) opens its branch here.
  useEffect(() => { setOpen((o) => [...new Set([...o, ...lineageIds(selected)])]); }, [selected]);
  return (
    <div className="ex-tree">
      <TextInput label="Search organisation" hideLabel placeholder="Search teams, initiatives, projects" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="ex-tree__tools">
        <Button size="sm" variant="ghost" onClick={() => setOpen(ALL_PARENTS)}>Expand all</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen([])}>Collapse all</Button>
      </div>
      <TreeView label="Organisation" nodes={EXPLORER_TREE} selectedId={selected} onSelect={onPick} expandedIds={open} onExpandedChange={setOpen}
        loadChildren={(n) => loadResourceTypes(n, frozen ? 0 : 250)} filter={q} emptyText="Nothing in the organisation matches" />
    </div>
  );
}

export function Explorer({ tab: tabParam }: { tab: string | undefined }) {
  const go = useNav();
  const scope = useScope();
  const own = useOwnership();
  const sel = useSelection();
  const tab = TABS.some((t) => t.value === tabParam) ? tabParam ?? "overview" : "overview";
  const unit: Unit = unitById(scope ?? ROOT) ?? UNITS[0]!;
  const parent = unit.parent ? unitById(unit.parent) : undefined;
  const all = rollup(scope);
  const direct = rollup(scope, "direct");
  const shown = own.mode === "direct" ? direct : all;
  const [drawer, setDrawer] = useState(false);
  const pick = (n: TreeNode) => {
    setDrawer(false);
    const u = unitOfNode(n.id);
    location.hash = hrefFor(u, n.id.startsWith("res:") ? "resources" : tab).slice(1);
  };
  const crumbs: BreadcrumbItem[] = lineage(unit.id).map((u) => ({ label: u.label, icon: entityIcon[u.kind], href: hrefFor(u.id, tab) }));
  const path = (owner: string) => own.path(owner);
  return (
    <Frame active="explorer">
      <SplitView asideLabel="Organisation" drawerOpen={drawer} onDrawerOpenChange={setDrawer} aside={<OrgTree selected={unit.id} onPick={pick} />}>
        <PageHeader
          kind={{ label: entityLabel[unit.kind], icon: entityIcon[unit.kind], ...(parent ? { detail: <>owned by <b>{parent.label}</b></> } : {}) }}
          crumbs={crumbs.length > 1 ? <Breadcrumbs items={crumbs} maxItems={3} onNavigate={(i) => { if (i.href) location.hash = i.href.slice(1); }} /> : undefined}
          title={unit.label}
          status={all.worst ? <StatusBadge status={all.worst.status} label={`${all.worst.count} ${statusWord(all.worst.status)} below`} /> : undefined}
          meta={[
            { label: "Lead", value: unit.lead ?? "Not set" },
            { label: "Budget", value: unit.budget ? `${money(unit.budget)} a month` : "Shared" },
            { label: "Resources", value: `${direct.resources.length} direct · ${all.resources.length} with everything below` },
          ]}
          tabs={<Tabs label="Workspace" value={tab} onChange={(t) => go("explorer/" + t)} tabs={TABS} />} />
        <div className="pw-page">
          {tab === "overview" ? <Overview unit={unit} /> : null}
          {tab === "resources" ? (
            <ResourcesTable rows={shown.resources} path={path} directLabel={own.directLabel} onOpen={(r) => go(r.href)} />
          ) : null}
          {tab === "delivery" ? <Delivery runs={shown.runs} deploys={shown.deploys} path={path} directLabel={own.directLabel} /> : null}
          {tab === "observability" ? <Observability scopeLabel={unit.label} services={services.filter((s) => own.has(serviceOwner(s.name))).map((s) => varyService(sel, s))} open={incidents.filter((i) => isOpen(i) && own.has(serviceOwner(i.service)))} path={path} directLabel={own.directLabel} /> : null}
          {tab === "infrastructure" ? <Infrastructure services={services.filter((s) => own.has(serviceOwner(s.name))).map((s) => varyService(sel, s))} path={path} directLabel={own.directLabel} /> : null}
          {tab === "financials" ? <Financials unit={unit} rows={workspaces.filter((w) => own.has(workspaceOwner(w.name)))} path={path} directLabel={own.directLabel} /> : null}
        </div>
      </SplitView>
    </Frame>
  );
}

/* ---------- Overview: rollups up top, the children below ---------- */
interface Child { id: string; unit: Unit | null; label: string; spend: number; statuses: Status[]; resources: number; noAccess: boolean }
function Overview({ unit }: { unit: Unit }) {
  const go = useNav();
  const scope = unit.id === ROOT ? null : unit.id;
  const all = rollup(scope), direct = rollup(scope, "direct");
  const failingRuns = all.runs.filter((r) => r.status === "critical").length;
  const kids = UNITS.filter((u) => u.parent === unit.id);
  const rows: Child[] = [
    ...kids.map((u): Child => { const r = rollup(u.id); return { id: u.id, unit: u, label: u.label, spend: r.spend, statuses: r.resources.map((x) => x.status), resources: r.resources.length, noAccess: !!u.noAccess }; }),
    ...(direct.resources.length && kids.length ? [{ id: "direct", unit: null, label: "Direct resources", spend: direct.spend, statuses: direct.resources.map((x) => x.status), resources: direct.resources.length, noAccess: false }] : []),
  ];
  const columns: Column<Child>[] = [
    { key: "label", header: "Name", render: (c) => <span className="ex-kind"><Icon name={c.noAccess ? "lock" : c.unit ? entityIcon[c.unit.kind] : "layers"} /><span className="pw-body-strong">{c.label}</span></span> },
    { key: "kind", header: "Kind", nowrap: true, render: (c) => (c.unit ? entityLabel[c.unit.kind] : "Owned here") },
    { key: "spend", header: "Spend, MTD", align: "right", num: true, sortable: true, render: (c) => (c.noAccess ? "–" : money(c.spend)) },
    { key: "health", header: "Health", render: (c) => (c.noAccess ? <span className="pw-muted">No access</span> : <Health items={c.statuses} />) },
    { key: "resources", header: "Resources", align: "right", num: true, sortable: true, render: (c) => (c.noAccess ? "–" : String(c.resources)) },
  ];
  const overBudget = unit.budget ? all.spend / unit.budget : 0;
  return (
    <>
      <div className="ex-metrics">
        <Metric label="Spend" scope="month to date" value={money(all.spend)} target={unit.budget ? `Budget ${money(unit.budget)}` : undefined}
          {...(overBudget >= 0.9 ? { status: "warning" as const, statusLabel: `${Math.round(overBudget * 100)} % of budget` } : {})} />
        <Metric label="Open incidents" scope="now" value={String(all.openIncidents.length)}
          {...(all.openIncidents.length ? { status: "critical" as const, statusLabel: all.openIncidents.map((i) => i.id).join(", ") } : {})} />
        <Metric label="Services" scope="in scope" value={String(all.resources.filter((r) => r.type === "service").length)}
          {...(all.health ? { status: all.health.status, statusLabel: `${all.health.count} ${all.health.status === "critical" ? "down" : "degraded"}` } : {})} />
        <Metric label="CI runs" scope="latest per branch" value={String(all.runs.length)}
          {...(failingRuns ? { status: "critical" as const, statusLabel: `${failingRuns} failing` } : {})} />
      </div>
      {rows.length ? (
        <Panel flush title={`Inside ${unit.label}`} meta="each row includes everything below it">
          <DataTable columns={columns} rows={rows} caption={`Inside ${unit.label}`} defaultSort={{ key: "spend", dir: "desc" }}
            rowLabel={(c) => c.label}
            onRowClick={(c) => { if (c.noAccess) return; if (c.unit) setScope(c.unit.id); else go("explorer/resources"); }} />
        </Panel>
      ) : (
        <ResourcesTable rows={all.resources} path={() => []} directLabel={`Owned by ${unit.label}`} onOpen={(r) => go(r.href)} />
      )}
    </>
  );
}

/* ---------- One table per angle; each reads the scope and offers List | Tree ---------- */
type PathFn = (owner: string) => ReturnType<ReturnType<typeof useOwnership>["path"]>;
interface TableProps { path: PathFn; directLabel: string }
const TYPE = Object.fromEntries(RESOURCE_TYPES.map((t) => [t.type, t]));

function ResourcesTable({ rows, path, directLabel, onOpen }: TableProps & { rows: Resource[]; onOpen: (r: Resource) => void }) {
  const columns: Column<Resource>[] = [
    { key: "name", header: "Resource", mono: true, sortable: true, defaultDir: "asc" },
    { key: "type", header: "Type", nowrap: true, render: (r) => { const t = TYPE[r.type]; return <span className="ex-kind"><Icon name={t?.icon ?? entityIcon[t?.kind ?? "resources"]} />{t?.one ?? r.type}</span>; } },
    { key: "status", header: "Status", sortable: true, sortValue: (r) => ["critical", "warning", "info", "unknown", "healthy"].indexOf(r.status),
      rollup: { status: (r) => r.status, word: resourceWord }, render: (r) => <StatusBadge size="sm" status={r.status} label={r.statusLabel} /> },
    { key: "detail", header: "Detail", nowrap: true },
    { key: "spend", header: "Spend, MTD", align: "right", num: true, sortable: true, sortValue: (r) => r.spend ?? -1, rollup: "sum", format: money, render: (r) => (r.spend == null ? "–" : money(r.spend)) },
  ];
  return (
    <Panel flush title="Resources" meta={`${rows.length} in scope`}>
      <DataTable columns={columns} rows={rows} rowKey="id" caption="Resources in scope" defaultSort={{ key: "status", dir: "asc" }}
        getPath={(r) => path(r.owner)} directLabel={directLabel} itemNoun={["resource", "resources"]} toolbar={<OwnershipNote />}
        onRowClick={onOpen} rowLabel={(r) => r.name} emptyTitle="Nothing owned here" emptyBody="Switch to Including descendants to see what the teams below own." />
    </Panel>
  );
}

function Delivery({ runs, deploys, path, directLabel }: TableProps & { runs: Run[]; deploys: Deploy[] }) {
  const go = useNav();
  const runCols: Column<Run>[] = [
    { key: "id", header: "Run", mono: true },
    { key: "status", header: "Status", rollup: { status: (r) => r.status, word: (s) => ({ critical: "failed", warning: "retried", info: "running", unknown: "cancelled", healthy: "passed" })[s] }, render: (r) => <StatusBadge size="sm" status={r.status} label={r.statusLabel} /> },
    { key: "repo", header: "Repository", mono: true },
    { key: "branch", header: "Branch", mono: true },
    { key: "when", header: "Started", num: true, sortable: true, rollup: "latest" },
  ];
  const depCols: Column<Deploy>[] = [
    { key: "service", header: "Service", mono: true },
    { key: "version", header: "Version", mono: true },
    { key: "status", header: "Status", rollup: { status: (d) => d.status, word: (s) => ({ critical: "failed", warning: "degraded", info: "in progress", unknown: "rolled back", healthy: "succeeded" })[s] }, render: (d) => <StatusBadge size="sm" status={d.status} label={d.statusLabel} /> },
    { key: "env", header: "Environment" },
    { key: "when", header: "Time", num: true, sortable: true, rollup: "latest" },
  ];
  return (
    <>
      <Panel flush title="CI runs" meta="latest per branch">
        <DataTable columns={runCols} rows={runs} rowKey="id" caption="CI runs in scope" defaultSort={{ key: "when", dir: "desc" }}
          getPath={(r) => path(runOwner(r.repo))} directLabel={directLabel} itemNoun={["run", "runs"]} toolbar={<OwnershipNote />}
          onRowClick={(r) => go("runs/" + r.id)} rowLabel={(r) => r.id} emptyTitle="No CI runs in scope" />
      </Panel>
      <Panel flush title="Deployments" meta="today">
        <DataTable columns={depCols} rows={deploys} rowKey="id" caption="Deployments in scope" defaultSort={{ key: "when", dir: "desc" }}
          getPath={(d) => path(serviceOwner(d.service))} directLabel={directLabel} itemNoun={["deployment", "deployments"]}
          onRowClick={(d) => go("services/" + d.service)} rowLabel={(d) => `${d.service} ${d.version}`} emptyTitle="No deployments in scope today" />
      </Panel>
    </>
  );
}

function Observability({ scopeLabel, services: rows, open, path, directLabel }: TableProps & { scopeLabel: string; services: Service[]; open: Incident[] }) {
  const go = useNav();
  const cols: Column<Service>[] = [
    { key: "name", header: "Service", mono: true },
    { key: "status", header: "Status", sortable: true, sortValue: (s) => ["critical", "warning", "healthy"].indexOf(s.status), rollup: { status: (s) => s.status, word: (s) => (s === "critical" ? "down" : s === "warning" ? "degraded" : s) }, render: (s) => <StatusBadge size="sm" status={s.status} label={SERVICE_STATUS[s.status]} /> },
    { key: "p95", header: "p95 vs SLO", align: "right", num: true, render: (s) => `${s.p95.toLocaleString("en")} / ${s.slo.toLocaleString("en")} ms` },
    { key: "availability", header: "Availability", align: "right", num: true, render: (s) => `${s.availability} %` },
    { key: "budget", header: "Error budget used", width: 170, render: (s) => <BulletBar used={1 - s.budget} requested={1 - s.budget} limit={1} warnAt={0.6} critAt={0.9} label={`${s.name} error budget used`} /> },
  ];
  const incCols: Column<Incident>[] = [
    { key: "id", header: "Incident", mono: true },
    { key: "title", header: "Title", render: (i) => <span className="pw-body-strong">{i.title}</span> },
    { key: "state", header: "State", render: stateBadge },
    { key: "started", header: "Started", nowrap: true },
  ];
  return (
    <>
      <Panel flush title="Open incidents" meta={open.length ? `${open.length} in ${scopeLabel}` : "none"}>
        <DataTable columns={incCols} rows={open} rowKey="id" caption="Open incidents in scope" onRowClick={(i) => go("incidents/" + i.id)} rowLabel={(i) => i.id}
          emptyTitle="No open incidents" emptyBody="Everything in scope is running within its objectives." />
      </Panel>
      <Panel flush title="Service health" meta="worst first">
        <DataTable columns={cols} rows={rows} rowKey="name" caption="Service health in scope" defaultSort={{ key: "status", dir: "asc" }}
          getPath={(s) => path(serviceOwner(s.name))} directLabel={directLabel} itemNoun={["service", "services"]} toolbar={<OwnershipNote />}
          onRowClick={(s) => go("services/" + s.name)} rowLabel={(s) => s.name} emptyTitle="No services in scope" />
      </Panel>
    </>
  );
}

function Infrastructure({ services: rows, path, directLabel }: TableProps & { services: Service[] }) {
  const go = useNav();
  const cols: Column<Service>[] = [
    { key: "name", header: "Service", mono: true },
    { key: "kind", header: "Runs as", nowrap: true },
    { key: "region", header: "Region", mono: true },
    { key: "version", header: "Version", mono: true },
    { key: "rps", header: "Requests/s", align: "right", num: true, sortable: true, rollup: "sum", format: (n) => n.toLocaleString("en"), render: (s) => s.rps.toLocaleString("en") },
  ];
  return (
    <Panel flush title="Runtime footprint" meta="services and model endpoints">
      <DataTable columns={cols} rows={rows} rowKey="name" caption="Runtime footprint in scope" defaultSort={{ key: "rps", dir: "desc" }}
        getPath={(s) => path(serviceOwner(s.name))} directLabel={directLabel} itemNoun={["service", "services"]} toolbar={<OwnershipNote />}
        onRowClick={(s) => go("services/" + s.name)} rowLabel={(s) => s.name} emptyTitle="Nothing running in scope" />
    </Panel>
  );
}

function Financials({ unit, rows, path, directLabel }: TableProps & { unit: Unit; rows: Workspace[] }) {
  const spend = Math.round(rows.reduce((a, w) => a + w.spend, 0) * 10) / 10;
  const budget = Math.round(rows.reduce((a, w) => a + w.budget, 0) * 10) / 10;
  const cols: Column<Workspace>[] = [
    { key: "name", header: "Workspace", mono: true },
    { key: "spend", header: "Spend, MTD", align: "right", num: true, sortable: true, rollup: "sum", format: money, render: (w) => money(w.spend) },
    { key: "budget", header: "Of budget", width: 190, render: (w) => <BulletBar used={w.spend} requested={w.spend} limit={w.budget} label={`${w.name} spend against budget`} /> },
    { key: "tokens", header: "Model tokens", align: "right", num: true, rollup: "sum", format: (n) => `${n} M`, render: (w) => (w.tokens ? `${w.tokens} M` : "–") },
    { key: "change", header: "vs last month", align: "right", render: (w) => <Trend value={w.change} unit=" %" threshold={2} /> },
  ];
  const share = budget ? spend / budget : 0;
  return (
    <>
      <div className="ex-metrics">
        <Metric label="Spend" scope="month to date" value={money(spend)} target={`Workspace budgets ${money(budget)}`}
          {...(share >= 0.9 ? { status: "warning" as const, statusLabel: `${Math.round(share * 100)} % of budget` } : {})} />
        <Metric label="Team budget" scope="a month" value={unit.budget ? money(unit.budget) : "Shared"} />
        <Metric label="Workspaces" scope="in scope" value={String(rows.length)} />
        <Metric label="Model tokens" scope="month to date" value={String(rows.reduce((a, w) => a + w.tokens, 0))} unit="M" />
      </div>
      <Panel flush title="Spend by workspace" meta="thousands of USD">
        <DataTable columns={cols} rows={rows} rowKey="id" caption="Spend by workspace in scope" defaultSort={{ key: "spend", dir: "desc" }}
          getPath={(w) => path(workspaceOwner(w.name))} directLabel={directLabel} itemNoun={["workspace", "workspaces"]} toolbar={<OwnershipNote />}
          rowTone={(w) => (w.spend / w.budget >= 0.92 ? "critical" : null)} emptyTitle="No cost workspaces in scope" />
      </Panel>
    </>
  );
}

