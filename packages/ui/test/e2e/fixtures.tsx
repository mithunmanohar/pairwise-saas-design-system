// e2e fixtures: small, realistic compositions of the package components. Each is mounted by harness.tsx with
// ?fixture=<name>. Keep sample content fictional (example-org, sample-repo, run_8f3k2, Dev A…J).
import * as React from "react";
import {
  ActionMenu, Button, Checkbox, DataTable, Drawer, Field, GlobalSearch, MenuSelect, Modal, Popover, PopoverClose, Select,
  Switch, Tabs, TabPanel, TextInput, Toaster, toast, Tooltip, TimeRangePicker, SegmentedControl, StatusGrid, BarChart, Heatmap,
  Pagination, ColumnsMenu, RadioGroup, Combobox, DatePicker, DateRangePicker, InlineEdit, FileUpload, KeyValueList, Avatar, AvatarGroup,
  ProgressBar, type Column, type DataTableSort, type UploadItem, type DateRangeValue,
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

function FoundationsFixture() {
  const [rows, setRows] = useState<Record<string, boolean>>({ a: true, b: false });
  const all = Object.values(rows).every(Boolean), some = Object.values(rows).some(Boolean);
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
      <TextInput label="Repository name" required defaultValue="sample-repo" />
      <TextInput label="Created by" readOnly defaultValue="Dev A" />
      <Checkbox label="Select all runs" checked={all ? true : some ? "indeterminate" : false} onChange={(c) => setRows({ a: c, b: c })} />
      <Checkbox label="run_8f3k2" checked={rows.a} onChange={(c) => setRows({ ...rows, a: c })} />
      <Checkbox label="run_9a1x7" checked={rows.b} onChange={(c) => setRows({ ...rows, b: c })} />
      <Switch label="Deploy on merge" error="Only admins can turn this on." />
      <Field label="Owner" hint="A person or team." required>{(p) => <input className="pw-input" {...p} defaultValue="Dev B" />}</Field>
      <Button asChild variant="primary" icon="play"><a href="#started">Start run</a></Button>
      <Popover label="Run filters" trigger={<Button icon="filter">Filters</Button>}>
        <div style={{ display: "grid", gap: 8 }}>
          <Checkbox label="Only failed runs" />
          <PopoverClose><Button size="sm">Done</Button></PopoverClose>
        </div>
      </Popover>
    </div>
  );
}

function TooltipFixture() {
  return (
    <div style={{ display: "flex", gap: 24, padding: 40 }}>
      <Tooltip content="Re-run failed checks"><Button icon="refresh" aria-label="Re-run" /></Tooltip>
      <Tooltip content="Opens in your CI provider" side="right"><a href="#ci">CI run</a></Tooltip>
    </div>
  );
}

function TimeFixture() {
  const [range, setRange] = useState("1h");
  const [refresh, setRefresh] = useState<"off" | "30s" | "1m" | "5m">("30s");
  const [abs, setAbs] = useState<string | undefined>();
  const [copied, setCopied] = useState("none");
  const [view, setView] = useState("list");
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start", paddingLeft: 400 }}>
      <TimeRangePicker value={range} onChange={(v) => { setRange(v); setAbs(undefined); }} refresh={refresh} onRefreshChange={(r) => setRefresh(r as typeof refresh)}
        absolute={abs} onAbsoluteChange={(r) => setAbs(`${r.from} – ${r.to}`)} onCopy={setCopied} defaultAbsolute={{ from: "2026-11-20 09:00", to: "2026-11-20 10:00" }} />
      <SegmentedControl label="View" value={view} onChange={setView} options={[{ value: "list", label: "List" }, { value: "board", label: "Board" }, { value: "timeline", label: "Timeline", disabled: true }]} />
      <output data-testid="state">{`${range}|${refresh}|${abs ?? ""}|${copied}|${view}`}</output>
    </div>
  );
}

function CommandsFixture() {
  const [log, setLog] = useState<string[]>([]);
  const [async, setAsync] = useState<{ q: string; loading: boolean }>({ q: "", loading: false });
  const add = (x: string) => setLog((l) => [...l, x]);
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 520 }}>
      <GlobalSearch onSelect={(i) => add("select:" + i.label)}
        recent={[{ label: "sample-repo", kind: "Repository" }, { label: "run_8f3k2", kind: "Run", status: "critical" }]}
        items={[
          { label: "Go to incidents", group: "Commands", icon: "siren", shortcut: "G I", keywords: ["alerts"], onRun: () => add("run:incidents") },
          { label: "Toggle theme", group: "Commands", icon: "settings", description: "Switch between light and dark", onRun: () => add("run:theme") },
          { label: "sample-repo", kind: "Repository", group: "Repositories" },
          { label: "run_8f3k2", kind: "Run", status: "critical", group: "Runs" },
        ]} />
      <GlobalSearch label="Search runs" shortcut={false} filter={false} loading={async.loading} placeholder="Search runs on the server"
        onQueryChange={(q) => setAsync({ q, loading: !!q })} items={async.q && !async.loading ? [{ label: `run_${async.q}1`, kind: "Run" }] : []} />
      <Button onClick={() => setAsync((a) => ({ ...a, loading: false }))}>Finish loading</Button>
      <output data-testid="log">{log.join(",")}</output>
    </div>
  );
}

function CriticalModalFixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Delete repository</Button>
      <Modal open={open} tone="critical" title="Delete sample-repo?" onClose={() => setOpen(false)}
        actions={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => setOpen(false)}>Delete repository</Button></>}>
        <p style={{ margin: 0 }}>Runs, settings and webhooks for sample-repo are removed. This can’t be undone.</p>
      </Modal>
    </>
  );
}

const MANY: Run[] = Array.from({ length: 63 }, (_, i) => ({ id: `run_${String(i + 1).padStart(2, "0")}`, repo: ["sample-repo", "docs-site", "infra"][i % 3]!, status: i % 7 === 0 ? "Failed" : "Passed", durationMs: 900 + ((i * 7919) % 6000) }));
const PINNED: Column<Run>[] = RUN_COLUMNS.map((c) => (c.key === "id" ? { ...c, pin: "start" as const, hideable: false } : c));
function TablePlusFixture() {
  const [sel, setSel] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>(["status"]);
  const [sort, setSort] = useState<DataTableSort | null>({ key: "durationMs", dir: "desc" });
  const [log, setLog] = useState("none");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><ColumnsMenu columns={PINNED} hidden={hidden} onChange={setHidden} /></div>
      <DataTable caption="All runs" columns={PINNED} rows={MANY} pageSize={10} pageSizeOptions={[10, 25]}
        selection="multiple" selectedKeys={sel} onSelectionChange={setSel} hiddenColumns={hidden} sort={sort} onSortChange={setSort}
        bulkActions={(keys) => <Button size="sm" onClick={() => setLog("rerun:" + keys.length)}>Re-run</Button>}
        rowActions={(r) => [{ label: "Copy run id", icon: "copy", onSelect: () => setLog("copy:" + r.id) }, "separator", { label: "Cancel run", tone: "critical", onSelect: () => setLog("cancel:" + r.id) }]} />
      <output data-testid="log">{log}</output>
      <output data-testid="sort">{sort ? sort.key + ":" + sort.dir : "none"}</output>
    </div>
  );
}

function PaginationFixture() {
  const [page, setPage] = useState(1);
  return <><Pagination page={page} pageSize={25} total={312} onPageChange={setPage} /><output data-testid="page">{page}</output></>;
}

function GridFixture() {
  const [cell, setCell] = useState("none");
  const cols = ["01", "02", "03", "04"];
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <StatusGrid ariaLabel="Nightly jobs by run" cols={cols} rows={[{ key: "ingest", label: "daily_ingest" }, { key: "train", label: "train_model" }]}
        cells={[["healthy", "warning", "critical", "info"], ["healthy", "healthy", "unknown", "critical"]]} onCell={(r, c, s) => setCell(`${r.label}:${c}:${s}`)} />
      <output data-testid="cell">{cell}</output>
      <BarChart ariaLabel="Runs per day" categories={["Mon", "Tue", "Wed"]} series={[{ name: "Passed", values: [12, 9, 14], color: "chart-1" }, { name: "Failed", values: [1, 3, 0], color: "chart-2" }]} onBar={(c) => setCell("bar:" + c)} />
      <Heatmap ariaLabel="Queue wait by hour" unit="s" rows={["runner-a", "runner-b"]} cols={["00", "01", "02"]} values={[[1, 2, null], [3, 0.5, 4]]} />
    </div>
  );
}

function TabPanelsFixture() {
  const [tab, setTab] = useState("checks");
  return (
    <Tabs label="Run details" value={tab} onChange={setTab} tabs={[{ value: "checks", label: "Checks", count: 3 }, { value: "logs", label: "Logs" }, { value: "files", label: "Files", disabled: true }]}>
      <TabPanel value="checks">3 checks passed.</TabPanel>
      <TabPanel value="logs">Build log for run_8f3k2.</TabPanel>
      <TabPanel value="files">No files.</TabPanel>
    </Tabs>
  );
}

