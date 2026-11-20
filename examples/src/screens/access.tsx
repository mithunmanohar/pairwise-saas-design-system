// Access: who can do what. Members with inline role changes, an invite form, API tokens and the audit log.
import { useState } from "react";
import { PageHeader, Tabs, Panel, FilterBar, DataTable, Select, StatusBadge, Tag, Button, ActionMenu, Modal, TextInput, Checkbox, Timeline, CopyButton, AlertBanner, toast, type Column } from "@pairwise/ui";
import { Frame, demoState } from "../frame";
import { members as seed, tokens, auditLog, type Member, type Role } from "../data";

const ROLES: Role[] = ["Owner", "Admin", "Developer", "Viewer"];

export function Access() {
  const [tab, setTab] = useState("members");
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [invite, setInvite] = useState(demoState === "invite");
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);
  const rows = list.filter((m) => (!q || (m.name + m.email).toLowerCase().includes(q.toLowerCase())) && (!f.role || f.role === "all" || m.role === f.role));
  const noMfa = list.filter((m) => !m.mfa).length;
  const emailError = tried && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email) ? "Enter a full email address, like dev.k@example-org.dev." : undefined;
  const closeInvite = () => { setInvite(false); setEmail(""); setTried(false); };
  const columns: Column<Member>[] = [
    { key: "name", header: "Member", sortable: true, defaultDir: "asc", render: (m) => <span className="ex-who"><span className="ex-avatar" aria-hidden="true">{m.initials}</span><span className="ex-cell2"><span className="pw-body-strong">{m.name}</span><span className="pw-caption pw-muted pw-mono">{m.email}</span></span></span> },
    { key: "role", header: "Role", width: 160, render: (m) => m.role === "Owner" ? <span className="ex-roleowner">Owner</span>
      : <Select label={`Role of ${m.name}`} hideLabel value={m.role} options={ROLES.filter((r) => r !== "Owner")} onChange={(v) => { setList(list.map((x) => (x.id === m.id ? { ...x, role: v as Role } : x))); toast(`${m.name} is now ${v === "Admin" ? "an" : "a"} ${v}`); }} /> },
    { key: "teams", header: "Teams", render: (m) => <span className="ex-tags">{m.teams.map((t) => <Tag key={t}>{t}</Tag>)}</span> },
    { key: "mfa", header: "Two-factor", sortable: true, render: (m) => (m.mfa ? <StatusBadge size="sm" status="healthy" label="On" /> : <StatusBadge size="sm" status="warning" label="Off" />) },
    { key: "lastActive", header: "Last active", nowrap: true },
    { key: "act", header: "", width: 44, render: (m) => m.role === "Owner" ? null : (
      <ActionMenu label={`Actions for ${m.name}`} items={[
        { label: "Resend MFA reminder", icon: "bell", disabled: m.mfa, onSelect: () => toast(`Reminder sent to ${m.name}`) },
        { label: "View activity", icon: "page", onSelect: () => setTab("audit") },
        "separator",
        { label: "Remove from org", tone: "critical", onSelect: () => setRemoving(m) },
      ]} />
    ) },
  ];
  return (
    <Frame active="access">
      <PageHeader title="Access" meta="Members, roles and API tokens for example-org."
        actions={<Button variant="primary" icon="user" onClick={() => setInvite(true)}>Invite member</Button>}
        tabs={<Tabs value={tab} onChange={setTab} tabs={[{ value: "members", label: "Members", count: list.length }, { value: "tokens", label: "API tokens", count: tokens.length }, { value: "audit", label: "Audit log" }]} />} />
      {tab === "members" ? (
        <div className="pw-page">
          {noMfa ? <AlertBanner tone="warning" title={`${noMfa} members don’t use two-factor sign-in.`} action="Require two-factor" onAction={() => toast({ tone: "healthy", title: "Two-factor sign-in is now required", body: "Members without it are asked at their next sign-in." })}>Require it to protect production access.</AlertBanner> : null}
          <Panel flush>
            <div className="ex-pad">
              <FilterBar query={q} onQuery={setQ} queryPlaceholder="Filter by name or email" values={f} onChange={setF} onClear={() => { setQ(""); setF({}); }} count={`${rows.length} of ${list.length}`}
                filters={[{ key: "role", label: "Role", options: ROLES }]} />
            </div>
            <DataTable columns={columns} rows={rows} defaultSort={{ key: "name", dir: "asc" }} caption="Members" pageSize={10} />
          </Panel>
        </div>
      ) : tab === "tokens" ? (
        <div className="pw-page">
          <Panel title="API tokens" meta="tokens act with their owner's role" flush actions={<Button size="sm" onClick={() => toast({ tone: "healthy", title: "Token created", body: "Copy it now. It won't be shown again." })}>Create token</Button>}>
            <DataTable caption="API tokens" rows={tokens} columns={[
              { key: "name", header: "Name", mono: true, render: (t) => <CopyButton value={t.name} label={`Copy ${t.name}`}>{t.name}</CopyButton> },
              { key: "scope", header: "Scope", render: (t) => <Tag mono>{t.scope}</Tag> },
              { key: "owner", header: "Owner", nowrap: true },
              { key: "lastUsed", header: "Last used", nowrap: true },
              { key: "expires", header: "Expires", nowrap: true },
              { key: "revoke", header: "", align: "right", render: (t) => <Button size="sm" variant="ghost" onClick={() => toast({ tone: "warning", title: `${t.name} revoked` })}>Revoke</Button> },
            ]} />
          </Panel>
        </div>
      ) : (
        <div className="pw-page ex-narrow">
          <Panel title="Audit log" meta="today, newest first" actions={<Button size="sm" icon="page" onClick={() => toast("Audit log exported")}>Export</Button>}>
            <Timeline events={auditLog} />
          </Panel>
        </div>
      )}
      <Modal open={invite} title="Invite a member" onClose={closeInvite}
        actions={<><Button onClick={closeInvite}>Cancel</Button><Button variant="primary" onClick={() => { setTried(true); if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) return; closeInvite(); toast({ tone: "healthy", title: "Invitation sent", body: `${email} can join for 7 days.` }); }}>Send invitation</Button></>}>
        <TextInput label="Email" type="email" placeholder="dev.k@example-org.dev" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} autoFocus />
        <Select label="Role" defaultValue="Developer" options={[{ value: "Admin", label: "Admin", meta: "Manages members and billing" }, { value: "Developer", label: "Developer", meta: "Deploys and runs CI" }, { value: "Viewer", label: "Viewer", meta: "Read only" }]} />
        <Checkbox label="Require two-factor sign-in" defaultChecked hint="Recommended for anyone who can deploy." />
      </Modal>
      <Modal open={removing != null} tone="critical" title={`Remove ${removing?.name ?? ""} from example-org?`} onClose={() => setRemoving(null)}
        actions={<><Button onClick={() => setRemoving(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (removing) { setList(list.filter((m) => m.id !== removing.id)); toast(`${removing.name} removed`); } setRemoving(null); }}>Remove member</Button></>}>
        <p className="ex-p">They lose access to every repository and service right away. Their API tokens are revoked.</p>
      </Modal>
    </Frame>
  );
}
