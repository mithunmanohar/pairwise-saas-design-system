#!/usr/bin/env node
// Bundles the e2e fixtures (fixtures.tsx, written against the package source) into .harness/ with the built
// tokens.css and styles.css. Run after the package build; `pnpm test:e2e` does both.
import { build } from "esbuild";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, ".harness");
for (const f of ["tokens.css", "styles.css"]) if (!existsSync(join(HERE, "../../dist", f))) throw new Error(`dist/${f} missing: run the package build first`);
mkdirSync(OUT, { recursive: true });
await build({ entryPoints: [join(HERE, "harness.tsx")], bundle: true, format: "esm", outfile: join(OUT, "harness.js"), jsx: "automatic", define: { "process.env.NODE_ENV": '"development"' }, logLevel: "warning" });
writeFileSync(join(OUT, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pairwise fixtures</title>
<link rel="stylesheet" href="../../../dist/tokens.css"><link rel="stylesheet" href="../../../dist/styles.css">
<style>body{margin:0;background:var(--surface);color:var(--ink);font:14px/20px var(--font-sans)} #root{padding:16px}</style>
</head><body><div id="root"></div><script type="module" src="harness.js"></script></body></html>
`);
console.log("harness: test/e2e/.harness");
