// e2e fixtures: small, realistic compositions of the package components. Each is mounted by harness.tsx with
// ?fixture=<name>. Keep sample content fictional (example-org, sample-repo, run_8f3k2, Dev A…J).
import * as React from "react";
import {
  ActionMenu, Button, Checkbox, DataTable, Drawer, GlobalSearch, MenuSelect, Modal, Select, Switch, Tabs, TextInput,
  Toaster, toast, type Column,
} from "../../src/index";

const { useState } = React;

function ModalFixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete branch</Button>
      <Modal open={open} title="Delete feature/add-retry?" onClose={() => setOpen(false)}
        actions={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => setOpen(false)}>Delete branch</Button></>}>
        <TextInput label="Type the branch name to confirm" />
      </Modal>
    </>
  );
}

function DrawerFixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open run</Button>
      <Drawer open={open} title="run_8f3k2" subtitle="sample-repo" onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Close</Button>}>
        <TextInput label="Note" />
      </Drawer>
    </>
  );
}

function ActionMenuFixture() {
  const [last, setLast] = useState("none");
  return (
    <>
      <ActionMenu label="Actions for run_8f3k2" items={[
        { label: "Re-run", icon: "refresh", onSelect: () => setLast("Re-run") },
        { label: "Copy link", icon: "link", onSelect: () => setLast("Copy link") },
        "separator",
        { label: "Cancel run", tone: "critical", onSelect: () => setLast("Cancel run") },
      ]} />
      <output data-testid="last">{last}</output>
    </>
  );
}

function FormFixture() {
  const [repo, setRepo] = useState("sample-repo");
  const [approve, setApprove] = useState(false);
  const [merge, setMerge] = useState(true);
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <TextInput label="Branch" defaultValue="feature/add-retry" hint="Created from main." error="A branch with this name already exists." />
      <Select label="Repository" value={repo} onChange={setRepo} options={["sample-repo", "docs-site", "infra"]} />
      <Checkbox label="Require approval" checked={approve} onChange={setApprove} />
      <Switch label="Auto-merge" checked={merge} onChange={setMerge} />
      <output data-testid="state">{`${repo}|${approve}|${merge}`}</output>
    </div>
  );
}

function TabsFixture() {
  const [tab, setTab] = useState("overview");
  return (
    <>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "overview", label: "Overview" }, { value: "runs", label: "Runs", count: 12 }, { value: "settings", label: "Settings" }]} />
      <output data-testid="tab">{tab}</output>
    </>
  );
}

function MenuSelectFixture() {
  const [env, setEnv] = useState("prod");
  return (
    <>
      <MenuSelect label="Environment" value={env} onChange={setEnv} options={["prod", "staging", "dev"]} />
      <output data-testid="env">{env}</output>
    </>
  );
}

function SearchFixture() {
  const [picked, setPicked] = useState("none");
  return (
    <div style={{ maxWidth: 480 }}>
      <GlobalSearch onSelect={(i) => setPicked(i.label)} items={[
        { label: "sample-repo", kind: "Repository" }, { label: "run_8f3k2", kind: "Run", status: "critical" },
        { label: "run_9a1x7", kind: "Run", status: "healthy" }, { label: "docs-site", kind: "Repository" },
      ]} />
      <output data-testid="picked">{picked}</output>
    </div>
  );
}

interface Run { id: string; repo: string; status: string; durationMs: number }
const RUNS: Run[] = Array.from({ length: 12 }, (_, i) => ({ id: `run_${(i + 10).toString(36)}k${i}`, repo: i % 2 ? "sample-repo" : "docs-site", status: i % 5 === 0 ? "Failed" : "Passed", durationMs: 1000 + ((i * 7919) % 5000) }));
const RUN_COLUMNS: Column<Run>[] = [
  { key: "id", header: "Run", mono: true },
  { key: "repo", header: "Repository", sortable: true, defaultDir: "asc" },
  { key: "status", header: "Status" },
  { key: "durationMs", header: "Duration", num: true, align: "right", sortable: true, render: (r) => `${r.durationMs} ms` },
];
function DataTableFixture() {
  const [opened, setOpened] = useState("none");
  const [repo, setRepo] = useState("all");
  const rows = repo === "all" ? RUNS : RUNS.filter((r) => r.repo === repo).slice(0, 3);
  return (
    <>
      <Button onClick={() => setRepo(repo === "all" ? "sample-repo" : "all")}>Toggle filter</Button>
      <DataTable caption="Recent runs" columns={RUN_COLUMNS} rows={rows} pageSize={5} onRowClick={(r) => setOpened(r.id)}
        renderExpanded={(r) => <span>Logs for {r.id}</span>} />
      <output data-testid="opened">{opened}</output>
    </>
  );
}

function ToastFixture() {
  return (
    <>
      <Button onClick={() => toast("Link copied")}>Show info</Button>
      <Button onClick={() => toast({ tone: "critical", title: "Couldn’t merge", body: "GitHub returned 409: the branch is out of date.", action: "Update branch" })}>Show error</Button>
      <Button onClick={() => toast({ tone: "healthy", title: "Run re-queued", action: "Undo", onAction: () => toast("Undone") })}>Show undo</Button>
      <Toaster />
    </>
  );
}

export const fixtures: Record<string, () => React.ReactElement> = {
  modal: ModalFixture, drawer: DrawerFixture, "action-menu": ActionMenuFixture, form: FormFixture, tabs: TabsFixture,
  "menu-select": MenuSelectFixture, search: SearchFixture, "data-table": DataTableFixture, toast: ToastFixture,
};
