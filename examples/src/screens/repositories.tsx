// Repositories: every repository connected to the org, with its latest CI result. A row opens its settings.
import { useState } from "react";
import { PageHeader, Panel, FilterBar, DataTable, StatusBadge, Tag, Button, Modal, TextInput, Select, Checkbox, toast, type Column } from "@pairwise/ui";
import { Frame, useNav } from "../frame";
import { repos, runs, type Repo } from "../data";

export function Repositories() {
  const go = useNav();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [connect, setConnect] = useState(false);
  const rows = repos.filter((r) => (!q || r.name.includes(q.toLowerCase())) && (!f.lang || f.lang === "all" || r.language === f.lang) && (!f.vis || f.vis === "all" || r.visibility === f.vis));
  const columns: Column<Repo>[] = [
    { key: "name", header: "Repository", sortable: true, defaultDir: "asc", render: (r) => <span className="ex-cell2"><span className="pw-mono pw-body-strong">{r.name}</span><span className="pw-caption pw-muted">{r.description}</span></span> },
    { key: "visibility", header: "Visibility", render: (r) => <Tag>{r.visibility}</Tag> },
    { key: "language", header: "Language", nowrap: true, sortable: true, defaultDir: "asc" },
    { key: "lastRun", header: "Latest run", render: (r) => {
      const run = runs.find((x) => x.repo === r.name);
      return run ? <button type="button" className="ex-plain" onClick={(e) => { e.stopPropagation(); go("runs/" + run.id); }} aria-label={`${r.lastRunLabel}, open ${run.id}`}><StatusBadge size="sm" status={r.lastRun} label={r.lastRunLabel} /></button> : <StatusBadge size="sm" status={r.lastRun} label={r.lastRunLabel} />;
    } },
    { key: "openPrs", header: "Open PRs", align: "right", num: true, sortable: true },
    { key: "updated", header: "Updated", align: "right", nowrap: true },
  ];
  return (
    <Frame active="repos">
      <PageHeader title="Repositories" meta="Repositories connected to example-org on GitHub."
        actions={<Button variant="primary" icon="link" onClick={() => setConnect(true)}>Connect repository</Button>} />
      <div className="pw-page">
        <Panel flush>
          <div className="ex-pad">
            <FilterBar query={q} onQuery={setQ} queryPlaceholder="Filter repositories" values={f} onChange={setF} onClear={() => { setQ(""); setF({}); }} count={`${rows.length} of ${repos.length}`}
              filters={[{ key: "lang", label: "Language", options: [...new Set(repos.map((r) => r.language))] }, { key: "vis", label: "Visibility", options: ["Private", "Internal"] }]} />
          </div>
          <DataTable columns={columns} rows={rows} rowKey="name" defaultSort={{ key: "name", dir: "asc" }} caption="Repositories" onRowClick={(r) => go("repos/" + r.name)} />
        </Panel>
      </div>
      <Modal open={connect} title="Connect a repository" onClose={() => setConnect(false)}
        actions={<><Button onClick={() => setConnect(false)}>Cancel</Button><Button variant="primary" onClick={() => { setConnect(false); toast({ tone: "healthy", title: "billing-service connected", body: "The first CI run starts on the next push." }); }}>Connect</Button></>}>
        <TextInput label="Repository" defaultValue="example-org/billing-service" hint="Owner and name, as on GitHub." />
        <Select label="Default branch" defaultValue="main" options={["main", "develop"]} />
        <Checkbox label="Run CI on pull requests" defaultChecked />
      </Modal>
    </Frame>
  );
}
