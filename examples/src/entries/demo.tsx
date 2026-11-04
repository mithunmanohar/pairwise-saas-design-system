// The live demo (GitHub Pages): the three screens as one app. The side nav, search and links route between them
// (#/services, #/runs, #/repos); other nav items show a placeholder. A floating control switches theme and density.
import { useEffect, useState } from "react";
import { PageHeader, Panel, StateBlock, Switch } from "@pairwise/ui";
import { mount, Frame, NavProvider, useNav, NAV } from "../frame";
import { ServiceHealth } from "../screens/service-health";
import { RunDetail } from "../screens/run-detail";
import { Settings } from "../screens/settings";

const SCREENS: Record<string, () => JSX.Element> = { services: ServiceHealth, runs: RunDetail, repos: Settings };
const LABEL = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.key, i.label])));
const routeOf = () => { const r = location.hash.replace(/^#\/?/, ""); return r === "" || r === "overview" ? "services" : r; };

function Placeholder({ route }: { route: string }) {
  const go = useNav();
  return (
    <Frame active={route}>
      <PageHeader title={LABEL[route] ?? "Not found"} />
      <div className="pw-page ex-narrow">
        <Panel>
          <StateBlock kind="empty" title="This page isn't part of the demo"
            body="Three pages are fully built: a service health dashboard, a CI run, and repository settings. Every one uses only @pairwise/ui components."
            action="Open service health" onAction={() => go("services")} secondary="Open the failed CI run" onSecondary={() => go("runs")} />
        </Panel>
      </div>
    </Frame>
  );
}

function Display() {
  const html = document.documentElement;
  const [dark, setDark] = useState(html.dataset.theme === "dark");
  const [comfy, setComfy] = useState(html.dataset.density === "comfortable");
  useEffect(() => { html.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => { html.dataset.density = comfy ? "comfortable" : "compact"; }, [comfy]);
  return (
    <div className="ex-display" role="group" aria-label="Display">
      <Switch label="Dark theme" checked={dark} onChange={setDark} />
      <Switch label="Comfortable rows" checked={comfy} onChange={setComfy} />
    </div>
  );
}

function Demo() {
  const [route, setRoute] = useState(routeOf);
  useEffect(() => {
    const f = () => { setRoute(routeOf()); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const go = (key: string) => { location.hash = "/" + key; };
  const Screen = SCREENS[route];
  return (
    <NavProvider value={go}>
      {Screen ? <Screen key={route} /> : <Placeholder key={route} route={route} />}
      <Display />
    </NavProvider>
  );
}

// Theme: ?theme= wins, then the OS preference.
if (!new URLSearchParams(location.search).has("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  history.replaceState(null, "", "?theme=dark" + location.hash);
}
mount(<Demo />);
