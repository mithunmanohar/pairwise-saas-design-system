// Observability: a service's health at a glance. Exceptions first, everything else quiet.
// Live: the window rolls forward every few seconds (unless ?frozen=1). Roll back asks for confirmation; endpoint rows
// open a drawer.
import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs, Tabs, StatusBadge, Button, ActionMenu, AlertBanner, Metric, Panel, TimeSeriesChart, BarChart, DataTable, Timeline, Modal, Drawer, Sparkline, toast, type Column } from "@pairwise/ui";
import { Frame, frozen, useNav } from "../frame";
import { latencyWindow, DEPLOY_AT, spark, errorBuckets, errors5xx, errors4xx, errorsTimeout, endpoints, type Endpoint } from "../data";

const STATUS_LABEL = { healthy: "Healthy", warning: "Slow", critical: "SLO breach" } as const;
const columns: Column<Endpoint>[] = [
  { key: "route", header: "Endpoint", mono: true },
  { key: "status", header: "Status", sortable: true, sortValue: (r) => ["critical", "warning", "healthy"].indexOf(r.status), render: (r) => <StatusBadge status={r.status} label={STATUS_LABEL[r.status]} size="sm" /> },
  { key: "p95", header: "p95", align: "right", num: true, sortable: true, render: (r) => `${r.p95} ms` },
  { key: "rps", header: "Requests/s", align: "right", num: true, sortable: true },
  { key: "errors", header: "Errors", align: "right", num: true, sortable: true, render: (r) => `${r.errors.toFixed(1)} %` },
];

