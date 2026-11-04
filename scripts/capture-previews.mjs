#!/usr/bin/env node
// Optional before/after screenshots of the component preview cards (design-system/components/<Card>/preview.html).
// Typical use: capture on main, capture on your branch, diff, and attach the changed PNGs to the PR.
//
//   node scripts/capture-previews.mjs capture <outDir> [--only Card,Card] [--themes light,dark] [--densities compact,comfortable]
//   node scripts/capture-previews.mjs diff <beforeDir> <afterDir> <diffDir> [--tolerance 2]
//
// capture: hosts each card the way the catalogue does (tokens.css, bundle.css, React, bundle.js injected ahead of the
// card's own markup and script), sets data-theme / data-density on <html>, freezes animation and caret, waits for fonts,
// and writes <Card>--<theme>--<density>.png plus manifest.json. Viewport = the card's @dsCard width (default 924) ×
// height; the screenshot is full-page. Locale en-US, time zone UTC, deviceScaleFactor 1.
// diff: compares two capture dirs pixel by pixel in the browser (no image dependencies) and writes a red-on-grey diff
// PNG for every card that differs, plus report.json. A pixel differs when any channel moves by more than --tolerance
// (default 2/255): back-to-back captures of the same kit differ by at most 2 on a few anti-aliased panel corners.
//
// Needs Playwright, which is not a repo dependency: the script resolves a globally installed `playwright`.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { execSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const CARDS = join(ROOT, "design-system", "components");

function loadPlaywright() {
  const req = createRequire(import.meta.url);
  const tries = ["playwright", "/opt/node-tools/node_modules/playwright"];
  try { tries.push(join(execSync("npm root -g", { encoding: "utf8" }).trim(), "playwright")); } catch {}
  for (const t of tries) { try { return req(t); } catch {} }
  throw new Error("playwright not found. Install it globally or add it to the workspace.");
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml" };

export function cardList() {
  return readdirSync(CARDS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(CARDS, d.name, "preview.html")))
    .map((d) => d.name).sort();
}

function cardMeta(name) {
  const html = readFileSync(join(CARDS, name, "preview.html"), "utf8");
  const m = html.match(/<!--\s*@dsCard([^>]*)-->/);
  const attr = (k) => { const r = m && m[1].match(new RegExp(`\\b${k}=(\\d+)`)); return r ? Number(r[1]) : undefined; };
  return { html, width: attr("width") ?? 924, height: attr("height") ?? 540 };
}

const FREEZE = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";

function wrap(name, html, theme, density) {
  const k = "/design-system/components/";
  const head = [
    `<base href="${k}${name}/">`,
    `<link rel="stylesheet" href="/design-system/tokens.css">`,
    `<link rel="stylesheet" href="${k}bundle.css">`,
    `<style>${FREEZE}</style>`,
    `<script src="${k}lib/react.production.min.js"></script>`,
    `<script src="${k}lib/react-dom.production.min.js"></script>`,
    `<script src="${k}bundle.js"></script>`,
  ].join("\n");
  let out = html.replace(/<!--\s*@dsCard[^>]*-->\s*/, "");
  out = out.replace(/<html([^>]*)>/i, `<html$1 data-theme="${theme}" data-density="${density}">`);
  out = /<head[^>]*>/i.test(out) ? out.replace(/<head([^>]*)>/i, `<head$1>\n${head}`) : head + out;
  return out;
}

function serve() {
  return new Promise((ok) => {
    const srv = createServer((req, res) => {
      const url = new URL(req.url, "http://x");
      const m = url.pathname.match(/^\/__card\/([^/]+)$/);
      if (m) {
        const { html } = cardMeta(decodeURIComponent(m[1]));
        res.writeHead(200, { "content-type": "text/html" });
        return res.end(wrap(decodeURIComponent(m[1]), html, url.searchParams.get("th"), url.searchParams.get("dn")));
      }
      const p = normalize(join(ROOT, decodeURIComponent(url.pathname)));
      if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
      res.end(readFileSync(p));
    });
    srv.listen(0, "127.0.0.1", () => ok(srv));
  });
}

