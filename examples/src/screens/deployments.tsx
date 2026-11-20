// Deployments: what shipped today, how delivery is trending (DORA-style), and a rollback one click away.
import { useState } from "react";
import { PageHeader, Panel, Metric, BarChart, DataTable, StatusBadge, FilterBar, Button, ActionMenu, Drawer, Timeline, CopyButton, toast, type Column } from "@pairwise/ui";
import { Frame, useNav } from "../frame";
import { deploys, deployDays, deploysOk, deploysFailed, deploysRolledBack, type Deploy } from "../data";

export function Deployments() {
  const go = useNav();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [peek, setPeek] = useState<Deploy | null>(null);
  const rows = deploys.filter((d) => (!q || d.service.includes(q.toLowerCase()) || d.version.includes(q))
    && (!f.env || f.env === "all" || d.env === f.env) && (!f.status || f.status === "all" || d.status === f.status));
  const columns: Column<Deploy>[] = [
    { key: "when", header: "Time", num: true, sortable: true },
    { key: "service", header: "Service", mono: true, sortable: true, defaultDir: "asc" },
    { key: "version", header: "Version", mono: true },
    { key: "env", header: "Environment" },
    { key: "status", header: "Status", render: (d) => <StatusBadge size="sm" status={d.status} label={d.statusLabel} /> },
    { key: "author", header: "Author", nowrap: true, render: (d) => `${d.author}, PR ${d.pr}` },
    { key: "duration", header: "Duration", align: "right", num: true },
    { key: "act", header: "", width: 44, render: (d) => (
      <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <ActionMenu label={`Actions for ${d.service} ${d.version}`} items={[
          { label: "View service", icon: "server", onSelect: () => go("services/" + d.service) },
          { label: "Copy deploy id", icon: "copy", onSelect: () => toast(`Copied ${d.id}`) },
          "separator",
          { label: `Roll back ${d.service}`, icon: "refresh", tone: "critical", disabled: d.status === "unknown" || d.env !== "prod", onSelect: () => toast({ tone: "warning", title: `Rolling back ${d.service}`, body: "You can follow it on this page." }) },
        ]} />
      </span>
    ) },
  ];
  return (
    <Frame active="deploys">
      <PageHeader title="Deployments" meta="Every rollout to prod and staging, newest first."
        actions={<Button variant="primary" icon="changes" onClick={() => toast("A deploy form would open here")}>New deployment</Button>} />
      <div className="pw-page">
        <div className="ex-metrics">
          <Metric label="Deploys per day" scope="7-day average" value="9.6" delta={{ value: 14, unit: " %", polarity: "up-good", window: "previous week" }} spark={{ points: deploysOk.map((v, i) => v + (deploysFailed[i] ?? 0)) }} />
          <Metric label="Lead time for changes" scope="median" value="3.2" unit="h" target="Target under 24 h" delta={{ value: -9, unit: " %", window: "previous week" }} />
          <Metric label="Change failure rate" scope="7 days" value="9.1" unit="%" status="warning" statusLabel="Above 5 % target" delta={{ value: 3.4, unit: " pt", window: "previous week", threshold: 0.5 }} />
          <Metric label="Time to restore" scope="median" value="41" unit="min" target="Target 1 h" />
        </div>
        <div className="ex-row ex-2">
          <Panel title="Deploys by outcome" meta="last 7 days">
            <BarChart ariaLabel="Deploys per day by outcome, last 7 days" categories={deployDays} height={220} stacked
              series={[{ name: "Succeeded", values: deploysOk, color: "chart-other" }, { name: "Failed", values: deploysFailed, color: "chart-1" }, { name: "Rolled back", values: deploysRolledBack, color: "chart-3" }]} />
          </Panel>
          <Panel title="In progress" meta="1 rollout">
            <div className="ex-stack">
              <div className="ex-split"><span className="pw-mono">ranker-model v12</span><StatusBadge status="info" label="Canary 25 %" /></div>
              <p className="ex-p pw-muted">Comparing click-through on 25 % of search traffic. Promotes automatically at 16:40 if the guardrails hold.</p>
              <Timeline dense events={[
                { time: "14:40", kind: "info", title: "Guardrails holding", body: "CTR +0.4 %, p95 64 ms" },
                { time: "14:10", kind: "scale", title: "Canary raised to 25 %", actor: "Rollout controller" },
                { time: "13:40", kind: "deploy", title: "Canary started at 5 %", actor: "Dev H, PR #88" },
              ]} />
              <div className="ex-actions"><Button size="sm" variant="danger" onClick={() => toast({ tone: "warning", title: "Canary halted", body: "Traffic moved back to v11." })}>Halt canary</Button><Button size="sm" onClick={() => toast({ tone: "healthy", title: "Promoting ranker-model v12" })}>Promote now</Button></div>
            </div>
          </Panel>
        </div>
        <Panel flush title="Today" meta={`${rows.length} deployments`}>
          <div className="ex-pad">
            <FilterBar query={q} onQuery={setQ} queryPlaceholder="Filter by service or version" values={f} onChange={setF} onClear={() => { setQ(""); setF({}); }}
              filters={[
                { key: "env", label: "Environment", options: ["prod", "staging"] },
                { key: "status", label: "Status", options: [{ value: "healthy", label: "Succeeded" }, { value: "info", label: "In progress" }, { value: "warning", label: "Degraded" }, { value: "critical", label: "Failed" }, { value: "unknown", label: "Rolled back" }] },
              ]} />
          </div>
          <DataTable columns={columns} rows={rows} defaultSort={{ key: "when", dir: "desc" }} caption="Deployments today" onRowClick={setPeek} selectedKey={peek?.id}
            rowTone={(d) => (d.status === "critical" ? "critical" : null)} />
        </Panel>
      </div>
      <Drawer open={peek != null} title={peek ? `${peek.service} ${peek.version}` : ""} subtitle={peek ? `${peek.env}, started ${peek.when}` : undefined} onClose={() => setPeek(null)}
        footer={peek ? <><Button onClick={() => go("services/" + peek.service)}>View service</Button><Button variant="primary" onClick={() => setPeek(null)}>Close</Button></> : null}>
        {peek ? (
          <>
            <StatusBadge status={peek.status} label={peek.statusLabel} />
            <dl className="pw-fields ex-dl">
              <div><dt>Deploy</dt><dd><CopyButton value={peek.id}>{peek.id}</CopyButton></dd></div>
              <div><dt>Pull request</dt><dd>{peek.pr} by {peek.author}</dd></div>
              <div><dt>Duration</dt><dd>{peek.duration}</dd></div>
            </dl>
            <Timeline dense events={[
              { time: peek.when, kind: "deploy", title: "Rollout started", actor: peek.author },
              { time: "+1 min", kind: "info", title: "Health checks passing on 1 of 12 replicas" },
              { time: "+4 min", kind: peek.status === "critical" ? "alert" : peek.status === "warning" ? "warn" : "resolve", title: peek.status === "critical" ? "Readiness probe failed; rollout stopped" : peek.status === "warning" ? "Rollout finished; latency regression detected" : "Rollout finished" },
            ]} />
          </>
        ) : null}
      </Drawer>
    </Frame>
  );
}
