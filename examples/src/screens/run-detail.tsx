// Developer platform: why did this CI run fail, and is it flaky or real?
import { useState } from "react";
import { PageHeader, Breadcrumbs, Tabs, StatusBadge, Button, ActionMenu, CopyButton, Panel, StatusGrid, RunStrip, CodeBlock, Timeline, Tag, Drawer, toast } from "@pairwise/ui";
import { Frame, demoState } from "../frame";
import { jobs, runCols, cells, branchRuns, mainRuns, testLog } from "../data";

export function RunDetail() {
  const [drawer, setDrawer] = useState(demoState === "drawer");
  const rerun = () => { setDrawer(false); toast({ tone: "info", title: "Re-running unit tests", body: "run_8f3k2, attempt 2" }); };
  return (
    <Frame active="runs">
      <PageHeader
        crumbs={<Breadcrumbs items={[{ label: "CI runs", href: "#" }, { label: "sample-repo", href: "#", mono: true }, { label: "run_8f3k2", mono: true }]} />}
        title="run_8f3k2" titleMono
        status={<StatusBadge status="critical" label="Failed" />}
        meta={[
          { label: "Branch", value: <CopyButton value="feature/add-retry">feature/add-retry</CopyButton> },
          { label: "Commit", value: <CopyButton value="4f9c2e1a7b3d90e1">4f9c2e1</CopyButton> },
          { label: "Triggered by", value: "Dev A, push" },
          { label: "Duration", value: "4 min 12 s" },
        ]}
        actions={<>
          <Button icon="external" onClick={() => toast("GitHub would open here")}>Open on GitHub</Button>
          <Button variant="primary" icon="refresh" onClick={rerun}>Re-run failed job</Button>
          <ActionMenu label="More actions for run_8f3k2" items={[{ label: "Re-run all jobs", icon: "refresh", onSelect: () => toast("Re-running all 6 jobs") }, { label: "Download logs", icon: "page", onSelect: () => toast("Logs downloaded") }, "separator", { label: "Cancel pipeline", tone: "critical", onSelect: () => toast({ tone: "critical", title: "Pipeline cancelled" }) }]} />
        </>}
        tabs={<Tabs value="summary" tabs={[{ value: "summary", label: "Summary" }, { value: "jobs", label: "Jobs", count: 6 }, { value: "logs", label: "Logs" }, { value: "artifacts", label: "Artifacts", count: 3 }]} />}
      />
      <div className="pw-page">
        <div className="ex-row ex-2">
          <div className="ex-stack">
            <Panel title="Checks" meta="6 jobs × last 16 runs on this branch">
              <StatusGrid ariaLabel="Job results for the last 16 runs" rows={jobs} cols={runCols} cells={cells} rowLabelWidth={150} onCell={(r, c, s) => toast(`${r.label}, run ${c}: ${s === "critical" ? "failed" : s === "warning" ? "passed after retry" : s === "unknown" ? "skipped" : "passed"}`)} />
            </Panel>
            <Panel title="Failing job" meta="unit tests, attempt 1 of 1" actions={<Button size="sm" onClick={() => setDrawer(true)}>Open job</Button>}>
              <CodeBlock title="unit tests: log" code={testLog} highlight={[6, 7, 8]} maxHeight={260} />
            </Panel>
          </div>
          <div className="ex-stack">
            <Panel title="Run history" meta="last 20 runs">
              <div className="ex-runs">
                <div><span className="pw-mono">feature/add-retry</span><RunStrip name="feature/add-retry" runs={branchRuns} /></div>
                <div><span className="pw-mono">main</span><RunStrip name="main" runs={mainRuns} /></div>
              </div>
            </Panel>
            <Panel title="Labels">
              <div className="ex-tags"><Tag>needs review</Tag><Tag mono>area:payments</Tag><Tag mono>size:S</Tag><Tag>retry-logic</Tag></div>
            </Panel>
            <Panel title="Timeline">
              <Timeline dense events={[
                { time: "14:03:06", kind: "alert", title: "unit tests failed", body: "1 of 214 tests failed in retry.test.ts", highlight: true },
                { time: "14:02:41", kind: "info", title: "unit tests started" },
                { time: "14:02:38", kind: "resolve", title: "typecheck passed", body: "11 s" },
                { time: "14:02:20", kind: "resolve", title: "lint passed", body: "6 s" },
                { time: "14:02:09", kind: "deploy", title: "Pushed 4f9c2e1", actor: "Dev A" },
              ]} />
            </Panel>
          </div>
        </div>
      </div>
      <Drawer open={drawer} title="unit tests" subtitle="Job 3 of 6, failed after 25 s" onClose={() => setDrawer(false)}
        footer={<><Button onClick={() => setDrawer(false)}>Close</Button><Button variant="primary" icon="refresh" onClick={rerun}>Re-run job</Button></>}>
        <CodeBlock title="retry.test.ts" code={"it(\"retries 3 times then fails\", async () => {\n  const fn = vi.fn().mockRejectedValue(new Error(\"boom\"));\n  await expect(withRetry(fn, 3)).rejects.toThrow(\"boom\");\n  expect(fn).toHaveBeenCalledTimes(3);\n});"} highlight={[4]} />
      </Drawer>
    </Frame>
  );
}

