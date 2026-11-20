// The live demo (GitHub Pages): one routed app built only from @pairwise/ui. Every nav item is a working page, and list
// rows open detail pages (#/services/checkout-api, #/incidents/INC-2041, #/runs/run_8f3k2, #/repos/sample-repo).
// A floating control switches theme and density (hidden with ?controls=0, which the screenshot script uses).
import { useEffect, useState } from "react";
import { PageHeader, Panel, StateBlock, Switch } from "@pairwise/ui";
import { mount, Frame, NavProvider, useNav, showControls } from "../frame";
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
  const [section = "", id] = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/");
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

function Display() {
  const html = document.documentElement;
  const [dark, setDark] = useState(html.dataset.theme === "dark");
  const [comfy, setComfy] = useState(html.dataset.density === "comfortable");
  useEffect(() => { html.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => { html.dataset.density = comfy ? "comfortable" : "compact"; }, [comfy]);
  return (
    <div className="ex-display" role="group" aria-label="Display">
      <Switch label="Dark" checked={dark} onChange={setDark} />
      <Switch label="Comfortable" checked={comfy} onChange={setComfy} />
    </div>
  );
}

function Demo() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const f = () => {
      setRoute(parse());
      // A new page starts at the top, like a real navigation.
      document.getElementById("main")?.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const go = (path: string) => { location.hash = "/" + path; };
  return (
    <NavProvider value={go}>
      <div className={showControls ? "ex-demo has-controls" : "ex-demo"}>
        <Page key={route.section + "/" + (route.id ?? "")} section={route.section} id={route.id} />
      </div>
      {showControls ? <Display /> : null}
    </NavProvider>
  );
}

// Dark by default; ?theme=light starts in light. The floating switch changes it at any time.
mount(<Demo />, "dark");
