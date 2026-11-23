// The live demo (GitHub Pages): one routed app built only from @pairwise/ui. Every nav item is a working page, and list
// rows open detail pages (#/services/checkout-api, #/incidents/INC-2041, #/runs/run_8f3k2, #/repos/sample-repo).
// The ownership scope rides along in the query (#/services?scope=in-ai) and every page reads it; the Resource
// Explorer (#/explorer, #/explorer/financials) is the one page that shows the whole hierarchy.
// A floating control switches theme, density and font (hidden with ?controls=0, which the screenshot script uses); the
// account button opens the same preferences in a drawer.
import { useEffect, useState } from "react";
import { PageHeader, Panel, StateBlock, Switch, MenuSelect, useAssistant, tokens } from "@pairwise/ui";
import { mount, Frame, NavProvider, useNav, showControls, usePrefs, setPrefs, isFont, hashPath, withScope } from "../frame";
import { Explorer } from "../screens/explorer";
import { Overview } from "../screens/overview";
import { Services } from "../screens/services";
import { ServiceHealth } from "../screens/service-health";
import { Incidents } from "../screens/incidents";
import { IncidentDetail } from "../screens/incident";
import { Deployments } from "../screens/deployments";
import { Runs } from "../screens/runs";
import { RunDetail } from "../screens/run-detail";
import { Repositories } from "../screens/repositories";
import { Settings } from "../screens/settings";
import { Usage } from "../screens/usage";
import { Access } from "../screens/access";
import { Admin } from "../screens/admin";

const parse = () => {
  // The query after the path (?scope=) is the ownership scope; it doesn't change the page.
  const [section = "", id] = hashPath().split("/");
  return { section: section || "overview", id };
};

function NotFound({ section }: { section: string }) {
  const go = useNav();
  return (
    <Frame active={section}>
      <PageHeader title="Page not found" />
      <div className="pw-page ex-narrow">
        <Panel>
          <StateBlock kind="empty" title="There’s no page at this address" body="The link may be out of date. Every page in the side navigation works."
            action="Go to overview" onAction={() => go("overview")} />
        </Panel>
      </div>
    </Frame>
  );
}

function Page({ section, id }: { section: string; id: string | undefined }) {
  switch (section) {
    case "overview": return <Overview />;
    case "explorer": return <Explorer tab={id} />;
    case "services": return id ? <ServiceHealth name={id} /> : <Services />;
    case "incidents": return id ? <IncidentDetail id={id} /> : <Incidents />;
    case "deploys": return <Deployments />;
    case "runs": return id ? <RunDetail id={id} /> : <Runs />;
    case "repos": return id ? <Settings name={id} /> : <Repositories />;
    case "usage": return <Usage />;
    case "access": return <Access />;
    case "admin": return <Admin />;
    default: return <NotFound section={section} />;
  }
}

// Shares the preferences store with the account drawer, so both always agree.
function Display() {
  const p = usePrefs();
  const a = useAssistant();
  // It floats at the bottom of the window: step aside while the assistant covers that area (expanded, or a drawer).
  if (a.open && (a.expanded || window.innerWidth < 1280)) return null;
  return (
    <div className="ex-display" role="group" aria-label="Display">
      <Switch label="Dark" checked={p.theme === "dark"} onChange={(on) => setPrefs({ theme: on ? "dark" : "light" })} />
      <Switch label="Comfortable" checked={p.density === "comfortable"} onChange={(on) => setPrefs({ density: on ? "comfortable" : "compact" })} />
      <span className="ex-display__font">
        <MenuSelect quiet label="Font" prefix="Font" value={p.font} onChange={(v) => setPrefs({ font: isFont(v) ? v : "org" })}
          options={[{ value: "org", label: "Default" }, ...tokens.fonts.map((f) => ({ value: f.id, label: f.label }))]} />
      </span>
    </div>
  );
}

function Demo() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    let last = hashPath();
    const f = () => {
      setRoute(parse());
      // A new page starts at the top, like a real navigation; a new scope on the same page keeps the place.
      if (hashPath() !== last) document.getElementById("main")?.scrollTo({ top: 0 });
      last = hashPath();
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const go = (path: string) => { location.hash = "/" + withScope(path); };
  return (
    <NavProvider value={go}>
      <div className={showControls ? "ex-demo has-controls" : "ex-demo"}>
        <Page key={route.section + "/" + (route.id ?? "")} section={route.section} id={route.id} />
      </div>
      {showControls ? <Display /> : null}
    </NavProvider>
  );
}

// Dark by default; ?theme=light starts in light. The floating control and the account menu change it at any time.
mount(<Demo />, "dark");
