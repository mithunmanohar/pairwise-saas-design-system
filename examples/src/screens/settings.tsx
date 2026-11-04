// Everyday SaaS: a settings page with validation, toggles, a toast and a confirmed destructive action.
import { useEffect, useState } from "react";
import { PageHeader, Breadcrumbs, Tabs, Panel, TextInput, Textarea, Select, Checkbox, Switch, Tag, Button, Modal, toast } from "@pairwise/ui";
import { Frame, demoState } from "../frame";

export function Settings() {
  const [branch, setBranch] = useState("main");
  const [topics, setTopics] = useState(["payments", "api", "typescript"]);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(demoState === "modal");
  useEffect(() => { if (demoState === "toast") toast({ tone: "healthy", title: "Settings saved", body: "Branch rules apply to new pull requests.", duration: null }); }, []);
  return (
    <Frame active="repos">
      <PageHeader
        crumbs={<Breadcrumbs items={[{ label: "Repositories", href: "#" }, { label: "sample-repo", mono: true }]} />}
        title="Repository settings"
        meta="example-org/sample-repo"
        tabs={<Tabs value="general" tabs={[{ value: "general", label: "General" }, { value: "branches", label: "Branches" }, { value: "notifications", label: "Notifications" }, { value: "access", label: "Access", count: 8 }]} />}
      />
      <div className="pw-page ex-narrow">
        <Panel title="General" footer={<div className="ex-actions"><Button>Cancel</Button><Button variant="primary" onClick={() => toast("Settings saved")}>Save changes</Button></div>}>
          <div className="ex-form">
            <TextInput label="Repository name" defaultValue="sample-repo" hint="Lowercase letters, numbers and dashes." />
            <Select label="Default branch" options={["main", "develop", "release/2.4"]} value={branch} onChange={setBranch} />
            <div className="ex-span"><Textarea label="Description" rows={3} defaultValue="Checkout and payments API for example-org." /></div>
            <div className="ex-span"><TextInput label="Deploy webhook" defaultValue="http://hooks.example-org.dev/deploy" error="Use an https:// URL so the payload is encrypted." /></div>
            <div className="ex-span">
              <div className="pw-formfield">
                <span className="pw-formfield__label">Topics</span>
                <div className="ex-tags">{topics.map((t) => <Tag key={t} onRemove={() => setTopics(topics.filter((x) => x !== t))}>{t}</Tag>)}</div>
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Before merging" meta="applies to the default branch">
          <div className="ex-checks">
            <Checkbox label="Require passing CI checks" defaultChecked />
            <Checkbox label="Require one approving review" defaultChecked hint="Reviews from code owners count twice." />
            <Checkbox label="Require signed commits" />
            <Switch label="Auto-merge when checks pass" defaultChecked />
            <Switch label="Delete branch after merge" />
          </div>
        </Panel>
        <Panel title="Danger zone">
          <div className="ex-danger">
            <p>Deleting the repository removes its runs, artifacts and settings. This can’t be undone.</p>
            <Button variant="danger" onClick={() => setDeleting(true)}>Delete repository</Button>
          </div>
        </Panel>
      </div>
      <Modal open={deleting} tone="critical" title="Delete sample-repo?" onClose={() => setDeleting(false)}
        actions={<><Button onClick={() => setDeleting(false)}>Cancel</Button><Button variant="danger" disabled={confirm !== "sample-repo"} onClick={() => { setDeleting(false); setConfirm(""); toast({ tone: "critical", title: "This is a demo", body: "Nothing was deleted." }); }}>Delete repository</Button></>}>
        <p style={{ margin: 0 }}>This permanently deletes 1,284 runs, 312 artifacts and all settings for example-org/sample-repo.</p>
        <TextInput label="Type sample-repo to confirm" autoFocus value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Modal>
    </Frame>
  );
}

