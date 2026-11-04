#!/usr/bin/env node
// Writes the installable @pairwise/ui package (built files only) into <outDir>. Run after `pnpm run ci`.
// The release workflow commits <outDir> to the tag ui-v<version>; projects install that tag from git, so the
// package must work as-is: no build step, no scripts, no dev dependencies.
//   node scripts/pack-release.mjs <outDir>
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const out = process.argv[2];
if (!out) { console.error("usage: node scripts/pack-release.mjs <outDir>"); process.exit(2); }
const PKG = new URL("../packages/ui/", import.meta.url).pathname;
if (!existsSync(join(PKG, "dist", "index.js"))) throw new Error("packages/ui/dist is missing: run `pnpm run ci` first");

const dir = resolve(out);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
cpSync(join(PKG, "dist"), join(dir, "dist"), { recursive: true });
for (const f of ["README.md", "CHANGELOG.md"]) cpSync(join(PKG, f), join(dir, f));

const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
delete pkg.scripts;
delete pkg.devDependencies;
pkg.files = ["dist", "README.md", "CHANGELOG.md"];
writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
console.log(`packed @pairwise/ui ${pkg.version} → ${dir}`);
