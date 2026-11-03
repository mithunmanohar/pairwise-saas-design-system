#!/usr/bin/env node
// Builds the preview kit from this package so the preview cards and @pairwise/ui can't drift.
// Run after `build` (it reads dist/). Writes:
//   design-system/tokens.css                  = dist/tokens.css
//   design-system/components/bundle.css       = self-hosted @font-face rules + dist/styles.css
//   design-system/components/fonts/*.woff2    = the faces dist/fonts.css imports (+ the OFL licence)
//   design-system/components/bundle.js        = src/index.ts as an IIFE exposing window.Pairwise (React external)
//   design-system/components/Prototype/prototype.js   (from Prototype/src)
//   pairwise-prototype.html                   = all of the above inlined into one offline file
// esbuild is used by this script only. React and ReactDOM come from window (components/lib/*.production.min.js).
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const DS = join(ROOT, "design-system");
const KIT = join(DS, "components");
const require = createRequire(join(PKG, "package.json"));

// Card order for the bundle header.
const COMPONENTS = ["Icon", "Button", "StatusBadge", "SeverityMark", "Tooltip", "MenuSelect", "TimeRangePicker", "ScopeSwitcher", "GlobalSearch",
  "FilterBar", "Breadcrumbs", "Tabs", "Panel", "Metric", "StateBlock", "AlertBanner", "Toast", "Drawer", "Modal", "Sparkline",
  "DataTable", "TimeSeriesChart", "BarChart", "Heatmap", "StatusGrid", "RunStrip", "BulletBar", "Timeline", "SideNav", "TopBar", "AppShell", "PageHeader"];
// Same faces as dist/fonts.css.
const FACES = [["atkinson-hyperlegible-next", [400, 600]], ["atkinson-hyperlegible-mono", [400, 500]]];

const read = (p) => readFileSync(p, "utf8");
for (const f of ["tokens.css", "styles.css", "index.js"]) if (!existsSync(join(PKG, "dist", f))) throw new Error(`dist/${f} missing: run the package build first`);

// React and its JSX runtime resolve to the page's UMD globals.
const reactGlobals = {
  name: "react-globals",
  setup(b) {
    b.onResolve({ filter: /^react(\/jsx-runtime)?$/ }, (a) => ({ path: a.path, namespace: "react-global" }));
    b.onLoad({ filter: /.*/, namespace: "react-global" }, (a) => ({
      loader: "js",
      contents: a.path === "react" ? "module.exports = window.React;"
        : "var R = window.React; function jsx(t, p, k) { return R.createElement(t, k === undefined ? p : Object.assign({}, p, { key: k })); }\n"
        + "module.exports = { jsx: jsx, jsxs: jsx, Fragment: R.Fragment };",
    }));
  },
};

const noScriptBreakers = (name, js) => { if (/<\/script|<!--/i.test(js)) throw new Error(`${name} contains </script or <!--`); return js; };
const pyJson = (v) => JSON.stringify(v).replace(/","|":|},{/g, (m) => (m === '","' ? '", "' : m === '":' ? '": ' : "}, {")).replace(/,\[/g, ", [");

async function bundle(entry, opts) {
  const r = await build({ ...(entry ? { entryPoints: [entry] } : {}), bundle: true, write: false, format: "iife", target: "es2020", platform: "browser",
    minifySyntax: true, minifyWhitespace: true, legalComments: "none", logLevel: "warning", ...opts });
  return r.outputFiles[0].text;
}

// 1. Component bundle → window.Pairwise
const js = await bundle(undefined, {
  stdin: { contents: 'import * as P from "./src/index";\n(window as unknown as { Pairwise: unknown }).Pairwise = { ...P };\n', resolveDir: PKG, loader: "ts", sourcefile: "preview-entry.ts" },
  plugins: [reactGlobals], jsx: "automatic", tsconfig: join(PKG, "tsconfig.json"),
});
const missing = COMPONENTS.filter((c) => !new RegExp(`\\b${c}\\b`).test(js));
if (missing.length) throw new Error("bundle is missing: " + missing.join(", "));
const header = "/* @ds-bundle: " + pyJson({ format: 4, namespace: "Pairwise", components: COMPONENTS.map((name) => ({ name })) }) + " */\n";
const bundleJs = header + noScriptBreakers("bundle.js", js);
writeFileSync(join(KIT, "bundle.js"), bundleJs);

// 2. Fonts: copy the woff2 files the faces reference; rewrite their urls.
const fontDir = join(KIT, "fonts");
rmSync(fontDir, { recursive: true, force: true }); mkdirSync(fontDir, { recursive: true });
const faces = [];
for (const [pkg, weights] of FACES) {
  const base = dirname(require.resolve(`@fontsource/${pkg}/package.json`));
  copyFileSync(join(base, "LICENSE"), join(fontDir, `${pkg}.LICENSE.txt`));
  for (const w of weights) {
    const css = read(join(base, `${w}.css`)).replace(/src: url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\)(, url\([^)]*\) format\('woff'\))?/g, (_m, file) => {
      copyFileSync(join(base, "files", file), join(fontDir, file));
      return `src: url(./fonts/${file}) format('woff2')`;
    });
    faces.push(css.trim());
  }
}
const fontsCss = "/* Self-hosted Atkinson Hyperlegible Next and Mono (SIL OFL 1.1, see fonts/*.LICENSE.txt), from @fontsource. */\n" + faces.join("\n\n") + "\n";

// 3. CSS
const tokensCss = read(join(PKG, "dist", "tokens.css"));
const stylesCss = read(join(PKG, "dist", "styles.css"));
const bundleCss = "/* Generated by packages/ui/scripts/build-preview.mjs from @pairwise/ui. Do not edit. */\n" + fontsCss + "\n" + stylesCss;
writeFileSync(join(DS, "tokens.css"), tokensCss);
writeFileSync(join(KIT, "bundle.css"), bundleCss);

// 4. Prototype. Talks to window.React / window.Pairwise only.
const protoJs = noScriptBreakers("prototype.js", await bundle(join(KIT, "Prototype", "src", "index.tsx"), { jsx: "transform", jsxFactory: "h", jsxFragment: "Fragment" }));
writeFileSync(join(KIT, "Prototype", "prototype.js"), protoJs);

// 5. Single-file prototype: fonts inlined as data URIs so it works offline.
const inlineFonts = bundleCss.replace(/url\(\.\/fonts\/([^)]+\.woff2)\)/g, (_m, f) => `url(data:font/woff2;base64,${readFileSync(join(fontDir, f)).toString("base64")})`);
const lib = (f) => noScriptBreakers(f, read(join(KIT, "lib", f)));
const html = `<!doctype html>
<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pairwise prototype</title>
<style>${tokensCss}</style>
<style>${inlineFonts}</style>
<style>html,body{margin:0;height:100%}</style>
</head><body><div id="root"></div>
<script>${lib("react.production.min.js")}</script>
<script>${lib("react-dom.production.min.js")}</script>
<script>${bundleJs}</script>
<script>${protoJs}</script>
<script>window.PairwiseProto.mount(document.getElementById('root'), { memory: true, route: 'overview', height: Math.max(760, window.innerHeight - 90) });</script>
</body></html>
`;
writeFileSync(join(ROOT, "pairwise-prototype.html"), html);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + " KB";
console.log(`preview: bundle.js ${kb(bundleJs)}, bundle.css ${kb(bundleCss)}, ${readdirSync(fontDir).filter((f) => f.endsWith(".woff2")).length} font files, prototype.js ${kb(protoJs)}, pairwise-prototype.html ${kb(html)}`);