function NewFormFixture() {
  const [plan, setPlan] = useState("team");
  const [owner, setOwner] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>(["ci"]);
  const [extra, setExtra] = useState<string[]>([]);
  const [due, setDue] = useState<string | null>("2026-11-20");
  const [range, setRange] = useState<DateRangeValue | null>(null);
  const owners = ["Dev A", "Dev B", "Dev C", "Dev D", "Dev E"].map((n, i) => ({ value: "dev-" + "abcde"[i], label: n, meta: i === 0 ? "Owner" : "Member" }));
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 420 }}>
      <RadioGroup label="Plan" value={plan} onChange={setPlan} hint="You can change this later." options={[{ value: "free", label: "Free", description: "1 runner" }, { value: "team", label: "Team", description: "10 runners" }, { value: "enterprise", label: "Enterprise", disabled: true }]} />
      <Combobox label="Reviewer" options={owners} value={owner} onChange={setOwner} required />
      <Combobox label="Topics" multiple creatable options={[...["ci", "docs", "infra", "release"], ...extra]} value={topics} onChange={setTopics} onCreate={(t) => setExtra((e) => [...e, t])} />
      <DatePicker label="Due date" value={due} onChange={setDue} min="2026-11-01" max="2026-12-31" isDateDisabled={(d) => d === "2026-11-25"} />
      <DateRangePicker label="Billing period" value={range} onChange={setRange} maxDays={45} min="2026-01-01" max="2026-12-31" presets={[{ label: "November", range: () => ({ from: "2026-11-01", to: "2026-11-30" }) }]} />
      <output data-testid="state">{JSON.stringify({ plan, owner, topics, due, range })}</output>
    </div>
  );
}

function DetailsFixture() {
  const [desc, setDesc] = useState("Retries flaky jobs.");
  const [name, setName] = useState("sample-repo");
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 520 }}>
      <KeyValueList label="Run details" items={[
        { label: "Run", value: "run_8f3k2", mono: true, copy: "run_8f3k2" },
        { label: "Branch", value: "feature/add-retry", mono: true },
        { label: "Description", value: <InlineEdit label="Description" value={desc} onSave={setDesc} multiline /> },
        { label: "Repository", value: <InlineEdit label="Repository name" value={name} mono validate={(v) => (/^[a-z0-9-]+$/.test(v) ? null : "Use lowercase letters, digits and dashes.")}
            onSave={(v) => new Promise<void>((ok, no) => setTimeout(() => (v === "taken" ? no(new Error("That name is taken.")) : (setName(v), ok())), 50))} /> },
        { label: "Reviewer", value: null },
      ]} />
      <AvatarGroup label="Reviewers" max={3} people={["Dev A", "Dev B", "Dev C", "Dev D", "Dev E"].map((name) => ({ name }))} />
      <Avatar name="Dev F" status="critical" />
      <ProgressBar label="Rollout" value={3} max={12} valueText="3 of 12 replicas" />
      <ProgressBar label="Indexing" value={null} />
    </div>
  );
}

function UploadFixture() {
  const [files, setFiles] = useState<UploadItem[]>([{ id: "u1", name: "sbom.json", size: 20480, status: "uploading", progress: 40 }, { id: "u2", name: "notes.txt", size: 900, status: "error", error: "Network error." }]);
  return (
    <div style={{ maxWidth: 520 }}>
      <FileUpload label="Attachments" hint="JSON or text, up to 1 MB each." accept=".json,.txt" maxSize={1024 * 1024} files={files}
        onFiles={(fs) => setFiles((x) => [...x, ...fs.map((f, i) => ({ id: "n" + x.length + i, name: f.name, size: f.size, status: "done" as const }))])}
        onRemove={(id) => setFiles((x) => x.filter((f) => f.id !== id))} onRetry={(id) => setFiles((x) => x.map((f) => (f.id === id ? { ...f, status: "uploading" as const, progress: 0, error: undefined } : f)))} />
    </div>
  );
}

export const fixtures: Record<string, () => React.ReactElement> = {
  modal: ModalFixture, drawer: DrawerFixture, "action-menu": ActionMenuFixture, form: FormFixture, tabs: TabsFixture,
  "menu-select": MenuSelectFixture, search: SearchFixture, "data-table": DataTableFixture, toast: ToastFixture,
  foundations: FoundationsFixture, tooltip: TooltipFixture, time: TimeFixture, commands: CommandsFixture, "critical-modal": CriticalModalFixture,
  "new-form": NewFormFixture, details: DetailsFixture, upload: UploadFixture, "table-plus": TablePlusFixture, pagination: PaginationFixture, grid: GridFixture, "tab-panels": TabPanelsFixture,
};
