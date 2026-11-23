// e2e fixtures for the assistant (2.2): the panel in a shell with a scripted conversation, and the content parts.
// Answers are scripted and streamed on a timer; there is no model. Sample content stays fictional.
import * as React from "react";
import {
  AppShell, SideNav, TopBar, AssistantPanel, AssistantMessage, PromptComposer, ContextBar, AssistantProvider, useAssistant, useAssistantContext,
  Markdown, Citation, SourceList, ResourceCard, Disclosure, CodeBlock, Avatar, FileUpload, ActionMenu, Button, AssistantAnswer, type AnswerBlock, type EntityRefProps,
  type AssistantContextItem, type AssistantFeedback, type AssistantMessageStatus, type TreeNode, type UploadItem, type NavGroup,
} from "../../src/index";

const { useState, useRef, useEffect } = React;

const NAV: NavGroup[] = [{ group: null, items: [{ key: "home", label: "Overview", icon: "home" }, { key: "services", label: "Services", icon: "server" }] }];
const ORG: TreeNode[] = [{ id: "co", kind: "company", label: "Example Company", children: [
  { id: "fn-data", kind: "function", label: "Data and analytics", children: [{ id: "in-ai", kind: "initiative", label: "AI transformation" }] },
] }];
const PAGE_CONTEXT: AssistantContextItem[] = [
  { id: "page", kind: "page", label: "Services", removable: false },
  { id: "own", kind: "ownership", label: "AI transformation", entity: "initiative", path: [{ id: "fn-data", label: "Data and analytics" }] },
  { id: "rt", kind: "runtime", label: "prod / region-a" },
  { id: "time", kind: "time", label: "Last hour" },
  { id: "perm", kind: "permission", label: "Read only", detail: "The assistant can read; it can't change anything.", removable: false },
];
const AVAILABLE: AssistantContextItem[] = [
  { id: "svc:checkout-api", kind: "entity", entity: "webapp", label: "checkout-api", detail: "Degraded" },
  { id: "svc:ranker-model", kind: "entity", entity: "model", label: "ranker-model" },
];
const ANSWER = "**checkout-api** is degraded: p95 latency is 840 ms against a 500 ms target since 13:40 [1].\n\n- The slowdown started after deploy `run_8f3k2` [2].\n- Error rate is unchanged.\n\n```diff\n- timeout: 2s\n+ timeout: 5s\n```";

const SOURCES = [{ id: "s1", title: "checkout-api latency", entity: "webapp" as const, path: [{ id: "p", label: "Checkout" }] }, { id: "s2", title: "Deploy run_8f3k2", kind: "Deployment" }];
interface Msg { id: number; who: "person" | "assistant"; text: string; status: AssistantMessageStatus; feedback?: AssistantFeedback }