export function ServiceHealth() {
  const go = useNav();
  const [shift, setShift] = useState(0);
  const [rollback, setRollback] = useState(false);
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  useEffect(() => {
    if (frozen) return;
    const t = window.setInterval(() => setShift((s) => s + 1), 4000);
    return () => window.clearInterval(t);
  }, []);
  const { labels, p95, p50 } = latencyWindow(shift);
  const latest = p95[p95.length - 1] ?? 0;
  const marker = DEPLOY_AT - shift;
  const updated = (labels[labels.length - 1] ?? "") + ":12";
  return (
    <Frame active="services">
      <PageHeader
        crumbs={<Breadcrumbs items={[{ label: "Services", href: "#" }, { label: "checkout-api", mono: true }]} />}
        title="checkout-api" titleMono
        status={<StatusBadge status="warning" label="Degraded" />}
        meta={[{ label: "Owner", value: "Payments team" }, { label: "Version", value: "v2.14.1", mono: true }, { label: "Region", value: "region-a" }, { label: "SLO", value: "99.9 %, p95 under 300 ms" }]}
        actions={<>
          <Button icon="book" onClick={() => toast("The runbook would open here")}>Runbook</Button>
          <Button variant="primary" icon="refresh" onClick={() => setRollback(true)}>Roll back to v2.14.0</Button>
          <ActionMenu label="More actions for checkout-api" items={[
            { label: "Copy link", icon: "link", onSelect: () => toast("Link copied") },
            { label: "Open on GitHub", icon: "external", onSelect: () => toast("GitHub would open here") },
            "separator",
            { label: "Pause alerts", icon: "pause", onSelect: () => toast({ tone: "warning", title: "Alerts paused for 1 hour" }) },
          ]} />
        </>}
        tabs={<Tabs value="overview" onChange={(v) => v === "incidents" && go("incidents")} tabs={[{ value: "overview", label: "Overview" }, { value: "endpoints", label: "Endpoints", count: 12 }, { value: "deploys", label: "Deployments" }, { value: "incidents", label: "Incidents", count: 1, tone: "critical" }, { value: "settings", label: "Settings" }]} />}
      />
      <div className="pw-page">
        <AlertBanner tone="warning" title="p95 latency has been above the SLO since 14:31." meta="alert_q3x7n, 27 min" action="Open incident" onAction={() => go("incidents")}>
          It started with deploy v2.14.1. Error rate is within budget.
        </AlertBanner>
        <div className="ex-metrics">
          <Metric label="p95 latency" scope="last hour" value={String(latest)} unit="ms" status="warning" statusLabel="Above SLO" delta={{ value: 61, unit: " %", window: "previous hour" }} spark={{ points: p95.slice(-30), threshold: 300 }} freshness={`Updated ${updated}`} />
          <Metric label="Error rate" scope="last hour" value="0.42" unit="%" delta={{ value: 0.6, unit: " pt", window: "previous hour", threshold: 0.1 }} spark={{ points: spark(0.3, 0.05, 24, 0.12) }} target="Budget 1 %" />
          <Metric label="Requests" scope="per second" value="1,219" delta={{ value: 3.1, unit: " %", polarity: "neutral", window: "previous hour" }} spark={{ points: spark(1180, 60) }} />
          <Metric label="Availability" scope="30 days" value="99.94" unit="%" target="Target 99.9 %" spark={{ points: spark(99.95, 0.02) }} />
        </div>
        <div className="ex-row ex-2">
          <Panel title="Latency" meta="p95 and p50, last hour">
            <TimeSeriesChart ariaLabel="checkout-api latency, last hour" labels={labels} unit="ms" height={220}
              series={[{ name: "p95", points: p95, color: "chart-1" }, { name: "p50", points: p50, color: "chart-2" }]}
              threshold={{ value: 300, label: "SLO 300 ms" }} markers={marker >= 0 ? [{ index: marker, label: "v2.14.1" }] : []}
              onMarker={() => toast("Deploy v2.14.1, PR #1482 by Dev B")} />
          </Panel>
          <Panel title="Errors by type" meta="10-minute buckets">
            <BarChart ariaLabel="checkout-api errors by type" categories={errorBuckets} height={238} stacked
              series={[{ name: "5xx", values: errors5xx, color: "chart-1" }, { name: "4xx", values: errors4xx, color: "chart-other" }, { name: "Timeouts", values: errorsTimeout, color: "chart-3" }]} />
          </Panel>
        </div>
        <div className="ex-row ex-2">
          <Panel title="Endpoints" meta="worst first" flush>
            <DataTable columns={columns} rows={endpoints} defaultSort={{ key: "status", dir: "asc" }} caption="Endpoints of checkout-api" onRowClick={setEndpoint} selectedKey={endpoint?.id} />
          </Panel>
          <Panel title="Recent changes" meta="last 24 hours">
            <Timeline dense onEvent={() => toast("PR #1482 would open here")} events={[
              { time: "14:31", kind: "alert", title: "p95 above SLO", actor: "Alerting", highlight: true },
              { time: "14:29", kind: "deploy", title: "Deployed v2.14.1", actor: "Deploy bot, PR #1482 by Dev B", link: true },
              { time: "13:05", kind: "scale", title: "Max replicas 12 → 16", actor: "Dev C" },
              { time: "11:48", kind: "config", title: "Retry budget raised to 3", actor: "Dev D, PR #1477" },
              { time: "09:30", kind: "resolve", title: "Resolved alert_m2k9p", actor: "Dev A" },
            ]} />
          </Panel>
        </div>
      </div>
      <Modal open={rollback} title="Roll back checkout-api to v2.14.0?" onClose={() => setRollback(false)}
        actions={<><Button onClick={() => setRollback(false)}>Cancel</Button><Button variant="primary" onClick={() => { setRollback(false); toast({ tone: "healthy", title: "Rolling back to v2.14.0", body: "3 of 12 replicas updated. You can follow it under Deployments." }); }}>Roll back</Button></>}>
        <p style={{ margin: 0 }}>All 12 replicas in region-a move back to v2.14.0, one at a time. Traffic keeps flowing during the rollback.</p>
      </Modal>
      <Drawer open={endpoint != null} title={endpoint?.route ?? ""} subtitle="Last hour" onClose={() => setEndpoint(null)}
        footer={<Button onClick={() => setEndpoint(null)}>Close</Button>}>
        {endpoint ? (
          <div className="ex-stack">
            <StatusBadge status={endpoint.status} label={STATUS_LABEL[endpoint.status]} />
            <dl className="pw-fields">
              <div><dt>p95</dt><dd>{endpoint.p95} ms</dd></div>
              <div><dt>Requests/s</dt><dd>{endpoint.rps}</dd></div>
              <div><dt>Errors</dt><dd>{endpoint.errors.toFixed(1)} %</dd></div>
            </dl>
            <Sparkline points={spark(endpoint.p95 * 0.8, endpoint.p95 * 0.08, 24, endpoint.p95 * 0.2)} width={380} height={56} threshold={300} tone={endpoint.status} label={`p95 trend for ${endpoint.route}`} />
          </div>
        ) : null}
      </Drawer>
    </Frame>
  );
}
