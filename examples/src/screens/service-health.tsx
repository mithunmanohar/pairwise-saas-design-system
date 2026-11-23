// Observability: a service's health at a glance. Exceptions first, everything else quiet.
// checkout-api tells the degraded story (deploy v2.14.1 pushed p95 over the SLO); other services render quiet.
// Live: the window rolls forward every few seconds (unless ?frozen=1). Roll back asks for confirmation; endpoint rows
// open a drawer.
import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs, Tabs, StatusBadge, Button, ActionMenu, AlertBanner, Metric, Panel, TimeSeriesChart, BarChart, DataTable, Timeline, Modal, Drawer, Sparkline, StateBlock, KeyValueList, useAssistant, toast, type Column } from "@pairwise/ui";
import { Frame, frozen, useNav, useCrumbNav, useSelection } from "../frame";
import { varyCounts, varyRound, varySeries, varyService, windowFor } from "../vary";
import { latencyWindow, steadyWindow, DEPLOY_AT, spark, errorBuckets, errors5xx, errors4xx, errorsTimeout, endpointsFor, deploys, incidents, isOpen, serviceByName, type Endpoint, type Service } from "../data";
import { SERVICE_STATUS } from "./services";

const STATUS_LABEL = { healthy: "Healthy", warning: "Slow", critical: "SLO breach" } as const;
const columns: Column<Endpoint>[] = [
  { key: "route", header: "Endpoint", mono: true },
  { key: "status", header: "Status", sortable: true, sortValue: (r) => ["critical", "warning", "healthy"].indexOf(r.status), render: (r) => <StatusBadge status={r.status} label={STATUS_LABEL[r.status]} size="sm" /> },
  { key: "p95", header: "p95", align: "right", num: true, sortable: true, render: (r) => `${r.p95.toLocaleString("en")} ms` },
  { key: "rps", header: "Requests/s", align: "right", num: true, sortable: true },
  { key: "errors", header: "Errors", align: "right", num: true, sortable: true, render: (r) => `${r.errors.toFixed(1)} %` },
];

export function ServiceHealth({ name = "checkout-api" }: { name?: string }) {
  const svc = serviceByName(name);
  const crumbs = useCrumbNav();
  if (!svc) {
    return (
      <Frame active="services">
        <PageHeader crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "Services", href: "#/services" }, { label: name, mono: true }]} />} title={name} titleMono />
        <div className="pw-page ex-narrow"><Panel><StateBlock kind="empty" title="No service with this name" body="It may have been renamed or removed." /></Panel></div>
      </Frame>
    );
  }
  return <ServicePage key={svc.name} svc={svc} />;
}