function Conversation() {
  const a = useAssistant();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  const [context, setContext] = useState(PAGE_CONTEXT);
  const [scope, setScope] = useState<string | null>("in-ai");
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [, setReports] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const stream = (id: number) => {
    let n = 0;
    setBusy(true); setSaid("");
    timer.current = window.setInterval(() => {
      n += 24;
      const done = n >= ANSWER.length;
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: ANSWER.slice(0, n), status: done ? "done" : "streaming" } : x)));
      if (done) { window.clearInterval(timer.current); setBusy(false); setSaid("Assistant replied: checkout-api is degraded."); }
    }, 60);
  };
  const ask = (q: string) => {
    const id = Date.now();
    setMsgs((m) => [...m, { id: id - 1, who: "person", text: q, status: "done" }, { id, who: "assistant", text: "", status: "streaming" }]);
    stream(id);
  };
  const stop = () => {
    window.clearInterval(timer.current); setBusy(false);
    setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, status: "stopped" } : x)));
    setSaid("Response stopped.");
  };
  return (
    <AssistantPanel open={a.open} onClose={() => a.setOpen(false)} expanded={a.expanded} onExpandedChange={a.setExpanded}
      conversations={[{ id: "c1", title: "Why is checkout-api slow?", updated: "13:52" }, { id: "c2", title: "Spend by squad", updated: "Yesterday" }]} activeId={msgs.length ? "c1" : null}
      onSelectConversation={() => undefined} onNewConversation={() => { stop(); setMsgs([]); setSaid(""); }} announcement={said}
      composer={
        <PromptComposer onSubmit={ask} busy={busy} onStop={stop} maxLength={400}
          suggestions={msgs.length ? undefined : [{ label: "Summarise this page" }, { label: "What changed in the last hour?" }]}
          templates={[{ label: "Explain a service…", prompt: "Explain … and what it depends on" }]}
          mentions={[{ value: "checkout-api", label: "checkout-api", entity: "webapp", description: "Service" }, { value: "ranker-model", label: "ranker-model", entity: "model" }, { value: "dev-a", label: "Dev A", icon: "user", group: "Person" }]}
          commands={[{ value: "explain", label: "Explain", description: "Explain what is selected" }, { value: "summarise", label: "Summarise", description: "Summarise this page" }]}
          attachments={{ files, maxSize: 1_000_000, accept: ".txt,.log,.json", onFiles: (fs) => setFiles((f) => [...f, ...fs.map((x, i) => ({ id: x.name + i, name: x.name, size: x.size, status: "done" as const }))]), onRemove: (id) => setFiles((f) => f.filter((x) => x.id !== id)) }}
          context={<ContextBar items={context} onRemove={(id) => setContext((c) => c.filter((x) => x.id !== id))} available={AVAILABLE} onAdd={(it) => setContext((c) => [...c, it])}
            scope={{ nodes: ORG, value: scope, onChange: setScope }} />} />
      }>
      {msgs.map((m) => m.who === "person"
        ? <AssistantMessage key={m.id} author={{ name: "Dev A", kind: "person" }} time="13:52">{m.text}</AssistantMessage>
        : (
          <AssistantMessage key={m.id} author={{ name: "Assistant", kind: "assistant" }} status={m.status} time="13:52"
            sources={m.status === "streaming" ? undefined : SOURCES}
            feedback={m.feedback} onFeedback={(f) => setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, feedback: f } : x)))}
            onReport={(r) => { setReports((n) => n + 1); document.body.dataset.report = r.reason; }} copyText={m.text} onRegenerate={() => stream(m.id)}
            provenance={{ generated: "13:52", model: "Example model", context: context.map((c) => c.label), tools: ["metrics.query", "deploys.list"] }}
            followUps={[{ label: "Show the deploy diff" }]} onFollowUp={(s) => ask(s.label)}>
            <Markdown streaming={m.status === "streaming"} sources={SOURCES} onSource={(s) => { document.body.dataset.source = s.id; }}>{m.text}</Markdown>
          </AssistantMessage>
        ))}
    </AssistantPanel>
  );
}
function ShellPage() {
  const a = useAssistant();
  useAssistantContext(PAGE_CONTEXT);
  return (
    <AppShell nav={<SideNav active="services" nav={NAV} />}
      top={<TopBar assistant={{ open: a.open, onToggle: a.toggle }} />}
      assistant={<Conversation />}>
      <div className="pw-page">
        <h1 className="pw-title">Services</h1>
        <ActionMenu label="Actions for checkout-api" items={[{ label: "Ask the assistant", icon: "assistant", onSelect: () => a.ask("Why is checkout-api slow?", [AVAILABLE[0]!]) }]} />
        <Button>Page button</Button>
        <span data-testid="asked">{a.context.length}</span>
      </div>
    </AppShell>
  );
}
function AssistantShellFixture() {
  const [asked, setAsked] = useState("");
  return (
    <div style={{ height: "100vh" }}>
      <AssistantProvider onAsk={(p, ctx) => setAsked(`${p}|${ctx.map((c) => c.id).join(",")}`)}><ShellPage /></AssistantProvider>
      <span data-testid="ask" hidden>{asked}</span>
    </div>
  );
}

