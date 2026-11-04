#!/usr/bin/env node
// Regenerates every image in docs/images/ from the real code: the example screens (examples/dist, built by
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

// Screens: [file, page, query, viewport]
const SCREENS = [
  ["service-health-light", "service-health", "", [1440, 1300]],
  ["service-health-dark", "service-health", "theme=dark", [1440, 1300]],
  ["run-detail-light", "run-detail", "", [1440, 960]],
  ["run-detail-dark", "run-detail", "theme=dark", [1440, 960]],
  ["run-detail-drawer-dark", "run-detail", "theme=dark&state=drawer", [1440, 960]],
  ["settings-light", "settings", "", [1440, 1060]],
  ["settings-dark", "settings", "theme=dark", [1440, 1060]],
  ["settings-modal-light", "settings", "state=modal", [1440, 1060]],
  ["settings-toast-dark", "settings", "theme=dark&state=toast", [1440, 1060]],
  ["service-health-collapsed-light", "service-health", "", [1180, 1000]],
  ["service-health-comfortable-light", "service-health", "density=comfortable", [1440, 1000]],
];
// Component cards for the README gallery (light theme, compact).
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
if (!existsSync(join(ROOT, "examples", "dist", "service-health.html"))) throw new Error("run `pnpm -C examples build` first");

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: SCALE, locale: "en-US", timezoneId: "UTC", reducedMotion: "reduce" });
const errors = [];
async function open(url, [w, h]) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${url}: ${e}`));
  await page.setViewportSize({ width: w, height: h });
  await page.goto(base + url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: FREEZE });
  await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  await page.waitForTimeout(300);
  return page;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "screens"), { recursive: true });
mkdirSync(join(OUT, "components"), { recursive: true });

for (const [file, screen, query, vp] of SCREENS) {
  const page = await open(`/examples/dist/${screen}.html?frozen=1${query ? "&" + query : ""}`, vp);
  await page.screenshot({ path: join(OUT, "screens", file + ".png") });
  await page.close();
}

// Hero: the top of the service-health screen, light on the left and dark on the right, split on a diagonal.
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  const img = (f) => "data:image/png;base64," + readFileSync(join(OUT, "screens", f)).toString("base64");
  const png = await page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const [la, da] = await Promise.all([load(a), load(b)]);
    const c = document.createElement("canvas"); c.width = la.width; c.height = Math.min(la.height, Math.round(la.width * 1000 / 1440)); const x = c.getContext("2d");
    x.drawImage(la, 0, 0);
    x.save(); x.beginPath(); x.moveTo(c.width * 0.62, 0); x.lineTo(c.width, 0); x.lineTo(c.width, c.height); x.lineTo(c.width * 0.42, c.height); x.closePath(); x.clip();
    x.drawImage(da, 0, 0); x.restore();
    return c.toDataURL("image/png").split(",")[1];
  }, [img("service-health-light.png"), img("service-health-dark.png")]);
  writeFileSync(join(OUT, "hero.png"), Buffer.from(png, "base64"));
  await page.close();
}

for (const name of COMPONENTS) {
  const page = await open(`/__card/${name}?th=light`, [cardWidth(name), 900]);
  await page.locator("#root").screenshot({ path: join(OUT, "components", name + ".png") });
  await page.close();
}
// Density: the same table in both densities.
for (const d of ["compact", "comfortable"]) {
  const page = await open(`/__card/DataTable?th=light`, [1100, 900]);
  await page.evaluate((v) => document.documentElement.setAttribute("data-density", v), d);
  await page.waitForTimeout(200);
  await page.locator("#root table").first().screenshot({ path: join(OUT, `density-${d}.png`) });
  await page.close();
}

await browser.close(); server.close();
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`screenshots: ${SCREENS.length} screens, hero, ${COMPONENTS.length} components, 2 density → docs/images/`);
