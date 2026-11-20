// Everyday SaaS: a repository's settings page with validation, toggles, a toast and a confirmed destructive action.
import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs, Tabs, Panel, TextInput, Textarea, Select, Checkbox, Switch, Tag, Button, Modal, DataTable, StateBlock, toast } from "@pairwise/ui";
import { Frame, demoState, useCrumbNav, useNav } from "../frame";
import { members, repoByName, type Repo } from "../data";

export function Settings({ name = "sample-repo" }: { name?: string }) {
  const repo = repoByName(name);
  const crumbs = useCrumbNav();
  if (!repo) {
    return (
      <Frame active="repos">
        <PageHeader crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "Repositories", href: "#/repos" }, { label: name, mono: true }]} />} title={name} titleMono />
        <div className="pw-page ex-narrow"><Panel><StateBlock kind="empty" title="No repository with this name" body="It may have been disconnected." /></Panel></div>
      </Frame>
    );
  }
  return <RepoSettings key={repo.name} repo={repo} />;
}

function RepoSettings({ repo }: { repo: Repo }) {
  const go = useNav();
  const crumbs = useCrumbNav();
  const [tab, setTab] = useState("general");
  const [branch, setBranch] = useState("main");
  const [topics, setTopics] = useState(repo.topics);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(demoState === "modal");
  useEffect(() => { if (demoState === "toast") toast({ tone: "healthy", title: "Settings saved", body: "Branch rules apply to new pull requests.", duration: null }); }, []);
  return (
    <Frame active="repos">
      <PageHeader
        crumbs={<Breadcrumbs onNavigate={crumbs} items={[{ label: "Repositories", href: "#/repos" }, { label: repo.name, mono: true }]} />}
        title="Repository settings"
        meta={`example-org/${repo.name}`}
        tabs={<Tabs value={tab} onChange={setTab} tabs={[{ value: "general", label: "General" }, { value: "branches", label: "Branches" }, { value: "notifications", label: "Notifications" }, { value: "access", label: "Access", count: 5 }]} />}
      />
      {tab === "general" ? (
        <div className="pw-page ex-narrow">
          <Panel title="General" footer={<div className="ex-actions"><Button onClick={() => go("repos")}>Cancel</Button><Button variant="primary" onClick={() => toast({ tone: "healthy", title: "Settings saved" })}>Save changes</Button></div>}>
            <div className="ex-form">
              <TextInput label="Repository name" defaultValue={repo.name} hint="Lowercase letters, numbers and dashes." />
              <Select label="Default branch" options={["main", "develop", "release/2.4"]} value={branch} onChange={setBranch} />
              <div className="ex-span"><Textarea label="Description" rows={3} defaultValue={repo.description} /></div>
              <div className="ex-span"><TextInput label="Deploy webhook" defaultValue={`http://hooks.example-org.dev/${repo.name}`} error="Use an https:// URL so the payload is encrypted." /></div>
              <div className="ex-span">
                <div className="pw-formfield">
                  <span className="pw-formfield__label">Topics</span>
                  <div className="ex-tags">{topics.length ? topics.map((t) => <Tag key={t} onRemove={() => setTopics(topics.filter((x) => x !== t))}>{t}</Tag>) : <span className="pw-muted">No topics</span>}</div>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="Before merging" meta="applies to the default branch">
            <BranchRules />
          </Panel>
          <Panel title="Danger zone">
            <div className="ex-danger">
              <p>Deleting the repository removes its runs, artifacts and settings. This can’t be undone.</p>
              <Button variant="danger" onClick={() => setDeleting(true)}>Delete repository</Button>
            </div>
          </Panel>
        </div>
      ) : tab === "branches" ? (
        <div className="pw-page ex-narrow">
          <Panel title="Protected branches" meta="rules apply to every matching branch"><BranchRules /></Panel>
          <Panel title="Branch name pattern" footer={<div className="ex-actions"><Button variant="primary" onClick={() => toast({ tone: "healthy", title: "Pattern saved" })}>Save pattern</Button></div>}>
            <TextInput label="New branches must match" defaultValue="^(feature|fix|train)/[a-z0-9-]+$" hint="A regular expression. Pushes that don't match are rejected." />
          </Panel>
        </div>
      ) : tab === "notifications" ? (
        <div className="pw-page ex-narrow">
          <Panel title="Notify the team when" footer={<div className="ex-actions"><Button variant="primary" onClick={() => toast({ tone: "healthy", title: "Notifications saved" })}>Save</Button></div>}>
            <div className="ex-checks">
              <Switch label="A run fails on the default branch" defaultChecked />
              <Switch label="A run on a pull request fails" hint="Only the author is notified." defaultChecked />
              <Switch label="A flaky test is detected" defaultChecked />
              <Switch label="A deployment finishes" />
            </div>
            <div className="ex-form ex-mt">
              <Select label="Channel" defaultValue="chat" options={[{ value: "chat", label: "Team chat" }, { value: "email", label: "Email" }, { value: "both", label: "Chat and email" }]} />
              <TextInput label="Chat channel" defaultValue="#payments-ci" />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="pw-page ex-narrow">
          <Panel title="People with access" meta="5 people" flush actions={<Button size="sm" onClick={() => go("access")}>Manage in Access</Button>}>
            <DataTable caption={`People with access to ${repo.name}`} rows={members.slice(0, 5)} columns={[
              { key: "name", header: "Name", nowrap: true },
              { key: "email", header: "Email", mono: true },
              { key: "perm", header: "Permission", render: (m) => (m.role === "Owner" || m.role === "Admin" ? "Admin" : "Write") },
            ]} />
          </Panel>
        </div>
      )}
      <Modal open={deleting} tone="critical" title={`Delete ${repo.name}?`} onClose={() => { setDeleting(false); setConfirm(""); }}
        actions={<><Button onClick={() => { setDeleting(false); setConfirm(""); }}>Cancel</Button><Button variant="danger" disabled={confirm !== repo.name} onClick={() => { setDeleting(false); setConfirm(""); toast({ tone: "critical", title: "This is a demo", body: "Nothing was deleted." }); }}>Delete repository</Button></>}>
        <p className="ex-p">This permanently deletes 1,284 runs, 312 artifacts and all settings for example-org/{repo.name}.</p>
        <TextInput label={`Type ${repo.name} to confirm`} autoFocus value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Modal>
    </Frame>
  );
}

function BranchRules() {
  return (
    <div className="ex-checks">
      <Checkbox label="Require passing CI checks" defaultChecked />
      <Checkbox label="Require one approving review" defaultChecked hint="Reviews from code owners count twice." />
      <Checkbox label="Require signed commits" />
      <Switch label="Auto-merge when checks pass" defaultChecked />
      <Switch label="Delete branch after merge" />
    </div>
  );
}
