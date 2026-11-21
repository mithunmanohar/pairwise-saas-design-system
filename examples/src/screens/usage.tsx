// Usage and cost: spend against budget, where it goes, and when model tokens are used. Over-budget rows stand out.
import { useState } from "react";
import { PageHeader, Panel, Metric, BarChart, Heatmap, DataTable, BulletBar, Trend, Tabs, Button, ActionMenu, DateRangePicker, toast, type Column, type DateRangeValue } from "@pairwise/ui";
import { Frame, OwnershipNote, useOrgWide, useOwnership } from "../frame";
import { workspaceOwner } from "../org";
import { months, costCompute, costModels, costStorage, costNetwork, costOther, days, hours, tokenHeat, workspaces, type Workspace } from "../data";

/** Thousands of USD, e.g. $46.5k. */
const money = (k: number) => `$${k.toFixed(1)}k`;

export function Usage() {
  const [view, setView] = useState("category");
  const own = useOwnership();
  const orgWide = useOrgWide();
  const scopedWorkspaces = workspaces.filter((w) => own.has(workspaceOwner(w.name)));
  const [period, setPeriod] = useState<DateRangeValue | null>({ from: "2026-11-01", to: "2026-11-30" });
  const columns: Column<Workspace>[] = [
    { key: "name", header: "Workspace", mono: true },
    { key: "team", header: "Team", nowrap: true, sortable: true, defaultDir: "asc" },
    { key: "spend", header: "Spend, MTD", align: "right", num: true, sortable: true, rollup: "sum", format: money, render: (w) => money(w.spend) },
    { key: "budget", header: "Of budget", width: 190, sortable: true, sortValue: (w) => w.spend / w.budget, render: (w) => <BulletBar used={w.spend} requested={w.spend} limit={w.budget} label={`${w.name} spend against budget`} /> },
    { key: "tokens", header: "Model tokens", align: "right", num: true, sortable: true, rollup: "sum", format: (n) => (n ? `${n} M` : "–"), render: (w) => (w.tokens ? `${w.tokens} M` : "–") },
    { key: "change", header: "vs last month", align: "right", sortable: true, render: (w) => <Trend value={w.change} unit=" %" threshold={2} /> },
  ];
  const byTeam = [
    { name: "AI platform", values: months.map((_, i) => (costModels[i] ?? 0) * 0.92 + (costCompute[i] ?? 0) * 0.18), color: "chart-1" as const },
    { name: "Payments", values: months.map((_, i) => (costCompute[i] ?? 0) * 0.36), color: "chart-2" as const },
    { name: "Discovery", values: months.map((_, i) => (costCompute[i] ?? 0) * 0.22 + (costModels[i] ?? 0) * 0.08), color: "chart-3" as const },
    { name: "Storefront", values: months.map((_, i) => (costCompute[i] ?? 0) * 0.16), color: "chart-4" as const },
    { name: "Other", values: months.map((_, i) => (costStorage[i] ?? 0) + (costNetwork[i] ?? 0) + (costOther[i] ?? 0) + (costCompute[i] ?? 0) * 0.08), color: "chart-other" as const },
  ];
  return (
    <Frame active="usage">
      <PageHeader title="Usage and cost" meta={[{ label: "Billing period", value: "Nov 1 – 30" }, { label: "Currency", value: "USD" }, { label: "Updated", value: "Today 06:00" }]}
        actions={<>
          <div className="ex-period"><DateRangePicker label="Report period" hideLabel value={period} maxDays={366} max="2026-12-31"
            onChange={(r) => { setPeriod(r); if (r?.to) toast({ title: `Showing ${r.from} to ${r.to}`, body: "This demo keeps the same sample data for every period." }); }} /></div>
          <Button icon="page" onClick={() => toast("Cost report exported as CSV")}>Export CSV</Button>
          <ActionMenu label="More cost actions" items={[{ label: "Set budget alerts", icon: "bell", onSelect: () => toast("Budget alerts would open here") }, { label: "Copy report link", icon: "link", onSelect: () => toast("Link copied") }]} />
        </>} />
      <div className="pw-page">
        <div className="ex-metrics">
          <Metric label="Spend" scope={orgWide("month to date")} value={money(46.5)} target="Budget $52k" delta={{ value: 9.4, unit: " %", window: "same day last month" }} spark={{ points: [38, 39, 40.5, 41.7, 43.3, 46.5] }} />
          <Metric label="Forecast" scope={orgWide("end of month")} value={money(54.8)} status="warning" statusLabel="Over budget by $2.8k" delta={{ value: 12.1, unit: " %", window: "October" }} />
          <Metric label="Model tokens" scope={orgWide("month to date")} value="539" unit="M" delta={{ value: 31, unit: " %", polarity: "neutral", window: "same day last month" }} spark={{ points: [210, 260, 300, 350, 420, 539] }} />
          <Metric label="Cost per 1k requests" scope={orgWide("month to date")} value="$0.41" delta={{ value: -4.2, unit: " %", window: "October" }} target="Target $0.45" />
        </div>
        <div className="ex-row ex-2">
          <Panel title="Monthly spend" meta={orgWide(view === "category" ? "by category, thousands of USD" : "by team, thousands of USD")}
            actions={<Tabs size="sm" value={view} onChange={setView} tabs={[{ value: "category", label: "Category" }, { value: "team", label: "Team" }]} />}>
            <BarChart ariaLabel={`Monthly spend by ${view}`} categories={months} height={240} stacked unit="k"
              series={view === "category" ? [
                { name: "Compute", values: costCompute, color: "chart-2" },
                { name: "Model APIs", values: costModels, color: "chart-1" },
                { name: "Storage", values: costStorage, color: "chart-3" },
                { name: "Network", values: costNetwork, color: "chart-4" },
                { name: "Other", values: costOther, color: "chart-other" },
              ] : byTeam} />
          </Panel>
          <Panel title="Budgets" meta={orgWide("month to date")}>
            <div className="ex-budgets">
              {[{ n: "Compute", u: 22.6 * 0.66, l: 24 }, { n: "Model APIs", u: 15.2 * 0.66, l: 12 }, { n: "Storage", u: 4.7 * 0.66, l: 6 }, { n: "Network", u: 2.8 * 0.66, l: 4 }].map((b) => (
                <div key={b.n} className="ex-budget">
                  <div className="ex-split"><span className="pw-body-strong">{b.n}</span><span className="pw-caption pw-muted pw-num">{money(b.u)} of {money(b.l)}</span></div>
                  <BulletBar used={b.u} requested={b.u * 1.5} limit={b.l} label={`${b.n} budget`} />
                </div>
              ))}
              <p className="ex-p pw-caption pw-muted">Light bar: forecast for the full month. Model APIs will pass their budget around Nov 24.</p>
            </div>
          </Panel>
        </div>
        <Panel title="Model tokens by hour" meta={orgWide("millions, this week (UTC)")}>
          <Heatmap ariaLabel="Model tokens by day and hour, this week" rows={days} cols={hours} values={tokenHeat} unit="M tokens" />
        </Panel>
        <Panel title="Workspaces" meta="highest spend first" flush>
          <DataTable columns={columns} rows={scopedWorkspaces} rowKey="id" defaultSort={{ key: "spend", dir: "desc" }} caption="Spend by workspace" rowTone={(w) => (w.spend / w.budget >= 0.92 ? "critical" : null)}
            getPath={(w) => own.path(workspaceOwner(w.name))} directLabel={own.directLabel} itemNoun={["workspace", "workspaces"]} toolbar={<OwnershipNote />}
            emptyTitle="No cost workspaces in scope" emptyBody="Choose a wider ownership scope in the top bar." />
        </Panel>
      </div>
    </Frame>
  );
}
