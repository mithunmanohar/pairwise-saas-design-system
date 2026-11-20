#!/usr/bin/env node
// Regenerates every image in docs/images/ from the real code: the routed demo (examples/dist/demo.html, built by
// build.mjs) and the component cards (design-system/components/<Name>/preview.html, using the generated preview kit).
// Nothing is mocked up. Run: pnpm -C examples screenshots   (needs a Playwright install; resolved like
// scripts/capture-previews.mjs). Chromium, 2× pixels, en-US, UTC, animations frozen.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const OUT = join(ROOT, "docs", "images");
const CARDS = join(ROOT, "design-system", "components");
const SCALE = 2;

// Screens: [file, demo route, query, viewport, fullPage]. Dark is the primary theme; light variants live under it.
// Every capture is the routed live demo (examples/dist/demo.html) with ?frozen=1&controls=0. fullPage grows the
// viewport to the page's scroll height so nothing is cut off; phone captures keep the device viewport.
const PHONE = [390, 844];
const SCREENS = [
  ["overview-dark", "overview", "", [1440, 1000], true],
  ["overview-light", "overview", "theme=light", [1440, 1000], true],
  ["services-dark", "services", "", [1440, 760], false],
  ["service-health-dark", "services/checkout-api", "", [1440, 1300], true],
  ["service-health-light", "services/checkout-api", "theme=light", [1440, 1300], true],
  ["service-health-collapsed-dark", "services/checkout-api", "", [1180, 1000], false],
  ["service-health-comfortable-dark", "services/checkout-api", "density=comfortable", [1440, 1000], false],
  ["incidents-dark", "incidents", "", [1440, 760], false],
  ["incident-dark", "incidents/INC-2041", "", [1440, 1150], true],
  ["deployments-dark", "deploys", "", [1440, 1100], true],
  ["runs-dark", "runs", "", [1440, 720], false],
  ["run-detail-dark", "runs/run_8f3k2", "", [1440, 960], true],
  ["run-detail-light", "runs/run_8f3k2", "theme=light", [1440, 960], true],
  ["run-detail-drawer-dark", "runs/run_8f3k2", "state=drawer", [1440, 960], false],
  ["repos-dark", "repos", "", [1440, 720], false],
  ["settings-dark", "repos/sample-repo", "", [1440, 1060], true],
  ["settings-modal-dark", "repos/sample-repo", "state=modal", [1440, 900], false],
  ["settings-toast-light", "repos/sample-repo", "theme=light&state=toast", [1440, 1060], false],
  ["usage-dark", "usage", "", [1440, 1300], true],
  ["usage-light", "usage", "theme=light", [1440, 1300], true],
  ["access-dark", "access", "", [1440, 900], false],
  ["access-invite-dark", "access", "state=invite", [1440, 900], false],
  ["admin-dark", "admin", "", [1440, 1000], false],
  ["prefs-dark", "overview", "state=prefs", [1440, 900], false],
  ["font-atkinson-dark", "runs/run_8f3k2", "font=atkinson", [1440, 620], false],
  ["font-inter-dark", "runs/run_8f3k2", "font=inter", [1440, 620], false],
  ["font-plex-dark", "runs/run_8f3k2", "font=plex", [1440, 620], false],
  ["phone-overview-dark", "overview", "", PHONE, false],
  ["phone-incident-dark", "incidents/INC-2041", "", PHONE, false],
  ["phone-run-detail-dark", "runs/run_8f3k2", "", PHONE, false],
  ["phone-service-health-light", "services/checkout-api", "theme=light", PHONE, false],
];
// Component cards for the README gallery (dark theme, compact).
const COMPONENTS = ["Button", "ActionMenu", "StatusBadge", "Tag", "CopyButton", "TextInput", "Select", "Checkbox", "Switch",
  "Tabs", "TimeRangePicker", "AlertBanner", "Toaster", "StateBlock", "Modal", "Drawer", "Metric", "DataTable", "CodeBlock",
  "Timeline", "TimeSeriesChart", "BarChart", "StatusGrid", "RunStrip", "Heatmap", "PageHeader", "Icon"];

