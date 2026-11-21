// Type-level tests against the built package (dist/*.d.ts), resolved through package.json "exports".
// Run by `pnpm typecheck` after `pnpm build`. A line marked @ts-expect-error must stay an error.
import { TreeView, ScopePicker, SplitView, ScopeNote, indexTree, type TreeNode, type PathSegment, ScopeSwitcher, Breadcrumbs, PageHeader, entityIcon, entityLabel, type EntityKind, Field, Popover, PopoverClose, iconNames, type IconName, SegmentedControl, Pagination, ColumnsMenu, RadioGroup, Combobox, DatePicker, DateRangePicker, DEFAULT_RANGE_PRESETS, InlineEdit, FileUpload, KeyValueList, Avatar, AvatarGroup, ProgressBar, parseISODate, toISODate, DataTable, MenuSelect, TopBar, TimeSeriesChart, SideNav, NAV, Icon, Legend, TextInput, Textarea, Select, Checkbox, Switch, ActionMenu, CopyButton, Tag, CodeBlock, Toaster, toast, Button, type Column } from "@pairwise/ui";
import { createRef } from "react";
import { createFormatter } from "@pairwise/ui/format";
import { color, fonts, motion, layer, type ColorToken, type FontPreset } from "@pairwise/ui/tokens";

interface Run { id: string; repo: string; durationMs: number; startedAt: Date }
const runs: Run[] = [{ id: "run_8f3k2", repo: "sample-repo", durationMs: 1200, startedAt: new Date(0) }];
const columns: Column<Run>[] = [
  { key: "id", header: "Run", mono: true },
  { key: "durationMs", header: "Duration", num: true, sortable: true, sortValue: (r) => r.durationMs },
  { key: "startedAt", header: "Started", sortable: true, sortValue: (r) => r.startedAt, render: (r) => r.startedAt.toISOString() },
];

export const ok = [
  <DataTable columns={columns} rows={runs} onRowClick={(r) => r.repo.toUpperCase()} stickyHeader />,
  <MenuSelect label="Repo" value="sample-repo" options={["sample-repo", { value: "other", label: "Other" }]} onChange={(v) => v.trim()} />,
  <TimeSeriesChart ariaLabel="Duration" labels={["a", "b"]} series={[{ name: "p50", points: [1, null], color: "chart-1" }]} onMarker={(m) => m.index} band={[0, 1]} />,
  <SideNav active="home" nav={NAV} />,
  <Icon name="check" size={14} />,
  <Legend items={[{ name: "a", color: "chart-2" }]} line />,
  <TextInput ref={createRef<HTMLInputElement>()} label="Branch" value="main" onChange={(e) => e.target.value} error="Required" />,
  <Textarea label="Comment" rows={3} hint="Markdown is supported." />,
  <Select label="Repo" options={["sample-repo", { value: "docs", label: "Docs", meta: "example-org" }]} value="docs" onChange={(v) => v.trim()} />,
  <Checkbox label="Require approval" checked onChange={(c) => !c} />,
  <Switch label="Auto-merge" defaultChecked onChange={(on) => !on} />,
  <ActionMenu label="Actions for run_8f3k2" items={[{ label: "Re-run", icon: "refresh", onSelect: () => {} }, "separator", { label: "Delete", tone: "critical" }]} />,
  <ActionMenu items={[]} trigger={<Button ref={createRef<HTMLButtonElement>()}>Actions</Button>} />,
  <CopyButton value="run_8f3k2">run_8f3k2</CopyButton>,
  <Tag mono onRemove={() => {}}>feature/add-retry</Tag>,
  <CodeBlock code={"a\nb"} title="Build log" highlight={[2]} />,
  <Toaster max={2} />,
];
export const toastId: number = toast("Saved") + toast({ tone: "critical", title: "Failed", duration: null });
toast.dismiss(toastId);
// @ts-expect-error menu entries are items or "separator"
export const badMenu = <ActionMenu items={["divider"]} />;
// @ts-expect-error every form control needs a label
export const noLabel = <TextInput value="x" />;
// @ts-expect-error Checkbox onChange receives a boolean, not an event
export const badCheckbox = <Checkbox label="x" onChange={(e: React.ChangeEvent) => e} />;

// @ts-expect-error rows must match the column row type
export const badRows = <DataTable columns={columns} rows={[{ nope: 1 }]} />;
// @ts-expect-error unknown colour token
export const badColor: ColorToken = "chart-99";
// @ts-expect-error icon sizes are 12 | 14 | 16 | 20
export const badIcon = <Icon name="check" size={18} />;

