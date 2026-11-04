#!/usr/bin/env node
// Bundles each entry (src/entries/*.tsx: one page per screen, plus demo.tsx, the routed live demo) into dist/<name>.html + .js + .css with esbuild, the way any
// app would bundle @pairwise/ui. Open the HTML files straight from disk. ?theme=dark&density=comfortable&state=…
import { build } from "esbuild";
import { readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCREENS = join(ROOT, "src", "entries");
const OUT = join(ROOT, "dist");
const names = readdirSync(SCREENS).filter((f) => f.endsWith(".tsx")).map((f) => basename(f, ".tsx"));

rmSync(OUT, { recursive: true, force: true });
await build({
  entryPoints: names.map((n) => join(SCREENS, n + ".tsx")),
  outdir: OUT, bundle: true, format: "iife", target: "es2020", jsx: "automatic", minify: true,
  loader: { ".woff2": "file", ".woff": "file" }, assetNames: "fonts/[name]-[hash]", logLevel: "warning",
  define: { "process.env.NODE_ENV": '"production"' },
});
for (const n of names) {
  writeFileSync(join(OUT, n + ".html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${n} · Pairwise example</title><link rel="stylesheet" href="./${n}.css"></head>
<body><div id="root"></div><script src="./${n}.js"></script></body></html>
`);
}
console.log(`examples: ${names.join(", ")} → examples/dist/`);
