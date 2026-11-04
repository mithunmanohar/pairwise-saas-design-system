// Type-level tests against the built package (dist/*.d.ts), resolved through package.json "exports".
// Run by `pnpm typecheck` after `pnpm build`. A line marked @ts-expect-error must stay an error.
import { DataTable, MenuSelect, TimeSeriesChart, SideNav, NAV, Icon, Legend, TextInput, Textarea, Select, Checkbox, Switch, ActionMenu, CopyButton, Tag, CodeBlock, Toaster, toast, Button, type Column } from "@pairwise/ui";
import { createRef } from "react";
import { createFormatter } from "@pairwise/ui/format";
import { color, type ColorToken } from "@pairwise/ui/tokens";

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
