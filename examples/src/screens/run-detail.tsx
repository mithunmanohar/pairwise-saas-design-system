// Developer platform: why did this CI run fail, and is it flaky or real?
// run_8f3k2 tells the failing story; other runs render from their status.
import { useState } from "react";
import { PageHeader, Breadcrumbs, Tabs, StatusBadge, Button, ActionMenu, CopyButton, Panel, StatusGrid, RunStrip, CodeBlock, Timeline, Tag, Drawer, DataTable, StateBlock, toast, type Column, type Status } from "@pairwise/ui";
import { Frame, demoState, useCrumbNav } from "../frame";
import { jobs, runCols, cells, branchRuns, mainRuns, testLog, passLog, runById, type Run } from "../data";

interface Job { key: string; label: string; status: Status; duration: string; attempt: string }
const JOB_TIMES = ["6 s", "11 s", "25 s", "1 min 48 s", "39 s", "1 min 3 s"];
const jobWord = (s: Status) => (s === "critical" ? "Failed" : s === "warning" ? "Passed after retry" : s === "info" ? "Running" : s === "unknown" ? "Skipped" : "Passed");
const jobsOf = (r: Run): Job[] => jobs.map((j, i) => {
  const status: Status = r.status === "critical" ? (j.key === "unit" ? "critical" : j.key === "integ" || j.key === "build" || j.key === "e2e" ? "unknown" : "healthy")
    : r.status === "info" ? (i < 3 ? "healthy" : i === 3 ? "info" : "unknown")
    : r.status === "warning" ? (j.key === "integ" ? "warning" : "healthy")
    : r.status === "unknown" ? (i < 2 ? "healthy" : "unknown") : "healthy";
  return { ...j, status, duration: status === "unknown" ? "–" : status === "info" ? "Running" : JOB_TIMES[i] ?? "", attempt: status === "warning" ? "2 of 2" : "1 of 1" };
});
const jobColumns: Column<Job>[] = [
  { key: "label", header: "Job", mono: true },
  { key: "status", header: "Result", render: (j) => <StatusBadge size="sm" status={j.status} label={jobWord(j.status)} /> },
  { key: "attempt", header: "Attempt", num: true },
  { key: "duration", header: "Duration", align: "right", num: true },
];
const ARTIFACTS = [
  { id: "a1", name: "coverage-report.html", size: "1.4 MB", job: "unit tests" },
  { id: "a2", name: "junit.xml", size: "86 KB", job: "unit tests" },
  { id: "a3", name: "build-output.tar.gz", size: "12.8 MB", job: "build" },
];

export function RunDetail({ id = "run_8f3k2" }: { id?: string }) {
  const run = runById(id);
  const crumbs = useCrumbNav();
  if (!run) {
    return (
      <Frame active="runs">
        <PageHeader crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "CI runs", href: "#/runs" }, { label: id, mono: true }]} />} title={id} titleMono />
        <div className="pw-page ex-narrow"><Panel><StateBlock kind="empty" title="No run with this id" body="Runs are kept for 90 days." /></Panel></div>
      </Frame>
    );
  }
  return <RunPage key={run.id} run={run} />;
}

