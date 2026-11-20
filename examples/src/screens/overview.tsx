// Overview: the whole estate at a glance. One thing needs attention (the open SEV2); everything healthy stays quiet.
import { useEffect, useState } from "react";
import { PageHeader, AlertBanner, Metric, Panel, DataTable, StatusBadge, SeverityMark, Sparkline, TimeSeriesChart, Timeline, BulletBar, Button, toast, type Column } from "@pairwise/ui";
import { Frame, frozen, useNav } from "../frame";
import { services, incidents, isOpen, deploys, minutes, spark, type Service } from "../data";

const STATUS = { healthy: "Healthy", warning: "Degraded", critical: "Down" } as const;
const order = (s: Service) => ["critical", "warning", "healthy"].indexOf(s.status);

const traffic = (shift: number) => {
  const labels = minutes(13 * 60 + 58 + shift, 60);
  const rps = labels.map((_, i) => Math.round(7200 + Math.sin((i + shift) / 6) * 520 + Math.sin((i + shift) / 2.3) * 160));
  return { labels, rps };
};

export function Overview() {
  const go = useNav();
  const [shift, setShift] = useState(0);
  useEffect(() => {
    if (frozen) return;
    const t = window.setInterval(() => setShift((s) => s + 1), 4000);
    return () => window.clearInterval(t);
  }, []);
  const open = incidents.filter(isOpen);
  const sev2 = open.find((i) => i.sev <= 2);
  const { labels, rps } = traffic(shift);
  const columns: Column<Service>[] = [
    { key: "name", header: "Service", mono: true, nowrap: true },
    { key: "status", header: "Status", sortable: true, sortValue: order, render: (s) => <StatusBadge status={s.status} label={STATUS[s.status]} size="sm" /> },
    { key: "trend", header: "p95, last hour", render: (s) => <Sparkline points={spark(s.p95 * 0.9, s.p95 * 0.05, 24, s.status === "warning" ? s.p95 * 0.3 : 0)} width={96} height={20} tone={s.status} label={`${s.name} p95 trend`} /> },
    { key: "p95", header: "p95", align: "right", num: true, sortable: true, render: (s) => `${s.p95.toLocaleString("en")} ms` },
    { key: "budget", header: "Error budget used", width: 180, render: (s) => <BulletBar used={1 - s.budget} requested={1 - s.budget} limit={1} warnAt={0.6} critAt={0.9} label={`${s.name} error budget used`} /> },
  ];
  return (
    <Frame active="overview">
      <PageHeader title="Overview" meta={[{ label: "Organization", value: "example-org" }, { label: "Environment", value: "prod" }, { label: "Services", value: String(services.length) }]}
        actions={<Button icon="refresh" onClick={() => toast("Refreshed just now")}>Refresh</Button>} />
      <div className="pw-page">
        {sev2 ? (
          <AlertBanner tone="critical" title={`${sev2.id}: ${sev2.title}.`} meta={`${sev2.service}, open ${sev2.duration}`} action="Open incident" onAction={() => go("incidents/" + sev2.id)}>
            {sev2.impact}
          </AlertBanner>
        ) : null}
        <div className="ex-metrics">
          <Metric label="Services healthy" scope="prod" value={`${services.filter((s) => s.status === "healthy").length} of ${services.length}`} status="warning" statusLabel="2 degraded" action="View" onAction={() => go("services")} />
          <Metric label="Open incidents" scope="all severities" value={String(open.length)} status="critical" statusLabel="1 SEV2" action="View" onAction={() => go("incidents")} />
          <Metric label="Deploys today" scope="prod and staging" value={String(deploys.length)} delta={{ value: 14, unit: " %", polarity: "neutral", window: "7-day average" }} spark={{ points: spark(9, 3, 14) }} action="View" onAction={() => go("deploys")} />
          <Metric label="Spend, month to date" scope="all workspaces" value="$46.5k" target="Budget $52k" delta={{ value: 9.4, unit: " %", window: "last month" }} action="View" onAction={() => go("usage")} />
        </div>
        <div className="ex-row ex-2">
          <Panel title="Services" meta="worst first" flush actions={<Button size="sm" onClick={() => go("services")}>All services</Button>}>
            <DataTable columns={columns} rows={services.slice(0, 6)} rowKey="name" defaultSort={{ key: "status", dir: "asc" }} caption="Services, worst first" onRowClick={(s) => go("services/" + s.name)} />
          </Panel>
          <Panel title="Open incidents" meta={`${open.length} open`}>
            <ul className="ex-list">
              {open.map((i) => (
                <li key={i.id}>
                  <button type="button" className="ex-list__item" onClick={() => go("incidents/" + i.id)}>
                    <SeverityMark level={i.sev} />
                    <span className="ex-list__main"><span className="pw-body-strong">{i.title}</span><span className="pw-caption pw-muted"><span className="pw-mono">{i.id}</span> · {i.service} · {i.state.toLowerCase()} · {i.duration}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="ex-row ex-2">
          <Panel title="Traffic" meta="all services, requests per second">
            <TimeSeriesChart ariaLabel="Requests per second across all services, last hour" labels={labels} unit="req/s" height={200} series={[{ name: "Requests", points: rps, color: "chart-1" }]} />
          </Panel>
          <Panel title="Recent changes" meta="today" actions={<Button size="sm" onClick={() => go("deploys")}>All deployments</Button>}>
            <Timeline dense onEvent={() => go("deploys")} events={deploys.slice(0, 4).map((d) => ({
              time: d.when, kind: d.status === "critical" ? "alert" : d.status === "warning" ? "warn" : "deploy",
              title: `${d.service} ${d.version}`, actor: `${d.statusLabel}, ${d.author}, PR ${d.pr}`, link: true, highlight: d.status === "warning",
            }))} />
          </Panel>
        </div>
      </div>
    </Frame>
  );
}