function loadPlaywright() {
  const req = createRequire(import.meta.url);
  const tries = ["playwright", "/opt/node-tools/node_modules/playwright"];
  try { tries.push(join(execSync("npm root -g", { encoding: "utf8" }).trim(), "playwright")); } catch { /* no global npm */ }
  for (const t of tries) { try { return req(t); } catch { /* next */ } }
  throw new Error("playwright not found: install it globally (npm i -g playwright) and run `npx playwright install chromium`");
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff" };
const FREEZE = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
function cardPage(name, theme) {
  const k = "/design-system/components/";
  const html = readFileSync(join(CARDS, name, "preview.html"), "utf8").replace(/<!--\s*@dsCard[^>]*-->\s*/, "");
  const head = `<base href="${k}${name}/"><link rel="stylesheet" href="/design-system/tokens.css"><link rel="stylesheet" href="${k}bundle.css">
<style>${FREEZE}</style><script src="${k}lib/react.production.min.js"></script><script src="${k}lib/react-dom.production.min.js"></script><script src="${k}bundle.js"></script>`;
  return html.replace(/<html([^>]*)>/i, `<html$1 data-theme="${theme}" data-density="compact">`).replace(/<head([^>]*)>/i, `<head$1>${head}`);
}
const cardWidth = (name) => Number((readFileSync(join(CARDS, name, "preview.html"), "utf8").match(/@dsCard[^>]*\bwidth=(\d+)/) || [, 924])[1]);

const server = await new Promise((ok) => {
  const s = createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const card = url.pathname.match(/^\/__card\/([A-Za-z]+)$/);
    if (card) { res.writeHead(200, { "content-type": "text/html" }); return res.end(cardPage(card[1], url.searchParams.get("th") || "light")); }
    const p = normalize(join(ROOT, decodeURIComponent(url.pathname)));
    if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" }); res.end(readFileSync(p));
  });
  s.listen(0, "127.0.0.1", () => ok(s));
});
const base = `http://127.0.0.1:${server.address().port}`;
if (!existsSync(join(ROOT, "examples", "dist", "demo.html"))) throw new Error("run `pnpm -C examples build` first");

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const opts = { deviceScaleFactor: SCALE, locale: "en-US", timezoneId: "UTC", reducedMotion: "reduce" };
const ctx = await browser.newContext(opts);
// Phone captures use mobile emulation, so scrollbars overlay the page as they do on a real phone.
const phoneCtx = await browser.newContext({ ...opts, isMobile: true, hasTouch: true });
// Desktop captures render like overlay scrollbars too (macOS, phones): headless Chromium hides its scrollbar but would
// still reserve the AppShell's stable scrollbar gutter, leaving a blank strip that no real user sees.
const OVERLAY_SCROLLBARS = ".pw-shell__content{scrollbar-gutter:auto!important}";
const errors = [];
async function open(url, [w, h]) {
  const page = await (w === PHONE[0] ? phoneCtx : ctx).newPage();
  page.on("pageerror", (e) => errors.push(`${url}: ${e}`));
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base + url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE + OVERLAY_SCROLLBARS });
  await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  await page.waitForTimeout(300);
  return page;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "screens"), { recursive: true });
mkdirSync(join(OUT, "components"), { recursive: true });

for (const [file, route, query, vp, full] of SCREENS) {
  const page = await open(`/examples/dist/demo.html?frozen=1&controls=0${query ? "&" + query : ""}#/${route}`, vp);
  if (full) {
    const h = await page.evaluate(() => { const m = document.getElementById("main"); return m ? m.scrollHeight + m.getBoundingClientRect().top : document.body.scrollHeight; });
    if (h > vp[1]) { await page.setViewportSize({ width: vp[0], height: Math.ceil(h) }); await page.waitForTimeout(300); }
  }
  await page.screenshot({ path: join(OUT, "screens", file + ".png") });
  await page.close();
}

// Hero: the top of the overview screen in dark, with a light-theme sliver on the right, split on a diagonal.
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  const img = (f) => "data:image/png;base64," + readFileSync(join(OUT, "screens", f)).toString("base64");
  const png = await page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const [la, da] = await Promise.all([load(a), load(b)]);
    const c = document.createElement("canvas"); c.width = la.width; c.height = Math.min(la.height, Math.round(la.width * 1000 / 1440)); const x = c.getContext("2d");
    x.drawImage(da, 0, 0);
    x.save(); x.beginPath(); x.moveTo(c.width * 0.86, 0); x.lineTo(c.width, 0); x.lineTo(c.width, c.height); x.lineTo(c.width * 0.70, c.height); x.closePath(); x.clip();
    x.drawImage(la, 0, 0); x.restore();
    return c.toDataURL("image/png").split(",")[1];
  }, [img("overview-light.png"), img("overview-dark.png")]);
  writeFileSync(join(OUT, "hero.png"), Buffer.from(png, "base64"));
  await page.close();
}

for (const name of COMPONENTS) {
  const page = await open(`/__card/${name}?th=dark`, [cardWidth(name), 900]);
  await page.locator("#root").screenshot({ path: join(OUT, "components", name + ".png") });
  await page.close();
}
// Density: the same table in both densities (dark).
for (const d of ["compact", "comfortable"]) {
  const page = await open(`/__card/DataTable?th=dark`, [1100, 900]);
  await page.evaluate((v) => document.documentElement.setAttribute("data-density", v), d);
  await page.waitForTimeout(200);
  await page.locator("#root table").first().screenshot({ path: join(OUT, `density-${d}.png`) });
  await page.close();
}

await browser.close(); server.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`screenshots: ${SCREENS.length} screens, hero, ${COMPONENTS.length} components, 2 density → docs/images/`);