export const f = createFormatter({ locale: "en-US", timeZone: "UTC", currency: "USD" });
export const c: string = color["chart-1"].light;

// Font presets: typed ids for data-font, with labels for a picker.
export const font: FontPreset = fonts[0].id;
export const fontLabels: string[] = fonts.map((x) => x.label);
// @ts-expect-error unknown font preset
export const badFont: FontPreset = "comic-sans";

// Account menu: a header, group headings and checked items.
export const accountMenu = <ActionMenu header={<span>Dev A</span>} items={[{ heading: "Switch organization" }, { label: "example-org", meta: "Owner", checked: true }, "separator", { label: "Sign out" }]} />;
export const topBar = <TopBar scope={{ env: "prod", cloud: "region-a", cluster: "cluster-1" }} scopeOptions={{ env: [], cloud: [], cluster: [] }} account={{ name: "Dev A", role: "Owner", org: "example-org", items: [{ label: "Sign out" }] }} />;
// @ts-expect-error an account needs a name
export const badAccount = <TopBar scope={{ env: "prod", cloud: "a", cluster: "b" }} scopeOptions={{ env: [], cloud: [], cluster: [] }} account={{ role: "Owner" }} />;

// 2.0 foundations: refs on every control, indeterminate checkbox, Field for custom controls, Button asChild, Popover,
// typed icon names, motion and layer tokens.
export const refs = [
  <Select ref={createRef<HTMLButtonElement>()} label="Repo" options={["a"]} required />,
  <Checkbox ref={createRef<HTMLButtonElement>()} label="Select all" hideLabel checked="indeterminate" />,
  <Switch ref={createRef<HTMLButtonElement>()} label="Auto-merge" error="Needs admin rights" />,
  <Field label="Owner" hint="A person or team" required>{(p) => <input {...p} />}</Field>,
  <Button asChild variant="primary" icon="play"><a href="#/runs/new">Start run</a></Button>,
  <Popover label="Filters" trigger={<Button icon="filter">Filters</Button>} side="bottom" align="end"><PopoverClose><Button>Done</Button></PopoverClose></Popover>,
];
export const iconName: IconName = "search";
export const someIcons: IconName[] = iconNames;
// @ts-expect-error unknown icon names are a type error
export const badIconName = <Icon name="serach" />;
// @ts-expect-error Field children is a render function
export const badField = <Field label="Owner"><input /></Field>;
export const dur: string = motion["duration-base"];
export const z: string = layer["z-popover"];

// 2.0 components: generics and unions stay strict.
export const v2 = [
  <SegmentedControl label="View" options={["list", { value: "board", label: "Board", disabled: true }]} value="list" onChange={(v) => v.trim()} />,
  <Pagination page={2} pageSize={25} total={312} onPageChange={(p) => p + 1} pageSizeOptions={[25, 50]} onPageSizeChange={(n) => n * 2} />,
  <ColumnsMenu columns={columns} hidden={["repo"]} onChange={(h) => h.length} />,
  <DataTable columns={columns} rows={runs} selection="multiple" selectedKeys={["run_8f3k2"]} onSelectionChange={(k) => k.length}
    bulkActions={(keys, rs) => <Button>{keys.length + rs[0]!.durationMs}</Button>} rowActions={(r) => [{ label: "Copy " + r.id }]} sort={{ key: "id", dir: "asc" }} onSortChange={(s) => s.dir} manual totalRows={300} page={2} />,
  <RadioGroup ref={createRef<HTMLDivElement>()} label="Plan" options={["free", { value: "team", description: "10 runners" }]} value="free" onChange={(v) => v.trim()} />,
  <Combobox label="Reviewer" options={["Dev A"]} value={null} onChange={(v: string | null) => v} />,
  <Combobox label="Topics" multiple options={[{ value: "ci", keywords: ["build"] }]} value={["ci"]} onChange={(v: string[]) => v.length} creatable onCreate={(l) => l.trim()} />,
  <DatePicker label="Due" value="2026-11-20" onChange={(v) => v?.slice(0, 4)} min="2026-01-01" isDateDisabled={(d) => d.endsWith("25")} />,
  <DateRangePicker label="Period" value={{ from: "2026-11-01", to: null }} onChange={(r) => r?.from} maxDays={31} presets={DEFAULT_RANGE_PRESETS} />,
  <InlineEdit label="Description" value="x" onSave={async (v) => { await Promise.resolve(v); }} validate={(v) => (v ? null : "Required")} />,
  <FileUpload label="Files" accept=".json" files={[{ id: "1", name: "a.json", size: 1, status: "uploading", progress: 10 }]} onFiles={(fs) => fs.map((f) => f.name)} />,
  <KeyValueList layout="grid" columns={3} items={[{ label: "Run", value: "run_8f3k2", mono: true, copy: "run_8f3k2" }]} />,
  <AvatarGroup people={[{ name: "Dev A" }]} max={3} size={32} />,
  <ProgressBar label="Rollout" value={null} tone="warning" />,
];
export const iso: string | null = parseISODate("2026-11-20") ? toISODate(new Date()) : null;
// @ts-expect-error multiple comboboxes take string arrays
export const badMulti = <Combobox label="Topics" multiple value="ci" options={[]} />;
// @ts-expect-error single comboboxes take a string or null
export const badSingle = <Combobox label="Owner" value={["a"]} options={[]} />;
// @ts-expect-error upload status is one of four states
export const badUpload = <FileUpload label="Files" files={[{ id: "1", name: "a", size: 1, status: "failed" }]} />;
// @ts-expect-error avatar sizes are 20 | 28 | 32 | 36
export const badAvatar = <Avatar name="Dev A" size={30} />;

