// Services: every service in scope, filterable, worst first. A row opens that service's health page.
import { useState } from "react";
import { PageHeader, Panel, FilterBar, DataTable, StatusBadge, BulletBar, Button, toast, type Column } from "@pairwise/ui";
import { Frame, useNav } from "../frame";
import { services, type Service } from "../data";

export const SERVICE_STATUS = { healthy: "Healthy", warning: "Degraded", critical: "Down" } as const;
const owners = [...new Set(services.map((s) => s.owner))];
const kinds = [...new Set(services.map((s) => s.kind))];

const columns: Column<Service>[] = [
  { key: "name", header: "Service", mono: true, sortable: true, defaultDir: "asc" },
  { key: "status", header: "Status", sortable: true, sortValue: (s) => ["critical", "warning", "healthy"].indexOf(s.status), render: (s) => <StatusBadge status={s.status} label={SERVICE_STATUS[s.status]} size="sm" /> },
  { key: "kind", header: "Type", nowrap: true },
  { key: "owner", header: "Owner", nowrap: true, sortable: true, defaultDir: "asc" },
  { key: "version", header: "Version", mono: true },
  { key: "p95", header: "p95", align: "right", num: true, sortable: true, render: (s) => `${s.p95.toLocaleString("en")} ms` },
  { key: "rps", header: "Requests/s", align: "right", num: true, sortable: true, render: (s) => s.rps.toLocaleString("en") },
  { key: "budget", header: "Error budget used", width: 170, sortable: true, sortValue: (s) => 1 - s.budget, render: (s) => <BulletBar used={1 - s.budget} requested={1 - s.budget} limit={1} warnAt={0.6} critAt={0.9} label={`${s.name} error budget used`} /> },
];

export function Services() {
  const go = useNav();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const rows = services.filter((s) => (!q || s.name.includes(q.toLowerCase()))
    && (!f.status || f.status === "all" || s.status === f.status)
    && (!f.owner || f.owner === "all" || s.owner === f.owner)
    && (!f.kind || f.kind === "all" || s.kind === f.kind));
  return (
    <Frame active="services">
      <PageHeader title="Services" meta="Every service and model endpoint in prod, with its SLO and error budget."
        actions={<Button variant="primary" icon="server" onClick={() => toast("A new-service wizard would open here")}>Register service</Button>} />
      <div className="pw-page">
        <Panel flush>
          <div className="ex-pad">
            <FilterBar query={q} onQuery={setQ} queryPlaceholder="Filter services" values={f} onChange={setF} onClear={() => { setQ(""); setF({}); }}
              count={`${rows.length} of ${services.length}`}
              filters={[
                { key: "status", label: "Status", options: [{ value: "critical", label: "Down" }, { value: "warning", label: "Degraded" }, { value: "healthy", label: "Healthy" }] },
                { key: "owner", label: "Owner", options: owners },
                { key: "kind", label: "Type", options: kinds },
              ]} />
          </div>
          <DataTable columns={columns} rows={rows} rowKey="name" defaultSort={{ key: "status", dir: "asc" }} caption="Services" pageSize={8}
            onRowClick={(s) => go("services/" + s.name)} emptyTitle="No services match" emptyBody="Clear the filters to see every service." />
        </Panel>
      </div>
    </Frame>
  );
}