async function capture(outDir, opts) {
  const { chromium } = loadPlaywright();
  mkdirSync(outDir, { recursive: true });
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ locale: "en-US", timezoneId: "UTC", deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  const manifest = [];
  const cards = opts.only ? opts.only : cardList();
  for (const name of cards) {
    const { width, height } = cardMeta(name);
    for (const th of opts.themes) for (const dn of opts.densities) {
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      await page.setViewportSize({ width, height });
      await page.goto(`${base}/__card/${encodeURIComponent(name)}?th=${th}&dn=${dn}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
      await page.waitForTimeout(250);
      const file = `${name}--${th}--${dn}.png`;
      await page.screenshot({ path: join(outDir, file), fullPage: true });
      const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`));
      manifest.push({ file, card: name, theme: th, density: dn, viewport: [width, height], fonts: [...new Set(fonts)].sort(), errors });
      await page.close();
    }
    process.stdout.write(".");
  }
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  await browser.close(); srv.close();
  const errs = manifest.filter((m) => m.errors.length);
  console.log(`\n${manifest.length} captures → ${outDir}${errs.length ? `; ${errs.length} with page errors (see manifest.json)` : ""}`);
}

async function diff(aDir, bDir, outDir, tol = 2) {
  const { chromium } = loadPlaywright();
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const files = readdirSync(aDir).filter((f) => f.endsWith(".png")).sort();
  const report = [];
  for (const f of files) {
    if (!existsSync(join(bDir, f))) { report.push({ file: f, status: "missing-after" }); continue; }
    const a = "data:image/png;base64," + readFileSync(join(aDir, f)).toString("base64");
    const b = "data:image/png;base64," + readFileSync(join(bDir, f)).toString("base64");
    const r = await page.evaluate(async ([a, b, tol]) => {
      const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height);
      const px = (img) => { const c = new OffscreenCanvas(w, h); const x = c.getContext("2d"); x.fillStyle = "#ff00ff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
      const da = px(ia), db = px(ib);
      const out = new OffscreenCanvas(w, h); const ox = out.getContext("2d"); const od = ox.createImageData(w, h);
      let n = 0, minX = w, minY = h, maxX = -1, maxY = -1, maxDelta = 0;
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]));
        const g = Math.round((da[i] + da[i + 1] + da[i + 2]) / 3 * 0.25 + 190);
        if (d > tol) { n++; maxDelta = Math.max(maxDelta, d); const p = i / 4, x = p % w, y = (p / w) | 0; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); od.data.set([230, 0, 0, 255], i); }
        else od.data.set([g, g, g, 255], i);
      }
      ox.putImageData(od, 0, 0);
      const blob = await out.convertToBlob({ type: "image/png" });
      const buf = n ? Array.from(new Uint8Array(await blob.arrayBuffer())) : null;
      return { size: [ia.width, ia.height, ib.width, ib.height], n, total: w * h, maxDelta, box: n ? [minX, minY, maxX, maxY] : null, buf };
    }, [a, b, tol]);
    const sizeChanged = r.size[0] !== r.size[2] || r.size[1] !== r.size[3];
    if (r.buf) writeFileSync(join(outDir, f), Buffer.from(r.buf));
    report.push({ file: f, status: r.n ? "differs" : "identical", pixels: r.n, ratio: +(r.n / r.total).toFixed(5), maxDelta: r.maxDelta, box: r.box, sizeBefore: r.size.slice(0, 2), sizeAfter: r.size.slice(2), sizeChanged });
  }
  writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");
  await browser.close();
  const d = report.filter((x) => x.status !== "identical");
  console.log(`${files.length} compared, ${files.length - d.length} identical, ${d.length} differ → ${outDir}/report.json`);
}

const [cmd, ...args] = process.argv.slice(2);
const flag = (k, dflt) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1].split(",") : dflt; };
if (cmd === "capture" && args[0]) await capture(resolve(args[0]), { only: flag("--only"), themes: flag("--themes", ["light", "dark"]), densities: flag("--densities", ["compact", "comfortable"]) });
else if (cmd === "diff" && args[2]) await diff(resolve(args[0]), resolve(args[1]), resolve(args[2]), Number(flag("--tolerance", ["2"])[0]));
else { console.error("usage: capture <outDir> [--only A,B] | diff <before> <after> <diffDir>"); process.exit(2); }