function ServicePage({ svc: base }: { svc: Service }) {
  const sel = useSelection();
  const assistant = useAssistant();
  const svc = varyService(sel, base);
  const go = useNav();
  const crumbs = useCrumbNav();
  const story = svc.name === "checkout-api";
  const [tab, setTab] = useState("overview");
  const [shift, setShift] = useState(0);
  const [rollback, setRollback] = useState(false);
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  useEffect(() => {
    if (frozen) return;
    const t = window.setInterval(() => setShift((s) => s + 1), 4000);
    return () => window.clearInterval(t);
  }, []);
  // The selected time range sets the window; the runtime scope and the rest of the selection vary the values.
  const hour = story ? latencyWindow(shift) : steadyWindow(shift, base.p95, svc.name.length);
  const win = windowFor(sel.time, shift);
  const pick = (pts: number[]) => (sel.time === "1h" ? pts : win.labels.map((_, i) => pts[Math.min(pts.length - 1, Math.floor((i * pts.length) / win.labels.length))] ?? 0));
  const labels = sel.time === "1h" ? hour.labels : win.labels;
  const p95 = varySeries(sel, svc.name + ":p95-series", pick(hour.p95), 0.2, 0.03).map((v) => Math.round(v));
  const p50 = varySeries(sel, svc.name + ":p50-series", pick(hour.p50), 0.2, 0.03).map((v) => Math.round(v));
  const latest = p95[p95.length - 1] ?? 0;
  const marker = sel.time === "1h" ? DEPLOY_AT - shift : -1;
  const updated = (hour.labels[hour.labels.length - 1] ?? "") + ":12";
  const prev = sel.time === "1h" ? "previous hour" : "previous period";
  // Errors come in six buckets across the selected window.
  const buckets = sel.time === "1h" ? errorBuckets : errorBuckets.map((_, i) => win.labels[Math.round((i * (win.labels.length - 1)) / (errorBuckets.length - 1))] ?? "");
  const eps = endpointsFor(svc);
  const svcDeploys = deploys.filter((d) => d.service === svc.name);
  const svcIncidents = incidents.filter((i) => i.service === svc.name);
  const openInc = svcIncidents.find(isOpen);
  const breach = latest > svc.slo;
  const scale = svc.rps / 1219;
  const endpointTable = <DataTable columns={columns} rows={eps} defaultSort={{ key: "status", dir: "asc" }} caption={`Endpoints of ${svc.name}`} onRowClick={setEndpoint} selectedKey={endpoint?.id} />;
  return (
    <Frame active="services">
      <PageHeader
        crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "Services", href: "#/services" }, { label: svc.name, mono: true }]} />}
        title={svc.name} titleMono
        status={<StatusBadge status={svc.status} label={SERVICE_STATUS[svc.status]} />}
        meta={[{ label: "Owner", value: svc.owner }, { label: "Version", value: svc.version, mono: true }, { label: "Region", value: svc.region }, { label: "SLO", value: `99.9 %, p95 under ${svc.slo.toLocaleString("en")} ms` }]}
        actions={<>
          <Button icon="book" onClick={() => toast("The runbook would open here")}>Runbook</Button>
          {story ? <Button variant="primary" icon="refresh" onClick={() => setRollback(true)}>Roll back to v2.14.0</Button> : null}
          <ActionMenu label={`More actions for ${svc.name}`} items={[
            { label: "Ask the assistant", icon: "assistant", onSelect: () => assistant.ask(`How is ${svc.name} doing?`) },
            { label: "Copy link", icon: "link", onSelect: () => toast("Link copied") },
            { label: "Open on GitHub", icon: "external", onSelect: () => toast("GitHub would open here") },
            "separator",
            { label: "Pause alerts", icon: "pause", onSelect: () => toast({ tone: "warning", title: "Alerts paused for 1 hour" }) },
          ]} />
        </>}
        tabs={<Tabs value={tab} onChange={(v) => (v === "incidents" && openInc ? go("incidents/" + openInc.id) : setTab(v))} tabs={[
          { value: "overview", label: "Overview" }, { value: "endpoints", label: "Endpoints", count: eps.length },
          { value: "deploys", label: "Deployments", count: svcDeploys.length },
          { value: "incidents", label: "Incidents", count: svcIncidents.filter(isOpen).length || undefined, tone: openInc ? "critical" : undefined },
        ]} />}
      />
      {tab === "overview" ? (
        <div className="pw-page">
          {story ? (
            <AlertBanner tone="warning" title="p95 latency has been above the SLO since 14:31." meta="alert_q3x7n, 27 min" action="Open incident" onAction={() => go("incidents/INC-2041")}>
              It started with deploy v2.14.1. Error rate is within budget.
            </AlertBanner>
          ) : null}
          <div className="ex-metrics">
            <Metric label="p95 latency" scope={win.phrase} value={latest.toLocaleString("en")} unit="ms" status={breach ? "warning" : undefined} statusLabel="Above SLO"
              delta={{ value: varyRound(sel, svc.name + ":p95-delta", story ? 61 : 1.2, 1, 0.6), unit: " %", window: prev }} spark={{ points: p95.slice(-30), threshold: svc.slo }} freshness={`Updated ${updated}`} />
            <Metric label="Error rate" scope={win.phrase} value={svc.errors.toFixed(2)} unit="%" delta={{ value: story ? 0.6 : 0.01, unit: " pt", window: prev, threshold: 0.1 }} spark={{ points: spark(svc.errors * 0.7, svc.errors * 0.12 + 0.01, 24, story ? 0.12 : 0) }} target="Budget 1 %" />
            <Metric label="Requests" scope="per second" value={svc.rps.toLocaleString("en")} delta={{ value: 3.1, unit: " %", polarity: "neutral", window: prev }} spark={{ points: spark(svc.rps, svc.rps * 0.05) }} />
            <Metric label="Availability" scope="30 days" value={svc.availability.toFixed(2)} unit="%" target="Target 99.9 %" spark={{ points: spark(svc.availability, 0.02) }} />
          </div>
          <div className="ex-row ex-2">
            <Panel title="Latency" meta={`p95 and p50, ${win.phrase}`}>
              <TimeSeriesChart ariaLabel={`${svc.name} latency, ${win.phrase}`} labels={labels} unit="ms" height={220}
                series={[{ name: "p95", points: p95, color: "chart-1" }, { name: "p50", points: p50, color: "chart-2" }]}
                threshold={{ value: svc.slo, label: `SLO ${svc.slo.toLocaleString("en")} ms` }} markers={story && marker >= 0 ? [{ index: marker, label: "v2.14.1" }] : []}
                onMarker={() => toast("Deploy v2.14.1, PR #1482 by Dev B")} />
            </Panel>
            <Panel title="Errors by type" meta={sel.time === "1h" ? "10-minute buckets" : win.phrase}>
              <BarChart ariaLabel={`${svc.name} errors by type`} categories={buckets} height={238} stacked
                series={[
                  { name: "5xx", values: varyCounts(sel, svc.name + ":5xx", story ? errors5xx : errors5xx.map((v) => Math.round(v * scale * 0.2))), color: "chart-1" },
                  { name: "4xx", values: varyCounts(sel, svc.name + ":4xx", errors4xx.map((v) => Math.round(v * (story ? 1 : scale)))), color: "chart-other" },
                  { name: "Timeouts", values: varyCounts(sel, svc.name + ":timeouts", story ? errorsTimeout : errorsTimeout.map((v) => Math.round(v * scale * 0.1))), color: "chart-3" },
                ]} />
            </Panel>
          </div>
          <div className="ex-row ex-2">
            <Panel title="Endpoints" meta="worst first" flush>{endpointTable}</Panel>
            <Panel title="Recent changes" meta="last 24 hours">
              <Timeline dense onEvent={() => go("deploys")} events={story ? [
                { time: "14:31", kind: "alert", title: "p95 above SLO", actor: "Alerting", highlight: true },
                { time: "14:29", kind: "deploy", title: "Deployed v2.14.1", actor: "Deploy bot, PR #1482 by Dev B", link: true },
                { time: "13:05", kind: "scale", title: "Max replicas 12 → 16", actor: "Dev C" },
                { time: "11:48", kind: "config", title: "Retry budget raised to 3", actor: "Dev D, PR #1477" },
                { time: "09:30", kind: "resolve", title: "Resolved alert_m2k9p", actor: "Dev A" },
              ] : [
                ...svcDeploys.map((d) => ({ time: d.when, kind: "deploy" as const, title: `Deployed ${d.version}`, actor: `${d.author}, PR ${d.pr}`, link: true })),
                { time: "08:00", kind: "scale", title: "Scheduled scale-up for business hours", actor: "Autoscaler" },
                { time: "Yesterday", kind: "config", title: "Alert thresholds reviewed", actor: svc.owner },
              ]} />
            </Panel>
          </div>
        </div>
      ) : tab === "endpoints" ? (
        <div className="pw-page"><Panel title="Endpoints" meta={`${eps.length} routes, last hour`} flush>{endpointTable}</Panel></div>
      ) : tab === "deploys" ? (
        <div className="pw-page">
          <Panel title="Deployments" meta="today">
            {svcDeploys.length ? <Timeline events={svcDeploys.map((d) => ({ time: d.when, kind: d.status === "critical" ? "alert" : d.status === "warning" ? "warn" : "deploy", title: `${d.version} to ${d.env}`, body: `${d.statusLabel}, took ${d.duration}`, actor: `${d.author}, PR ${d.pr}` }))} />
              : <StateBlock kind="empty" inline title="No deployments today" body="The last deployment was more than 24 hours ago." action="All deployments" onAction={() => go("deploys")} />}
          </Panel>
        </div>
      ) : (
        <div className="pw-page">
          <Panel title="Incidents" meta="last 30 days">
            {svcIncidents.length ? <Timeline onEvent={(e) => go("incidents/" + e.title.split(":")[0])} events={svcIncidents.map((i) => ({ time: i.started.replace(/^(Today|Yesterday) /, ""), kind: isOpen(i) ? "alert" : "resolve", title: `${i.id}: ${i.title}`, body: `${i.state}, ${i.duration}`, actor: `Commander ${i.commander}`, link: true }))} />
              : <StateBlock kind="empty" inline title="No incidents in the last 30 days" body={`${svc.name} has met its SLO every day this month.`} />}
          </Panel>
        </div>
      )}
      <Modal open={rollback} title={`Roll back ${svc.name} to v2.14.0?`} onClose={() => setRollback(false)}
        actions={<><Button onClick={() => setRollback(false)}>Cancel</Button><Button variant="primary" onClick={() => { setRollback(false); toast({ tone: "healthy", title: "Rolling back to v2.14.0", body: "3 of 12 replicas updated. You can follow it under Deployments." }); }}>Roll back</Button></>}>
        <p className="ex-p">All 12 replicas in region-a move back to v2.14.0, one at a time. Traffic keeps flowing during the rollback.</p>
      </Modal>
      <Drawer open={endpoint != null} title={endpoint?.route ?? ""} subtitle="Last hour" onClose={() => setEndpoint(null)}
        footer={<Button onClick={() => setEndpoint(null)}>Close</Button>}>
        {endpoint ? (
          <div className="ex-stack">
            <StatusBadge status={endpoint.status} label={STATUS_LABEL[endpoint.status]} />
            <KeyValueList label="Endpoint, last hour" items={[
              { label: "p95", value: `${endpoint.p95.toLocaleString("en")} ms` },
              { label: "Requests/s", value: endpoint.rps },
              { label: "Errors", value: `${endpoint.errors.toFixed(1)} %` },
            ]} />
            <div className="ex-fill"><Sparkline points={spark(endpoint.p95 * 0.8, endpoint.p95 * 0.08, 24, endpoint.status === "healthy" ? 0 : endpoint.p95 * 0.2)} width={380} height={56} threshold={svc.slo} tone={endpoint.status} label={`p95 trend for ${endpoint.route}`} /></div>
          </div>
        ) : null}
      </Drawer>
    </Frame>
  );
}
