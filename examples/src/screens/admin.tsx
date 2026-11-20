// Administration: organization-wide settings, plan limits and data retention.
import { useState } from "react";
import { PageHeader, Panel, TextInput, Textarea, Select, Switch, Checkbox, Button, BulletBar, Modal, toast, tokens } from "@pairwise/ui";
import { Frame, usePrefs, setPrefs, isFont, fontLabel } from "../frame";

export function Admin() {
  const [sso, setSso] = useState(true);
  const [transfer, setTransfer] = useState(false);
  const prefs = usePrefs();
  return (
    <Frame active="admin">
      <PageHeader title="Administration" meta="Settings that apply to everyone in example-org." />
      <div className="pw-page ex-narrow">
        <Panel title="Organization" footer={<div className="ex-actions"><Button variant="primary" onClick={() => toast({ tone: "healthy", title: "Organization settings saved" })}>Save changes</Button></div>}>
          <div className="ex-form">
            <TextInput label="Display name" defaultValue="Example Org" />
            <TextInput label="Slug" defaultValue="example-org" hint="Used in URLs. Changing it breaks old links." />
            <Select label="Default region" defaultValue="region-a" options={[{ value: "region-a", label: "region-a", meta: "Primary" }, { value: "region-b", label: "region-b" }]} />
            <Select label="Locale and number format" defaultValue="en-US" options={[{ value: "en-US", label: "English (US)" }, { value: "en-GB", label: "English (UK)" }, { value: "en-IN", label: "English (India)" }]} />
            <div className="ex-span">
              <Select label="Default font" value={prefs.orgFont} hint="Applies to everyone in example-org. People can still choose their own from their account menu."
                options={tokens.fonts.map((f) => ({ value: f.id, label: f.label, meta: f.id === "atkinson" ? "Pairwise default" : undefined }))}
                onChange={(v) => { if (!isFont(v)) return; setPrefs({ orgFont: v }); toast({ tone: "healthy", title: `Default font set to ${fontLabel(v)}`, body: prefs.font === "org" ? "You see it now; so does everyone using the default." : "You chose your own font, so your view doesn't change." }); }} />
            </div>
          </div>
        </Panel>
        <Panel title="Sign-in and security">
          <div className="ex-checks">
            <Switch label="Single sign-on (SAML)" checked={sso} onChange={(v) => { setSso(v); toast(v ? "Single sign-on turned on" : "Single sign-on turned off"); }} hint={sso ? "Members sign in with the company identity provider." : "Members sign in with email and password."} />
            <Checkbox label="Require two-factor sign-in for everyone" />
            <Checkbox label="Sign members out after 12 hours" defaultChecked />
          </div>
          <div className="ex-mt"><Textarea label="Allowed IP ranges" rows={3} defaultValue={"10.0.0.0/8\n192.0.2.0/24"} hint="One CIDR range per line. Leave empty to allow any address." /></div>
        </Panel>
        <Panel title="Data retention">
          <div className="ex-form">
            <Select label="Metrics" defaultValue="13m" options={[{ value: "30d", label: "30 days" }, { value: "90d", label: "90 days" }, { value: "13m", label: "13 months" }]} />
            <Select label="Logs and CI artifacts" defaultValue="30d" options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "90d", label: "90 days" }]} />
            <Select label="Model prompts and responses" defaultValue="0" hint="Off keeps nothing after the request finishes." options={[{ value: "0", label: "Off" }, { value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]} />
            <Select label="Audit log" defaultValue="2y" options={[{ value: "1y", label: "1 year" }, { value: "2y", label: "2 years" }]} />
          </div>
        </Panel>
        <Panel title="Plan" meta="Team plan, renews Jan 1, 2027" actions={<Button size="sm" onClick={() => toast("Plans would open here")}>Compare plans</Button>}>
          <div className="ex-budgets">
            {[{ n: "Seats", u: 8, l: 10, t: "8 of 10" }, { n: "CI minutes", u: 41200, l: 50000, t: "41,200 of 50,000" }, { n: "Model tokens", u: 539, l: 600, t: "539 M of 600 M" }].map((b) => (
              <div key={b.n} className="ex-budget">
                <div className="ex-split"><span className="pw-body-strong">{b.n}</span><span className="pw-caption pw-muted pw-num">{b.t}</span></div>
                <BulletBar used={b.u} requested={b.u} limit={b.l} label={b.n} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Danger zone">
          <div className="ex-danger">
            <p>Transfer ownership of example-org to another owner. You become an admin.</p>
            <Button variant="danger" onClick={() => setTransfer(true)}>Transfer ownership</Button>
          </div>
        </Panel>
      </div>
      <Modal open={transfer} tone="critical" title="Transfer ownership of example-org?" onClose={() => setTransfer(false)}
        actions={<><Button onClick={() => setTransfer(false)}>Cancel</Button><Button variant="danger" onClick={() => { setTransfer(false); toast({ tone: "critical", title: "This is a demo", body: "Ownership was not transferred." }); }}>Transfer to Dev C</Button></>}>
        <p className="ex-p">Dev C becomes the owner and can remove you. Only an owner can undo this.</p>
        <Select label="New owner" defaultValue="Dev C" options={["Dev C", "Dev E"]} />
      </Modal>
    </Frame>
  );
}
