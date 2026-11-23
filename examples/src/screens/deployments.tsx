// Deployments: what shipped today, how delivery is trending (DORA-style), and a rollback one click away.
import { useState } from "react";
import { PageHeader, Panel, Metric, BarChart, DataTable, StatusBadge, StateBlock, FilterBar, Button, Drawer, Timeline, CopyButton, KeyValueList, InlineEdit, ProgressBar, useAssistant, toast, type Column } from "@pairwise/ui";
import { Frame, OwnershipNote, useNav, useOwnership, useSelection } from "../frame";
import { serviceOwner } from "../org";
import { share, varyCounts, varyInt, varyRound } from "../vary";
import { deploys as allDeploys, deployDays, deploysOk, deploysFailed, deploysRolledBack, type Deploy } from "../data";

export function Deployments() {
  const go = useNav();
  const assistant = useAssistant();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [peek, setPeek] = useState<Deploy | null>(null);
  const own = useOwnership();
  const sel = useSelection();
  const part = share(sel);
  const ok = varyCounts(sel, "ok", deploysOk, part), failed = varyCounts(sel, "failed", deploysFailed, part), rolledBack = varyCounts(sel, "rolled-back", deploysRolledBack, part);
  const cfr = varyRound(sel, "cfr", 9.1, 1, 0.6);
  const canary = own.has(serviceOwner("ranker-model"));
  const deploys = allDeploys.filter((d) => own.has(serviceOwner(d.service)));
  const [notes, setNotes] = useState<Record<string, string>>({ dep_9a1: "Adds retry with backoff to the payment provider client." });
  const rows = deploys.filter((d) => (!q || d.service.includes(q.toLowerCase()) || d.version.includes(q))
    && (!f.env || f.env === "all" || d.env === f.env) && (!f.status || f.status === "all" || d.status === f.status));
  const columns: Column<Deploy>[] = [
    { key: "when", header: "Time", num: true, sortable: true, rollup: "latest" },
    { key: "service", header: "Service", mono: true, sortable: true, defaultDir: "asc" },
    { key: "version", header: "Version", mono: true },
    { key: "env", header: "Environment" },
    { key: "status", header: "Status", rollup: { status: (d) => d.status, word: (s) => ({ critical: "failed", warning: "degraded", info: "in progress", unknown: "rolled back", healthy: "succeeded" })[s] }, render: (d) => <StatusBadge size="sm" status={d.status} label={d.statusLabel} /> },
    { key: "author", header: "Author", nowrap: true, render: (d) => `${d.author}, PR ${d.pr}` },
    { key: "duration", header: "Duration", align: "right", num: true },
  ];
  return (
    <Frame active="deploys">
      <PageHeader title="Deployments" meta="Every rollout to prod and staging, newest first."
        actions={<Button variant="primary" icon="changes" onClick={() => toast("A deploy form would open here")}>New deployment</Button>} />
      <div className="pw-page">
        <div className="ex-metrics">
          <Metric label="Deploys per day" scope="7-day average" value={varyRound(sel, "per-day", 9.6 * part).toFixed(1)} delta={{ value: varyInt(sel, "per-day-delta", 14, 0.8), unit: " %", polarity: "up-good", window: "previous week" }} spark={{ points: ok.map((v, i) => v + (failed[i] ?? 0)) }} />
          <Metric label="Lead time for changes" scope="median" value={varyRound(sel, "lead", 3.2).toFixed(1)} unit="h" target="Target under 24 h" delta={{ value: -varyInt(sel, "lead-delta", 9, 0.8), unit: " %", window: "previous week" }} />
          <Metric label="Change failure rate" scope="7 days" value={cfr.toFixed(1)} unit="%" {...(cfr > 5 ? { status: "warning" as const, statusLabel: "Above 5 % target" } : {})} delta={{ value: varyRound(sel, "cfr-delta", 3.4, 1, 0.8), unit: " pt", window: "previous week", threshold: 0.5 }} />
          <Metric label="Time to restore" scope="median" value={String(varyInt(sel, "restore", 41))} unit="min" target="Target 1 h" />
        </div>
        <div className="ex-row ex-2">
          <Panel title="Deploys by outcome" meta="last 7 days">
            <BarChart ariaLabel="Deploys per day by outcome, last 7 days" categories={deployDays} height={220} stacked
              series={[{ name: "Succeeded", values: ok, color: "chart-other" }, { name: "Failed", values: failed, color: "chart-1" }, { name: "Rolled back", values: rolledBack, color: "chart-3" }]} />
          </Panel>
          <Panel title="In progress" meta={canary ? "1 rollout" : "none"}>
            {canary ? <div className="ex-stack">
              <div className="ex-split"><span className="pw-mono">ranker-model v12</span><StatusBadge status="info" label="Canary" /></div>
              <ProgressBar label="Search traffic on v12" value={25} hint="Next step: 50 % at 16:40 if the guardrails hold." />
              <p className="ex-p pw-muted">Comparing click-through on 25 % of search traffic. Promotes automatically at 16:40 if the guardrails hold.</p>
              <Timeline dense events={[
                { time: "14:40", kind: "info", title: "Guardrails holding", body: "CTR +0.4 %, p95 64 ms" },
                { time: "14:10", kind: "scale", title: "Canary raised to 25 %", actor: "Rollout controller" },
                { time: "13:40", kind: "deploy", title: "Canary started at 5 %", actor: "Dev H, PR #88" },
              ]} />
              <div className="ex-actions"><Button size="sm" variant="danger" onClick={() => toast({ tone: "warning", title: "Canary halted", body: "Traffic moved back to v11." })}>Halt canary</Button><Button size="sm" onClick={() => toast({ tone: "healthy", title: "Promoting ranker-model v12" })}>Promote now</Button></div>
            </div> : <StateBlock kind="empty" inline title="No rollouts in progress" body="Nothing owned in this scope is rolling out right now." />}
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
          <DataTable columns={columns} rows={rows} rowKey="id" defaultSort={{ key: "when", dir: "desc" }} caption="Deployments today" onRowClick={setPeek} selectedKey={peek?.id}
            getPath={(d) => own.path(serviceOwner(d.service))} directLabel={own.directLabel} itemNoun={["deployment", "deployments"]} toolbar={<OwnershipNote />}
            emptyTitle="No deployments match" emptyBody="Clear the filters, or choose a wider ownership scope."
            rowTone={(d) => (d.status === "critical" ? "critical" : null)} rowLabel={(d) => `${d.service} ${d.version}`}
            rowActions={(d) => [
              { label: "View service", icon: "server", onSelect: () => go("services/" + d.service) },
              { label: "Ask the assistant", icon: "assistant", onSelect: () => assistant.ask(`How is ${d.service} doing since ${d.version}?`, [{ id: "svc:" + d.service, kind: "entity", entity: "webapp", label: d.service }]) },
              { label: "Copy deploy id", icon: "copy", onSelect: () => toast(`Copied ${d.id}`) },
              "separator",
              { label: `Roll back ${d.service}`, icon: "refresh", tone: "critical", disabled: d.status === "unknown" || d.env !== "prod", onSelect: () => toast({ tone: "warning", title: `Rolling back ${d.service}`, body: "You can follow it on this page." }) },
            ]} />
        </Panel>
      </div>
      <Drawer open={peek != null} title={peek ? `${peek.service} ${peek.version}` : ""} subtitle={peek ? `${peek.env}, started ${peek.when}` : undefined} onClose={() => setPeek(null)}
        footer={peek ? <><Button onClick={() => go("services/" + peek.service)}>View service</Button><Button variant="primary" onClick={() => setPeek(null)}>Close</Button></> : null}>
        {peek ? (
          <>
            <StatusBadge status={peek.status} label={peek.statusLabel} />
            <KeyValueList label="Deployment details" items={[
              { label: "Deploy", value: <CopyButton value={peek.id}>{peek.id}</CopyButton> },
              { label: "Pull request", value: `${peek.pr} by ${peek.author}` },
              { label: "Duration", value: peek.duration },
              { label: "Release note", value: <InlineEdit label="Release note" value={notes[peek.id] ?? ""} emptyText="Add a release note" multiline
                  onSave={(v) => new Promise<void>((done) => window.setTimeout(() => { setNotes({ ...notes, [peek.id]: v }); toast({ tone: "healthy", title: "Release note saved" }); done(); }, 400))} /> },
            ]} />
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