// 2.1: entity kinds, runtime dimensions, folding breadcrumbs, PageHeader kind.
export const v21 = [
  <ScopeSwitcher dimensions={[{ key: "ns", label: "Namespace", value: "a", options: ["a", "b"], onChange: (v) => v.trim() }]} compact label="Runtime" />,
  <ScopeSwitcher scope={{ env: "prod", cloud: "a", cluster: "b" }} options={{ env: [], cloud: [], cluster: [] }} onChange={(s) => s.env} />,
  <Breadcrumbs maxItems={3} items={[{ label: "Example Company", icon: entityIcon.company, href: "#/c" }, { label: "AI transformation" }]} onNavigate={(i) => i.icon} />,
  <PageHeader title="AI transformation" kind={{ label: entityLabel.initiative, icon: entityIcon.initiative, detail: "owned by ML engineering" }} />,
];
export const kind: EntityKind = "initiative";
// @ts-expect-error unknown entity kind
export const badKind: EntityKind = "tribe";

// 2.1 hierarchy components and DataTable List / Tree.
const org: TreeNode[] = [{ id: "co", kind: "company", label: "Example Company", children: [{ id: "p", kind: "project", label: "Forecasting platform", hasChildren: true, status: "critical", statusCount: 1 }] }];
interface Pipe { id: string; cost: number; ok: boolean; path: PathSegment[] }
const pipes: Pipe[] = [{ id: "forecasting-train", cost: 1.9, ok: false, path: [{ id: "p", label: "Forecasting platform", kind: "project" }] }];
export const v21b = [
  <TreeView label="Organisation" nodes={org} selectedId="co" onSelect={(n) => n.kind} loadChildren={async (n) => (n.id ? [] : org)} filter="fore" state="ready" />,
  <ScopePicker nodes={org} value={null} onChange={(id) => id?.length} />,
  <SplitView asideLabel="Organisation" aside={<span />} defaultCollapsed>workspace</SplitView>,
  <ScopeNote scope="AI transformation" summary="and its 2 projects" mode="direct" onModeChange={(m) => m === "direct"} />,
  <TopBar ownership={<ScopePicker nodes={org} value="co" />} runtime={[{ key: "env", label: "Environment", value: "prod", options: ["prod"] }]} />,
  <DataTable rows={pipes} getPath={(p) => p.path} view="tree" onViewChange={(v) => v === "list"} itemNoun={["pipeline", "pipelines"]} directLabel="Owned by the initiative"
    columns={[{ key: "id", header: "Pipeline" }, { key: "cost", header: "Cost", rollup: "sum", format: (n) => "$" + n }, { key: "ok", header: "Status", rollup: { status: (p) => (p.ok ? "healthy" : "critical") } }, { key: "path", header: "Latest", rollup: (rs) => rs.length }]} />,
];
export const pathOf = indexTree(org).get("p")?.path.map((n) => n.label);
// @ts-expect-error the view is list or tree
export const badView = <DataTable rows={pipes} columns={[]} view="grid" />;
// @ts-expect-error a rollup is sum, latest, {status}, or a function
export const badRollup = <DataTable rows={pipes} columns={[{ key: "cost", header: "Cost", rollup: "average" }]} />;
