// CI runs: the latest run per branch, with each branch's recent history so a flaky failure stands out.
import { useState } from "react";
import { PageHeader, Panel, Tabs, FilterBar, DataTable, StatusBadge, RunStrip, Button, toast, type Column } from "@pairwise/ui";
import { Frame, useNav } from "../frame";
import { runs, repos, type Run } from "../data";

const columns: Column<Run>[] = [
  { key: "status", header: "Status", render: (r) => <StatusBadge size="sm" status={r.status} label={r.statusLabel} /> },
  { key: "id", header: "Run", mono: true },
  { key: "repo", header: "Repository", mono: true, sortable: true, defaultDir: "asc" },
  { key: "branch", header: "Branch", mono: true },
  { key: "history", header: "Last 10 runs", render: (r) => <RunStrip runs={r.history} name={r.branch} /> },
  { key: "author", header: "Triggered by", nowrap: true, render: (r) => `${r.author}, ${r.trigger}` },
  { key: "when", header: "Started", num: true, sortable: true },
  { key: "duration", header: "Duration", align: "right", num: true },
];

export function Runs() {
  const go = useNav();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const rows = runs.filter((r) => (tab === "all" || (tab === "failing" ? r.status === "critical" : r.author === "Dev A"))
    && (!q || r.branch.includes(q) || r.id.includes(q)) && (!f.repo || f.repo === "all" || r.repo === f.repo));
  return (
    <Frame active="runs">
      <PageHeader title="CI runs" meta="The latest run on every active branch."
        actions={<Button icon="refresh" onClick={() => toast("Checked for new runs just now")}>Refresh</Button>}
        tabs={<Tabs value={tab} onChange={setTab} tabs={[{ value: "all", label: "All runs", count: runs.length }, { value: "failing", label: "Failing", count: runs.filter((r) => r.status === "critical").length, tone: "critical" }, { value: "mine", label: "Started by me" }]} />} />
      <div className="pw-page">
        <Panel flush>
          <div className="ex-pad">
            <FilterBar query={q} onQuery={setQ} queryPlaceholder="Filter by branch or run" values={f} onChange={setF} onClear={() => { setQ(""); setF({}); }}
              count={`${rows.length} runs`} filters={[{ key: "repo", label: "Repository", options: repos.map((r) => r.name) }]} />
          </div>
          <DataTable columns={columns} rows={rows} defaultSort={{ key: "when", dir: "desc" }} caption="CI runs" onRowClick={(r) => go("runs/" + r.id)}
            emptyTitle="No runs match" emptyBody="Clear the filters, or push a commit to start a run." />
        </Panel>
      </div>
    </Frame>
  );
}