const MD = `### Latency by region

The p95 is **840 ms** in \`region-a\` [docs](https://example.com/runbook).

| Region | p95 |
| --- | --- |
| region-a | 840 ms |
| region-b | 310 ms |

1. Check the deploy
2. Roll back if needed

![diagram](https://example.com/diagram.png)

<script>alert(1)</script>

\`\`\`yaml
timeout: 5s
\`\`\`
`;
function AssistantContentFixture() {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [opened, setOpened] = useState("none");
  return (
    <div style={{ display: "grid", gap: 16, padding: 24, maxWidth: 420 }}>
      <Markdown onLink={(h) => { setOpened(h); }}>{MD}</Markdown>
      <p>The slowdown started after a deploy <Citation n={1} title="Deploy run_8f3k2" onOpen={() => setOpened("cite-1")} />.</p>
      <SourceList sources={[{ id: "a", title: "Deploy run_8f3k2", kind: "Deployment", excerpt: "timeout raised to 5s" }, { id: "b", title: "checkout-api", entity: "webapp", path: [{ id: "x", label: "Commerce" }, { id: "y", label: "Checkout" }] }]} onOpen={(s) => setOpened(s.id)} />
      <ResourceCard kind="webapp" name="checkout-api" mono status="warning" statusLabel="Degraded" path={[{ id: "x", label: "Commerce" }, { id: "y", label: "Checkout" }]}
        facts={[{ label: "p95", value: "840 ms" }, { label: "Owner", value: "Squad Checkout" }]} onOpen={() => setOpened("card")} actions={[{ label: "Ask the assistant", icon: "assistant", onSelect: () => setOpened("ask") }]} />
      <Disclosure summary="How this was worked out" meta="3 steps"><p style={{ margin: 0 }}>Read the latency series, then the deploys.</p></Disclosure>
      <CodeBlock title="config.yaml" diff code={"@@ timeouts @@\n retries: 3\n-timeout: 2s\n+timeout: 5s"} />
      <span style={{ display: "flex", gap: 8 }}><Avatar name="Assistant" icon="assistant" /><Avatar name="Cost analyst" /></span>
      <FileUpload variant="button" label="Attach files" files={files} onFiles={(fs) => setFiles(fs.map((f, i) => ({ id: String(i), name: f.name, size: f.size, status: "done" })))} onRemove={() => setFiles([])} />
      <span data-testid="opened">{opened}</span>
    </div>
  );
}

// Structured answers: every block type, an over-long list (7 rows, 5 shown), entity chips in text.
function AnswerFixture() {
  const [opened, setOpened] = useState("none");
  const o = (what: string) => () => setOpened(what);
  const ents: EntityRefProps[] = [{ label: "INC-2041", icon: "siren", kindLabel: "Incident", onOpen: o("INC-2041") }, { label: "checkout-api", kind: "webapp", onOpen: o("checkout-api") }];
  const rows = Array.from({ length: 7 }, (_, i) => ({ id: "r" + i, ref: { label: "svc-" + i, kind: "webapp" as const, onOpen: o("svc-" + i) }, title: `Row ${i + 1}`, status: i < 2 ? "critical" as const : "warning" as const, statusLabel: i < 2 ? "Down" : "Degraded", action: { label: "Open", onSelect: o("act-" + i) } }));
  const blocks: AnswerBlock[] = [
    { type: "summary", text: "2 services are down and 5 are degraded.", status: "critical", statusLabel: "Needs action" },
    { type: "items", title: "Needs attention", items: rows },
    { type: "metrics", items: [{ label: "Services healthy", value: "3 of 10" }, { label: "Open incidents", value: "2" }, { label: "p95", value: "403 ms", delta: { value: 34, unit: " %", breach: true } }, { label: "Deploys", value: "8" }, { label: "Hidden fifth", value: "x" }] },
    { type: "text", markdown: "It started with INC-2041 on `checkout-api` [1]." },
    { type: "next", text: "Roll back checkout-api.", actions: [{ label: "Open deployments", onSelect: o("deploys") }] },
    { type: "code", code: "-a\n+b", title: "change", diff: true },
    { type: "steps", steps: ["Read the incidents", "Compared deploys"] },
  ];
  return (
    <div style={{ maxWidth: 440 }}>
      <AssistantAnswer blocks={blocks} entities={ents} sources={[{ id: "s", title: "Deploy dep_9a1" }]} onSource={o("source")} />
      <span data-testid="opened">{opened}</span>
    </div>
  );
}

export const assistantFixtures: Record<string, () => React.ReactElement> = {
  "assistant-shell": AssistantShellFixture, "assistant-content": AssistantContentFixture, "assistant-answer": AnswerFixture,
};