function RunPage({ run }: { run: Run }) {
  const crumbs = useCrumbNav();
  const failed = run.status === "critical";
  const [tab, setTab] = useState("summary");
  const [drawer, setDrawer] = useState(failed && demoState === "drawer");
  const rerun = () => { setDrawer(false); toast({ tone: "info", title: failed ? "Re-running unit tests" : "Re-running all jobs", body: `${run.id}, attempt 2` }); };
  const runJobs = jobsOf(run);
  const log = failed ? testLog : passLog(run);
  const failingJob = runJobs.find((j) => j.status === "critical");
  return (
    <Frame active="runs">
      <PageHeader
        crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "CI runs", href: "#/runs" }, { label: run.repo, href: "#/repos/" + run.repo, mono: true }, { label: run.id, mono: true }]} />}
        title={run.id} titleMono
        status={<StatusBadge status={run.status} label={run.statusLabel} />}
        meta={[
          { label: "Branch", value: <CopyButton value={run.branch}>{run.branch}</CopyButton> },
          { label: "Commit", value: <CopyButton value={run.commit + "a7b3d90e1"}>{run.commit}</CopyButton> },
          { label: "Triggered by", value: `${run.author}, ${run.trigger}` },
          { label: "Duration", value: run.duration },
        ]}
        actions={<>
          <Button icon="external" onClick={() => toast("GitHub would open here")}>Open on GitHub</Button>
          {run.status === "info" ? <Button variant="primary" icon="pause" onClick={() => toast({ tone: "warning", title: "Cancelling run" })}>Cancel run</Button>
            : <Button variant="primary" icon="refresh" onClick={rerun}>{failed ? "Re-run failed job" : "Re-run"}</Button>}
          <ActionMenu label={`More actions for ${run.id}`} items={[{ label: "Re-run all jobs", icon: "refresh", onSelect: () => toast("Re-running all 6 jobs") }, { label: "Download logs", icon: "page", onSelect: () => toast("Logs downloaded") }, "separator", { label: "Cancel pipeline", tone: "critical", disabled: run.status !== "info", onSelect: () => toast({ tone: "critical", title: "Pipeline cancelled" }) }]} />
        </>}
        tabs={<Tabs value={tab} onChange={setTab} tabs={[{ value: "summary", label: "Summary" }, { value: "jobs", label: "Jobs", count: runJobs.length }, { value: "logs", label: "Logs" }, { value: "artifacts", label: "Artifacts", count: ARTIFACTS.length }]} />}
      />
      {tab === "summary" ? (
        <div className="pw-page">
          <div className="ex-row ex-2">
            <div className="ex-stack">
              <Panel title="Checks" meta="6 jobs × last 16 runs on this branch">
                <StatusGrid ariaLabel="Job results for the last 16 runs" rows={jobs} cols={runCols} cells={cells} rowLabelWidth={150} onCell={(r, c, s) => toast(`${r.label}, run ${c}: ${s === "critical" ? "failed" : s === "warning" ? "passed after retry" : s === "unknown" ? "skipped" : "passed"}`)} />
              </Panel>
              {failingJob ? (
                <Panel title="Failing job" meta={`${failingJob.label}, attempt ${failingJob.attempt}`} actions={<Button size="sm" onClick={() => setDrawer(true)}>Open job</Button>}>
                  <CodeBlock title={`${failingJob.label}: log`} code={log} highlight={[6, 7, 8]} maxHeight={260} />
                </Panel>
              ) : (
                <Panel title="Jobs" meta={jobWord(run.status === "info" ? "info" : "healthy").toLowerCase()} flush>
                  <DataTable columns={jobColumns} rows={runJobs} rowKey="key" caption={`Jobs of ${run.id}`} />
                </Panel>
              )}
            </div>
            <div className="ex-stack">
              <Panel title="Run history" meta="last 20 runs">
                <div className="ex-runs">
                  <div><span className="pw-mono">{run.branch}</span><RunStrip name={run.branch} runs={run.branch === "main" ? mainRuns : run.id === "run_8f3k2" ? branchRuns : [...run.history, ...run.history]} /></div>
                  {run.branch !== "main" ? <div><span className="pw-mono">main</span><RunStrip name="main" runs={mainRuns} /></div> : null}
                </div>
              </Panel>
              <Panel title="Labels">
                <div className="ex-tags">{failed ? <><Tag>needs review</Tag><Tag mono>area:payments</Tag><Tag mono>size:S</Tag><Tag>retry-logic</Tag></> : <><Tag mono>{`repo:${run.repo}`}</Tag><Tag mono>{`trigger:${run.trigger.replace(" ", "-")}`}</Tag></>}</div>
              </Panel>
              <Panel title="Timeline">
                <Timeline dense events={failed ? [
                  { time: "14:03:06", kind: "alert", title: "unit tests failed", body: "1 of 214 tests failed in retry.test.ts", highlight: true },
                  { time: "14:02:41", kind: "info", title: "unit tests started" },
                  { time: "14:02:38", kind: "resolve", title: "typecheck passed", body: "11 s" },
                  { time: "14:02:20", kind: "resolve", title: "lint passed", body: "6 s" },
                  { time: "14:02:09", kind: "deploy", title: `Pushed ${run.commit}`, actor: run.author },
                ] : runJobs.filter((j) => j.status !== "unknown").reverse().map((j) => ({
                  time: run.when, kind: j.status === "info" ? "info" as const : j.status === "warning" ? "warn" as const : "resolve" as const,
                  title: `${j.label} ${jobWord(j.status).toLowerCase()}`, body: j.duration,
                }))} />
              </Panel>
            </div>
          </div>
        </div>
      ) : tab === "jobs" ? (
        <div className="pw-page"><Panel title="Jobs" meta={`${runJobs.length} jobs`} flush>
          <DataTable columns={jobColumns} rows={runJobs} rowKey="key" caption={`Jobs of ${run.id}`} rowTone={(j) => (j.status === "critical" ? "critical" : null)}
            onRowClick={(j) => (j.status === "critical" ? setDrawer(true) : toast(`${j.label}: ${jobWord(j.status).toLowerCase()}`))} />
        </Panel></div>
      ) : tab === "logs" ? (
        <div className="pw-page"><CodeBlock title={failingJob ? `${failingJob.label}: log` : "Run log"} code={log} highlight={failed ? [6, 7, 8] : []} maxHeight={520} /></div>
      ) : (
        <div className="pw-page"><Panel title="Artifacts" meta="kept for 30 days" flush>
          <DataTable caption={`Artifacts of ${run.id}`} rows={ARTIFACTS} columns={[
            { key: "name", header: "File", mono: true },
            { key: "job", header: "Job", mono: true },
            { key: "size", header: "Size", align: "right", num: true },
            { key: "dl", header: "", align: "right", render: (a) => <Button size="sm" variant="ghost" icon="page" onClick={() => toast(`Downloading ${a.name}`)}>Download</Button> },
          ]} />
        </Panel></div>
      )}
      <Drawer open={drawer} title="unit tests" subtitle="Job 3 of 6, failed after 25 s" onClose={() => setDrawer(false)}
        footer={<><Button onClick={() => setDrawer(false)}>Close</Button><Button variant="primary" icon="refresh" onClick={rerun}>Re-run job</Button></>}>
        <CodeBlock title="retry.test.ts" code={"it(\"retries 3 times then fails\", async () => {\n  const fn = vi.fn().mockRejectedValue(new Error(\"boom\"));\n  await expect(withRetry(fn, 3)).rejects.toThrow(\"boom\");\n  expect(fn).toHaveBeenCalledTimes(3);\n});"} highlight={[4]} />
      </Drawer>
    </Frame>
  );
}
