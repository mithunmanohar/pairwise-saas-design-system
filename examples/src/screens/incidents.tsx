// Incidents: open ones first, then the recent history. A row opens the incident.
import { useState } from "react";
import { PageHeader, Panel, Tabs, DataTable, SeverityMark, StatusBadge, Metric, Button, Modal, TextInput, Select, Textarea, toast, type Column } from "@pairwise/ui";
import { Frame, OwnershipNote, useNav, useOwnership, useSelection, demoState } from "../frame";
import { incidents as allIncidents, isOpen, services, type Incident } from "../data";
import { serviceOwner } from "../org";
import { share, varyCounts, varyInt } from "../vary";

export const stateBadge = (i: Incident) => (
  <StatusBadge size="sm" status={i.state === "Resolved" ? "healthy" : i.state === "Investigating" ? "critical" : i.state === "Monitoring" ? "info" : "warning"} label={i.state} />
);

const columns: Column<Incident>[] = [
  { key: "sev", header: "Severity", sortable: true, defaultDir: "asc", render: (i) => <SeverityMark level={i.sev} /> },
  { key: "id", header: "Incident", mono: true },
  { key: "title", header: "Title", render: (i) => <span className="pw-body-strong">{i.title}</span> },
  { key: "service", header: "Service", mono: true },
  { key: "state", header: "State", sortable: true, sortValue: (i) => ["Investigating", "Acknowledged", "Monitoring", "Resolved"].indexOf(i.state), render: stateBadge,
    rollup: (rs) => { const n = rs.filter(isOpen).length; return n ? <StatusBadge size="sm" status="critical" label={`${n} open`} /> : <StatusBadge size="sm" status="healthy" label="All resolved" />; } },
  { key: "commander", header: "Commander", nowrap: true },
  { key: "started", header: "Started", nowrap: true },
  { key: "duration", header: "Duration", align: "right", num: true },
];

export function Incidents() {
  const go = useNav();
  const [tab, setTab] = useState("open");
  const [declare, setDeclare] = useState(demoState === "declare");
  const [title, setTitle] = useState("");
  const [tried, setTried] = useState(false);
  const own = useOwnership();
  const sel = useSelection();
  const part = share(sel);
  const incidents = allIncidents.filter((i) => own.has(serviceOwner(i.service)));
  const rows = tab === "open" ? incidents.filter(isOpen) : tab === "resolved" ? incidents.filter((i) => !isOpen(i)) : incidents;
  const close = () => { setDeclare(false); setTitle(""); setTried(false); };
  return (
    <Frame active="incidents">
      <PageHeader title="Incidents" meta="Declared incidents for every service in scope. Severity 1 is the most urgent."
        actions={<Button variant="primary" icon="siren" onClick={() => setDeclare(true)}>Declare incident</Button>}
        tabs={<Tabs value={tab} onChange={setTab} tabs={[
          { value: "open", label: "Open", count: incidents.filter(isOpen).length, tone: "critical" },
          { value: "resolved", label: "Resolved", count: incidents.filter((i) => !isOpen(i)).length },
          { value: "all", label: "All" },
        ]} />} />
      <div className="pw-page">
        <div className="ex-metrics">
          <Metric label="Open" scope="in scope, now" value={String(incidents.filter(isOpen).length)}
            {...(incidents.some(isOpen) ? { status: "critical" as const, statusLabel: incidents.filter(isOpen).map((i) => "SEV" + i.sev).join(", ") } : {})} />
          <Metric label="Time to acknowledge" scope="median, 30 days" value={String(varyInt(sel, "tta", 6))} unit="min" target="Target 10 min" delta={{ value: varyInt(sel, "tta-delta", 12, 0.8), unit: " %", polarity: "up-bad", window: "last month" }} />
          <Metric label="Time to resolve" scope="median, 30 days" value={String(varyInt(sel, "ttr", 47))} unit="min" delta={{ value: -varyInt(sel, "ttr-delta", 18, 0.8), unit: " %", polarity: "up-bad", window: "last month" }} />
          <Metric label="Incidents" scope="30 days" value={String(varyInt(sel, "count", Math.max(1, Math.round(9 * part))))} delta={{ value: -varyInt(sel, "count-delta", 3, 0.8), unit: "", polarity: "up-bad", window: "previous 30 days", threshold: 1 }} spark={{ points: varyCounts(sel, "count-spark", [2, 1, 3, 2, 0, 1, 2, 3, 1, 2, 1, 0, 2, 1], part) }} />
        </div>
        <Panel flush title={tab === "open" ? "Open incidents" : tab === "resolved" ? "Resolved incidents" : "All incidents"} meta="most urgent first">
          <DataTable columns={columns} rows={rows} rowKey="id" defaultSort={{ key: "sev", dir: "asc" }} caption="Incidents" onRowClick={(i) => go("incidents/" + i.id)}
            getPath={(i) => own.path(serviceOwner(i.service))} directLabel={own.directLabel} itemNoun={["incident", "incidents"]} toolbar={<OwnershipNote />}
            emptyTitle="No open incidents" emptyBody="Everything is running within its objectives." />
        </Panel>
      </div>
      <Modal open={declare} title="Declare an incident" onClose={close}
        actions={<><Button onClick={close}>Cancel</Button><Button variant="primary" onClick={() => { setTried(true); if (!title.trim()) return; close(); toast({ tone: "info", title: "INC-2042 declared", body: "On-call for the service has been paged." }); }}>Declare and page on-call</Button></>}>
        <TextInput label="What is happening?" placeholder="Checkout is slow for some customers" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
          error={tried && !title.trim() ? "Describe the impact in a few words so responders know where to start." : undefined} />
        <div className="ex-form">
          <Select label="Service" defaultValue="checkout-api" options={services.map((s) => s.name)} />
          <Select label="Severity" defaultValue="3" options={[{ value: "1", label: "SEV1, customer-facing outage" }, { value: "2", label: "SEV2, major degradation" }, { value: "3", label: "SEV3, minor degradation" }, { value: "4", label: "SEV4, no customer impact" }]} />
        </div>
        <Textarea label="Notes" rows={3} hint="Optional. Shared with responders." />
      </Modal>
    </Frame>
  );
}
