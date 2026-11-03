#!/usr/bin/env node
// Copies component CSS into dist/styles.css (font CDN import and density vars removed: they now come from
// fonts.css and tokens.css) and writes dist/fonts.css, which self-hosts the fonts via @fontsource.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(PKG, "dist"), { recursive: true });
let css = readFileSync(join(PKG, "src", "styles.css"), "utf8");
css = css.replace(/^@import url\([^)]*\);\n/m, "")
  .replace(/^:root \{ --pw-row:.*\n/m, "")
  .replace(/^\[data-density="comfortable"\], \.is-comfortable \{.*\n/m, '.is-comfortable { --pw-row: var(--row-comfortable); --pw-ctl: var(--control-comfortable); --pw-cell-x: var(--space-4); }\n');
writeFileSync(join(PKG, "dist", "styles.css"), css);
writeFileSync(join(PKG, "dist", "fonts.css"), [
  '@import "@fontsource/atkinson-hyperlegible-next/400.css";',
  '@import "@fontsource/atkinson-hyperlegible-next/600.css";',
  '@import "@fontsource/atkinson-hyperlegible-mono/400.css";',
  '@import "@fontsource/atkinson-hyperlegible-mono/500.css";',
  "",
].join("\n"));
console.log("css: styles.css, fonts.css");
