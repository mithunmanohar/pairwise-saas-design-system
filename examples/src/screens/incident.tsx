// One incident: what is happening, who is on it, what changed, and the next action.
import { useState } from "react";
import { PageHeader, Breadcrumbs, StatusBadge, SeverityMark, Button, ActionMenu, AlertBanner, Panel, Timeline, TimeSeriesChart, Textarea, StateBlock, CopyButton, Tag, toast, type TimelineEvent } from "@pairwise/ui";
import { Frame, useNav, useCrumbNav } from "../frame";
import { incidentById, isOpen, latencyWindow, DEPLOY_AT, members, type Incident } from "../data";
import { stateBadge } from "./incidents";

export function IncidentDetail({ id }: { id: string }) {
  const inc = incidentById(id);
  const crumbs = useCrumbNav();
  if (!inc) {
    return (
      <Frame active="incidents">
        <PageHeader crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "Incidents", href: "#/incidents" }, { label: id, mono: true }]} />} title={id} titleMono />
        <div className="pw-page ex-narrow"><Panel><StateBlock kind="empty" title="No incident with this id" body="Check the id, or find it in the incident list." /></Panel></div>
      </Frame>
    );
  }
  return <IncidentPage key={inc.id} inc={inc} />;
}

function IncidentPage({ inc }: { inc: Incident }) {
  const go = useNav();
  const crumbs = useCrumbNav();
  const [state, setState] = useState(inc.state);
  const [note, setNote] = useState("");
  const [events, setEvents] = useState<TimelineEvent[]>(inc.events);
  const open = state !== "Resolved";
  const { labels, p95 } = latencyWindow(0);
  const responders = members.filter((m) => m.name === inc.commander || (inc.service === "checkout-api" && (m.name === "Dev B" || m.name === "Dev C")));
  const post = () => {
    if (!note.trim()) return;
    setEvents([{ time: "14:58", kind: "comment", title: note.trim(), actor: "Dev A" }, ...events]);
    setNote("");
    toast("Update posted to the incident channel");
  };
  const resolve = () => { setState("Resolved"); setEvents([{ time: "14:58", kind: "resolve", title: "Resolved", actor: "Dev A" }, ...events]); toast({ tone: "healthy", title: `${inc.id} resolved`, body: "A postmortem ticket was opened." }); };
  return (
    <Frame active="incidents">
      <PageHeader
        crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "Incidents", href: "#/incidents" }, { label: inc.id, mono: true }]} />}
        title={inc.title}
        status={<><SeverityMark level={inc.sev} />{stateBadge({ ...inc, state })}</>}
        meta={[
          { label: "Incident", value: <CopyButton value={inc.id}>{inc.id}</CopyButton> },
          { label: "Service", value: <button type="button" className="pw-linkbtn ex-inline" onClick={() => go("services/" + inc.service)}>{inc.service}</button> },
          { label: "Commander", value: inc.commander }, { label: "Started", value: inc.started }, { label: "Duration", value: inc.duration },
        ]}
        actions={open ? <>
          <Button icon="server" onClick={() => go("services/" + inc.service)}>Open service</Button>
          <Button variant="primary" icon="check" onClick={resolve}>Mark resolved</Button>
          <ActionMenu label={`More actions for ${inc.id}`} items={[
            { label: "Page another team", icon: "bell", onSelect: () => toast("Platform on-call paged") },
            { label: "Open incident channel", icon: "comment", onSelect: () => toast("The chat channel would open here") },
            "separator",
            { label: "Change severity", icon: "siren", onSelect: () => toast("A severity picker would open here") },
          ]} />
        </> : <Button icon="page" onClick={() => toast("The postmortem would open here")}>Open postmortem</Button>}
      />
      <div className="pw-page">
        {open ? (
          <AlertBanner tone={inc.sev <= 2 ? "critical" : "warning"} title="Customer impact." meta="updated 14:57">{inc.impact}</AlertBanner>
        ) : (
          <AlertBanner tone="healthy" title="Resolved." meta={`after ${inc.duration}`}>{inc.impact}</AlertBanner>
        )}
        <div className="ex-row ex-2">
          <div className="ex-stack">
            {inc.service === "checkout-api" ? (
              <Panel title="p95 latency" meta="checkout-api, last hour">
                <TimeSeriesChart ariaLabel="checkout-api p95 latency during the incident" labels={labels} unit="ms" height={200}
                  series={[{ name: "p95", points: p95, color: "chart-1" }]} threshold={{ value: 300, label: "SLO 300 ms" }}
                  markers={[{ index: DEPLOY_AT, label: "v2.14.1" }]} highlight={[DEPLOY_AT + 2, labels.length - 1]} onMarker={() => go("deploys")} />
              </Panel>
            ) : null}
            <Panel title="Timeline" meta="newest first">
              {open ? (
                <div className="ex-compose">
                  <Textarea label="Post an update" hideLabel rows={2} placeholder="What changed, and what happens next?" value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="ex-actions"><Button size="sm" disabled={!note.trim()} onClick={post}>Post update</Button></div>
                </div>
              ) : null}
              <Timeline events={events} onEvent={() => go("deploys")} />
            </Panel>
          </div>
          <div className="ex-stack">
            <Panel title="Responders" meta={responders.length === 1 ? "1 person" : `${responders.length} people`}>
              <ul className="ex-people">
                {responders.map((m) => (
                  <li key={m.id}><span className="ex-avatar" aria-hidden="true">{m.initials}</span><span className="ex-list__main"><span className="pw-body-strong">{m.name}</span><span className="pw-caption pw-muted">{m.name === inc.commander ? "Incident commander" : m.teams.join(", ")}</span></span></li>
                ))}
              </ul>
            </Panel>
            <Panel title="Labels">
              <div className="ex-tags"><Tag mono>{`service:${inc.service}`}</Tag><Tag mono>{`sev:${inc.sev}`}</Tag>{inc.service === "checkout-api" ? <Tag>caused by deploy</Tag> : null}{isOpen(inc) ? <Tag>customer-facing</Tag> : null}</div>
            </Panel>
            <Panel title="Next steps">
              <ol className="ex-steps">
                <li>Confirm the cause with the owning team.</li>
                <li>Mitigate first: roll back or fail over before fixing forward.</li>
                <li>Post an update every 30 minutes until resolved.</li>
              </ol>
            </Panel>
          </div>
        </div>
      </div>
    </Frame>
  );
}
